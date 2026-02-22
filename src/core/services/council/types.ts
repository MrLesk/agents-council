export type CouncilState = {
  version: number;
  activeSessionId: string | null;
  sessions: CouncilSession[];
  requests: CouncilRequest[];
  feedback: CouncilFeedback[];
  participants: CouncilParticipant[];
};

export type CouncilConclusion = {
  author: string;
  content: string;
  createdAt: string;
};

export type CouncilSession = {
  id: string;
  status: "active" | "closed";
  createdAt: string;
  currentRequestId: string | null;
  conclusion: CouncilConclusion | null;
};

export type CouncilRequest = {
  id: string;
  sessionId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  status: "open" | "closed";
};

export type CouncilFeedback = {
  id: string;
  sessionId: string;
  requestId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CouncilParticipant = {
  sessionId: string;
  agentName: string;
  lastSeen: string;
  lastRequestSeen: string | null;
  lastFeedbackSeen: string | null;
};

export type StartCouncilInput = {
  request: string;
  agentName: string;
};

export type StartCouncilResult = {
  agentName: string;
  session: CouncilSession;
  request: CouncilRequest;
  state: CouncilState;
};

export type GetCurrentSessionDataInput = {
  agentName: string;
  cursor?: string;
};

export type GetCurrentSessionDataResult = {
  agentName: string;
  session: CouncilSession | null;
  request: CouncilRequest | null;
  feedback: CouncilFeedback[];
  participant: CouncilParticipant;
  nextCursor: string | null;
  pendingParticipants: string[];
  state: CouncilState;
};

export type CloseCouncilInput = {
  agentName: string;
  conclusion: string;
};

export type CloseCouncilResult = {
  agentName: string;
  session: CouncilSession;
  conclusion: CouncilConclusion;
  state: CouncilState;
};

export type SendResponseInput = {
  agentName: string;
  content: string;
};

export type SendResponseResult = {
  agentName: string;
  feedback: CouncilFeedback;
  state: CouncilState;
};

export type ListSessionsInput = {
  status?: "all" | "active" | "closed";
};

export type ListSessionsResult = {
  activeSessionId: string | null;
  sessions: CouncilSession[];
  state: CouncilState;
};

export type GetSessionDataInput = {
  agentName: string;
  sessionId: string;
  cursor?: string;
};

export type GetSessionDataResult = {
  agentName: string;
  session: CouncilSession;
  request: CouncilRequest | null;
  feedback: CouncilFeedback[];
  participant: CouncilParticipant;
  nextCursor: string | null;
  pendingParticipants: string[];
  state: CouncilState;
};

export type SetActiveSessionInput = {
  agentName: string;
  sessionId: string;
};

export type SetActiveSessionResult = {
  agentName: string;
  session: CouncilSession;
  participant: CouncilParticipant;
  state: CouncilState;
};
