import type {
  CloseCouncilResponse,
  GetCurrentSessionDataResponse,
  GlobalSettingsResponse,
  ListSessionsResponse,
  SendResponseResponse,
  StartCouncilResponse,
  SummonAgentResponse,
  SummonSettingsResponse,
} from "../ui/types";

export type BridgeResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

export type CouncilStateChangedEvent = {
  type: "state-changed";
};

export type StartCouncilPayload = {
  agent_name: string;
  request: string;
};

export type JoinCouncilPayload = {
  agent_name: string;
};

export type GetCurrentSessionDataPayload = {
  agent_name: string;
  cursor?: string;
};

export type SendResponsePayload = {
  agent_name: string;
  content: string;
};

export type CloseCouncilPayload = {
  agent_name: string;
  conclusion: string;
};

export type SetActiveSessionPayload = {
  agent_name: string;
  session_id: string;
};

export type UpdateSummonSettingsPayload = {
  agent: string;
  model?: string | null;
  reasoning_effort?: string | null;
};

export type SummonAgentPayload = {
  agent?: string | null;
  model?: string | null;
  reasoning_effort?: string | null;
};

export type UpdateSettingsPayload = {
  claude_code_path?: string | null;
  codex_path?: string | null;
};

export interface CouncilDesktopBridge {
  startCouncil: (payload: StartCouncilPayload) => Promise<BridgeResult<StartCouncilResponse>>;
  joinCouncil: (payload: JoinCouncilPayload) => Promise<BridgeResult<GetCurrentSessionDataResponse>>;
  getCurrentSessionData: (
    payload: GetCurrentSessionDataPayload,
  ) => Promise<BridgeResult<GetCurrentSessionDataResponse>>;
  listSessions: () => Promise<BridgeResult<ListSessionsResponse>>;
  setActiveSession: (payload: SetActiveSessionPayload) => Promise<BridgeResult<GetCurrentSessionDataResponse>>;
  sendResponse: (payload: SendResponsePayload) => Promise<BridgeResult<SendResponseResponse>>;
  closeCouncil: (payload: CloseCouncilPayload) => Promise<BridgeResult<CloseCouncilResponse>>;
  getSummonSettings: () => Promise<BridgeResult<SummonSettingsResponse>>;
  refreshSummonModels: () => Promise<BridgeResult<SummonSettingsResponse>>;
  updateSummonSettings: (payload: UpdateSummonSettingsPayload) => Promise<BridgeResult<SummonSettingsResponse>>;
  summonAgent: (payload: SummonAgentPayload) => Promise<BridgeResult<SummonAgentResponse>>;
  getSettings: () => Promise<BridgeResult<GlobalSettingsResponse>>;
  updateSettings: (payload: UpdateSettingsPayload) => Promise<BridgeResult<GlobalSettingsResponse>>;
  subscribeStateChanged: (listener: (event: CouncilStateChangedEvent) => void) => () => void;
}

declare global {
  interface Window {
    __COUNCIL_DESKTOP_BRIDGE__?: CouncilDesktopBridge;
  }
}
