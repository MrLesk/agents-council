import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import { Codex } from "@openai/codex-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { appendFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

import { loadSummonSettings, upsertSummonSettings } from "../../config/summonSettings";
import { FileCouncilStateStore } from "../../state/fileStateStore";
import { CouncilServiceImpl } from "./index";
import type { CouncilFeedback, CouncilRequest, CouncilState } from "./types";

export const SUPPORTED_SUMMON_AGENTS = ["Claude", "Codex"] as const;
export type SupportedSummonAgent = (typeof SUPPORTED_SUMMON_AGENTS)[number];

export function isSupportedSummonAgent(value: string): value is SupportedSummonAgent {
  return SUPPORTED_SUMMON_AGENTS.includes(value as SupportedSummonAgent);
}

export function resolveDefaultSummonAgent(
  lastUsedAgent: string | null,
  supportedAgents: readonly string[] = SUPPORTED_SUMMON_AGENTS,
): string {
  if (lastUsedAgent && supportedAgents.includes(lastUsedAgent)) {
    return lastUsedAgent;
  }

  const sorted = [...supportedAgents].sort((left, right) => left.localeCompare(right));
  const fallback = sorted[0];
  if (!fallback) {
    throw new Error("No summon agents are configured.");
  }
  return fallback;
}

export type SummonAgentInput = {
  agent: string;
  model?: string | null;
};

export type SummonAgentResult = {
  agent: string;
  model: string | null;
  feedback: CouncilFeedback;
};

export type SummonModelInfo = {
  value: string;
  displayName: string;
  description: string;
};

type SummonResultMessage = {
  subtype?: string;
  errors?: string[];
  result?: string;
  is_error?: boolean;
  error?: string;
};

const SUMMON_SERVER_NAME = "council";
const SUMMON_TOOL_PREFIX = "mcp__council__";
const READ_ONLY_TOOLS = new Set(["Read", "Glob", "Grep"]);
const SUMMON_DEBUG_ENV = "AGENTS_COUNCIL_SUMMON_DEBUG";
const CLAUDE_CODE_PATH_ENV = "CLAUDE_CODE_PATH";
const CODEX_API_KEY_ENV = "CODEX_API_KEY";
const OPENAI_API_KEY_ENV = "OPENAI_API_KEY";
const OPENAI_BASE_URL_ENV = "OPENAI_BASE_URL";
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
const CODEX_CONFIG_PATH = path.join(os.homedir(), ".codex", "config.toml");

function isAbsolutePath(p: string): boolean {
  // Unix absolute path or Windows absolute path (C:\... or \\...)
  return p.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("\\\\");
}

