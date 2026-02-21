import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import { Codex } from "@openai/codex-sdk";
import type { ModelReasoningEffort } from "@openai/codex-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { appendFile, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

import {
  loadSummonSettings,
  upsertSummonSettings,
  type SummonModelInfo,
  type SummonModelsCacheEntry,
} from "../../config/summonSettings";
import { FileCouncilStateStore } from "../../state/fileStateStore";
import { CouncilServiceImpl, updateParticipant } from "./index";
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
  reasoningEffort?: string | null;
};

export type SummonAgentResult = {
  agent: string;
  model: string | null;
  feedback: CouncilFeedback;
};

type SummonResultMessage = {
  subtype?: string;
  errors?: string[];
  result?: string;
  is_error?: boolean;
  error?: string;
};

type JsonRpcResponse = {
  id?: number;
  result?: unknown;
  error?: unknown;
};

const SUMMON_SERVER_NAME = "council";
const SUMMON_TOOL_PREFIX = "mcp__council__";
const READ_ONLY_TOOLS = new Set(["Read", "Glob", "Grep"]);
const SUMMON_DEBUG_ENV = "AGENTS_COUNCIL_SUMMON_DEBUG";
const CLAUDE_CODE_PATH_ENV = "CLAUDE_CODE_PATH";
const CODEX_PATH_ENV = "CODEX_PATH";
const MODEL_REFRESH_TIMEOUT_MS = 8000;
const CODEX_CONFIG_PATH = path.join(os.homedir(), ".codex", "config.toml");
const MODEL_REASONING_EFFORTS: ModelReasoningEffort[] = ["minimal", "low", "medium", "high", "xhigh"];

function isAbsolutePath(p: string): boolean {
  // Unix absolute path or Windows absolute path (C:\... or \\...)
  return p.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("\\\\");
}

async function resolveExecutablePath(command: string): Promise<string> {
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
    return resolveExecutablePath(settings.claudeCodePath);
  }
  const envPath = process.env[CLAUDE_CODE_PATH_ENV]?.trim();
  if (envPath && envPath.length > 0) {
    return resolveExecutablePath(envPath);
  }
  return resolveExecutablePath("claude");
}

async function getCodexExecutablePath(): Promise<string | null> {
  // Priority: config > env var > default (bundled binary)
  const settings = await loadSummonSettings();
  if (settings.codexPath) {
    return resolveExecutablePath(settings.codexPath);
  }
  const envPath = process.env[CODEX_PATH_ENV]?.trim();
  if (envPath && envPath.length > 0) {
    return resolveExecutablePath(envPath);
  }
  return null;
}

let cachedVersion: string | null = null;
const cachedCodexVersionsByCommand = new Map<string, string>();

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

