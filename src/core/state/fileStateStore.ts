import { promises as fs } from "node:fs";

import type {
  CouncilConclusion,
  CouncilFeedback,
  CouncilParticipant,
  CouncilRequest,
  CouncilSession,
  CouncilState,
} from "../services/council/types";
import { ensureFileDirectory, withFileLock, writeJsonFileAtomic } from "./fileStore";
import { resolveCouncilStatePath } from "./path";
import type { CouncilStateStore, CouncilStateUpdater } from "./store";

const DEFAULT_STATE_VERSION = 2;
const LEGACY_STATE_VERSION = 1;
const LEGACY_MIGRATION_SESSION_ID = "legacy-session-1";

type LegacyCouncilStateV1 = {
  version?: number;
  session: LegacyCouncilSession | null;
  requests: LegacyCouncilRequest[];
  feedback: LegacyCouncilFeedback[];
  participants: LegacyCouncilParticipant[];
};

type LegacyCouncilSession = {
  id: string;
  status: "active" | "closed";
  createdAt: string;
  currentRequestId: string | null;
  conclusion: CouncilConclusion | null;
};

type LegacyCouncilRequest = {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  status: "open" | "closed";
};

type LegacyCouncilFeedback = {
  id: string;
  requestId: string;
  author: string;
  content: string;
  createdAt: string;
};

type LegacyCouncilParticipant = {
  agentName: string;
  lastSeen: string;
  lastRequestSeen: string | null;
  lastFeedbackSeen: string | null;
};

export class FileCouncilStateStore implements CouncilStateStore {
  private readonly statePath: string;

  constructor(statePath?: string) {
    this.statePath = resolveCouncilStatePath(statePath);
  }

  async load(): Promise<CouncilState> {
    const raw = await readStateJson(this.statePath);
    return normalizeCouncilState(raw);
  }

  async save(state: CouncilState): Promise<void> {
    await ensureFileDirectory(this.statePath);
    await withFileLock(this.statePath, async () => {
      const canonicalState = normalizeCouncilState(state);
      await writeJsonFileAtomic(this.statePath, canonicalState);
    });
  }

  async update<T>(updater: CouncilStateUpdater<T>): Promise<T> {
    await ensureFileDirectory(this.statePath);
    return withFileLock(this.statePath, async () => {
      const current = normalizeCouncilState(await readStateJson(this.statePath));
      const { state, result } = await updater(current);
      const canonicalState = normalizeCouncilState(state);
      await writeJsonFileAtomic(this.statePath, canonicalState);
      return result;
    });
  }
}

async function readStateJson(statePath: string): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8")) as unknown;
  } catch (error) {
    if (isErrno(error, "ENOENT")) {
      return createInitialState();
    }
    if (error instanceof SyntaxError) {
      throw new Error(`State file is invalid JSON at ${statePath}. Fix or remove the file and retry.`);
    }
    throw error;
  }
}

function normalizeCouncilState(input: unknown): CouncilState {
  if (isCouncilStateV2Candidate(input)) {
    const normalized = normalizeCouncilStateV2(input);
    assertCouncilStateIntegrity(normalized);
    return normalized;
  }

  if (isLegacyCouncilStateV1Candidate(input)) {
    const migrated = migrateLegacyCouncilStateV1(input);
    assertCouncilStateIntegrity(migrated);
    return migrated;
  }

  throw new Error("State file contains an unsupported schema.");
}

function createInitialState(): CouncilState {
  return {
    version: DEFAULT_STATE_VERSION,
    activeSessionId: null,
    sessions: [],
    requests: [],
    feedback: [],
    participants: [],
  };
}

function isCouncilStateV2Candidate(input: unknown): input is Record<string, unknown> {
  return (
    isRecord(input) && (input.version === DEFAULT_STATE_VERSION || "sessions" in input || "activeSessionId" in input)
  );
}

