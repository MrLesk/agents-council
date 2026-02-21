import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { FileCouncilStateStore } from "../../state/fileStateStore";
import { CouncilServiceImpl } from "./index";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    }),
  );
});

async function createStore(): Promise<FileCouncilStateStore> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "agents-council-service-"));
  tempDirs.push(directory);
  return new FileCouncilStateStore(path.join(directory, "state.json"));
}

describe("CouncilServiceImpl multi-session lifecycle", () => {
  test("creates, lists, retrieves, and updates sessions with deterministic ordering", async () => {
    const store = await createStore();
    const service = new CouncilServiceImpl(store);

    const first = await service.startCouncil({ agentName: "alpha", request: "First request" });
    await service.sendResponse({ agentName: "advisor-1", content: "First response" });

    const second = await service.startCouncil({ agentName: "beta", request: "Second request" });
    await service.sendResponse({ agentName: "advisor-2", content: "Second response" });

    const third = await service.startCouncil({ agentName: "gamma", request: "Third request" });
    await service.closeCouncil({ agentName: "gamma", conclusion: "Third complete" });

    await service.setActiveSession({ agentName: "alpha", sessionId: first.session.id });

    const listed = await service.listSessions();
    expect(listed.sessions).toHaveLength(3);
    expect(listed.activeSessionId).toBe(first.session.id);
    expect(listed.sessions[0]?.id).toBe(first.session.id);

    const firstSessionData = await service.getSessionData({
      agentName: "reader",
      sessionId: first.session.id,
    });
    expect(firstSessionData.session.id).toBe(first.session.id);
    expect(firstSessionData.request?.id).toBe(first.request.id);
    expect(firstSessionData.feedback.every((entry) => entry.sessionId === first.session.id)).toBe(true);

    const secondSessionData = await service.getSessionData({
      agentName: "reader",
      sessionId: second.session.id,
    });
    expect(secondSessionData.session.id).toBe(second.session.id);
    expect(secondSessionData.request?.id).toBe(second.request.id);
    expect(secondSessionData.feedback.every((entry) => entry.sessionId === second.session.id)).toBe(true);

    const thirdSessionData = await service.getSessionData({
      agentName: "reader",
      sessionId: third.session.id,
    });
    expect(thirdSessionData.session.id).toBe(third.session.id);
    expect(thirdSessionData.session.status).toBe("closed");

    const state = await store.load();
    const requestsById = new Map(state.requests.map((request) => [request.id, request]));

    for (const feedback of state.feedback) {
      const request = requestsById.get(feedback.requestId);
      expect(request).toBeDefined();
      expect(request?.sessionId).toBe(feedback.sessionId);
    }

    for (const participant of state.participants) {
      expect(state.sessions.some((session) => session.id === participant.sessionId)).toBe(true);
    }
  });
});
