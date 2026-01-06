export type CouncilStateDto = {
  version: number;
  session: SessionDto | null;
  requests: RequestDto[];
  feedback: FeedbackDto[];
  participants: ParticipantDto[];
};

export type ConclusionDto = {
  author: string;
  content: string;
  created_at: string;
};

export type SessionDto = {
  id: string;
  status: "active" | "closed";
  created_at: string;
  current_request_id: string | null;
  conclusion: ConclusionDto | null;
};

export type RequestDto = {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  status: "open" | "closed";
};

export type FeedbackDto = {
  id: string;
  request_id: string;
  author: string;
  content: string;
  created_at: string;
};

export type ParticipantDto = {
  agent_name: string;
  last_seen: string;
  last_request_seen: string | null;
  last_feedback_seen: string | null;
};

export type StartCouncilResponse = {
  agent_name: string;
  session_id: string;
  request_id: string;
  state: CouncilStateDto;
};

export type GetCurrentSessionDataResponse = {
  agent_name: string;
  session_id: string | null;
  request: RequestDto | null;
  feedback: FeedbackDto[];
  participant: ParticipantDto;
  next_cursor: string | null;
  state: CouncilStateDto;
};

export type CloseCouncilResponse = {
  agent_name: string;
  session_id: string;
  conclusion: ConclusionDto;
  state: CouncilStateDto;
};

export type SendResponseResponse = {
  agent_name: string;
  feedback: FeedbackDto;
  state: CouncilStateDto;
};

export type SummonAgentSettingsDto = {
  model: string | null;
};

export type SummonModelInfoDto = {
  value: string;
  display_name: string;
  description: string;
};

export type SummonSettingsResponse = {
  last_used_agent: string | null;
  agents: Record<string, SummonAgentSettingsDto>;
  supported_agents: string[];
  supported_models: SummonModelInfoDto[];
  default_agent: string;
};

export type SummonAgentResponse = {
  agent: string;
  model: string | null;
  feedback: FeedbackDto;
};
