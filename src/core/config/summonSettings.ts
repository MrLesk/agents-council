import path from "node:path";

import { ensureFileDirectory, readJsonFile, withFileLock, writeJsonFileAtomic } from "../state/fileStore";
import { resolveCouncilStatePath } from "../state/path";

export type SummonAgentSettings = {
  model: string | null;
  reasoningEffort: string | null;
};

export type SummonModelReasoningEffort = {
  reasoningEffort: string;
  description: string;
};

export type SummonModelInfo = {
  value: string;
  displayName: string;
  description: string;
  supportedReasoningEfforts: SummonModelReasoningEffort[];
  defaultReasoningEffort: string;
};

export type SummonModelsCacheEntry = {
  models: SummonModelInfo[];
  updatedAt: string;
};

export type SummonSettings = {
  lastUsedAgent: string | null;
  agents: Record<string, SummonAgentSettings>;
  claudeCodePath: string | null;
  codexPath: string | null;
  summonModelsCache: Record<string, SummonModelsCacheEntry>;
};

export type SummonSettingsUpdate = {
  lastUsedAgent?: string | null;
  agents?: Record<string, Partial<SummonAgentSettings>>;
  claudeCodePath?: string | null;
  codexPath?: string | null;
  summonModelsCache?: Record<string, SummonModelsCacheEntry | null>;
};

export async function loadSummonSettings(statePath?: string): Promise<SummonSettings> {
  const configPath = resolveConfigPath(statePath);
  const raw = await readJsonFile<unknown>(configPath, createDefaultSummonSettings);
  return normalizeSummonSettings(raw);
}

export async function upsertSummonSettings(update: SummonSettingsUpdate, statePath?: string): Promise<SummonSettings> {
  const configPath = resolveConfigPath(statePath);
  await ensureFileDirectory(configPath);

  return withFileLock(configPath, async () => {
    const raw = await readJsonFile<unknown>(configPath, createDefaultSummonSettings);
    const current = normalizeSummonSettings(raw);
    const next = applyUpdate(current, update);
    await writeJsonFileAtomic(configPath, next);
    return next;
  });
}

function resolveConfigPath(statePath?: string): string {
  const resolvedStatePath = resolveCouncilStatePath(statePath);
  return path.join(path.dirname(resolvedStatePath), "config.json");
}

function createDefaultSummonSettings(): SummonSettings {
  return {
    lastUsedAgent: null,
    agents: {},
    claudeCodePath: null,
    codexPath: null,
    summonModelsCache: {},
  };
}

function normalizeSummonSettings(input: unknown): SummonSettings {
  if (!isRecord(input)) {
    return createDefaultSummonSettings();
  }

  if ("summon" in input) {
    return normalizeSummonSettings(input.summon);
  }

  return {
    lastUsedAgent: normalizeOptionalString(input.lastUsedAgent),
    agents: normalizeAgentSettings(input.agents),
    claudeCodePath: normalizeOptionalString(input.claudeCodePath),
    codexPath: normalizeOptionalString(input.codexPath),
    summonModelsCache: normalizeSummonModelsCache(input.summonModelsCache),
  };
}

function normalizeAgentSettings(input: unknown): Record<string, SummonAgentSettings> {
  if (!isRecord(input)) {
    return {};
  }

  const agents: Record<string, SummonAgentSettings> = {};

  for (const [agentName, rawSettings] of Object.entries(input)) {
    if (!isRecord(rawSettings)) {
      continue;
    }

    agents[agentName] = {
      model: normalizeOptionalString(rawSettings.model),
      reasoningEffort: normalizeOptionalString(rawSettings.reasoningEffort ?? rawSettings.reasoning_effort),
    };
  }

  return agents;
}

function applyUpdate(current: SummonSettings, update: SummonSettingsUpdate): SummonSettings {
  const nextAgents: Record<string, SummonAgentSettings> = { ...current.agents };

  if (update.agents) {
    for (const [agentName, agentUpdate] of Object.entries(update.agents)) {
      if (!agentUpdate || typeof agentUpdate !== "object") {
        continue;
      }

      const existing = nextAgents[agentName] ?? { model: null, reasoningEffort: null };
      const model = "model" in agentUpdate ? normalizeOptionalString(agentUpdate.model) : existing.model;
      const reasoningEffort =
        "reasoningEffort" in agentUpdate || "reasoning_effort" in agentUpdate
          ? normalizeOptionalString(
              (agentUpdate as Record<string, unknown>).reasoningEffort ??
                (agentUpdate as Record<string, unknown>).reasoning_effort,
            )
          : existing.reasoningEffort;

      nextAgents[agentName] = {
        model,
        reasoningEffort,
      };
    }
  }

  const lastUsedAgent =
    "lastUsedAgent" in update ? normalizeOptionalString(update.lastUsedAgent) : current.lastUsedAgent;

  const claudeCodePath =
    "claudeCodePath" in update ? normalizeOptionalString(update.claudeCodePath) : current.claudeCodePath;
  const codexPath = "codexPath" in update ? normalizeOptionalString(update.codexPath) : current.codexPath;
  const summonModelsCache = applyModelsCacheUpdate(current.summonModelsCache, update.summonModelsCache);

  return {
    lastUsedAgent,
    agents: nextAgents,
    claudeCodePath,
    codexPath,
    summonModelsCache,
  };
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSummonModelsCache(input: unknown): Record<string, SummonModelsCacheEntry> {
  if (!isRecord(input)) {
    return {};
  }

  const cache: Record<string, SummonModelsCacheEntry> = {};

  for (const [agentName, rawEntry] of Object.entries(input)) {
    const entry = normalizeSummonModelsCacheEntry(rawEntry);
    if (entry) {
      cache[agentName] = entry;
    }
  }

  return cache;
}

function normalizeSummonModelsCacheEntry(input: unknown): SummonModelsCacheEntry | null {
  if (!isRecord(input)) {
    return null;
  }

  const models = Array.isArray(input.models)
    ? input.models
        .map((model) => normalizeSummonModelInfo(model))
        .filter((model): model is SummonModelInfo => model !== null)
    : [];

  if (models.length === 0) {
    return null;
  }

  const updatedAt = normalizeOptionalString(input.updatedAt) ?? new Date().toISOString();

  return {
    models,
    updatedAt,
  };
}

function normalizeSummonModelInfo(input: unknown): SummonModelInfo | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = normalizeOptionalString(input.value);
  if (!value) {
    return null;
  }

  const displayName = normalizeOptionalString(input.displayName) ?? value;
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

function normalizeReasoningEfforts(input: unknown[]): SummonModelReasoningEffort[] {
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
    .filter((entry): entry is SummonModelReasoningEffort => entry !== null);
}

function applyModelsCacheUpdate(
  current: Record<string, SummonModelsCacheEntry>,
  update?: Record<string, SummonModelsCacheEntry | null>,
): Record<string, SummonModelsCacheEntry> {
  if (!update) {
    return current;
  }

  const next = { ...current };
  for (const [agentName, entry] of Object.entries(update)) {
    if (!entry) {
      delete next[agentName];
      continue;
    }
    next[agentName] = entry;
  }

  return next;
}
