import path from "node:path";

import { ensureFileDirectory, readJsonFile, withFileLock, writeJsonFileAtomic } from "../state/fileStore";
import { resolveCouncilStatePath } from "../state/path";

export type SummonAgentSettings = {
  model: string | null;
};

export type SummonSettings = {
  lastUsedAgent: string | null;
  agents: Record<string, SummonAgentSettings>;
  claudeCodePath: string | null;
  codexPath: string | null;
};

export type SummonSettingsUpdate = {
  lastUsedAgent?: string | null;
  agents?: Record<string, Partial<SummonAgentSettings>>;
  claudeCodePath?: string | null;
  codexPath?: string | null;
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

      const existing = nextAgents[agentName] ?? { model: null };
      const model = "model" in agentUpdate ? normalizeOptionalString(agentUpdate.model) : existing.model;

      nextAgents[agentName] = {
        model,
      };
    }
  }

  const lastUsedAgent =
    "lastUsedAgent" in update ? normalizeOptionalString(update.lastUsedAgent) : current.lastUsedAgent;

  const claudeCodePath =
    "claudeCodePath" in update ? normalizeOptionalString(update.claudeCodePath) : current.claudeCodePath;
  const codexPath = "codexPath" in update ? normalizeOptionalString(update.codexPath) : current.codexPath;

  return {
    lastUsedAgent,
    agents: nextAgents,
    claudeCodePath,
    codexPath,
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
