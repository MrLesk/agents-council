import { randomUUID } from "node:crypto";

import type { CouncilStateStore } from "../../state/store";
import type {
  CloseCouncilInput,
  CloseCouncilResult,
  CloseSessionInput,
  CloseSessionResult,
  CouncilConclusion,
  CouncilFeedback,
  CouncilParticipant,
  CouncilRequest,
  CouncilSession,
  CouncilState,
  GetCurrentSessionDataInput,
  GetCurrentSessionDataResult,
  GetSessionDataInput,
  GetSessionDataResult,
  ListSessionsInput,
  ListSessionsResult,
  SendResponseInput,
  SendResponseResult,
  SetActiveSessionInput,
  SetActiveSessionResult,
  StartCouncilInput,
  StartCouncilResult,
} from "./types";

export interface CouncilService {
  startCouncil(input: StartCouncilInput): Promise<StartCouncilResult>;
  getCurrentSessionData(input: GetCurrentSessionDataInput): Promise<GetCurrentSessionDataResult>;
  closeCouncil(input: CloseCouncilInput): Promise<CloseCouncilResult>;
  closeSession(input: CloseSessionInput): Promise<CloseSessionResult>;
  sendResponse(input: SendResponseInput): Promise<SendResponseResult>;
  listSessions(input?: ListSessionsInput): Promise<ListSessionsResult>;
  getSessionData(input: GetSessionDataInput): Promise<GetSessionDataResult>;
  setActiveSession(input: SetActiveSessionInput): Promise<SetActiveSessionResult>;
}

export class CouncilServiceImpl implements CouncilService {
  constructor(private readonly store: CouncilStateStore) {}

