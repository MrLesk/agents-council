import type { SummonSettings } from "../../../core/config/summonSettings";
import { loadSummonSettings, upsertSummonSettings } from "../../../core/config/summonSettings";
import { CouncilServiceImpl } from "../../../core/services/council";
import {
  SUPPORTED_SUMMON_AGENTS,
  getClaudeCodeVersion,
  getCodexCliVersion,
  isSupportedSummonAgent,
  loadCachedSummonModelsByAgent,
  refreshSummonModelsByAgent,
  refreshSummonModelsInBackground,
  resolveDefaultSummonAgent,
  summonAgent,
} from "../../../core/services/council/summon";
import { FileCouncilStateStore } from "../../../core/state/fileStateStore";
import {
  mapCloseCouncilInput,
  mapCloseCouncilResponse,
  mapGetCurrentSessionDataInput,
  mapGetCurrentSessionDataResponse,
  mapSendResponseInput,
  mapSendResponseResponse,
  mapStartCouncilInput,
  mapStartCouncilResponse,
  mapSummonAgentResponse,
} from "../../mcp/mapper";
import type {
  CloseCouncilParams,
  GetCurrentSessionDataParams,
  JoinCouncilParams,
  SendResponseParams,
  StartCouncilParams,
} from "../../mcp/dtos/types";
import type {
  CloseCouncilResponse,
  GetCurrentSessionDataResponse,
  GlobalSettingsResponse,
  SendResponseResponse,
  StartCouncilResponse,
  SummonAgentResponse,
  SummonModelInfoDto,
  SummonSettingsResponse,
} from "../ui/types";

type JsonRecord = Record<string, unknown>;

export class BridgeApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function startCouncilAction(payload: unknown): Promise<StartCouncilResponse> {
  const body = requireRecord(payload);
  const params: StartCouncilParams & { agent_name: string } = {
    request: requireString(body, "request"),
    agent_name: requireString(body, "agent_name"),
  };
  const result = await getService().startCouncil(mapStartCouncilInput(params));
  return mapStartCouncilResponse(result);
}

export async function joinCouncilAction(payload: unknown): Promise<GetCurrentSessionDataResponse> {
  const body = requireRecord(payload);
  const params: JoinCouncilParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
  };
  const result = await getService().getCurrentSessionData(mapGetCurrentSessionDataInput(params));
  return mapGetCurrentSessionDataResponse(result);
}

export async function getCurrentSessionDataAction(payload: unknown): Promise<GetCurrentSessionDataResponse> {
  const body = requireRecord(payload);
  const params: GetCurrentSessionDataParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    cursor: optionalString(body, "cursor"),
  };
  const result = await getService().getCurrentSessionData(mapGetCurrentSessionDataInput(params));
  return mapGetCurrentSessionDataResponse(result);
}

export async function sendResponseAction(payload: unknown): Promise<SendResponseResponse> {
  const body = requireRecord(payload);
  const params: SendResponseParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    content: requireString(body, "content"),
  };
  const result = await getService().sendResponse(mapSendResponseInput(params));
  return mapSendResponseResponse(result);
}

export async function closeCouncilAction(payload: unknown): Promise<CloseCouncilResponse> {
  const body = requireRecord(payload);
  const params: CloseCouncilParams & { agent_name: string } = {
    agent_name: requireString(body, "agent_name"),
    conclusion: requireString(body, "conclusion"),
  };
  const result = await getService().closeCouncil(mapCloseCouncilInput(params));
  return mapCloseCouncilResponse(result);
}

export async function getSummonSettingsAction(): Promise<SummonSettingsResponse> {
  const [settings, supportedModelsByAgent, claudeCodeVersion, codexCliVersion] = await Promise.all([
    loadSummonSettings(),
    loadCachedSummonModelsByAgent(),
    getClaudeCodeVersion(),
    getCodexCliVersion(),
  ]);

  if (Object.values(supportedModelsByAgent).some((models) => models.length === 0)) {
    refreshSummonModelsInBackground();
  }

  return mapSummonSettings(
    settings,
    mapSupportedModelsByAgent(supportedModelsByAgent),
    claudeCodeVersion,
    codexCliVersion,
  );
}

export async function refreshSummonModelsAction(): Promise<SummonSettingsResponse> {
  const supportedModelsByAgent = await refreshSummonModelsByAgent();
  const [settings, claudeCodeVersion, codexCliVersion] = await Promise.all([
    loadSummonSettings(),
    getClaudeCodeVersion(),
    getCodexCliVersion(),
  ]);

  return mapSummonSettings(
    settings,
    mapSupportedModelsByAgent(supportedModelsByAgent),
    claudeCodeVersion,
    codexCliVersion,
  );
}

