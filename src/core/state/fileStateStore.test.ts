import { afterEach, describe, expect, test } from "bun:test";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { CouncilServiceImpl } from "../services/council";
import { FileCouncilStateStore } from "./fileStateStore";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    }),
  );
});

async function createStatePath(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "agents-council-state-"));
  tempDirs.push(directory);
  return path.join(directory, "state.json");
}

describe("FileCouncilStateStore migration and safety", () => {
  test("migrates legacy v1 state to canonical multi-session v2 state", async () => {
    const statePath = await createStatePath();
    const legacy = {
      version: 1,
      session: {
        id: "legacy-session",
        status: "active",
        createdAt: "2026-02-20T10:00:00.000Z",
        currentRequestId: "request-1",
        conclusion: null,
      },
      requests: [
        {
          id: "request-1",
          content: "legacy request",
          createdBy: "agent-a",
          createdAt: "2026-02-20T10:00:00.000Z",
          status: "open",
        },
      ],
      feedback: [
        {
          id: "feedback-1",
          requestId: "request-1",
          author: "agent-b",
          content: "legacy feedback",
          createdAt: "2026-02-20T10:01:00.000Z",
        },
      ],
      participants: [
        {
          agentName: "agent-a",
          lastSeen: "2026-02-20T10:02:00.000Z",
          lastRequestSeen: "request-1",
          lastFeedbackSeen: "feedback-1",
        },
      ],
    };

    await writeFile(statePath, `${JSON.stringify(legacy, null, 2)}\n`, "utf8");

    const store = new FileCouncilStateStore(statePath);
    const migrated = await store.load();

    expect(migrated.version).toBe(2);
    expect(migrated.activeSessionId).toBe("legacy-session");
    expect(migrated.sessions).toHaveLength(1);
    expect(migrated.requests).toHaveLength(1);
    expect(migrated.feedback).toHaveLength(1);
    expect(migrated.participants).toHaveLength(1);
    expect(migrated.requests[0]?.sessionId).toBe("legacy-session");
    expect(migrated.feedback[0]?.sessionId).toBe("legacy-session");
    expect(migrated.participants[0]?.sessionId).toBe("legacy-session");

    await store.update((state) => ({ state, result: undefined }));

    const persisted = JSON.parse(await readFile(statePath, "utf8")) as Record<string, unknown>;
    expect(persisted.version).toBe(2);
    expect(Array.isArray(persisted.sessions)).toBe(true);
    expect(persisted.activeSessionId).toBe("legacy-session");
    expect(persisted.session).toBeUndefined();
  });

  test("does not overwrite malformed JSON state files", async () => {
    const statePath = await createStatePath();
    const malformed = "{ invalid-json";
    await writeFile(statePath, malformed, "utf8");

    const store = new FileCouncilStateStore(statePath);

    await expect(store.load()).rejects.toThrow("invalid JSON");
    await expect(store.update((state) => ({ state, result: undefined }))).rejects.toThrow("invalid JSON");

    const afterFailure = await readFile(statePath, "utf8");
    expect(afterFailure).toBe(malformed);
  });

  test("preserves valid JSON and lock cleanup under concurrent updates", async () => {
    const statePath = await createStatePath();
    const store = new FileCouncilStateStore(statePath);
    const service = new CouncilServiceImpl(store);

    await service.startCouncil({ agentName: "host", request: "Need council feedback." });

    await Promise.all(
      Array.from({ length: 24 }, (_, index) =>
        service.sendResponse({
          agentName: `agent-${index + 1}`,
          content: `response-${index + 1}`,
        }),
      ),
    );

    const state = await store.load();
    const activeSessionId = state.activeSessionId;
    expect(activeSessionId).not.toBeNull();
    const activeFeedback = state.feedback.filter((entry) => entry.sessionId === activeSessionId);
    expect(activeFeedback).toHaveLength(24);

    const rawState = await readFile(statePath, "utf8");
    expect(() => JSON.parse(rawState)).not.toThrow();
    await expect(access(`${statePath}.lock`)).rejects.toThrow();
  });
});
