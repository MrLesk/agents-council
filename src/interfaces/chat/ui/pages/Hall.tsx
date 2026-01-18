import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import MarkdownPreview, { type MarkdownPreviewProps } from "@uiw/react-markdown-preview";

import { Settings } from "../components/Settings";
import { getSummonSettings, refreshSummonModels, summonAgent, updateSummonSettings } from "../api";
import type { CouncilContext } from "../hooks/useCouncil";
import type { SummonModelInfoDto, SummonSettingsResponse } from "../types";

type AgentType = "claude" | "codex" | "gemini" | "human" | "other";

const AGENT_SIGILS: Record<AgentType, string> = {
  claude: "◈",
  codex: "◆",
  gemini: "✦",
  human: "●",
  other: "○",
};

function getAgentType(name: string): AgentType {
  const lower = name.toLowerCase();
  if (lower.includes("claude")) return "claude";
  if (lower.includes("codex")) return "codex";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("human")) return "human";
  return "other";
}

function AgentBadge({ name }: { name: string }) {
  const agentType = getAgentType(name);
  const sigil = AGENT_SIGILS[agentType];
  return (
    <span className="agent-badge">
      <span className={`agent-sigil agent-${agentType}`}>{sigil}</span>
      <span className={`agent-name agent-${agentType}`}>{name}</span>
    </span>
  );
}

function formatSummonModelLabel(model: SummonModelInfoDto): string {
  const name = model.display_name.trim() || model.value;
  const description = model.description.trim();
  if (description.length > 0 && description !== name) {
    return `${name} — ${description}`;
  }
  return name;
}

type HallProps = {
  name: string;
  council: CouncilContext;
  onNameChange: (name: string) => void;
};

const filterMarkdownPlugins: NonNullable<MarkdownPreviewProps["pluginsFilter"]> = (type, plugins) => {
  if (type !== "rehype") {
    return plugins;
  }

  return plugins.filter((plugin) => {
    const candidate = Array.isArray(plugin) ? plugin[0] : plugin;
    if (typeof candidate !== "function") {
      return true;
    }
    return candidate.name !== "rehypeRaw";
  });
};

