import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DESKTOP_COMMAND_ENV = "COUNCIL_DESKTOP_COMMAND";
const DESKTOP_COMMAND_ARGS_ENV = "COUNCIL_DESKTOP_ARGS";
const DESKTOP_SOURCE_ENV = "COUNCIL_DESKTOP_LAUNCH_SOURCE";
const DESKTOP_DEV_SCRIPT = "desktop:dev";
const EARLY_EXIT_WINDOW_MS = 400;

type LaunchSource = "default" | "chat";

type LaunchCommand = {
  cmd: string[];
  cwd: string;
};

export async function launchDesktopApp(options: { source: LaunchSource }): Promise<void> {
  const launch = resolveLaunchCommand();
  let proc: Bun.Subprocess;

  try {
    proc = Bun.spawn(launch.cmd, {
      cwd: launch.cwd,
      stdin: "ignore",
      stdout: "ignore",
      stderr: "pipe",
      env: {
        ...process.env,
        [DESKTOP_SOURCE_ENV]: options.source,
      },
    });
    proc.unref();
  } catch (error) {
    throw new Error(`Unable to spawn desktop runtime (${formatCommand(launch.cmd)}): ${getErrorMessage(error)}`);
  }

  const earlyExit = await Promise.race([proc.exited, Bun.sleep(EARLY_EXIT_WINDOW_MS).then(() => null)]);

  if (typeof earlyExit === "number" && earlyExit !== 0) {
    const stderr = await readStderr(proc);
    throw new Error(`Desktop runtime exited with code ${earlyExit}.${stderr ? ` ${stderr}` : ""}`);
  }
}

function resolveLaunchCommand(): LaunchCommand {
  const override = process.env[DESKTOP_COMMAND_ENV]?.trim();
  if (override) {
    return {
      cmd: [override, ...parseSpaceSeparatedArgs(process.env[DESKTOP_COMMAND_ARGS_ENV])],
      cwd: process.cwd(),
    };
  }

  const projectRoot = resolveProjectRoot();
  if (!projectRoot) {
    throw new Error(
      `Desktop runtime is not configured for this invocation. Set ${DESKTOP_COMMAND_ENV} to an executable path to override.`,
    );
  }

  return {
    cmd: ["bun", "run", DESKTOP_DEV_SCRIPT],
    cwd: projectRoot,
  };
}

function resolveProjectRoot(): string | null {
  const candidates = new Set<string>();
  candidates.add(process.cwd());

  const scriptPath = process.argv[1];
  if (scriptPath) {
    let dir = path.dirname(path.resolve(scriptPath));
    for (let index = 0; index < 5; index += 1) {
      candidates.add(dir);
      const parent = path.dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }

  for (const candidate of candidates) {
    if (isProjectRoot(candidate)) {
      return candidate;
    }
  }

  return null;
}

function isProjectRoot(directory: string): boolean {
  const packageJsonPath = path.join(directory, "package.json");
  const electrobunConfigPath = path.join(directory, "electrobun.config.ts");

  if (!existsSync(packageJsonPath) || !existsSync(electrobunConfigPath)) {
    return false;
  }

  try {
    const raw = readFileSync(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as {
      name?: unknown;
      scripts?: Record<string, unknown>;
    };

    return (
      parsed.name === "agents-council" &&
      typeof parsed.scripts === "object" &&
      parsed.scripts !== null &&
      typeof parsed.scripts[DESKTOP_DEV_SCRIPT] === "string"
    );
  } catch {
    return false;
  }
}

function parseSpaceSeparatedArgs(value?: string): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(" ")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function formatCommand(command: string[]): string {
  return command.join(" ");
}

async function readStderr(proc: Bun.Subprocess): Promise<string> {
  if (!proc.stderr || typeof proc.stderr === "number") {
    return "";
  }
  try {
    const raw = await new Response(proc.stderr).text();
    return raw.trim().replace(/\s+/g, " ");
  } catch {
    return "";
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
