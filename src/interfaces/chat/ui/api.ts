import type {
  BridgeResult,
  CloseCouncilPayload,
  CouncilDesktopBridge,
  CouncilStateChangedEvent,
  GetCurrentSessionDataPayload,
  JoinCouncilPayload,
  SetActiveSessionPayload,
  SendResponsePayload,
  StartCouncilPayload,
  SummonAgentPayload,
  UpdateSettingsPayload,
  UpdateSummonSettingsPayload,
} from "../bridge/contract";
import type {
  CloseCouncilResponse,
  GetCurrentSessionDataResponse,
  GlobalSettingsResponse,
  ListSessionsResponse,
  SendResponseResponse,
  StartCouncilResponse,
  SummonAgentResponse,
  SummonSettingsResponse,
} from "./types";

type BridgeOptions<T> = {
  path: string;
  payload: Record<string, unknown>;
  bridgeCall: (bridge: CouncilDesktopBridge) => Promise<BridgeResult<T>>;
};

export type CouncilStateChangeSubscription = {
  close: () => void;
};

export type CouncilStateChangeHandlers = {
  onChange: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: string }).error)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

async function callBridgeOrHttp<T>(options: BridgeOptions<T>): Promise<T> {
  const bridge = resolveDesktopBridge();
  if (bridge) {
    const result = await options.bridgeCall(bridge);
    if (!result.ok) {
      throw new Error(result.error || "Request failed.");
    }
    return result.data;
  }

  return postJson<T>(options.path, options.payload);
}

export async function startCouncil(agentName: string, request: string): Promise<StartCouncilResponse> {
  const payload: StartCouncilPayload = {
    agent_name: agentName,
    request,
  };

  return callBridgeOrHttp({
    path: "/start-council",
    payload,
    bridgeCall: (bridge) => bridge.startCouncil(payload),
  });
}

export async function joinCouncil(agentName: string): Promise<GetCurrentSessionDataResponse> {
  const payload: JoinCouncilPayload = {
    agent_name: agentName,
  };

  return callBridgeOrHttp({
    path: "/join-council",
    payload,
    bridgeCall: (bridge) => bridge.joinCouncil(payload),
  });
}

export async function getCurrentSessionData(agentName: string): Promise<GetCurrentSessionDataResponse> {
  const payload: GetCurrentSessionDataPayload = {
    agent_name: agentName,
  };

  return callBridgeOrHttp({
    path: "/get-current-session-data",
    payload,
    bridgeCall: (bridge) => bridge.getCurrentSessionData(payload),
  });
}

export async function listSessions(): Promise<ListSessionsResponse> {
  return callBridgeOrHttp({
    path: "/list-sessions",
    payload: {},
    bridgeCall: (bridge) => bridge.listSessions(),
  });
}

export async function setActiveSession(agentName: string, sessionId: string): Promise<GetCurrentSessionDataResponse> {
  const payload: SetActiveSessionPayload = {
    agent_name: agentName,
    session_id: sessionId,
  };

  return callBridgeOrHttp({
    path: "/set-active-session",
    payload,
    bridgeCall: (bridge) => bridge.setActiveSession(payload),
  });
}

export async function sendResponse(agentName: string, content: string): Promise<SendResponseResponse> {
  const payload: SendResponsePayload = {
    agent_name: agentName,
    content,
  };

  return callBridgeOrHttp({
    path: "/send-response",
    payload,
    bridgeCall: (bridge) => bridge.sendResponse(payload),
  });
}

export async function closeCouncil(agentName: string, conclusion: string): Promise<CloseCouncilResponse> {
  const payload: CloseCouncilPayload = {
    agent_name: agentName,
    conclusion,
  };

  return callBridgeOrHttp({
    path: "/close-council",
    payload,
    bridgeCall: (bridge) => bridge.closeCouncil(payload),
  });
}

export async function getSummonSettings(): Promise<SummonSettingsResponse> {
  return callBridgeOrHttp({
    path: "/get-summon-settings",
    payload: {},
    bridgeCall: (bridge) => bridge.getSummonSettings(),
  });
}

export async function refreshSummonModels(): Promise<SummonSettingsResponse> {
  return callBridgeOrHttp({
    path: "/refresh-summon-models",
    payload: {},
    bridgeCall: (bridge) => bridge.refreshSummonModels(),
  });
}

export async function updateSummonSettings(payload: UpdateSummonSettingsPayload): Promise<SummonSettingsResponse> {
  return callBridgeOrHttp({
    path: "/update-summon-settings",
    payload,
    bridgeCall: (bridge) => bridge.updateSummonSettings(payload),
  });
}

export async function summonAgent(payload: SummonAgentPayload): Promise<SummonAgentResponse> {
  return callBridgeOrHttp({
    path: "/summon-agent",
    payload,
    bridgeCall: (bridge) => bridge.summonAgent(payload),
  });
}

export async function getSettings(): Promise<GlobalSettingsResponse> {
  return callBridgeOrHttp({
    path: "/get-settings",
    payload: {},
    bridgeCall: (bridge) => bridge.getSettings(),
  });
}

export async function updateSettings(payload: UpdateSettingsPayload): Promise<GlobalSettingsResponse> {
  return callBridgeOrHttp({
    path: "/update-settings",
    payload,
    bridgeCall: (bridge) => bridge.updateSettings(payload),
  });
}

export function subscribeCouncilStateChanges(
  handlers: CouncilStateChangeHandlers,
): CouncilStateChangeSubscription | null {
  const bridge = resolveDesktopBridge();
  if (bridge) {
    handlers.onConnect?.();
    const unsubscribe = bridge.subscribeStateChanged((_event: CouncilStateChangedEvent) => {
      handlers.onChange();
    });

    return {
      close: () => {
        unsubscribe();
      },
    };
  }

  const wsUrl = resolveWebSocketUrl();
  if (!wsUrl || typeof WebSocket === "undefined") {
    return null;
  }

  const ws = new WebSocket(wsUrl);

  ws.addEventListener("open", () => {
    handlers.onConnect?.();
  });

  const handleDisconnect = () => {
    handlers.onDisconnect?.();
  };

  ws.addEventListener("close", handleDisconnect);
  ws.addEventListener("error", handleDisconnect);
  ws.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(String(event.data)) as { type?: string };
      if (payload.type === "state-changed") {
        handlers.onChange();
        return;
      }
    } catch {
      // Fall through and still refresh
    }
    handlers.onChange();
  });

  return {
    close: () => {
      ws.close();
    },
  };
}

export function resolveWebSocketUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}

function resolveDesktopBridge(): CouncilDesktopBridge | null {
  if (typeof window === "undefined") {
    return null;
  }

  const bridge = window.__COUNCIL_DESKTOP_BRIDGE__;
  return bridge ?? null;
}