export async function getCodexCliVersion(): Promise<string | null> {
  const codexPath = await getCodexExecutablePath();
  const command = codexPath ?? "codex";
  const cached = cachedCodexVersionsByCommand.get(command);
  if (cached) {
    return cached;
  }

  try {
    const proc = Bun.spawn([command, "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    // Output example: "codex-cli 0.105.0-alpha.10"
    const match = output.match(/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?|\d+\.\d+)/);
    if (match?.[1]) {
      cachedCodexVersionsByCommand.set(command, match[1]);
      return match[1];
    }
  } catch {
    // Ignore errors
  }
  return null;
}

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

export async function loadCachedSummonModelsByAgent(
  agents: readonly SupportedSummonAgent[] = SUPPORTED_SUMMON_AGENTS,
): Promise<Record<string, SummonModelInfo[]>> {
  const settings = await loadSummonSettings();
  const cache = settings.summonModelsCache ?? {};
  const updates: Record<string, SummonModelsCacheEntry> = {};
  const results: Record<string, SummonModelInfo[]> = {};

  for (const agent of agents) {
    let models = cache[agent]?.models ?? [];
    if (agent === "Codex" && models.length === 0) {
      const fallback = await loadCodexFallbackModels();
      if (fallback.length > 0) {
        models = fallback;
        if (!cache[agent]) {
          updates[agent] = buildModelsCacheEntry(fallback);
        }
      }
    }
    results[agent] = models;
  }

  if (Object.keys(updates).length > 0) {
    await upsertSummonSettings({ summonModelsCache: updates });
  }

  return results;
}

export async function refreshSummonModelsByAgent(
  agents: readonly SupportedSummonAgent[] = SUPPORTED_SUMMON_AGENTS,
): Promise<Record<string, SummonModelInfo[]>> {
  const updates: Record<string, SummonModelsCacheEntry> = {};

  for (const agent of agents) {
    const models = agent === "Codex" ? await fetchCodexModelsViaAppServer() : await fetchClaudeSupportedModels();
    if (models.length > 0) {
      updates[agent] = buildModelsCacheEntry(models);
    }
  }

  if (Object.keys(updates).length > 0) {
    await upsertSummonSettings({ summonModelsCache: updates });
  }

  return loadCachedSummonModelsByAgent(agents);
}

export function refreshSummonModelsInBackground(
  agents: readonly SupportedSummonAgent[] = SUPPORTED_SUMMON_AGENTS,
): void {
  void refreshSummonModelsByAgent(agents).catch(() => {});
}

function buildModelsCacheEntry(models: SummonModelInfo[]): SummonModelsCacheEntry {
  return {
    models,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchClaudeSupportedModels(): Promise<SummonModelInfo[]> {
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
    const models = await withTimeout(response.supportedModels(), MODEL_REFRESH_TIMEOUT_MS);
    return models
      .filter((model): model is SummonModelInfo => Boolean(model && typeof model.value === "string"))
      .map((model) => ({
        value: model.value,
        displayName:
          typeof model.displayName === "string" && model.displayName.trim().length > 0
            ? model.displayName
            : model.value,
        description: typeof model.description === "string" ? model.description : "",
        supportedReasoningEfforts: [],
        defaultReasoningEffort: "",
      }))
      .filter((model) => model.value.trim().length > 0);
  } catch {
    return [];
  } finally {
    // Fire-and-forget interrupt - don't await as it may hang
    response.interrupt().catch(() => {});
  }
}

async function fetchCodexModelsViaAppServer(): Promise<SummonModelInfo[]> {
  const codexPath = await getCodexExecutablePath();
  const command = codexPath ?? "codex";
  let proc: Bun.Subprocess | null = null;
  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  let writeLine: ((line: string) => void) | null = null;

  try {
    proc = Bun.spawn([command, "app-server"], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    if (!proc.stdin || !proc.stdout) {
      throw new Error("Codex app-server missing stdio.");
    }

    const stdout = proc.stdout;
    if (!isReadableStream(stdout)) {
      throw new Error("Codex app-server stdout is not readable.");
    }

    if (isFileSink(proc.stdin)) {
      writeLine = (line) => {
        proc?.stdin && (proc.stdin as Bun.FileSink).write(line);
      };
    } else if (isWritableStream(proc.stdin)) {
      writer = proc.stdin.getWriter();
      const encoder = new TextEncoder();
      writeLine = (line) => {
        void writer?.write(encoder.encode(line));
      };
    } else {
      throw new Error("Codex app-server stdin is not writable.");
    }
    const pending = new Map<number, (value: JsonRpcResponse) => void>();
    let nextId = 1;

    void (async () => {
      for await (const line of readLines(stdout)) {
        if (!line.trim()) {
          continue;
        }
        let payload: JsonRpcResponse | null = null;
        try {
          payload = JSON.parse(line) as JsonRpcResponse;
        } catch {
          continue;
        }
        const id = typeof payload.id === "number" ? payload.id : null;
        if (id !== null) {
          const resolve = pending.get(id);
          if (resolve) {
            pending.delete(id);
            resolve(payload);
          }
        }
      }
    })();

    proc.exited.then(() => {
      for (const resolve of pending.values()) {
        resolve({} as JsonRpcResponse);
      }
      pending.clear();
    });

    const sendRequest = async (method: string, params: Record<string, unknown>): Promise<JsonRpcResponse> => {
      const id = nextId++;
      const payload = { jsonrpc: "2.0", id, method, params };
      writeLine?.(`${JSON.stringify(payload)}\n`);
      return new Promise((resolve) => {
        pending.set(id, resolve);
      });
    };

    const sendNotification = (method: string, params: Record<string, unknown> | null) => {
      const payload = { jsonrpc: "2.0", method, params: params ?? {} };
      writeLine?.(`${JSON.stringify(payload)}\n`);
    };

    await withTimeout(
      sendRequest("initialize", {
        clientInfo: { name: "agents-council", title: "Agents Council", version: "0.1.0" },
      }),
      MODEL_REFRESH_TIMEOUT_MS,
    );
    sendNotification("initialized", {});

    const response = await withTimeout(sendRequest("model/list", {}), MODEL_REFRESH_TIMEOUT_MS);
    const rawResult = (response.result ?? response) as { data?: unknown } | unknown;
    const rawModels = isRecord(rawResult) ? ((rawResult as { data?: unknown }).data ?? rawResult) : rawResult;
    if (!Array.isArray(rawModels)) {
      return [];
    }

    return rawModels
      .map((item: unknown) => normalizeModelInfoFromAny(item))
      .filter((model): model is SummonModelInfo => model !== null);
  } catch {
    return [];
  } finally {
    try {
      writer?.releaseLock();
    } catch {
      // ignore
    }
    try {
      proc?.kill();
    } catch {
      // ignore
    }
  }
}

async function loadCodexDefaultModel(): Promise<string | null> {
  try {
    const config = await readFile(CODEX_CONFIG_PATH, "utf8");
    return parseCodexModelFromConfig(config);
  } catch {
    return null;
  }
}

async function loadCodexFallbackModels(): Promise<SummonModelInfo[]> {
  const defaultModel = await loadCodexDefaultModel();
  if (!defaultModel) {
    return [];
  }

  return [
    {
      value: defaultModel,
      displayName: defaultModel,
      description: "",
      supportedReasoningEfforts: [],
      defaultReasoningEffort: "",
    },
  ];
}

function parseCodexModelFromConfig(config: string): string | null {
  try {
    const parsed = Bun.TOML.parse(config);
    if (parsed && typeof parsed === "object" && "model" in parsed) {
      const value = (parsed as Record<string, unknown>).model;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
    }
  } catch {
    return null;
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

async function markParticipantPending(store: FileCouncilStateStore, agent: string, requestId: string): Promise<void> {
  const now = new Date().toISOString();
  await store.update((state) => {
    if (!state.session || state.session.status !== "active") {
      return { state, result: undefined };
    }
    const { participants } = updateParticipant(state.participants, agent, now, (candidate) => ({
      ...candidate,
      lastSeen: now,
      lastRequestSeen: requestId,
    }));
    return {
      state: {
        ...state,
        participants,
      },
      result: undefined,
    };
  });
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
  await markParticipantPending(store, agent, session.currentRequestId);

  const settings = await loadSummonSettings();
  const savedAgent = settings.agents[agent] ?? { model: null, reasoningEffort: null };
  const model = input.model === undefined ? savedAgent.model : normalizeOptionalString(input.model);
  const reasoningEffort =
    input.reasoningEffort === undefined ? savedAgent.reasoningEffort : normalizeOptionalString(input.reasoningEffort);

  await upsertSummonSettings({
    lastUsedAgent: agent,
    agents: {
      [agent]: {
        model,
        reasoningEffort,
      },
    },
  });
  await appendSummonLog({
    event: "summon_settings",
    data: { agent, model, reasoningEffort },
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
  await markParticipantPending(store, agent, request.id);

  const settings = await loadSummonSettings();
  const savedAgent = settings.agents[agent] ?? { model: null, reasoningEffort: null };
  const model = input.model === undefined ? savedAgent.model : normalizeOptionalString(input.model);
  const reasoningEffort =
    input.reasoningEffort === undefined ? savedAgent.reasoningEffort : normalizeOptionalString(input.reasoningEffort);

  await upsertSummonSettings({
    lastUsedAgent: agent,
    agents: {
      [agent]: {
        model,
        reasoningEffort,
      },
    },
  });
  await appendSummonLog({
    event: "summon_settings",
    data: { agent, model, reasoningEffort },
  });

  const requestFeedback = state.feedback.filter((entry) => entry.requestId === request.id);
  const prompt = buildCodexSummonPrompt(request, requestFeedback);
  const codexPath = await getCodexExecutablePath();
  const codex = codexPath ? new Codex({ codexPathOverride: codexPath }) : new Codex();
  const thread = codex.startThread({
    model: model ?? undefined,
    modelReasoningEffort: normalizeModelReasoningEffort(reasoningEffort),
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

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeModelReasoningEffort(value: string | null): ModelReasoningEffort | undefined {
  if (!value) {
    return undefined;
  }
  return MODEL_REASONING_EFFORTS.includes(value as ModelReasoningEffort) ? (value as ModelReasoningEffort) : undefined;
}

function normalizeModelInfoFromAny(input: unknown): SummonModelInfo | null {
  if (!isRecord(input)) {
    return null;
  }
  const value = normalizeOptionalString(input.model ?? input.id ?? input.value);
  if (!value) {
    return null;
  }
  const displayName =
    normalizeOptionalString(input.displayName ?? input.display_name ?? input.model ?? input.id) ?? value;
  const description = normalizeOptionalString(input.description) ?? "";
  const supportedReasoningEfforts = Array.isArray(input.supportedReasoningEfforts)
    ? normalizeReasoningEfforts(input.supportedReasoningEfforts)
    : Array.isArray(input.supported_reasoning_efforts)
      ? normalizeReasoningEfforts(input.supported_reasoning_efforts)
      : [];
  const defaultReasoningEffort =
    normalizeOptionalString(input.defaultReasoningEffort ?? input.default_reasoning_effort) ?? "";

  return {
    value,
    displayName,
    description,
    supportedReasoningEfforts,
    defaultReasoningEffort,
  };
}

function normalizeReasoningEfforts(input: unknown[]): { reasoningEffort: string; description: string }[] {
  return input
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }
      const reasoningEffort = normalizeOptionalString(entry.reasoningEffort ?? entry.reasoning_effort);
      if (!reasoningEffort) {
        return null;
      }
      return {
        reasoningEffort,
        description: normalizeOptionalString(entry.description) ?? "",
      };
    })
    .filter((entry): entry is { reasoningEffort: string; description: string } => entry !== null);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out."));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function* readLines(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let index = buffer.indexOf("\n");
      while (index !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        yield line;
        index = buffer.indexOf("\n");
      }
    }
    if (buffer.length > 0) {
      yield buffer;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return Boolean(value && typeof (value as ReadableStream<Uint8Array>).getReader === "function");
}

function isWritableStream(value: unknown): value is WritableStream<Uint8Array> {
  return Boolean(value && typeof (value as WritableStream<Uint8Array>).getWriter === "function");
}

function isFileSink(value: unknown): value is { write: (data: string) => void } {
  return Boolean(value && typeof (value as { write?: unknown }).write === "function");
}