export function Hall({ name, council, onNameChange }: HallProps) {
  const [requestDraft, setRequestDraft] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [conclusionDraft, setConclusionDraft] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSummon, setShowSummon] = useState(false);
  const [showSummonAgent, setShowSummonAgent] = useState(false);
  const [summonSettings, setSummonSettings] = useState<SummonSettingsResponse | null>(null);
  const [summonAgentName, setSummonAgentName] = useState("");
  const [summonModel, setSummonModel] = useState("");
  const [summonBusy, setSummonBusy] = useState(false);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [summonError, setSummonError] = useState<string | null>(null);
  const [summonNotice, setSummonNotice] = useState<string | null>(null);
  const [summonFailure, setSummonFailure] = useState<{ agent: string; message: string } | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevFeedbackLengthRef = useRef(0);
  const refreshNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    connection,
    busy,
    error,
    notice,
    sessionStatus,
    hallState,
    currentRequest,
    feedback,
    pendingParticipants,
    canClose,
    start,
    send,
    close,
  } = council;

  const isActive = hallState === "active";
  const isIdle = hallState === "idle";
  const canCloseCouncil = canClose(name);
  const isCreator = Boolean(currentRequest && currentRequest.created_by === name);
  const hasSpoken = Boolean(
    currentRequest && feedback.some((entry) => entry.request_id === currentRequest.id && entry.author === name),
  );
  const speakLabel = !isCreator && !hasSpoken ? "Join and speak" : "Speak";
  const summonLabel = currentRequest ? "Summon a New Council" : "Summon the Council";
  const summonModels = summonSettings?.supported_models_by_agent[summonAgentName] ?? [];
  const hasSummonModels = summonModels.length > 0;
  const isCodexAgent = summonAgentName === "Codex";
  const allowModelOverride = hasSummonModels;
  const showDefaultOption = isCodexAgent || !hasSummonModels;
  const selectModelValue = allowModelOverride ? summonModel : "";
  const missingSummonModel =
    summonModel.trim().length > 0 ? !summonModels.some((model) => model.value === summonModel) : false;

  const sessionLabel =
    sessionStatus === "none" ? "No session" : sessionStatus === "active" ? "In session" : "Concluded";
  const sessionOrbClass = `status-orb status-orb-${sessionStatus}`;

  const clearSummonNoticeTimeout = useCallback(() => {
    if (refreshNoticeTimeoutRef.current !== null) {
      clearTimeout(refreshNoticeTimeoutRef.current);
      refreshNoticeTimeoutRef.current = null;
    }
  }, []);

  const scheduleSummonNoticeClear = useCallback(() => {
    clearSummonNoticeTimeout();
    refreshNoticeTimeoutRef.current = setTimeout(() => {
      setSummonNotice(null);
      refreshNoticeTimeoutRef.current = null;
    }, 2500);
  }, [clearSummonNoticeTimeout]);

  useEffect(() => () => clearSummonNoticeTimeout(), [clearSummonNoticeTimeout]);

  const handleStart = async () => {
    const success = await start(name, requestDraft);
    if (success) {
      setRequestDraft("");
      setShowSummon(false);
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

  const applySummonDefaults = useCallback((settings: SummonSettingsResponse, nextAgent?: string) => {
    const agent = nextAgent ?? settings.default_agent ?? settings.supported_agents[0] ?? "";
    setSummonAgentName(agent);
    const agentSettings = settings.agents[agent];
    const savedModel = agentSettings?.model ?? null;
    const availableModels = settings.supported_models_by_agent[agent] ?? [];
    if (savedModel) {
      setSummonModel(savedModel);
      return;
    }
    const [firstModel] = availableModels;
    if (firstModel) {
      setSummonModel(firstModel.value);
      return;
    }
    setSummonModel("");
  }, []);

  const isNearBottom = useCallback(() => {
    const threshold = 150; // pixels from bottom
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
    }, 100);
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

  // Detect new messages from WebSocket updates
  useEffect(() => {
    const prevLength = prevFeedbackLengthRef.current;
    const currentLength = feedback.length;

    // Update the ref for next comparison
    prevFeedbackLengthRef.current = currentLength;

    // If new messages arrived and user is not near bottom, show toast
    // Use requestAnimationFrame to check after React renders the new content
    if (currentLength > prevLength && prevLength > 0) {
      requestAnimationFrame(() => {
        const nearBottom = isNearBottom();
        if (!nearBottom) {
          setHasNewMessages(true);
        }
      });
    }
  }, [feedback.length, isNearBottom]);

  // Clear new messages toast when user scrolls to bottom
  useEffect(() => {
    if (!hasNewMessages) return;

    const handleScroll = () => {
      const nearBottom = isNearBottom();
      console.log("[Toast Debug] Scroll event - nearBottom:", nearBottom);
      if (nearBottom) {
        console.log("[Toast Debug] Clearing hasNewMessages due to scroll");
        setHasNewMessages(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNewMessages, isNearBottom]);

  const handleSummonAgentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextAgent = event.target.value;
    setSummonNotice(null);
    setSummonError(null);
    if (summonSettings) {
      applySummonDefaults(summonSettings, nextAgent);
    } else {
      setSummonAgentName(nextAgent);
    }
  };

  const handleSummonAgent = async () => {
    if (!summonAgentName) {
      setSummonError("Select an agent to summon.");
      return;
    }

    const model = allowModelOverride ? summonModel.trim() : "";
    const summonPayload = {
      agent: summonAgentName,
      model: model.length > 0 ? model : null,
    };
    const settingsPayload: { agent: string; model?: string | null } = {
      agent: summonAgentName,
    };
    if (allowModelOverride) {
      settingsPayload.model = model.length > 0 ? model : null;
    }

    // Show brief loading state on button
    setSummonBusy(true);
    setSummonError(null);
    setSummonNotice(null);
    setSummonFailure(null);

    try {
      // Save settings first
      const updatedSettings = await updateSummonSettings(settingsPayload);
      setSummonSettings(updatedSettings);

      // Show loading animation for 200ms before closing modal
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Close modal - loading indicator will appear via pendingParticipants from API
      setShowSummonAgent(false);

      // Run summon in background
      await summonAgent(summonPayload);
    } catch (err) {
      // Show error inline in the messages area
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
    clearSummonNoticeTimeout();
    try {
      const updatedSettings = await refreshSummonModels();
      setSummonSettings(updatedSettings);
      applySummonDefaults(updatedSettings, summonAgentName);
      setSummonNotice("Models refreshed.");
      scheduleSummonNoticeClear();
    } catch (err) {
      setSummonError(err instanceof Error ? err.message : "Failed to refresh models.");
      setSummonNotice(null);
    } finally {
      setRefreshingModels(false);
    }
  };

  const closeSummonAgentModal = () => {
    setShowSummonAgent(false);
    setSummonError(null);
    setSummonNotice(null);
    clearSummonNoticeTimeout();
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="brand">
          <div className="brand-text">
            <div className="brand-title">Council Hall</div>
          </div>
        </div>
        <div className="hero-controls">
          <div className={`status-indicator status-indicator-${sessionStatus}`} title={sessionLabel}>
            <span className={sessionOrbClass} aria-hidden="true" />
            <span>{sessionLabel}</span>
          </div>
          <div className="identity">
            You are <strong>{name}</strong>
          </div>
          <button type="button" className="btn btn-ghost btn-settings" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </div>
      </header>

      {connection !== "listening" ? (
        <output className={`status-banner status-banner-${connection}`}>
          Connection lost. Attempting to rejoin...
        </output>
      ) : null}

      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}

      {notice ? <output className="notice">{notice}</output> : null}

      <main className="hall">
        <section className="panel-primary matter-panel">
          <div className="panel-primary-inner" />
          <div className="panel-primary-corners" />
          <div className="panel-header panel-header-centered">
            <h2 className="panel-title-decorated panel-title-hero">
              <span className="title-flourish">◆</span>
              The Matter Before the Council
              <span className="title-flourish">◆</span>
            </h2>
          </div>
          <div className="matter-content">
            {currentRequest ? (
              <article className={`message-card panel-secondary agent-${getAgentType(currentRequest.created_by)}`}>
                <header className="message-card-header">
                  <AgentBadge name={currentRequest.created_by} />
                  <span className="stamp">{formatTime(currentRequest.created_at)}</span>
                </header>
                <div className="message-card-content">
                  <MarkdownPreview
                    className="message-content"
                    source={currentRequest.content}
                    skipHtml
                    pluginsFilter={filterMarkdownPlugins}
                    wrapperElement={{ "data-color-mode": "dark" }}
                  />
                </div>
              </article>
            ) : (
              <p className="muted matter-empty">No council is in session. Bring a matter before the wise.</p>
            )}
            {council.state?.session?.conclusion ? (
              <div className="conclusion">
                <div className="solution-label">The Conclusion</div>
                <p className="conclusion-text">{council.state.session.conclusion.content}</p>
                <div className="meta-row">
                  Spoken by <AgentBadge name={council.state.session.conclusion.author} /> at{" "}
                  {formatDateTime(council.state.session.conclusion.created_at)}
                </div>
              </div>
            ) : null}
          </div>
          {!isActive ? (
            <div className="matter-actions-footer">
              <button type="button" className="btn-game" onClick={() => setShowSummon(true)} disabled={busy}>
                {summonLabel}
              </button>
            </div>
          ) : null}
        </section>

        <section className="panel-primary voices-panel">
          <div className="panel-primary-inner" />
          <div className="panel-primary-corners" />
          <div className="panel-header">
            <h2 className="panel-title-decorated">
              <span className="title-flourish">◆</span>
              Voices of the Council
              <span className="title-flourish">◆</span>
            </h2>
            <div className="voices-header-actions">
              {!isIdle ? (
                <span className="voices-count">
                  {feedback.length} {feedback.length === 1 ? "voice" : "voices"}
                </span>
              ) : null}
              {isActive ? (
                <button
                  type="button"
                  className="btn-game"
                  onClick={() => setShowSummonAgent(true)}
                  disabled={busy || summonBusy}
                >
                  Summon Agent
                </button>
              ) : null}
            </div>
          </div>
          {isIdle ? (
            <div className="empty">No council is in session.</div>
          ) : (
            <div className="messages" ref={messagesContainerRef}>
              {feedback.length === 0 && pendingParticipants.length === 0 && !summonFailure ? (
                <div className="empty">The council listens...</div>
              ) : (
                <>
                  {feedback.map((entry) => {
                    const agentType = getAgentType(entry.author);
                    return (
                      <article key={entry.id} className={`message-card panel-secondary agent-${agentType}`}>
                        <header className="message-card-header">
                          <AgentBadge name={entry.author} />
                          <span className="stamp">{formatTime(entry.created_at)}</span>
                        </header>
                        <div className="message-card-content">
                          <MarkdownPreview
                            className="message-content"
                            source={entry.content}
                            skipHtml
                            pluginsFilter={filterMarkdownPlugins}
                            wrapperElement={{ "data-color-mode": "dark" }}
                          />
                        </div>
                      </article>
                    );
                  })}
                  {pendingParticipants.map((agentName) => (
                    <article
                      key={`pending-${agentName}`}
                      className={`message-card panel-secondary agent-${getAgentType(agentName)} thinking`}
                    >
                      <header className="message-card-header">
                        <AgentBadge name={agentName} />
                        <span className="stamp thinking-label">thinking...</span>
                      </header>
                      <div className="message-card-content">
                        <div className="thinking-indicator">
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                        </div>
                      </div>
                    </article>
                  ))}
                  {summonFailure ? (
                    <article
                      className={`message-card panel-secondary agent-${getAgentType(summonFailure.agent)} error-card`}
                    >
                      <header className="message-card-header">
                        <AgentBadge name={summonFailure.agent} />
                        <span className="stamp error-label">failed</span>
                      </header>
                      <div className="message-card-content">
                        <p className="error-text">{summonFailure.message}</p>
                        <button type="button" className="btn-link" onClick={() => setSummonFailure(null)}>
                          Dismiss
                        </button>
                      </div>
                    </article>
                  ) : null}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {isActive ? (
          <section className="panel-primary composer-panel">
            <div className="panel-primary-inner" />
            <div className="panel-primary-corners" />
            <div className="panel-header">
              <h2 className="panel-title-decorated">
                <span className="title-flourish">◆</span>
                Your Counsel
                <span className="title-flourish">◆</span>
              </h2>
            </div>
            <textarea
              id="response-draft"
              className="composer-textarea"
              value={responseDraft}
              onChange={(event) => setResponseDraft(event.target.value)}
              placeholder="Share your wisdom..."
              rows={4}
            />
            <div className="composer-actions">
              <button
                type="button"
                className="btn-game"
                onClick={() => void handleSend()}
                disabled={busy || !responseDraft.trim()}
              >
                {speakLabel}
              </button>
            </div>
          </section>
        ) : null}

        {isActive ? (
          <section className="panel-primary seal-panel">
            <div className="panel-primary-inner" />
            <div className="panel-primary-corners" />
            <div className="panel-header panel-header-centered">
              <h2 className="panel-title-decorated">
                <span className="title-flourish">◆</span>
                Seal the Matter
                <span className="title-flourish">◆</span>
              </h2>
            </div>
            <p className="seal-helper">Seal only after the council agrees on a final answer.</p>
            <div className="matter-seal-input">
              <label className="label" htmlFor="conclusion-draft">
                Conclusion (to seal)
              </label>
              <textarea
                id="conclusion-draft"
                className="textarea"
                value={conclusionDraft}
                onChange={(event) => setConclusionDraft(event.target.value)}
                placeholder="Speak the final word..."
                rows={2}
              />
            </div>
            <div className="seal-actions">
              <button
                type="button"
                className="btn-game btn-game-seal"
                onClick={() => void handleClose()}
                disabled={busy || !conclusionDraft.trim() || !canCloseCouncil}
              >
                Seal the Matter
              </button>
            </div>
          </section>
        ) : null}
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

      {showSummon ? (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowSummon(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setShowSummon(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Summon the Council"
        >
          <div className="dialog-panel">
            <div className="dialog-header">
              <h2>Summon the Council</h2>
              <button type="button" className="dialog-close" onClick={() => setShowSummon(false)} aria-label="Close">
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
                <button type="button" className="btn-ghost" onClick={() => setShowSummon(false)}>
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
              closeSummonAgentModal();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeSummonAgentModal();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Summon an agent"
        >
          <div className="dialog-panel">
            <div className="dialog-header">
              <h2>Summon an Agent</h2>
              <button
                type="button"
                className="btn-icon dialog-header-action"
                onClick={handleRefreshModels}
                title="Refresh models"
                aria-label="Refresh models"
                disabled={!summonSettings || summonBusy || refreshingModels}
              >
                ⟳
              </button>
              <button type="button" className="dialog-close" onClick={closeSummonAgentModal} aria-label="Close">
                ×
              </button>
            </div>
            {summonError ? (
              <div className="alert" role="alert">
                {summonError}
              </div>
            ) : null}
            {summonNotice ? <output className="notice">{summonNotice}</output> : null}
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
                <div className="dialog-actions">
                  <button type="button" className="btn-ghost" onClick={closeSummonAgentModal} disabled={summonBusy}>
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

      {/* Toast - rendered at root level for proper fixed positioning */}
      {hasNewMessages ? (
        <button type="button" className="new-messages-toast" onClick={scrollToBottom}>
          ↓ New messages
        </button>
      ) : null}
    </div>
  );
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