  async startCouncil(input: StartCouncilInput): Promise<StartCouncilResult> {
    return this.store.update((state) => {
      const now = nowIso();
      const session = createSession(now);
      const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
        allowReuse: true,
      });
      const requestId = randomUUID();
      const request: CouncilRequest = {
        id: requestId,
        sessionId: session.id,
        content: input.request,
        createdBy: agentName,
        createdAt: now,
        status: "open",
      };

      const { participants, participant } = updateParticipant(
        state.participants,
        session.id,
        agentName,
        now,
        (candidate) => ({
          ...candidate,
          lastSeen: now,
          lastRequestSeen: requestId,
        }),
      );

      const nextSession: CouncilSession = {
        ...session,
        status: "active",
        currentRequestId: requestId,
      };

      const nextState: CouncilState = {
        ...state,
        activeSessionId: nextSession.id,
        sessions: [...state.sessions, nextSession],
        requests: [...state.requests, request],
        participants,
      };

      return {
        state: nextState,
        result: {
          agentName: participant.agentName,
          session: nextSession,
          request,
          state: nextState,
        },
      };
    });
  }

  async getCurrentSessionData(input: GetCurrentSessionDataInput): Promise<GetCurrentSessionDataResult> {
    const state = await this.store.load();
    const session = getActiveSession(state);
    const now = nowIso();

    if (!session) {
      const { agentName } = resolveAgentName([], input.agentName, { allowReuse: true });
      return {
        agentName,
        session: null,
        request: null,
        feedback: [],
        participant: createTransientParticipant(agentName, now),
        nextCursor: input.cursor ?? null,
        pendingParticipants: [],
        state,
      };
    }

    const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
      allowReuse: true,
    });
    const { nextState, participant, request, feedback, nextCursor, pendingParticipants } = buildSessionData(
      state,
      session.id,
      agentName,
      input.cursor,
      now,
    );

    return {
      agentName: participant.agentName,
      session,
      request,
      feedback,
      participant,
      nextCursor,
      pendingParticipants,
      state: nextState,
    };
  }

  async closeCouncil(input: CloseCouncilInput): Promise<CloseCouncilResult> {
    const state = await this.store.load();
    const session = getActiveSession(state);
    if (!session) {
      throw new Error("No active session.");
    }

    return this.closeSession({
      agentName: input.agentName,
      sessionId: session.id,
      conclusion: input.conclusion,
    });
  }

  async closeSession(input: CloseSessionInput): Promise<CloseSessionResult> {
    return this.store.update((state) => {
      const session = findSessionById(state, input.sessionId);
      if (!session) {
        throw new Error("Session not found.");
      }
      if (session.status === "closed") {
        throw new Error("Council session is already closed.");
      }

      const now = nowIso();
      const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
        allowReuse: true,
      });
      const conclusion: CouncilConclusion = {
        author: agentName,
        content: input.conclusion,
        createdAt: now,
      };
      const request = getCurrentRequestForSession(state, session.id);
      const updatedSession: CouncilSession = {
        ...session,
        status: "closed",
        conclusion,
      };
      const updatedSessions = state.sessions.map((item) => (item.id === updatedSession.id ? updatedSession : item));
      const updatedRequests: CouncilRequest[] = request
        ? state.requests.map((item) => (item.id === request.id ? { ...item, status: "closed" } : item))
        : state.requests;
      const lastFeedback = getFeedbackForSession(state, session.id).at(-1);
      const { participants, participant } = updateParticipant(
        state.participants,
        session.id,
        agentName,
        now,
        (candidate) => ({
          ...candidate,
          lastSeen: now,
          lastRequestSeen: request ? request.id : candidate.lastRequestSeen,
          lastFeedbackSeen: lastFeedback ? lastFeedback.id : candidate.lastFeedbackSeen,
        }),
      );
      const nextState: CouncilState = {
        ...state,
        activeSessionId: resolveActiveSessionIdAfterClose({
          sessions: updatedSessions,
          activeSessionId: state.activeSessionId,
          closedSessionId: updatedSession.id,
        }),
        sessions: updatedSessions,
        requests: updatedRequests,
        participants,
      };

      return {
        state: nextState,
        result: {
          agentName: participant.agentName,
          session: updatedSession,
          conclusion,
          state: nextState,
        },
      };
    });
  }

  async sendResponse(input: SendResponseInput): Promise<SendResponseResult> {
    return this.sendResponseToSession({
      agentName: input.agentName,
      content: input.content,
      sessionId: null,
    });
  }

  async listSessions(input: ListSessionsInput = {}): Promise<ListSessionsResult> {
    const state = await this.store.load();
    const status = input.status ?? "all";
    const sessions = sortSessionsForListing(state.sessions, state.activeSessionId).filter((session) => {
      if (status === "all") {
        return true;
      }
      return session.status === status;
    });

    return {
      activeSessionId: state.activeSessionId,
      sessions,
      state,
    };
  }

  async getSessionData(input: GetSessionDataInput): Promise<GetSessionDataResult> {
    const state = await this.store.load();
    const session = findSessionById(state, input.sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    const now = nowIso();
    const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
      allowReuse: true,
    });
    const { nextState, participant, request, feedback, nextCursor, pendingParticipants } = buildSessionData(
      state,
      session.id,
      agentName,
      input.cursor,
      now,
    );

    return {
      agentName: participant.agentName,
      session,
      request,
      feedback,
      participant,
      nextCursor,
      pendingParticipants,
      state: nextState,
    };
  }

  async setActiveSession(input: SetActiveSessionInput): Promise<SetActiveSessionResult> {
    return this.store.update((state) => {
      const session = findSessionById(state, input.sessionId);
      if (!session) {
        throw new Error("Session not found.");
      }

      const now = nowIso();
      const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
        allowReuse: true,
      });
      const { participants, participant } = updateParticipant(
        state.participants,
        session.id,
        agentName,
        now,
        (candidate) => ({
          ...candidate,
          lastSeen: now,
          lastRequestSeen: session.currentRequestId ?? candidate.lastRequestSeen,
        }),
      );

      const nextState: CouncilState = {
        ...state,
        activeSessionId: session.id,
        participants,
      };

      return {
        state: nextState,
        result: {
          agentName: participant.agentName,
          session,
          participant,
          state: nextState,
        },
      };
    });
  }

  async sendResponseToSession(input: {
    agentName: string;
    content: string;
    sessionId: string | null;
  }): Promise<SendResponseResult> {
    return this.store.update((state) => {
      const session = input.sessionId ? findSessionById(state, input.sessionId) : getActiveSession(state);
      if (!session) {
        throw new Error("No active session.");
      }
      if (session.status === "closed") {
        throw new Error("Council session is closed.");
      }

      const request = getCurrentRequestForSession(state, session.id);
      if (!request) {
        throw new Error("No active request.");
      }

      const now = nowIso();
      const { agentName } = resolveAgentName(getParticipantsForSession(state, session.id), input.agentName, {
        allowReuse: true,
      });
      const feedback: CouncilFeedback = {
        id: randomUUID(),
        sessionId: session.id,
        requestId: request.id,
        author: agentName,
        content: input.content,
        createdAt: now,
      };

      const { participants, participant } = updateParticipant(
        state.participants,
        session.id,
        agentName,
        now,
        (candidate) => ({
          ...candidate,
          lastSeen: now,
          lastRequestSeen: request.id,
          lastFeedbackSeen: feedback.id,
        }),
      );

      const nextState: CouncilState = {
        ...state,
        feedback: [...state.feedback, feedback],
        participants,
      };

      return {
        state: nextState,
        result: {
          agentName: participant.agentName,
          feedback,
          state: nextState,
        },
      };
    });
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function createSession(createdAt: string): CouncilSession {
  return {
    id: randomUUID(),
    status: "active",
    createdAt,
    currentRequestId: null,
    conclusion: null,
  };
}

export function findSessionById(state: CouncilState, sessionId: string): CouncilSession | null {
  return state.sessions.find((session) => session.id === sessionId) ?? null;
}

export function getActiveSession(state: CouncilState): CouncilSession | null {
  const sessionId = state.activeSessionId;
  if (!sessionId) {
    return null;
  }
  return findSessionById(state, sessionId);
}

export function getCurrentRequestForSession(state: CouncilState, sessionId: string): CouncilRequest | null {
  const session = findSessionById(state, sessionId);
  const currentId = session?.currentRequestId;
  if (!currentId) {
    return null;
  }

  return state.requests.find((request) => request.id === currentId && request.sessionId === sessionId) ?? null;
}

export function getFeedbackForSession(state: CouncilState, sessionId: string): CouncilFeedback[] {
  return state.feedback.filter((entry) => entry.sessionId === sessionId);
}

export function getParticipantsForSession(state: CouncilState, sessionId: string): CouncilParticipant[] {
  return state.participants.filter((entry) => entry.sessionId === sessionId);
}

function buildSessionData(
  state: CouncilState,
  sessionId: string,
  agentName: string,
  cursor: string | undefined,
  now: string,
): {
  nextState: CouncilState;
  participant: CouncilParticipant;
  request: CouncilRequest | null;
  feedback: CouncilFeedback[];
  nextCursor: string | null;
  pendingParticipants: string[];
} {
  const effectiveCursor = cursor ?? null;
  const request = getCurrentRequestForSession(state, sessionId);
  const allFeedback = getFeedbackForSession(state, sessionId);
  const feedback = sliceAfterId(allFeedback, effectiveCursor);
  const lastFeedback = feedback.at(-1);
  const nextCursor = lastFeedback ? lastFeedback.id : effectiveCursor;

  const { participants, participant } = updateParticipant(
    state.participants,
    sessionId,
    agentName,
    now,
    (candidate) => ({
      ...candidate,
      lastSeen: now,
      lastRequestSeen: request ? request.id : candidate.lastRequestSeen,
      lastFeedbackSeen: nextCursor,
    }),
  );

  const allPending = computePendingParticipants(
    getParticipantsForSession({ ...state, participants }, sessionId),
    allFeedback,
    request?.id ?? null,
    request?.createdBy ?? null,
  );
  const pendingParticipants = allPending.filter((name) => name !== agentName);

  return {
    nextState: {
      ...state,
      participants,
    },
    participant,
    request,
    feedback,
    nextCursor,
    pendingParticipants,
  };
}

function computePendingParticipants(
  participants: CouncilParticipant[],
  allFeedback: CouncilFeedback[],
  currentRequestId: string | null,
  requestCreator: string | null,
): string[] {
  if (!currentRequestId) {
    return [];
  }
  const feedbackForRequest = allFeedback.filter((entry) => entry.requestId === currentRequestId);
  const authorsWithFeedback = new Set(feedbackForRequest.map((entry) => entry.author));
  if (requestCreator) {
    authorsWithFeedback.add(requestCreator);
  }

  return participants.filter((entry) => !authorsWithFeedback.has(entry.agentName)).map((entry) => entry.agentName);
}

function sliceAfterId<T extends { id: string }>(items: T[], lastSeenId: string | null): T[] {
  if (!lastSeenId) {
    return items;
  }

  const index = items.findIndex((item) => item.id === lastSeenId);
  if (index === -1) {
    return items;
  }

  return items.slice(index + 1);
}

function resolveAgentName(
  participants: CouncilParticipant[],
  requestedName: string,
  options: { allowReuse: boolean },
): { agentName: string; existingParticipant: CouncilParticipant | null } {
  const existingParticipant = participants.find((participant) => participant.agentName === requestedName) ?? null;
  if (existingParticipant && options.allowReuse) {
    return { agentName: existingParticipant.agentName, existingParticipant };
  }

  return {
    agentName: nextAvailableAgentName(participants, requestedName),
    existingParticipant: options.allowReuse ? existingParticipant : null,
  };
}

function nextAvailableAgentName(participants: CouncilParticipant[], requestedName: string): string {
  if (!participants.some((participant) => participant.agentName === requestedName)) {
    return requestedName;
  }

  let suffix = 1;
  while (participants.some((participant) => participant.agentName === `${requestedName}#${suffix}`)) {
    suffix += 1;
  }

  return `${requestedName}#${suffix}`;
}

export function updateParticipant(
  participants: CouncilParticipant[],
  sessionId: string,
  agentName: string,
  now: string,
  updater: (participant: CouncilParticipant) => CouncilParticipant,
): { participants: CouncilParticipant[]; participant: CouncilParticipant } {
  const index = participants.findIndex(
    (participant) => participant.sessionId === sessionId && participant.agentName === agentName,
  );
  const baseParticipant =
    index >= 0 && participants[index]
      ? participants[index]
      : {
          sessionId,
          agentName,
          lastSeen: now,
          lastRequestSeen: null,
          lastFeedbackSeen: null,
        };
  const updated = updater(baseParticipant);
  const nextParticipants =
    index >= 0
      ? [...participants.slice(0, index), updated, ...participants.slice(index + 1)]
      : [...participants, updated];

  return { participants: nextParticipants, participant: updated };
}

function createTransientParticipant(agentName: string, now: string): CouncilParticipant {
  return {
    sessionId: "",
    agentName,
    lastSeen: now,
    lastRequestSeen: null,
    lastFeedbackSeen: null,
  };
}

export function sortSessionsForListing(sessions: CouncilSession[], activeSessionId: string | null): CouncilSession[] {
  return [...sessions].sort((left, right) => {
    const leftActiveRank = left.id === activeSessionId ? 0 : 1;
    const rightActiveRank = right.id === activeSessionId ? 0 : 1;
    if (leftActiveRank !== rightActiveRank) {
      return leftActiveRank - rightActiveRank;
    }

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
  });
}

function resolveActiveSessionIdAfterClose(input: {
  sessions: CouncilSession[];
  activeSessionId: string | null;
  closedSessionId: string;
}): string | null {
  if (input.activeSessionId !== input.closedSessionId) {
    return input.activeSessionId;
  }

  const fallback = sortSessionsForListing(input.sessions, null).find((session) => session.status === "active");
  return fallback?.id ?? null;
}
