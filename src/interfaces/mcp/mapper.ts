import type {
  CloseCouncilParams,
  CloseCouncilResponse,
  ConclusionDto,
  CouncilStateDto,
  FeedbackDto,
  GetCurrentSessionDataParams,
  GetCurrentSessionDataResponse,
  ParticipantDto,
  RequestDto,
  SendResponseParams,
  SendResponseResponse,
  SummonAgentParams,
  SummonAgentResponse,
  SessionDto,
  StartCouncilParams,
  StartCouncilResponse,
} from "./dtos/types";
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
  SendResponseInput,
  SendResponseResult,
  StartCouncilInput,
  StartCouncilResult,
} from "../../core/services/council/types";
import type { SummonAgentInput, SummonAgentResult } from "../../core/services/council/summon";

type SendResponseToSessionInput = {
  agentName: string;
  sessionId: string;
  content: string;
};

export function mapStartCouncilInput(params: StartCouncilParams & { agent_name: string }): StartCouncilInput {
  return {
    request: params.request,
    agentName: params.agent_name,
  };
}

export function mapGetCurrentSessionDataInput(
  params: GetCurrentSessionDataParams & { agent_name: string },
): GetCurrentSessionDataInput {
  return {
    agentName: params.agent_name,
    cursor: params.cursor,
  };
}

export function mapGetSessionDataInput(
  params: GetCurrentSessionDataParams & { agent_name: string; session_id: string },
): GetSessionDataInput {
  return {
    agentName: params.agent_name,
    sessionId: params.session_id,
    cursor: params.cursor,
  };
}

export function mapCloseCouncilInput(params: CloseCouncilParams & { agent_name: string }): CloseCouncilInput {
  return {
    agentName: params.agent_name,
    conclusion: params.conclusion,
  };
}

export function mapCloseSessionInput(
  params: CloseCouncilParams & { agent_name: string; session_id: string },
): CloseSessionInput {
  return {
    agentName: params.agent_name,
    sessionId: params.session_id,
    conclusion: params.conclusion,
  };
}

export function mapSendResponseInput(params: SendResponseParams & { agent_name: string }): SendResponseInput {
  return {
    agentName: params.agent_name,
    content: params.content,
  };
}

export function mapSendResponseToSessionInput(
  params: SendResponseParams & { agent_name: string; session_id: string },
): SendResponseToSessionInput {
  return {
    agentName: params.agent_name,
    sessionId: params.session_id,
    content: params.content,
  };
}

export function mapStartCouncilResponse(result: StartCouncilResult): StartCouncilResponse {
  return {
    agent_name: result.agentName,
    session_id: result.session.id,
    request_id: result.request.id,
    state: mapCouncilState(result.state, result.session.id),
  };
}

export function mapGetCurrentSessionDataResponse(
  result: GetCurrentSessionDataResult | GetSessionDataResult,
): GetCurrentSessionDataResponse {
  const sessionId = result.session?.id ?? null;
  return {
    agent_name: result.agentName,
    session_id: sessionId,
    request: result.request ? mapRequest(result.request) : null,
    feedback: result.feedback.map(mapFeedback),
    participant: mapParticipant(result.participant),
    next_cursor: result.nextCursor,
    pending_participants: result.pendingParticipants,
    state: mapCouncilState(result.state, sessionId),
  };
}

export function mapCloseCouncilResponse(result: CloseCouncilResult | CloseSessionResult): CloseCouncilResponse {
  return {
    agent_name: result.agentName,
    session_id: result.session.id,
    conclusion: mapConclusion(result.conclusion),
    state: mapCouncilState(result.state, result.session.id),
  };
}

export function mapSendResponseResponse(result: SendResponseResult): SendResponseResponse {
  return {
    agent_name: result.agentName,
    session_id: result.feedback.sessionId,
    feedback: mapFeedback(result.feedback),
    state: mapCouncilState(result.state, result.feedback.sessionId),
  };
}

export function mapSummonAgentInput(params: SummonAgentParams): SummonAgentInput {
  return {
    agent: params.agent,
    model: params.model,
  };
}

export function mapSummonAgentResponse(result: SummonAgentResult): SummonAgentResponse {
  return {
    agent: result.agent,
    model: result.model,
    feedback: mapFeedback(result.feedback),
  };
}

function mapCouncilState(state: CouncilState, sessionId: string | null = state.activeSessionId): CouncilStateDto {
  const session = sessionId ? state.sessions.find((entry) => entry.id === sessionId) : null;
  const scopedSessionId = session?.id ?? null;
  const activeRequests = scopedSessionId
    ? state.requests.filter((request) => request.sessionId === scopedSessionId)
    : [];
  const activeFeedback = scopedSessionId
    ? state.feedback.filter((feedback) => feedback.sessionId === scopedSessionId)
    : [];
  const activeParticipants = scopedSessionId
    ? state.participants.filter((participant) => participant.sessionId === scopedSessionId)
    : [];

  return {
    version: state.version,
    session: session ? mapSession(session) : null,
    requests: activeRequests.map(mapRequest),
    feedback: activeFeedback.map(mapFeedback),
    participants: activeParticipants.map(mapParticipant),
  };
}

function mapSession(session: CouncilSession): SessionDto {
  return {
    id: session.id,
    status: session.status,
    created_at: session.createdAt,
    current_request_id: session.currentRequestId,
    conclusion: session.conclusion ? mapConclusion(session.conclusion) : null,
  };
}

function mapRequest(request: CouncilRequest): RequestDto {
  return {
    id: request.id,
    content: request.content,
    created_by: request.createdBy,
    created_at: request.createdAt,
    status: request.status,
  };
}

function mapFeedback(feedback: CouncilFeedback): FeedbackDto {
  return {
    id: feedback.id,
    request_id: feedback.requestId,
    author: feedback.author,
    content: feedback.content,
    created_at: feedback.createdAt,
  };
}

function mapConclusion(conclusion: CouncilConclusion): ConclusionDto {
  return {
    author: conclusion.author,
    content: conclusion.content,
    created_at: conclusion.createdAt,
  };
}

function mapParticipant(participant: CouncilParticipant): ParticipantDto {
  return {
    agent_name: participant.agentName,
    last_seen: participant.lastSeen,
    last_request_seen: participant.lastRequestSeen,
    last_feedback_seen: participant.lastFeedbackSeen,
  };
}
