import type { Server } from "bun";

import type { SummonSettings } from "../../core/config/summonSettings";
import { loadSummonSettings, upsertSummonSettings } from "../../core/config/summonSettings";
import { CouncilServiceImpl } from "../../core/services/council";
import {
  SUPPORTED_SUMMON_AGENTS,
  getClaudeCodeVersion,
  loadSupportedSummonModelsByAgent,
  isSupportedSummonAgent,
  resolveDefaultSummonAgent,
  summonAgent,
} from "../../core/services/council/summon";
import { FileCouncilStateStore } from "../../core/state/fileStateStore";
import type { CouncilStateWatcher } from "../../core/state/watcher";
import { watchCouncilState } from "../../core/state/watcher";
import chatUi from "./ui/index.html";
import {
  mapCloseCouncilInput,
  mapCloseCouncilResponse,
  mapGetCurrentSessionDataInput,
  mapGetCurrentSessionDataResponse,
  mapSendResponseInput,
  mapSendResponseResponse,
  mapSummonAgentResponse,
  mapStartCouncilInput,
  mapStartCouncilResponse,
} from "../mcp/mapper";
import type {
  CloseCouncilParams,
  GetCurrentSessionDataParams,
  JoinCouncilParams,
  SendResponseParams,
  StartCouncilParams,
} from "../mcp/dtos/types";

type ChatServerOptions = {
  port: number;
  hostname?: string;
};

type JsonRecord = Record<string, unknown>;
type SummonAgentSettingsDto = {
  model: string | null;
};

type SummonModelInfoDto = {
  value: string;
  display_name: string;
  description: string;
};

type SummonSettingsResponse = {
  last_used_agent: string | null;
  agents: Record<string, SummonAgentSettingsDto>;
  supported_agents: string[];
  supported_models_by_agent: Record<string, SummonModelInfoDto[]>;
  default_agent: string;
  claude_code_path: string | null;
  claude_code_version: string | null;
};

type GlobalSettingsResponse = {
  claude_code_path: string | null;
};

export type ChatServer = {
  server: Server<undefined>;
  url: string;
  close: () => void;
};

const service = new CouncilServiceImpl(new FileCouncilStateStore());
const STATE_TOPIC = "council-state";
const STATE_CHANGED_EVENT = JSON.stringify({ type: "state-changed" });
export function startChatServer(options: ChatServerOptions): ChatServer {
  const hostname = options.hostname ?? "127.0.0.1";
  const port = options.port;
  let server: Server<undefined>;
  let watcher: CouncilStateWatcher | null = null;

  try {
    server = Bun.serve({
      hostname,
      port,
      routes: {
        "/": chatUi,
      },
      async fetch(req, bunServer) {
        try {
          const url = new URL(req.url);
          if (req.method === "GET" && url.pathname === "/ws") {
            const upgraded = bunServer.upgrade(req);
            if (upgraded) {
              return;
            }
            return jsonError(400, "WebSocket upgrade failed.");
          }
          if (req.method === "POST") {
            switch (url.pathname) {
              case "/start-council":
                return await handleStartCouncil(req);
              case "/join-council":
                return await handleJoinCouncil(req);
              case "/get-current-session-data":
                return await handleGetCurrentSessionData(req);
              case "/send-response":
                return await handleSendResponse(req);
              case "/close-council":
                return await handleCloseCouncil(req);
              case "/get-summon-settings":
                return await handleGetSummonSettings();
              case "/update-summon-settings":
                return await handleUpdateSummonSettings(req);
              case "/summon-agent":
                return await handleSummonAgent(req);
              case "/get-settings":
                return await handleGetSettings();
              case "/update-settings":
                return await handleUpdateSettings(req);
              default:
                return jsonError(404, "Not found.");
            }
          }

          return jsonError(404, "Not found.");
        } catch (error) {
          if (error instanceof ApiError) {
            return jsonError(error.status, error.message);
          }
          return jsonError(500, getErrorMessage(error));
        }
      },
      websocket: {
        open(ws) {
          try {
            ws.subscribe(STATE_TOPIC);
          } catch {
            // Ignore subscription errors.
          }
        },
        message() {
          // Ignore incoming messages from clients.
        },
        close(ws) {
          try {
            ws.unsubscribe(STATE_TOPIC);
          } catch {
            // Ignore unsubscribe errors.
          }
        },
      },
    });
  } catch (error) {
    if (isErrno(error, "EADDRINUSE")) {
      throw new Error(
        `Port ${port} is already in use. Close the other council chat instance or launch with --port/-p to use a different port.`,
      );
    }
    throw error;
  }

  watcher = watchCouncilState({
    onChange: () => {
      try {
        server.publish(STATE_TOPIC, STATE_CHANGED_EVENT);
      } catch {
        // Ignore publish errors to avoid destabilizing the server.
      }
    },
  });

  return {
    server,
    url: `http://localhost:${server.port}`,
    close: () => {
      watcher?.close();
      watcher = null;
    },
  };
}

async function handleStartCouncil(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const params: StartCouncilParams & { agent_name: string } = {
    request: requireString(body, "request"),
    agent_name: requireString(body, "agent_name"),
  };
  const result = await service.startCouncil(mapStartCouncilInput(params));
  return Response.json(mapStartCouncilResponse(result));
}

async function handleJoinCouncil(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const params: JoinCouncilParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
  };
  const result = await service.getCurrentSessionData(mapGetCurrentSessionDataInput(params));
  return Response.json(mapGetCurrentSessionDataResponse(result));
}