function normalizeCouncilStateV2(input: Record<string, unknown>): CouncilState {
  const sessions = normalizeSessions(input.sessions, "sessions");
  const requests = normalizeRequests(input.requests, "requests");
  const feedback = normalizeFeedback(input.feedback, "feedback");
  const participants = normalizeParticipants(input.participants, "participants");

  const activeSessionId = resolveActiveSessionId(
    normalizeOptionalString(input.activeSessionId) ?? normalizeOptionalString(input.active_session_id),
    sessions,
  );

  const requestIdsBySession = new Map<string, Set<string>>();
  for (const session of sessions) {
    requestIdsBySession.set(session.id, new Set());
  }

  for (const request of requests) {
    requestIdsBySession.get(request.sessionId)?.add(request.id);
  }

  const normalizedSessions = sessions.map((session) => {
    const sessionRequestIds = requestIdsBySession.get(session.id) ?? new Set<string>();
    const currentRequestId =
      session.currentRequestId && sessionRequestIds.has(session.currentRequestId)
        ? session.currentRequestId
        : findLatestOpenRequestId(requests, session.id);

    return {
      ...session,
      currentRequestId,
    };
  });

  return {
    version: DEFAULT_STATE_VERSION,
    activeSessionId,
    sessions: normalizedSessions,
    requests,
    feedback,
    participants,
  };
}

function isLegacyCouncilStateV1Candidate(input: unknown): input is LegacyCouncilStateV1 {
  if (!isRecord(input)) {
    return false;
  }

  if (input.version === LEGACY_STATE_VERSION) {
    return true;
  }

  return "session" in input && "requests" in input && "feedback" in input && "participants" in input;
}

function migrateLegacyCouncilStateV1(input: LegacyCouncilStateV1): CouncilState {
  const legacySession = normalizeLegacySession(input.session);
  const requests: CouncilRequest[] = normalizeLegacyRequests(input.requests).map((request) => ({
    ...request,
    sessionId: legacySession?.id ?? LEGACY_MIGRATION_SESSION_ID,
  }));

  const sessionIdByRequestId = new Map(requests.map((request) => [request.id, request.sessionId]));

  const feedback: CouncilFeedback[] = normalizeLegacyFeedback(input.feedback).map((entry) => ({
    ...entry,
    sessionId: sessionIdByRequestId.get(entry.requestId) ?? legacySession?.id ?? LEGACY_MIGRATION_SESSION_ID,
  }));

  const requestsWithFeedback = ensureRequestsForLegacyFeedback(
    requests,
    feedback,
    legacySession?.id ?? LEGACY_MIGRATION_SESSION_ID,
  );
  const participants: CouncilParticipant[] = normalizeLegacyParticipants(input.participants).map((participant) => ({
    ...participant,
    sessionId: legacySession?.id ?? LEGACY_MIGRATION_SESSION_ID,
  }));

  const inferredSession =
    legacySession ??
    (requestsWithFeedback.length > 0 || participants.length > 0 || feedback.length > 0
      ? {
          id: LEGACY_MIGRATION_SESSION_ID,
          status: "closed",
          createdAt: inferSessionCreatedAt(requestsWithFeedback, feedback, participants),
          currentRequestId: findLatestOpenRequestId(requestsWithFeedback, LEGACY_MIGRATION_SESSION_ID),
          conclusion: null,
        }
      : null);

  const sessions = inferredSession
    ? [
        {
          ...inferredSession,
          currentRequestId:
            inferredSession.currentRequestId &&
            requestsWithFeedback.some(
              (request) => request.id === inferredSession.currentRequestId && request.sessionId === inferredSession.id,
            )
              ? inferredSession.currentRequestId
              : findLatestOpenRequestId(requestsWithFeedback, inferredSession.id),
        },
      ]
    : [];

  return {
    version: DEFAULT_STATE_VERSION,
    activeSessionId: sessions[0]?.id ?? null,
    sessions,
    requests: requestsWithFeedback,
    feedback,
    participants,
  };
}

