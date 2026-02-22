import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

const DESKTOP_COMMAND_ENV = "COUNCIL_DESKTOP_COMMAND";
const DESKTOP_COMMAND_ARGS_ENV = "COUNCIL_DESKTOP_ARGS";
const DESKTOP_SOURCE_ENV = "COUNCIL_DESKTOP_LAUNCH_SOURCE";
const DESKTOP_DEV_SCRIPT = "desktop:dev";
const EARLY_EXIT_WINDOW_MS = 400;
const COUNCIL_DESKTOP_EXECUTABLE_BASE = "council-desktop";
const MACOS_APP_NAME = "Agents Council";

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

  const bundledRuntime = resolveBundledDesktopRuntime();
  if (bundledRuntime) {
    return bundledRuntime;
  }

  const projectRoot = resolveProjectRoot();
  if (projectRoot) {
    return {
      cmd: ["bun", "run", DESKTOP_DEV_SCRIPT],
      cwd: projectRoot,
    };
  }

  const packagedDesktopExecutable = resolvePackagedDesktopExecutable();
  if (packagedDesktopExecutable) {
    return {
      cmd: [packagedDesktopExecutable],
      cwd: path.dirname(packagedDesktopExecutable),
    };
  }

  throw new Error(
    `Desktop runtime is not configured for this invocation. Set ${DESKTOP_COMMAND_ENV} to an executable path, or run from a source checkout that contains electrobun desktop assets.`,
  );
}

function resolveProjectRoot(): string | null {
  const candidates = collectCandidateRoots();

  for (const candidate of candidates) {
    if (isProjectRoot(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolveBundledDesktopRuntime(): LaunchCommand | null {
  const searchDirs = collectDesktopSearchDirs();
  const currentExecutable = normalizePath(process.execPath);

  for (const directory of searchDirs) {
    for (const command of getBundledCommandCandidates(directory)) {
      const executable = command[0];
      if (!executable) {
        continue;
      }

      if (!existsSync(executable)) {
        continue;
      }

      if (currentExecutable && normalizePath(executable) === currentExecutable) {
        continue;
      }

      return {
        cmd: command,
        cwd: directory,
      };
    }
  }

  return null;
}

function resolvePackagedDesktopExecutable(): string | null {
  const roots = collectCandidateRoots();
  const relativeCandidates = getPackagedDesktopExecutableCandidates();

  for (const root of roots) {
    for (const relativeCandidate of relativeCandidates) {
      const fullPath = path.join(root, relativeCandidate);
      if (existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

function collectDesktopSearchDirs(): string[] {
  const candidates = new Set<string>();
  candidates.add(process.cwd());

  if (process.execPath) {
    candidates.add(path.dirname(path.resolve(process.execPath)));
  }
  if (process.argv[0]) {
    candidates.add(path.dirname(path.resolve(process.argv[0])));
  }
  if (process.argv[1]) {
    candidates.add(path.dirname(path.resolve(process.argv[1])));
  }

  return [...candidates];
}

function getBundledCommandCandidates(directory: string): string[][] {
  const candidates: string[][] = [];
  const executableSuffix = process.platform === "win32" ? ".exe" : "";
  const binaryNames = [
    `Agents Council${executableSuffix}`,
    `Agents Council-dev${executableSuffix}`,
    `AgentsCouncil${executableSuffix}`,
    `AgentsCouncil-dev${executableSuffix}`,
    `agents-council${executableSuffix}`,
  ];

  for (const binaryName of binaryNames) {
    candidates.push([path.join(directory, binaryName)]);
  }

  if (process.platform === "darwin") {
    const appBundles: Array<{ bundle: string; executable: string }> = [
      { bundle: "Agents Council.app", executable: "Agents Council" },
      { bundle: "Agents Council-dev.app", executable: "Agents Council-dev" },
      { bundle: "AgentsCouncil.app", executable: "AgentsCouncil" },
      { bundle: "AgentsCouncil-dev.app", executable: "AgentsCouncil-dev" },
    ];

    for (const bundle of appBundles) {
      const appExecutable = path.join(directory, bundle.bundle, "Contents", "MacOS", bundle.executable);
      candidates.push([appExecutable]);
    }
  }

  return candidates;
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

function collectCandidateRoots(): string[] {
  const roots = new Set<string>();
  roots.add(process.cwd());
  addPathAncestors(roots, process.argv[1]);
  addPathAncestors(roots, process.argv[0]);
  addPathAncestors(roots, process.execPath);
  return [...roots];
}

function addPathAncestors(target: Set<string>, inputPath: string | undefined): void {
  if (!inputPath) {
    return;
  }

  let current = path.dirname(path.resolve(inputPath));
  for (let index = 0; index < 7; index += 1) {
    target.add(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
}

function getPackagedDesktopExecutableCandidates(): string[] {
  const executableName = `${COUNCIL_DESKTOP_EXECUTABLE_BASE}${process.platform === "win32" ? ".exe" : ""}`;
  const candidates = [
    executableName,
    path.join("desktop", executableName),
    path.join("resources", "desktop", executableName),
  ];

  if (process.platform === "darwin") {
    candidates.push(path.join(`${MACOS_APP_NAME}.app`, "Contents", "MacOS", MACOS_APP_NAME));
    candidates.push(path.join("desktop", `${MACOS_APP_NAME}.app`, "Contents", "MacOS", MACOS_APP_NAME));
    candidates.push(path.join("resources", "desktop", `${MACOS_APP_NAME}.app`, "Contents", "MacOS", MACOS_APP_NAME));
  }

  return candidates;
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

function normalizePath(value: string): string {
  try {
    return realpathSync(value);
  } catch {
    return path.resolve(value);
  }
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