async function handleGetCurrentSessionData(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const params: GetCurrentSessionDataParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    cursor: optionalString(body, "cursor"),
  };
  const result = await service.getCurrentSessionData(mapGetCurrentSessionDataInput(params));
  return Response.json(mapGetCurrentSessionDataResponse(result));
}

async function handleSendResponse(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const params: SendResponseParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    content: requireString(body, "content"),
  };
  const result = await service.sendResponse(mapSendResponseInput(params));
  return Response.json(mapSendResponseResponse(result));
}

async function handleCloseCouncil(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const params: CloseCouncilParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    conclusion: requireString(body, "conclusion"),
  };
  const result = await service.closeCouncil(mapCloseCouncilInput(params));
  return Response.json(mapCloseCouncilResponse(result));
}

async function handleGetSummonSettings(): Promise<Response> {
  const [settings, supportedModelsByAgent, version] = await Promise.all([
    loadSummonSettings(),
    loadSupportedSummonModelsByAgent(),
    getClaudeCodeVersion(),
  ]);
  const supportedModelDtosByAgent = mapSupportedModelsByAgent(supportedModelsByAgent);
  return Response.json(mapSummonSettings(settings, supportedModelDtosByAgent, version));
}

async function handleUpdateSummonSettings(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const agent = requireString(body, "agent");
  if (!isSupportedSummonAgent(agent)) {
    throw new ApiError(400, "Unsupported agent.");
  }

  const model = optionalStringOrNull(body, "model");
  const update: {
    lastUsedAgent: string;
    agents?: Record<string, { model?: string | null }>;
  } = {
    lastUsedAgent: agent,
  };

  const agentUpdate: { model?: string | null } = {};
  if (model !== undefined) {
    agentUpdate.model = model;
  }
  if (Object.keys(agentUpdate).length > 0) {
    update.agents = { [agent]: agentUpdate };
  }

  const updated = await upsertSummonSettings(update);
  const [supportedModelsByAgent, version] = await Promise.all([
    loadSupportedSummonModelsByAgent(),
    getClaudeCodeVersion(),
  ]);
  const supportedModelDtosByAgent = mapSupportedModelsByAgent(supportedModelsByAgent);
  return Response.json(mapSummonSettings(updated, supportedModelDtosByAgent, version));
}

async function handleSummonAgent(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const settings = await loadSummonSettings();
  const requestedAgent = optionalStringOrNull(body, "agent");
  const defaultAgent = resolveDefaultSummonAgent(settings.lastUsedAgent, SUPPORTED_SUMMON_AGENTS);
  const agent = typeof requestedAgent === "string" ? requestedAgent : defaultAgent;
  if (!isSupportedSummonAgent(agent)) {
    throw new ApiError(400, "Unsupported agent.");
  }

  const model = optionalStringOrNull(body, "model");
  const result = await summonAgent({
    agent,
    model,
  });

  return Response.json(mapSummonAgentResponse(result));
}

async function handleGetSettings(): Promise<Response> {
  const settings = await loadSummonSettings();
  const response: GlobalSettingsResponse = {
    claude_code_path: settings.claudeCodePath,
  };
  return Response.json(response);
}

async function handleUpdateSettings(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const claudeCodePath = optionalStringOrNull(body, "claude_code_path");

  const update: { claudeCodePath?: string | null } = {};
  if (claudeCodePath !== undefined) {
    update.claudeCodePath = claudeCodePath;
  }

  const updated = await upsertSummonSettings(update);
  const response: GlobalSettingsResponse = {
    claude_code_path: updated.claudeCodePath,
  };
  return Response.json(response);
}

async function readJsonBody(req: Request): Promise<JsonRecord> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body.");
  }

  if (!isRecord(body)) {
    throw new ApiError(400, "Request body must be a JSON object.");
  }

  return body;
}

function requireString(body: JsonRecord, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `"${field}" is required.`);
  }
  return value.trim();
}

function optionalString(body: JsonRecord, field: string): string | undefined {
  const value = body[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new ApiError(400, `"${field}" must be a string.`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalStringOrNull(body: JsonRecord, field: string): string | null | undefined {
  if (!(field in body)) {
    return undefined;
  }

  const value = body[field];
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new ApiError(400, `"${field}" must be a string or null.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapSupportedModelsByAgent(
  supportedModelsByAgent: Record<string, { value: string; displayName: string; description: string }[]>,
): Record<string, SummonModelInfoDto[]> {
  const mapped: Record<string, SummonModelInfoDto[]> = {};

  for (const [agent, models] of Object.entries(supportedModelsByAgent)) {
    mapped[agent] = models.map((model) => ({
      value: model.value,
      display_name: model.displayName,
      description: model.description,
    }));
  }

  return mapped;
}

function mapSummonSettings(
  settings: SummonSettings,
  supportedModelsByAgent: Record<string, SummonModelInfoDto[]>,
  version: string | null,
): SummonSettingsResponse {
  const agents: Record<string, SummonAgentSettingsDto> = {};

  for (const [agent, agentSettings] of Object.entries(settings.agents)) {
    agents[agent] = {
      model: agentSettings.model,
    };
  }

  return {
    last_used_agent: settings.lastUsedAgent,
    agents,
    supported_agents: [...SUPPORTED_SUMMON_AGENTS],
    supported_models_by_agent: supportedModelsByAgent,
    default_agent: resolveDefaultSummonAgent(settings.lastUsedAgent, SUPPORTED_SUMMON_AGENTS),
    claude_code_path: settings.claudeCodePath,
    claude_code_version: version,
  };
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function isErrno(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === code
  );
}