function normalizeLegacySession(input: unknown): LegacyCouncilSession | null {
  if (input === null || input === undefined) {
    return null;
  }
  if (!isRecord(input)) {
    throw new Error("Legacy session must be an object or null.");
  }

  return {
    id: requireString(input.id, "session.id"),
    status: requireSessionStatus(input.status, "session.status"),
    createdAt: requireString(input.createdAt ?? input.created_at, "session.createdAt"),
    currentRequestId: normalizeOptionalString(input.currentRequestId ?? input.current_request_id),
    conclusion: normalizeConclusion(input.conclusion),
  };
}

function normalizeLegacyRequests(input: unknown): LegacyCouncilRequest[] {
  if (!Array.isArray(input)) {
    throw new Error("Legacy requests must be an array.");
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`Legacy requests[${index}] must be an object.`);
    }

    return {
      id: requireString(raw.id, `requests[${index}].id`),
      content: requireString(raw.content, `requests[${index}].content`),
      createdBy: requireString(raw.createdBy ?? raw.created_by, `requests[${index}].createdBy`),
      createdAt: requireString(raw.createdAt ?? raw.created_at, `requests[${index}].createdAt`),
      status: requireRequestStatus(raw.status, `requests[${index}].status`),
    };
  });
}

function normalizeLegacyFeedback(input: unknown): LegacyCouncilFeedback[] {
  if (!Array.isArray(input)) {
    throw new Error("Legacy feedback must be an array.");
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`Legacy feedback[${index}] must be an object.`);
    }

    return {
      id: requireString(raw.id, `feedback[${index}].id`),
      requestId: requireString(raw.requestId ?? raw.request_id, `feedback[${index}].requestId`),
      author: requireString(raw.author, `feedback[${index}].author`),
      content: requireString(raw.content, `feedback[${index}].content`),
      createdAt: requireString(raw.createdAt ?? raw.created_at, `feedback[${index}].createdAt`),
    };
  });
}

function normalizeLegacyParticipants(input: unknown): LegacyCouncilParticipant[] {
  if (!Array.isArray(input)) {
    throw new Error("Legacy participants must be an array.");
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`Legacy participants[${index}] must be an object.`);
    }

    return {
      agentName: requireString(raw.agentName ?? raw.agent_name, `participants[${index}].agentName`),
      lastSeen: requireString(raw.lastSeen ?? raw.last_seen, `participants[${index}].lastSeen`),
      lastRequestSeen: normalizeOptionalString(raw.lastRequestSeen ?? raw.last_request_seen),
      lastFeedbackSeen: normalizeOptionalString(raw.lastFeedbackSeen ?? raw.last_feedback_seen),
    };
  });
}

function ensureRequestsForLegacyFeedback(
  requests: CouncilRequest[],
  feedback: CouncilFeedback[],
  fallbackSessionId: string,
): CouncilRequest[] {
  const requestsById = new Map(requests.map((request) => [request.id, request]));
  const next = [...requests];

  for (const entry of feedback) {
    if (requestsById.has(entry.requestId)) {
      continue;
    }

    const syntheticRequest: CouncilRequest = {
      id: entry.requestId,
      sessionId: entry.sessionId || fallbackSessionId,
      content: "[Migrated request unavailable]",
      createdBy: entry.author,
      createdAt: entry.createdAt,
      status: "closed",
    };
    requestsById.set(syntheticRequest.id, syntheticRequest);
    next.push(syntheticRequest);
  }

  return next;
}

function normalizeSessions(input: unknown, label: string): CouncilSession[] {
  if (!Array.isArray(input)) {
    throw new Error(`${label} must be an array.`);
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`${label}[${index}] must be an object.`);
    }

    return {
      id: requireString(raw.id, `${label}[${index}].id`),
      status: requireSessionStatus(raw.status, `${label}[${index}].status`),
      createdAt: requireString(raw.createdAt ?? raw.created_at, `${label}[${index}].createdAt`),
      currentRequestId: normalizeOptionalString(raw.currentRequestId ?? raw.current_request_id),
      conclusion: normalizeConclusion(raw.conclusion),
    };
  });
}

