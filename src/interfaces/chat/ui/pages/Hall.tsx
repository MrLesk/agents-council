import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import MarkdownPreview, { type MarkdownPreviewProps } from "@uiw/react-markdown-preview";

import { Settings } from "../components/Settings";
import { getSummonSettings, summonAgent, updateSummonSettings } from "../api";
import type { CouncilContext } from "../hooks/useCouncil";
import type { SummonSettingsResponse } from "../types";

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
  const [summonError, setSummonError] = useState<string | null>(null);
  const [summonNotice, setSummonNotice] = useState<string | null>(null);

  const {
    connection,
    busy,
    error,
    notice,
    sessionStatus,
    hallState,
    currentRequest,
    feedback,
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

  const sessionLabel =
    sessionStatus === "none" ? "No session" : sessionStatus === "active" ? "In session" : "Concluded";
  const sessionOrbClass = `status-orb status-orb-${sessionStatus}`;

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
    setSummonModel(agentSettings?.model ?? "");
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
    setSummonBusy(true);
    setSummonError(null);
    setSummonNotice(null);

    const model = summonModel.trim();
    const payload = {
      agent: summonAgentName,
      model: model.length > 0 ? model : null,
    };

    try {
      const updatedSettings = await updateSummonSettings(payload);
      setSummonSettings(updatedSettings);
      const result = await summonAgent(payload);
      setSummonNotice(`Summoned ${result.agent}. Response recorded.`);
    } catch (err) {
      setSummonError(err instanceof Error ? err.message : "Unable to summon agent.");
    } finally {
      setSummonBusy(false);
    }
  };

  const closeSummonAgentModal = () => {
    setShowSummonAgent(false);
    setSummonError(null);
    setSummonNotice(null);
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
                  <p className="request-text">{currentRequest.content}</p>
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
          <div className="matter-actions-footer">
            {isActive ? (
              <>
                <button
                  type="button"
                  className="btn-game"
                  onClick={() => setShowSummonAgent(true)}
                  disabled={busy || summonBusy}
                >
                  Summon Claude
                </button>
                <button
                  type="button"
                  className="btn-game btn-game-seal"
                  onClick={() => void handleClose()}
                  disabled={busy || !conclusionDraft.trim() || !canCloseCouncil}
                >
                  Seal the Matter
                </button>
              </>
            ) : (
              <button type="button" className="btn-game" onClick={() => setShowSummon(true)} disabled={busy}>
                {summonLabel}
              </button>
            )}
          </div>
          {isActive ? (
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
            </div>
          </div>
          {isIdle ? (
            <div className="empty">No council is in session.</div>
          ) : (
            <div className="messages">
              {feedback.length === 0 ? (
                <div className="empty">The council listens...</div>
              ) : (
                feedback.map((entry) => {
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
                })
              )}
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
                <select
                  id="summon-agent"
                  className="select"
                  value={summonAgentName}
                  onChange={handleSummonAgentChange}
                  disabled={summonBusy}
                >
                  {summonSettings.supported_agents.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </select>
                <label className="label" htmlFor="summon-model">
                  Model
                </label>
                {summonSettings.supported_models.length > 0 &&
                summonModel &&
                !summonSettings.supported_models.some((model) => model.value === summonModel) ? (
                  <div className="select-hint">Saved model isn’t in the current list.</div>
                ) : null}
                <select
                  id="summon-model"
                  className="select"
                  value={summonModel}
                  onChange={(event) => setSummonModel(event.target.value)}
                  disabled={summonBusy}
                >
                  <option value="">Default (Claude Code)</option>
                  {summonModel &&
                  !summonSettings.supported_models.some((model) => model.value === summonModel) ? (
                    <option value={summonModel}>{`Saved: ${summonModel}`}</option>
                  ) : null}
                  {summonSettings.supported_models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.display_name}
                    </option>
                  ))}
                </select>
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
