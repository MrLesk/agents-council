import type {
  CloseCouncilResponse,
  GetCurrentSessionDataResponse,
  GlobalSettingsResponse,
  SendResponseResponse,
  StartCouncilResponse,
  SummonAgentResponse,
  SummonSettingsResponse,
} from "./types";

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

export async function startCouncil(agentName: string, request: string): Promise<StartCouncilResponse> {
  return postJson<StartCouncilResponse>("/start-council", {
    agent_name: agentName,
    request,
  });
}

export async function joinCouncil(agentName: string): Promise<GetCurrentSessionDataResponse> {
  return postJson<GetCurrentSessionDataResponse>("/join-council", {
    agent_name: agentName,
  });
}

export async function getCurrentSessionData(agentName: string): Promise<GetCurrentSessionDataResponse> {
  return postJson<GetCurrentSessionDataResponse>("/get-current-session-data", {
    agent_name: agentName,
  });
}

export async function sendResponse(agentName: string, content: string): Promise<SendResponseResponse> {
  return postJson<SendResponseResponse>("/send-response", {
    agent_name: agentName,
    content,
  });
}

export async function closeCouncil(agentName: string, conclusion: string): Promise<CloseCouncilResponse> {
  return postJson<CloseCouncilResponse>("/close-council", {
    agent_name: agentName,
    conclusion,
  });
}

export async function getSummonSettings(): Promise<SummonSettingsResponse> {
  return postJson<SummonSettingsResponse>("/get-summon-settings", {});
}

export async function refreshSummonModels(): Promise<SummonSettingsResponse> {
  return postJson<SummonSettingsResponse>("/refresh-summon-models", {});
}

export async function updateSummonSettings(payload: {
  agent: string;
  model?: string | null;
  reasoning_effort?: string | null;
}): Promise<SummonSettingsResponse> {
  return postJson<SummonSettingsResponse>("/update-summon-settings", payload);
}

export async function summonAgent(payload: {
  agent?: string | null;
  model?: string | null;
  reasoning_effort?: string | null;
}): Promise<SummonAgentResponse> {
  return postJson<SummonAgentResponse>("/summon-agent", payload);
}

export async function getSettings(): Promise<GlobalSettingsResponse> {
  return postJson<GlobalSettingsResponse>("/get-settings", {});
}

export async function updateSettings(payload: {
  claude_code_path?: string | null;
  codex_path?: string | null;
}): Promise<GlobalSettingsResponse> {
  return postJson<GlobalSettingsResponse>("/update-settings", payload);
}

export function resolveWebSocketUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}