async function resolveClaudePath(command: string): Promise<string> {
  // If already an absolute path, return as-is
  if (isAbsolutePath(command)) {
    return command;
  }

  // Resolve command to absolute path using platform-appropriate command
  // This is necessary because the SDK validates "native binary" when given a simple command name,
  // but accepts npm-installed claude when given the full absolute path
  const isWindows = process.platform === "win32";
  const whichCommand = isWindows ? "where" : "which";

  try {
    const proc = Bun.spawn([whichCommand, command], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    // `where` on Windows may return multiple lines; take the first one
    const resolved = output.split(/\r?\n/)[0]?.trim() ?? "";
    if (resolved.length > 0 && isAbsolutePath(resolved)) {
      return resolved;
    }
  } catch {
    // Fall through to return original command
  }

  return command;
}

async function getClaudeCodeExecutablePath(): Promise<string> {
  // Priority: config > env var > default "claude"
  const settings = await loadSummonSettings();
  if (settings.claudeCodePath) {
    return resolveClaudePath(settings.claudeCodePath);
  }
  const envPath = process.env[CLAUDE_CODE_PATH_ENV]?.trim();
  if (envPath && envPath.length > 0) {
    return resolveClaudePath(envPath);
  }
  return resolveClaudePath("claude");
}

let cachedVersion: string | null = null;

export async function getClaudeCodeVersion(): Promise<string | null> {
  if (cachedVersion !== null) {
    return cachedVersion;
  }

  const claudePath = await getClaudeCodeExecutablePath();
  try {
    const proc = Bun.spawn([claudePath, "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    // Output format: "2.0.76 (Claude Code)"
    const match = output.match(/^([\d.]+)/);
    if (match?.[1]) {
      cachedVersion = match[1];
      return cachedVersion;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

let cachedClaudeModels: SummonModelInfo[] | null = null;
let cachedClaudeModelsAt = 0;
let cachedCodexModels: SummonModelInfo[] | null = null;
let cachedCodexModelsAt = 0;

function isSummonToolAllowed(toolName: string): boolean {
  if (toolName.startsWith(SUMMON_TOOL_PREFIX)) {
    return true;
  }
  return READ_ONLY_TOOLS.has(toolName);
}

function isSummonDebugEnabled(): boolean {
  const value = process.env[SUMMON_DEBUG_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export async function loadSupportedSummonModels(agent: SupportedSummonAgent): Promise<SummonModelInfo[]> {
  if (agent === "Codex") {
    return loadCodexSupportedModels();
  }
  return loadClaudeSupportedModels();
}

export async function loadSupportedSummonModelsByAgent(
  agents: readonly SupportedSummonAgent[] = SUPPORTED_SUMMON_AGENTS,
): Promise<Record<string, SummonModelInfo[]>> {
  const entries = await Promise.all(
    agents.map(async (agent) => [agent, await loadSupportedSummonModels(agent)] as const),
  );
  return Object.fromEntries(entries);
}

async function loadClaudeSupportedModels(): Promise<SummonModelInfo[]> {
  const now = Date.now();
  if (cachedClaudeModels !== null && now - cachedClaudeModelsAt < MODEL_CACHE_TTL_MS) {
    return cachedClaudeModels;
  }

  const claudeCodePath = await getClaudeCodeExecutablePath();
  const response = query({
    prompt: createPromptMessages("List supported Claude Code models."),
    options: {
      pathToClaudeCodeExecutable: claudeCodePath,
      maxTurns: 0,
      permissionMode: "default",
      settingSources: ["user"],
    },
  });

  try {
    const models = await response.supportedModels();
    const normalized = models
      .filter((model): model is SummonModelInfo => Boolean(model && typeof model.value === "string"))
      .map((model) => ({
        value: model.value,
        displayName:
          typeof model.displayName === "string" && model.displayName.trim().length > 0
            ? model.displayName
            : model.value,
        description: typeof model.description === "string" ? model.description : "",
      }))
      .filter((model) => model.value.trim().length > 0);

    cachedClaudeModels = normalized;
    cachedClaudeModelsAt = now;
    return normalized;
  } catch {
    cachedClaudeModels = [];
    cachedClaudeModelsAt = now;
    return [];
  } finally {
    // Fire-and-forget interrupt - don't await as it may hang
    response.interrupt().catch(() => {});
  }
}

async function loadCodexSupportedModels(): Promise<SummonModelInfo[]> {
  const now = Date.now();
  if (cachedCodexModels !== null && now - cachedCodexModelsAt < MODEL_CACHE_TTL_MS) {
    return cachedCodexModels;
  }

  const defaultModel = await loadCodexDefaultModel();
  const models = defaultModel
    ? [
        {
          value: defaultModel,
          displayName: defaultModel,
          description: "Default from ~/.codex/config.toml",
        },
      ]
    : [];

  cachedCodexModels = models;
  cachedCodexModelsAt = now;
  return models;
}

async function loadCodexDefaultModel(): Promise<string | null> {
  try {
    const config = await readFile(CODEX_CONFIG_PATH, "utf8");
    return parseCodexModelFromConfig(config);
  } catch {
    return null;
  }
}

function parseCodexModelFromConfig(config: string): string | null {
  const doubleQuoted = config.match(/^\s*model\s*=\s*"(.*?)"\s*$/m);
  if (doubleQuoted?.[1]) {
    return doubleQuoted[1].trim();
  }
  const singleQuoted = config.match(/^\s*model\s*=\s*'(.*?)'\s*$/m);
  if (singleQuoted?.[1]) {
    return singleQuoted[1].trim();
  }
  return null;
}

function getCurrentRequestFromState(state: CouncilState): CouncilRequest | null {
  const currentId = state.session?.currentRequestId;
  if (!currentId) {
    return null;
  }
  return state.requests.find((request) => request.id === currentId) ?? null;
}

export async function summonAgent(input: SummonAgentInput): Promise<SummonAgentResult> {
  const agent = normalizeRequiredString(input.agent, "agent");
  if (!isSupportedSummonAgent(agent)) {
    throw new Error("Unsupported agent.");
  }

  if (agent === "Codex") {
    return summonCodexAgent({ ...input, agent });
  }

  return summonClaudeAgent({ ...input, agent });
}

export async function summonClaudeAgent(input: SummonAgentInput): Promise<SummonAgentResult> {
  const agent = normalizeRequiredString(input.agent, "agent");
  await appendSummonLog({
    event: "summon_start",
    data: {
      agent,
      model: input.model ?? null,
      cwd: process.cwd(),
    },
  });
  const store = new FileCouncilStateStore();
  const state = await store.load();
  const session = state.session;
  if (!session || session.status !== "active") {
    await appendSummonLog({ event: "summon_error", data: { message: "No active council session." } });
    throw new Error("No active council session.");
  }
  if (!session.currentRequestId) {
    await appendSummonLog({ event: "summon_error", data: { message: "No active request." } });
    throw new Error("No active request.");
  }
  await appendSummonLog({
    event: "summon_session",
    data: { sessionId: session.id, requestId: session.currentRequestId },
  });

  const settings = await loadSummonSettings();
  const savedAgent = settings.agents[agent] ?? { model: null };
  const model = input.model === undefined ? savedAgent.model : normalizeOptionalString(input.model);

  await upsertSummonSettings({
    lastUsedAgent: agent,
    agents: {
      [agent]: {
        model,
      },
    },
  });
  await appendSummonLog({
    event: "summon_settings",
    data: { agent, model },
  });

  const service = new CouncilServiceImpl(store);
  const existingFeedbackIds = new Set(state.feedback.map((entry) => entry.id));
  const councilServer = createSdkMcpServer({
    name: SUMMON_SERVER_NAME,
    version: "0.1.0",
    tools: buildCouncilTools(service, agent),
  });

  const prompt = buildClaudeSummonPrompt();
  const claudeCodePath = await getClaudeCodeExecutablePath();

  const response = query({
    prompt: createPromptMessages(prompt),
    options: {
      pathToClaudeCodeExecutable: claudeCodePath,
      mcpServers: {
        [SUMMON_SERVER_NAME]: councilServer,
      },
      model: model ?? undefined,
      permissionMode: "default",
      settingSources: ["user"],
      canUseTool: async (toolName, input) => {
        if (isSummonToolAllowed(toolName)) {
          return { behavior: "allow", updatedInput: input };
        }
        return {
          behavior: "deny",
          message: "Tool not permitted. Allow via user settings or use council/read tools only.",
          interrupt: false,
        };
      },
    },
  });

  let resultMessage: SummonResultMessage | null = null;
  try {
    for await (const message of response) {
      await appendSummonLog({ event: "sdk_message", data: message });
      if (message.type === "result") {
        resultMessage = message as SummonResultMessage;
      }
    }
  } catch (error) {
    const details = resolveSummonResultError(resultMessage) ?? getErrorMessage(error);
    await appendSummonLog({ event: "summon_error", data: { message: details } });
    throw new Error(details);
  }

  if (!resultMessage) {
    await appendSummonLog({ event: "summon_error", data: { message: "No result message." } });
    throw new Error("Summon failed to return a result.");
  }
  const resultError = resolveSummonResultError(resultMessage);
  if (resultError) {
    await appendSummonLog({ event: "summon_error", data: { message: resultError } });
    throw new Error(resultError);
  }

  const updated = await store.load();
  const feedback = updated.feedback.find((entry) => entry.author === agent && !existingFeedbackIds.has(entry.id));
  if (!feedback) {
    await appendSummonLog({ event: "summon_error", data: { message: "Claude did not submit a response." } });
    throw new Error("Claude did not submit a response.");
  }

  await appendSummonLog({
    event: "summon_success",
    data: { feedbackId: feedback.id, feedbackAuthor: feedback.author },
  });
  return {
    agent,
    model,
    feedback,
  };
}

export async function summonCodexAgent(input: SummonAgentInput): Promise<SummonAgentResult> {
  const agent = normalizeRequiredString(input.agent, "agent");
  await appendSummonLog({
    event: "summon_start",
    data: {
      agent,
      model: input.model ?? null,
      runner: "codex",
      cwd: process.cwd(),
    },
  });

  const store = new FileCouncilStateStore();
  const state = await store.load();
  const session = state.session;
  if (!session || session.status !== "active") {
    await appendSummonLog({ event: "summon_error", data: { message: "No active council session." } });
    throw new Error("No active council session.");
  }
  const request = getCurrentRequestFromState(state);
  if (!request) {
    await appendSummonLog({ event: "summon_error", data: { message: "No active request." } });
    throw new Error("No active request.");
  }
  await appendSummonLog({
    event: "summon_session",
    data: { sessionId: session.id, requestId: request.id },
  });

  const settings = await loadSummonSettings();
  const savedAgent = settings.agents[agent] ?? { model: null };
  const model = input.model === undefined ? savedAgent.model : normalizeOptionalString(input.model);

  await upsertSummonSettings({
    lastUsedAgent: agent,
    agents: {
      [agent]: {
        model,
      },
    },
  });
  await appendSummonLog({
    event: "summon_settings",
    data: { agent, model },
  });

  const requestFeedback = state.feedback.filter((entry) => entry.requestId === request.id);
  const prompt = buildCodexSummonPrompt(request, requestFeedback);
  const codex = new Codex();
  const thread = codex.startThread({
    model: model ?? undefined,
    sandboxMode: "read-only",
    workingDirectory: process.cwd(),
    skipGitRepoCheck: true,
    approvalPolicy: "never",
    networkAccessEnabled: false,
    webSearchEnabled: false,
  });

  let responseText: string | null = null;
  try {
    const turn = await thread.run(prompt);
    responseText = normalizeOptionalString(turn.finalResponse);
  } catch (error) {
    const message = getErrorMessage(error);
    await appendSummonLog({ event: "summon_error", data: { message } });
    throw new Error(message);
  }

  if (!responseText) {
    await appendSummonLog({ event: "summon_error", data: { message: "Codex did not return a response." } });
    throw new Error("Codex did not return a response.");
  }

  const service = new CouncilServiceImpl(store);
  const result = await service.sendResponse({ agentName: agent, content: responseText });
  await appendSummonLog({
    event: "summon_success",
    data: { feedbackId: result.feedback.id, feedbackAuthor: result.feedback.author },
  });

  return {
    agent,
    model,
    feedback: result.feedback,
  };
}

function buildCouncilTools(service: CouncilServiceImpl, agentName: string) {
  const joinCouncil = tool(
    "join_council",
    "Join the current council session and fetch the request and responses.",
    {},
    async () => {
      try {
        const result = await service.getCurrentSessionData({ agentName });
        return toolOk(result);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  const getCurrentSessionData = tool(
    "get_current_session_data",
    "Get the current session request and responses since the last cursor.",
    {
      cursor: z.string().min(1).optional(),
    },
    async ({ cursor }) => {
      try {
        const result = await service.getCurrentSessionData({ agentName, cursor });
        return toolOk(result);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  const sendResponse = tool(
    "send_response",
    "Send a response for the current session.",
    {
      content: z.string().min(1),
    },
    async ({ content }) => {
      try {
        const result = await service.sendResponse({ agentName, content });
        return toolOk(result);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return [joinCouncil, getCurrentSessionData, sendResponse];
}

function toolOk<T extends Record<string, unknown>>(payload: T): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

function toolError(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
    isError: true,
  };
}

function buildClaudeSummonPrompt(): string {
  const lines = [
    "You are a Claude agent summoned to the Agents Council.",
    "Use the council tools to join the active session, review the request and prior feedback, then send a single response.",
    "Tools: mcp__council__join_council, mcp__council__get_current_session_data, mcp__council__send_response.",
    "Steps:",
    "1) Call mcp__council__join_council.",
    "2) If needed, call mcp__council__get_current_session_data to see additional responses.",
    "3) Call mcp__council__send_response with your advice.",
  ];

  return lines.join("\n");
}

function buildCodexSummonPrompt(request: CouncilRequest, feedback: CouncilFeedback[]): string {
  const lines = [
    "You are a Codex agent summoned to the Agents Council.",
    "Review the council request and prior feedback, then provide a single response.",
    "",
    `Council request (from ${request.createdBy}):`,
    request.content,
    "",
    "Prior responses:",
  ];

  if (feedback.length === 0) {
    lines.push("None yet.");
  } else {
    feedback.forEach((entry) => {
      lines.push(`- ${entry.author}: ${entry.content}`);
    });
  }

  lines.push("", "Reply with your advice only. Do not run commands or call tools.");
  return lines.join("\n");
}

async function* createPromptMessages(prompt: string) {
  yield {
    type: "user" as const,
    session_id: "",
    message: {
      role: "user" as const,
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
    parent_tool_use_id: null,
  };
}

type SummonLogEntry = {
  timestamp: string;
  event: string;
  data?: unknown;
};

async function appendSummonLog(entry: Omit<SummonLogEntry, "timestamp">): Promise<void> {
  if (!isSummonDebugEnabled()) {
    return;
  }
  const logPath = path.resolve(process.cwd(), "summon-debug.log");
  const payload: SummonLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  try {
    await appendFile(logPath, `${JSON.stringify(payload)}\n`, "utf8");
  } catch {
    // Ignore logging errors to avoid masking summon failures.
  }
}

function normalizeRequiredString(value: string, label: string): string {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }
  return normalized;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveSummonResultError(resultMessage: SummonResultMessage | null): string | null {
  if (!resultMessage) {
    return null;
  }
  const resultText = normalizeOptionalString(resultMessage.result);
  const errorText = normalizeOptionalString(resultMessage.error);
  const errorsText = normalizeOptionalString(resultMessage.errors?.filter(Boolean).join("; "));

  if (resultMessage.is_error) {
    return resultText ?? errorsText ?? errorText ?? "Claude summon failed.";
  }
  if (resultMessage.subtype && resultMessage.subtype !== "success") {
    return errorsText ?? resultText ?? errorText ?? "Claude summon failed.";
  }
  return null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Summon failed.";
}
