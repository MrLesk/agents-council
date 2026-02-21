import { describe, expect, test } from "bun:test";

import type { GetSessionDataResult, SendResponseResult } from "../../core/services/council/types";
import { mapGetCurrentSessionDataResponse, mapSendResponseResponse } from "./mapper";

describe("MCP mapper session targeting", () => {
  test("maps session data using the targeted session scope instead of active session", () => {
    const result: GetSessionDataResult = {
      agentName: "agent-a",
      session: {
        id: "session-a",
        status: "active",
        createdAt: "2026-02-22T00:00:00.000Z",
        currentRequestId: "request-a",
        conclusion: null,
      },
      request: {
        id: "request-a",
        sessionId: "session-a",
        content: "request-a",
        createdBy: "agent-a",
        createdAt: "2026-02-22T00:00:00.000Z",
        status: "open",
      },
      feedback: [
        {
          id: "feedback-a",
          sessionId: "session-a",
          requestId: "request-a",
          author: "agent-b",
          content: "feedback-a",
          createdAt: "2026-02-22T00:01:00.000Z",
        },
      ],
      participant: {
        sessionId: "session-a",
        agentName: "agent-a",
        lastSeen: "2026-02-22T00:01:00.000Z",
        lastRequestSeen: "request-a",
        lastFeedbackSeen: "feedback-a",
      },
      nextCursor: "feedback-a",
      pendingParticipants: ["agent-c"],
      state: {
        version: 2,
        activeSessionId: "session-b",
        sessions: [
          {
            id: "session-a",
            status: "active",
            createdAt: "2026-02-22T00:00:00.000Z",
            currentRequestId: "request-a",
            conclusion: null,
          },
          {
            id: "session-b",
            status: "active",
            createdAt: "2026-02-22T01:00:00.000Z",
            currentRequestId: "request-b",
            conclusion: null,
          },
        ],
        requests: [
          {
            id: "request-a",
            sessionId: "session-a",
            content: "request-a",
            createdBy: "agent-a",
            createdAt: "2026-02-22T00:00:00.000Z",
            status: "open",
          },
          {
            id: "request-b",
            sessionId: "session-b",
            content: "request-b",
            createdBy: "agent-d",
            createdAt: "2026-02-22T01:00:00.000Z",
            status: "open",
          },
        ],
        feedback: [
          {
            id: "feedback-a",
            sessionId: "session-a",
            requestId: "request-a",
            author: "agent-b",
            content: "feedback-a",
            createdAt: "2026-02-22T00:01:00.000Z",
          },
          {
            id: "feedback-b",
            sessionId: "session-b",
            requestId: "request-b",
            author: "agent-e",
            content: "feedback-b",
            createdAt: "2026-02-22T01:01:00.000Z",
          },
        ],
        participants: [
          {
            sessionId: "session-a",
            agentName: "agent-a",
            lastSeen: "2026-02-22T00:01:00.000Z",
            lastRequestSeen: "request-a",
            lastFeedbackSeen: "feedback-a",
          },
          {
            sessionId: "session-b",
            agentName: "agent-d",
            lastSeen: "2026-02-22T01:01:00.000Z",
            lastRequestSeen: "request-b",
            lastFeedbackSeen: "feedback-b",
          },
        ],
      },
    };

    const mapped = mapGetCurrentSessionDataResponse(result);
    expect(mapped.session_id).toBe("session-a");
    expect(mapped.state.session?.id).toBe("session-a");
    expect(mapped.state.requests).toHaveLength(1);
    expect(mapped.state.requests[0]?.id).toBe("request-a");
    expect(mapped.state.feedback).toHaveLength(1);
    expect(mapped.state.feedback[0]?.id).toBe("feedback-a");
    expect(mapped.state.participants).toHaveLength(1);
    expect(mapped.state.participants[0]?.agent_name).toBe("agent-a");
  });

  test("includes session_id in send_response output and scopes state to the feedback session", () => {
    const result: SendResponseResult = {
      agentName: "agent-a",
      feedback: {
        id: "feedback-b",
        sessionId: "session-b",
        requestId: "request-b",
        author: "agent-a",
        content: "feedback-b",
        createdAt: "2026-02-22T01:01:00.000Z",
      },
      state: {
        version: 2,
        activeSessionId: "session-a",
        sessions: [
          {
            id: "session-a",
            status: "active",
            createdAt: "2026-02-22T00:00:00.000Z",
            currentRequestId: "request-a",
            conclusion: null,
          },
          {
            id: "session-b",
            status: "active",
            createdAt: "2026-02-22T01:00:00.000Z",
            currentRequestId: "request-b",
            conclusion: null,
          },
        ],
        requests: [
          {
            id: "request-a",
            sessionId: "session-a",
            content: "request-a",
            createdBy: "agent-z",
            createdAt: "2026-02-22T00:00:00.000Z",
            status: "open",
          },
          {
            id: "request-b",
            sessionId: "session-b",
            content: "request-b",
            createdBy: "agent-a",
            createdAt: "2026-02-22T01:00:00.000Z",
            status: "open",
          },
        ],
        feedback: [
          {
            id: "feedback-a",
            sessionId: "session-a",
            requestId: "request-a",
            author: "agent-z",
            content: "feedback-a",
            createdAt: "2026-02-22T00:01:00.000Z",
          },
          {
            id: "feedback-b",
            sessionId: "session-b",
            requestId: "request-b",
            author: "agent-a",
            content: "feedback-b",
            createdAt: "2026-02-22T01:01:00.000Z",
          },
        ],
        participants: [
          {
            sessionId: "session-a",
            agentName: "agent-z",
            lastSeen: "2026-02-22T00:01:00.000Z",
            lastRequestSeen: "request-a",
            lastFeedbackSeen: "feedback-a",
          },
          {
            sessionId: "session-b",
            agentName: "agent-a",
            lastSeen: "2026-02-22T01:01:00.000Z",
            lastRequestSeen: "request-b",
            lastFeedbackSeen: "feedback-b",
          },
        ],
      },
    };

    const mapped = mapSendResponseResponse(result);
    expect(mapped.session_id).toBe("session-b");
    expect(mapped.state.session?.id).toBe("session-b");
    expect(mapped.state.requests).toHaveLength(1);
    expect(mapped.state.requests[0]?.id).toBe("request-b");
  });
});