function normalizeRequests(input: unknown, label: string): CouncilRequest[] {
  if (!Array.isArray(input)) {
    throw new Error(`${label} must be an array.`);
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`${label}[${index}] must be an object.`);
    }

    return {
      id: requireString(raw.id, `${label}[${index}].id`),
      sessionId: requireString(raw.sessionId ?? raw.session_id, `${label}[${index}].sessionId`),
      content: requireString(raw.content, `${label}[${index}].content`),
      createdBy: requireString(raw.createdBy ?? raw.created_by, `${label}[${index}].createdBy`),
      createdAt: requireString(raw.createdAt ?? raw.created_at, `${label}[${index}].createdAt`),
      status: requireRequestStatus(raw.status, `${label}[${index}].status`),
    };
  });
}

function normalizeFeedback(input: unknown, label: string): CouncilFeedback[] {
  if (!Array.isArray(input)) {
    throw new Error(`${label} must be an array.`);
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`${label}[${index}] must be an object.`);
    }

    return {
      id: requireString(raw.id, `${label}[${index}].id`),
      sessionId: requireString(raw.sessionId ?? raw.session_id, `${label}[${index}].sessionId`),
      requestId: requireString(raw.requestId ?? raw.request_id, `${label}[${index}].requestId`),
      author: requireString(raw.author, `${label}[${index}].author`),
      content: requireString(raw.content, `${label}[${index}].content`),
      createdAt: requireString(raw.createdAt ?? raw.created_at, `${label}[${index}].createdAt`),
    };
  });
}

function normalizeParticipants(input: unknown, label: string): CouncilParticipant[] {
  if (!Array.isArray(input)) {
    throw new Error(`${label} must be an array.`);
  }

  return input.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`${label}[${index}] must be an object.`);
    }

    return {
      sessionId: requireString(raw.sessionId ?? raw.session_id, `${label}[${index}].sessionId`),
      agentName: requireString(raw.agentName ?? raw.agent_name, `${label}[${index}].agentName`),
      lastSeen: requireString(raw.lastSeen ?? raw.last_seen, `${label}[${index}].lastSeen`),
      lastRequestSeen: normalizeOptionalString(raw.lastRequestSeen ?? raw.last_request_seen),
      lastFeedbackSeen: normalizeOptionalString(raw.lastFeedbackSeen ?? raw.last_feedback_seen),
    };
  });
}

function normalizeConclusion(input: unknown): CouncilConclusion | null {
  if (input === null || input === undefined) {
    return null;
  }
  if (!isRecord(input)) {
    throw new Error("conclusion must be an object or null.");
  }

  return {
    author: requireString(input.author, "conclusion.author"),
    content: requireString(input.content, "conclusion.content"),
    createdAt: requireString(input.createdAt ?? input.created_at, "conclusion.createdAt"),
  };
}

function requireSessionStatus(value: unknown, label: string): CouncilSession["status"] {
  if (value === "active" || value === "closed") {
    return value;
  }
  throw new Error(`${label} must be "active" or "closed".`);
}