export async function updateSummonSettingsAction(payload: unknown): Promise<SummonSettingsResponse> {
  const body = requireRecord(payload);
  const agent = requireString(body, "agent");
  if (!isSupportedSummonAgent(agent)) {
    throw new BridgeApiError(400, "Unsupported agent.");
  }

  const model = optionalStringOrNull(body, "model");
  const reasoningEffort = optionalStringOrNull(body, "reasoning_effort");
  const update: {
    lastUsedAgent: string;
    agents?: Record<string, { model?: string | null; reasoningEffort?: string | null }>;
  } = {
    lastUsedAgent: agent,
  };

  const agentUpdate: { model?: string | null; reasoningEffort?: string | null } = {};
  if (model !== undefined) {
    agentUpdate.model = model;
  }
  if (reasoningEffort !== undefined) {
    agentUpdate.reasoningEffort = reasoningEffort;
  }
  if (Object.keys(agentUpdate).length > 0) {
    update.agents = { [agent]: agentUpdate };
  }

  const updated = await upsertSummonSettings(update);
  const [supportedModelsByAgent, claudeCodeVersion, codexCliVersion] = await Promise.all([
    loadCachedSummonModelsByAgent(),
    getClaudeCodeVersion(),
    getCodexCliVersion(),
  ]);

  return mapSummonSettings(
    updated,
    mapSupportedModelsByAgent(supportedModelsByAgent),
    claudeCodeVersion,
    codexCliVersion,
  );
}

export async function summonAgentAction(payload: unknown): Promise<SummonAgentResponse> {
  const body = requireRecord(payload);
  const settings = await loadSummonSettings();
  const requestedAgent = optionalStringOrNull(body, "agent");
  const defaultAgent = resolveDefaultSummonAgent(settings.lastUsedAgent, SUPPORTED_SUMMON_AGENTS);
  const agent = typeof requestedAgent === "string" ? requestedAgent : defaultAgent;

  if (!isSupportedSummonAgent(agent)) {
    throw new BridgeApiError(400, "Unsupported agent.");
  }

  const model = optionalStringOrNull(body, "model");
  const reasoningEffort = optionalStringOrNull(body, "reasoning_effort");
  const result = await summonAgent({
    agent,
    model,
    reasoningEffort,
  });

  return mapSummonAgentResponse(result);
}

export async function getSettingsAction(): Promise<GlobalSettingsResponse> {
  const settings = await loadSummonSettings();
  return {
    claude_code_path: settings.claudeCodePath,
    codex_path: settings.codexPath,
  };
}

export async function updateSettingsAction(payload: unknown): Promise<GlobalSettingsResponse> {
  const body = requireRecord(payload);
  const claudeCodePath = optionalStringOrNull(body, "claude_code_path");
  const codexPath = optionalStringOrNull(body, "codex_path");

  const update: { claudeCodePath?: string | null; codexPath?: string | null } = {};
  if (claudeCodePath !== undefined) {
    update.claudeCodePath = claudeCodePath;
  }
  if (codexPath !== undefined) {
    update.codexPath = codexPath;
  }

  const updated = await upsertSummonSettings(update);
  return {
    claude_code_path: updated.claudeCodePath,
    codex_path: updated.codexPath,
  };
}

export function requireRecord(payload: unknown): JsonRecord {
  if (!isRecord(payload)) {
    throw new BridgeApiError(400, "Request body must be a JSON object.");
  }
  return payload;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function getErrorStatus(error: unknown): number {
  if (error instanceof BridgeApiError) {
    return error.status;
  }
  return 500;
}

function requireString(body: JsonRecord, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BridgeApiError(400, `"${field}" is required.`);
  }
  return value.trim();
}

function optionalString(body: JsonRecord, field: string): string | undefined {
  const value = body[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BridgeApiError(400, `"${field}" must be a string.`);
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
    throw new BridgeApiError(400, `"${field}" must be a string or null.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapSupportedModelsByAgent(
  supportedModelsByAgent: Record<
    string,
    {
      value: string;
      displayName: string;
      description: string;
      supportedReasoningEfforts: { reasoningEffort: string; description: string }[];
      defaultReasoningEffort: string;
    }[]
  >,
): Record<string, SummonModelInfoDto[]> {
  const mapped: Record<string, SummonModelInfoDto[]> = {};

  for (const [agent, models] of Object.entries(supportedModelsByAgent)) {
    mapped[agent] = models.map((model) => ({
      value: model.value,
      display_name: model.displayName,
      description: model.description,
      supported_reasoning_efforts: model.supportedReasoningEfforts.map((effort) => ({
        reasoning_effort: effort.reasoningEffort,
        description: effort.description,
      })),
      default_reasoning_effort: model.defaultReasoningEffort,
    }));
  }

  return mapped;
}

function mapSummonSettings(
  settings: SummonSettings,
  supportedModelsByAgent: Record<string, SummonModelInfoDto[]>,
  claudeCodeVersion: string | null,
  codexCliVersion: string | null,
): SummonSettingsResponse {
  const agents: SummonSettingsResponse["agents"] = {};

  for (const [agent, agentSettings] of Object.entries(settings.agents)) {
    agents[agent] = {
      model: agentSettings.model,
      reasoning_effort: agentSettings.reasoningEffort,
    };
  }

  return {
    last_used_agent: settings.lastUsedAgent,
    agents,
    supported_agents: [...SUPPORTED_SUMMON_AGENTS],
    supported_models_by_agent: supportedModelsByAgent,
    default_agent: resolveDefaultSummonAgent(settings.lastUsedAgent, SUPPORTED_SUMMON_AGENTS),
    claude_code_path: settings.claudeCodePath,
    claude_code_version: claudeCodeVersion,
    codex_cli_version: codexCliVersion,
  };
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getService(): CouncilServiceImpl {
  return new CouncilServiceImpl(new FileCouncilStateStore());
}
