import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { loadSummonSettings, upsertSummonSettings } from "../../config/summonSettings";
import { FileCouncilStateStore } from "../../state/fileStateStore";
import { CouncilServiceImpl } from "./index";
import type { CouncilFeedback } from "./types";

export const SUPPORTED_SUMMON_AGENTS = ["Claude"] as const;
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

const SUMMON_SERVER_NAME = "council";
const SUMMON_TOOL_PREFIX = "mcp__council__";
const READ_ONLY_TOOLS = new Set(["Read", "Glob", "Grep"]);
const SUMMON_DEBUG_ENV = "AGENTS_COUNCIL_SUMMON_DEBUG";
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedModels: SummonModelInfo[] | null = null;
let cachedModelsAt = 0;

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

export async function loadSupportedSummonModels(): Promise<SummonModelInfo[]> {
  const now = Date.now();
  if (cachedModels && now - cachedModelsAt < MODEL_CACHE_TTL_MS) {
    return cachedModels;
  }

  const response = query({
    prompt: createPromptMessages("List supported Claude Code models."),
    options: {
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

    if (normalized.length > 0) {
      cachedModels = normalized;
      cachedModelsAt = now;
    }

    return normalized;
  } catch {
    return [];
  } finally {
    try {
      await response.interrupt();
    } catch {
      // Ignore interrupt failures.
    }
  }
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

  const prompt = buildSummonPrompt();

  const response = query({
    prompt: createPromptMessages(prompt),
    options: {
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

  let resultMessage: { subtype?: string; errors?: string[]; result?: string } | null = null;
  for await (const message of response) {
    await appendSummonLog({ event: "sdk_message", data: message });
    if (message.type === "result") {
      resultMessage = message;
    }
  }

  if (!resultMessage) {
    await appendSummonLog({ event: "summon_error", data: { message: "No result message." } });
    throw new Error("Summon failed to return a result.");
  }
  if (resultMessage.subtype !== "success") {
    const details = resultMessage.errors?.join("; ") ?? "Claude summon failed.";
    await appendSummonLog({ event: "summon_error", data: { message: details } });
    throw new Error(details);
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

function buildSummonPrompt(): string {
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