function requireRequestStatus(value: unknown, label: string): CouncilRequest["status"] {
  if (value === "open" || value === "closed") {
    return value;
  }
  throw new Error(`${label} must be "open" or "closed".`);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return normalized;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveActiveSessionId(candidate: string | null, sessions: CouncilSession[]): string | null {
  if (candidate && sessions.some((session) => session.id === candidate)) {
    return candidate;
  }

  const preferred = sessions
    .slice()
    .sort((left, right) => {
      const leftStatusRank = left.status === "active" ? 0 : 1;
      const rightStatusRank = right.status === "active" ? 0 : 1;
      if (leftStatusRank !== rightStatusRank) {
        return leftStatusRank - rightStatusRank;
      }

      const createdAtCompare = right.createdAt.localeCompare(left.createdAt);
      if (createdAtCompare !== 0) {
        return createdAtCompare;
      }

      return left.id.localeCompare(right.id);
    })
    .at(0);

  return preferred?.id ?? null;
}

function findLatestOpenRequestId(requests: CouncilRequest[], sessionId: string): string | null {
  const request = requests
    .filter((entry) => entry.sessionId === sessionId)
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "open" ? -1 : 1;
      }
      const createdAtCompare = right.createdAt.localeCompare(left.createdAt);
      if (createdAtCompare !== 0) {
        return createdAtCompare;
      }
      return left.id.localeCompare(right.id);
    })
    .at(0);

  return request?.id ?? null;
}

function inferSessionCreatedAt(
  requests: CouncilRequest[],
  feedback: CouncilFeedback[],
  participants: CouncilParticipant[],
): string {
  const candidates = [
    ...requests.map((entry) => entry.createdAt),
    ...feedback.map((entry) => entry.createdAt),
    ...participants.map((entry) => entry.lastSeen),
  ].sort((left, right) => left.localeCompare(right));

  return candidates[0] ?? new Date().toISOString();
}

function assertCouncilStateIntegrity(state: CouncilState): void {
  const sessionIds = new Set<string>();
  for (const session of state.sessions) {
    if (sessionIds.has(session.id)) {
      throw new Error(`Duplicate session id detected: ${session.id}`);
    }
    sessionIds.add(session.id);
  }

  if (state.activeSessionId && !sessionIds.has(state.activeSessionId)) {
    throw new Error(`activeSessionId does not reference an existing session: ${state.activeSessionId}`);
  }

  const requestIds = new Set<string>();
  const requestById = new Map<string, CouncilRequest>();
  for (const request of state.requests) {
    if (requestIds.has(request.id)) {
      throw new Error(`Duplicate request id detected: ${request.id}`);
    }
    if (!sessionIds.has(request.sessionId)) {
      throw new Error(`Request ${request.id} references unknown session ${request.sessionId}`);
    }
    requestIds.add(request.id);
    requestById.set(request.id, request);
  }

  const feedbackIds = new Set<string>();
  for (const entry of state.feedback) {
    if (feedbackIds.has(entry.id)) {
      throw new Error(`Duplicate feedback id detected: ${entry.id}`);
    }
    if (!sessionIds.has(entry.sessionId)) {
      throw new Error(`Feedback ${entry.id} references unknown session ${entry.sessionId}`);
    }
    const request = requestById.get(entry.requestId);
    if (!request) {
      throw new Error(`Feedback ${entry.id} references unknown request ${entry.requestId}`);
    }
    if (request.sessionId !== entry.sessionId) {
      throw new Error(
        `Feedback ${entry.id} session (${entry.sessionId}) does not match request session (${request.sessionId})`,
      );
    }
    feedbackIds.add(entry.id);
  }

  const participantKeys = new Set<string>();
  for (const participant of state.participants) {
    if (!sessionIds.has(participant.sessionId)) {
      throw new Error(`Participant ${participant.agentName} references unknown session ${participant.sessionId}`);
    }
    const participantKey = `${participant.sessionId}::${participant.agentName}`;
    if (participantKeys.has(participantKey)) {
      throw new Error(`Duplicate participant detected: ${participantKey}`);
    }
    participantKeys.add(participantKey);
  }

  for (const session of state.sessions) {
    if (!session.currentRequestId) {
      continue;
    }
    const request = requestById.get(session.currentRequestId);
    if (!request) {
      throw new Error(`Session ${session.id} references unknown currentRequestId ${session.currentRequestId}`);
    }
    if (request.sessionId !== session.id) {
      throw new Error(
        `Session ${session.id} currentRequestId ${session.currentRequestId} belongs to session ${request.sessionId}`,
      );
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isErrno(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === code
  );
}
