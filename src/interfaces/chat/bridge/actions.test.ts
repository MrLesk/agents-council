import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { watchCouncilState } from "../../../core/state/watcher";
import {
  closeCouncilAction,
  getCurrentSessionDataAction,
  getSettingsAction,
  getSummonSettingsAction,
  joinCouncilAction,
  sendResponseAction,
  startCouncilAction,
  summonAgentAction,
  updateSettingsAction,
  updateSummonSettingsAction,
} from "./actions";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    }),
  );

  delete process.env.AGENTS_COUNCIL_STATE_PATH;
});

async function withTempStatePath<T>(run: (statePath: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "agents-council-bridge-"));
  tempDirs.push(directory);
  const statePath = path.join(directory, "state.json");
  process.env.AGENTS_COUNCIL_STATE_PATH = statePath;
  return run(statePath);
}

async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) {
      throw new Error("Timed out waiting for condition.");
    }
    await Bun.sleep(10);
  }
}

describe("chat bridge actions", () => {
  test("supports start/join/get/send/close council flow", async () => {
    await withTempStatePath(async () => {
      const started = await startCouncilAction({
        agent_name: "host",
        request: "Need focused council feedback",
      });
      expect(started.state.session?.status).toBe("active");

      const joined = await joinCouncilAction({ agent_name: "advisor" });
      expect(joined.session_id).toBe(started.session_id);

      await sendResponseAction({
        agent_name: "advisor",
        content: "Here is the recommended approach.",
      });

      const current = await getCurrentSessionDataAction({ agent_name: "host" });
      expect(current.feedback.length).toBeGreaterThan(0);
      expect(current.feedback.at(-1)?.content).toBe("Here is the recommended approach.");

      const closed = await closeCouncilAction({
        agent_name: "host",
        conclusion: "Consensus reached.",
      });
      expect(closed.state.session?.status).toBe("closed");
      expect(closed.conclusion.content).toBe("Consensus reached.");
    });
  });

  test("emits live-update watcher notifications on state changes", async () => {
    await withTempStatePath(async (statePath) => {
      let changes = 0;
      const watcher = watchCouncilState({
        statePath,
        debounceMs: 10,
        onChange: () => {
          changes += 1;
        },
      });

      try {
        await Bun.sleep(50);

        await startCouncilAction({
          agent_name: "host",
          request: "Observe state watcher updates.",
        });

        await waitFor(() => changes >= 1, 2000);

        await sendResponseAction({
          agent_name: "observer",
          content: "Watcher update confirmation.",
        });

        await waitFor(() => changes >= 1, 2000);
      } finally {
        watcher.close();
      }
    });
  });

  test("supports summon/settings APIs with actionable validation errors", async () => {
    await withTempStatePath(async () => {
      const initialSettings = await getSettingsAction();
      expect(initialSettings.claude_code_path).toBeNull();
      expect(initialSettings.codex_path).toBeNull();

      const updatedSettings = await updateSettingsAction({
        claude_code_path: "/tmp/claude",
        codex_path: "/tmp/codex",
      });
      expect(updatedSettings.claude_code_path).toBe("/tmp/claude");
      expect(updatedSettings.codex_path).toBe("/tmp/codex");

      const summonSettings = await getSummonSettingsAction();
      expect(summonSettings.supported_agents).toContain("Claude");
      expect(summonSettings.supported_agents).toContain("Codex");

      const summonSettingsAfterUpdate = await updateSummonSettingsAction({
        agent: "Codex",
        model: null,
        reasoning_effort: null,
      });
      expect(summonSettingsAfterUpdate.last_used_agent).toBe("Codex");

      await expect(summonAgentAction({ agent: "NotSupportedAgent" })).rejects.toThrow("Unsupported agent.");
    });
  });
});
