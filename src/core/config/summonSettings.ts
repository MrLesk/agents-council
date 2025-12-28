import path from "node:path";

import { ensureFileDirectory, readJsonFile, withFileLock, writeJsonFileAtomic } from "../state/fileStore";
import { resolveCouncilStatePath } from "../state/path";

export type SummonAgentSettings = {
  model: string | null;
  reasoningEffort: string | null;
};

export type SummonSettings = {
  lastUsedAgent: string | null;
  agents: Record<string, SummonAgentSettings>;
};

export type SummonSettingsUpdate = {
  lastUsedAgent?: string | null;
  agents?: Record<string, Partial<SummonAgentSettings>>;
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
      reasoningEffort: normalizeOptionalString(rawSettings.reasoningEffort),
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
        "reasoningEffort" in agentUpdate
          ? normalizeOptionalString(agentUpdate.reasoningEffort)
          : existing.reasoningEffort;

      nextAgents[agentName] = {
        model,
        reasoningEffort,
      };
    }
  }

  const lastUsedAgent =
    "lastUsedAgent" in update ? normalizeOptionalString(update.lastUsedAgent) : current.lastUsedAgent;

  return {
    lastUsedAgent,
    agents: nextAgents,
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
