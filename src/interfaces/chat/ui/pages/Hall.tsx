import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Settings } from "../components/Settings";
import { CouncilHall } from "../components/CouncilHall";
import { CouncilSidebar } from "../components/CouncilSidebar";
import type { HallAgentType, HallMessage } from "../components/MessageBubble";
import { getSummonSettings, refreshSummonModels, summonAgent, updateSummonSettings } from "../api";
import type { CouncilContext } from "../hooks/useCouncil";
import type { SummonModelInfoDto, SummonSettingsResponse } from "../types";

type HallProps = {
  name: string;
  council: CouncilContext;
  onNameChange: (name: string) => void;
};

function formatSummonModelLabel(model: SummonModelInfoDto): string {
  return model.display_name.trim() || model.value;
}

function resolveReasoningEffort(model: SummonModelInfoDto | null, savedEffort: string | null): string {
  if (!model) {
    return "";
  }
  const options = model.supported_reasoning_efforts ?? [];
  if (options.length === 0) {
    return "";
  }
  if (savedEffort && options.some((effort) => effort.reasoning_effort === savedEffort)) {
    return savedEffort;
  }
  return model.default_reasoning_effort || options[0]?.reasoning_effort || "";
}

export function Hall({ name, council, onNameChange }: HallProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSummonAgent, setShowSummonAgent] = useState(false);
  const [requestDraft, setRequestDraft] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [conclusionDraft, setConclusionDraft] = useState("");
  const [summonSettings, setSummonSettings] = useState<SummonSettingsResponse | null>(null);
  const [summonAgentName, setSummonAgentName] = useState("");
  const [summonModel, setSummonModel] = useState("");
  const [summonReasoningEffort, setSummonReasoningEffort] = useState("");
  const [summonBusy, setSummonBusy] = useState(false);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [summonError, setSummonError] = useState<string | null>(null);
  const [summonNotice, setSummonNotice] = useState<string | null>(null);
  const [summonFailure, setSummonFailure] = useState<{ agent: string; message: string } | null>(null);
  const [localPendingAgents, setLocalPendingAgents] = useState<string[]>([]);

  const {
    connection,
    busy,
    error,
    notice,
    sessionStatus,
    sessions,
    activeSessionId,
    currentRequest,
    feedback,
    pendingParticipants,
    canClose,
    start,
    send,
    close,
    selectSession,
  } = council;

  const canCloseCouncil = canClose(name);
  const selectedSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const sessionTitle = selectedSession?.title ?? deriveSessionTitle(currentRequest?.content ?? "");
  const currentRequestId = currentRequest?.id ?? null;

  const summonModels = summonSettings?.supported_models_by_agent[summonAgentName] ?? [];
  const hasSummonModels = summonModels.length > 0;
  const isCodexAgent = summonAgentName === "Codex";
  const allowModelOverride = hasSummonModels;
  const showDefaultOption = isCodexAgent || !hasSummonModels;
  const selectModelValue = allowModelOverride ? summonModel : "";
  const selectedSummonModel = summonModels.find((model) => model.value === summonModel) ?? null;
  const reasoningOptions = selectedSummonModel?.supported_reasoning_efforts ?? [];
  const hasReasoningOptions = reasoningOptions.length > 0;
  const allowReasoningOverride = hasReasoningOptions;
  const selectReasoningValue = allowReasoningOverride ? summonReasoningEffort : "";
  const missingSummonModel =
    summonModel.trim().length > 0 ? !summonModels.some((model) => model.value === summonModel) : false;

  const displayPendingParticipants = useMemo(
    () => Array.from(new Set([...pendingParticipants, ...localPendingAgents])),
    [pendingParticipants, localPendingAgents],
  );

  const activeAgents = useMemo(() => {
    const names = new Set<string>();
    names.add(name);
    if (currentRequest?.created_by) {
      names.add(currentRequest.created_by);
    }
    for (const entry of feedback) {
      names.add(entry.author);
    }
    for (const pending of displayPendingParticipants) {
      names.add(pending);
    }

    return Array.from(names);
  }, [currentRequest?.created_by, displayPendingParticipants, feedback, name]);

  const hallMessages = useMemo<HallMessage[]>(() => {
    const messages: HallMessage[] = feedback.map((entry) => ({
      id: entry.id,
      author: entry.author,
      content: entry.content,
      created_at: entry.created_at,
      message_type: hasCodeBlock(entry.content) ? "code" : "text",
      agent_type: getAgentType(entry.author),
      own: entry.author === name,
    }));

    if (summonFailure) {
      messages.push({
        id: `summon-failure-${summonFailure.agent}`,
        author: summonFailure.agent,
        content: summonFailure.message,
        created_at: new Date().toISOString(),
        message_type: "system",
        agent_type: getAgentType(summonFailure.agent),
        own: false,
      });
    }

    return messages;
  }, [feedback, name, summonFailure]);

  const applySummonDefaults = useCallback((settings: SummonSettingsResponse, nextAgent?: string) => {
    const agent = nextAgent ?? settings.default_agent ?? settings.supported_agents[0] ?? "";
    setSummonAgentName(agent);
    const agentSettings = settings.agents[agent];
    const savedModel = agentSettings?.model ?? null;
    const savedEffort = agentSettings?.reasoning_effort ?? null;
    const availableModels = settings.supported_models_by_agent[agent] ?? [];
    const selectedModel =
      savedModel && savedModel.trim().length > 0
        ? (availableModels.find((model) => model.value === savedModel) ?? null)
        : (availableModels[0] ?? null);
    const nextModel = selectedModel?.value ?? "";
    setSummonModel(nextModel);
    const nextEffort = resolveReasoningEffort(selectedModel, savedEffort);
    setSummonReasoningEffort(nextEffort);
  }, []);

  useEffect(() => {
    if (!showSummonAgent) {
      return;
    }

    let cancelled = false;
    setSummonBusy(true);
    setSummonError(null);
    setSummonNotice(null);

    getSummonSettings()
      .then((settings) => {
        if (cancelled) {
          return;
        }
        setSummonSettings(settings);
        applySummonDefaults(settings);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setSummonError(err instanceof Error ? err.message : "Unable to load summon settings.");
      })
      .finally(() => {
        if (!cancelled) {
          setSummonBusy(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showSummonAgent, applySummonDefaults]);

  useEffect(() => {
    if (!currentRequestId) {
      return;
    }

    setLocalPendingAgents((prev) =>
      prev.filter(
        (agent) => !feedback.some((entry) => entry.request_id === currentRequestId && entry.author === agent),
      ),
    );
  }, [currentRequestId, feedback]);

  useEffect(() => {
    if (!summonSettings) {
      if (summonReasoningEffort !== "") {
        setSummonReasoningEffort("");
      }
      return;
    }

    const model = selectedSummonModel;
    if (!model) {
      if (summonReasoningEffort !== "") {
        setSummonReasoningEffort("");
      }
      return;
    }

    const options = model.supported_reasoning_efforts ?? [];
    if (options.length === 0) {
      if (summonReasoningEffort !== "") {
        setSummonReasoningEffort("");
      }
      return;
    }

    if (summonReasoningEffort && options.some((effort) => effort.reasoning_effort === summonReasoningEffort)) {
      return;
    }

    const savedEffort = summonSettings.agents[summonAgentName]?.reasoning_effort ?? null;
    const nextEffort = resolveReasoningEffort(model, savedEffort);
    if (nextEffort !== summonReasoningEffort) {
      setSummonReasoningEffort(nextEffort);
    }
  }, [selectedSummonModel, summonAgentName, summonReasoningEffort, summonSettings]);

  const handleStart = async () => {
    const success = await start(name, requestDraft);
    if (success) {
      setRequestDraft("");
      setShowStartModal(false);
      setSummonFailure(null);
    }
  };

  const handleSend = async () => {
    const success = await send(name, responseDraft);
    if (success) {
      setResponseDraft("");
    }
  };

  const handleClose = async () => {
    const success = await close(name, conclusionDraft);
    if (success) {
      setConclusionDraft("");
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) {
      return;
    }

    await selectSession(name, sessionId);
  };

  const handleSummonAgentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextAgent = event.target.value;
    setSummonNotice(null);
    setSummonError(null);

    if (summonSettings) {
      applySummonDefaults(summonSettings, nextAgent);
      return;
    }

    setSummonAgentName(nextAgent);
  };

  const handleSummonAgent = async () => {
    if (!summonAgentName) {
      setSummonError("Select an agent to summon.");
      return;
    }

    const model = allowModelOverride ? summonModel.trim() : "";
    const reasoningEffort = allowReasoningOverride ? summonReasoningEffort.trim() : "";
    const summonPayload = {
      agent: summonAgentName,
      model: model.length > 0 ? model : null,
      ...(allowReasoningOverride ? { reasoning_effort: reasoningEffort.length > 0 ? reasoningEffort : null } : {}),
    };
    const settingsPayload: { agent: string; model?: string | null; reasoning_effort?: string | null } = {
      agent: summonAgentName,
    };
    if (allowModelOverride) {
      settingsPayload.model = model.length > 0 ? model : null;
    }
    if (allowReasoningOverride) {
      settingsPayload.reasoning_effort = reasoningEffort.length > 0 ? reasoningEffort : null;
    }

    setSummonBusy(true);
    setSummonError(null);
    setSummonNotice(null);
    setSummonFailure(null);
    setLocalPendingAgents((prev) => (prev.includes(summonAgentName) ? prev : [...prev, summonAgentName]));

    try {
      const updatedSettings = await updateSummonSettings(settingsPayload);
      setSummonSettings(updatedSettings);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setShowSummonAgent(false);
      await summonAgent(summonPayload);
    } catch (err) {
      setLocalPendingAgents((prev) => prev.filter((agent) => agent !== summonAgentName));
      const message = err instanceof Error ? err.message : "Unable to summon agent.";
      setSummonFailure({ agent: summonAgentName, message });
    } finally {
      setSummonBusy(false);
    }
  };

  const handleRefreshModels = async () => {
    if (refreshingModels) {
      return;
    }

    setRefreshingModels(true);
    setSummonError(null);
    setSummonNotice("Refreshing models...");

    try {
      const updatedSettings = await refreshSummonModels();
      setSummonSettings(updatedSettings);
      applySummonDefaults(updatedSettings, summonAgentName);
      setSummonNotice("Models refreshed.");
    } catch (err) {
      setSummonError(err instanceof Error ? err.message : "Failed to refresh models.");
      setSummonNotice(null);
    } finally {
      setRefreshingModels(false);
    }
  };

  return (
    <div className="council-shell">
      <CouncilSidebar
        operatorName={name}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(sessionId) => void handleSelectSession(sessionId)}
        onNewSession={() => setShowStartModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        busy={busy}
      />

      <main className="council-main">
        {connection !== "listening" ? (
          <output className="status-banner status-banner-offline">Connection lost. Attempting to rejoin...</output>
        ) : null}

        {error ? (
          <div className="alert" role="alert">
            {error}
          </div>
        ) : null}

        {notice ? <output className="notice">{notice}</output> : null}

        <CouncilHall
          sessionTitle={sessionTitle}
          sessionStatus={sessionStatus}
          request={currentRequest}
          messages={hallMessages}
          pendingParticipants={displayPendingParticipants}
          activeAgents={activeAgents}
          responseDraft={responseDraft}
          onResponseDraftChange={setResponseDraft}
          onResponseKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          onSendResponse={() => void handleSend()}
          canSendResponse={!busy && responseDraft.trim().length > 0 && sessionStatus === "active"}
          conclusionDraft={conclusionDraft}
          onConclusionDraftChange={setConclusionDraft}
          onCloseCouncil={() => void handleClose()}
          canCloseCouncil={!busy && conclusionDraft.trim().length > 0 && canCloseCouncil}
          onOpenSummonAgent={() => setShowSummonAgent(true)}
          summonDisabled={busy || summonBusy}
        />
      </main>

      {showSettings ? (
        <Settings
          currentName={name}
          onSave={(newName) => {
            onNameChange(newName);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      ) : null}

      {showStartModal ? (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowStartModal(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setShowStartModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Spawn session"
        >
          <div className="dialog-panel">
            <div className="dialog-header">
              <h2>Spawn Session</h2>
              <button
                type="button"
                className="dialog-close"
                onClick={() => setShowStartModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form
              className="dialog-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleStart();
              }}
            >
              <label className="label" htmlFor="request-draft">
                What matter shall we deliberate?
              </label>
              <textarea
                id="request-draft"
                className="textarea"
                value={requestDraft}
                onChange={(event) => setRequestDraft(event.target.value)}
                placeholder="State the matter before the council..."
                rows={4}
              />
              <div className="dialog-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowStartModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-game" disabled={busy || !requestDraft.trim()}>
                  Summon the Council
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showSummonAgent ? (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowSummonAgent(false);
              setSummonError(null);
              setSummonNotice(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setShowSummonAgent(false);
              setSummonError(null);
              setSummonNotice(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Summon an agent"
        >
          <div className="dialog-panel">
            <div className="dialog-header">
              <h2>Summon an Agent</h2>
              {summonNotice ? <span className="dialog-status">{summonNotice}</span> : null}
              <button
                type="button"
                className="btn-icon dialog-header-action"
                onClick={() => void handleRefreshModels()}
                title="Refresh models"
                aria-label="Refresh models"
                disabled={!summonSettings || summonBusy || refreshingModels}
              >
                ⟳
              </button>
              <button
                type="button"
                className="dialog-close"
                onClick={() => {
                  setShowSummonAgent(false);
                  setSummonError(null);
                  setSummonNotice(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {summonError ? (
              <div className="alert" role="alert">
                {summonError}
              </div>
            ) : null}
            {!summonSettings ? (
              <div className="empty">Loading summon settings...</div>
            ) : (
              <form
                className="dialog-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSummonAgent();
                }}
              >
                <label className="label" htmlFor="summon-agent">
                  Agent
                </label>
                <div className="select-wrapper">
                  <select
                    id="summon-agent"
                    className="select"
                    value={summonAgentName}
                    onChange={handleSummonAgentChange}
                    disabled={summonBusy}
                  >
                    {summonSettings.supported_agents.map((agent) => {
                      const displayName =
                        agent === "Claude" && summonSettings.claude_code_version
                          ? `Claude Code v${summonSettings.claude_code_version}`
                          : agent === "Codex" && summonSettings.codex_cli_version
                            ? `Codex v${summonSettings.codex_cli_version}`
                            : agent;
                      return (
                        <option key={agent} value={agent}>
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <label className="label" htmlFor="summon-model">
                  Model
                </label>
                {missingSummonModel ? <div className="select-hint">Saved model isn't in the current list.</div> : null}
                {!hasSummonModels ? (
                  <div className="select-hint">No known models for this agent. Default settings will be used.</div>
                ) : null}
                <div className="select-wrapper">
                  <select
                    id="summon-model"
                    className="select"
                    value={selectModelValue}
                    onChange={(event) => setSummonModel(event.target.value)}
                    disabled={summonBusy}
                  >
                    {showDefaultOption ? <option value="">Default</option> : null}
                    {missingSummonModel ? (
                      <option value={summonModel} disabled={!allowModelOverride}>
                        {`Saved: ${summonModel}`}
                      </option>
                    ) : null}
                    {summonModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {formatSummonModelLabel(model)}
                      </option>
                    ))}
                  </select>
                </div>
                {hasReasoningOptions ? (
                  <>
                    <label className="label" htmlFor="summon-reasoning">
                      Reasoning
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="summon-reasoning"
                        className="select"
                        value={selectReasoningValue}
                        onChange={(event) => setSummonReasoningEffort(event.target.value)}
                        disabled={summonBusy}
                      >
                        {reasoningOptions.map((effort) => (
                          <option key={effort.reasoning_effort} value={effort.reasoning_effort}>
                            {effort.reasoning_effort}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : null}
                <div className="dialog-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setShowSummonAgent(false);
                      setSummonError(null);
                      setSummonNotice(null);
                    }}
                    disabled={summonBusy}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-game" disabled={summonBusy || !summonAgentName}>
                    Summon Agent
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getAgentType(name: string): HallAgentType {
  const lower = name.toLowerCase();
  if (lower.includes("claude")) return "claude";
  if (lower.includes("codex")) return "codex";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("human")) return "human";
  return "other";
}

function hasCodeBlock(content: string): boolean {
  return /```[\s\S]*```/.test(content);
}

function deriveSessionTitle(content: string): string {
  const collapsed = content.trim().replace(/\s+/g, " ");
  if (!collapsed) {
    return "Council Hall";
  }

  const maxLength = 64;
  return collapsed.length <= maxLength ? collapsed : `${collapsed.slice(0, maxLength - 1)}…`;
}
