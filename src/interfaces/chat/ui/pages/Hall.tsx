import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import MarkdownPreview, { type MarkdownPreviewProps } from "@uiw/react-markdown-preview";

import { Settings } from "../components/Settings";
import { getSummonSettings, summonAgent, updateSummonSettings } from "../api";
import type { CouncilContext } from "../hooks/useCouncil";
import type { SummonSettingsResponse } from "../types";

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
            <div className="brand-title">Agents Council — Hall</div>
          </div>
        </div>
        <div className="hero-controls">
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
        <section className="panel matter-panel">
          <div className="panel-header">
            <h2>The Matter Before the Council</h2>
            <div className="matter-header-actions">
              <div className={`status-pill status-${sessionStatus}`}>{sessionLabel}</div>
            </div>
          </div>
          <div className={`matter-grid${isActive ? "" : " matter-grid-single"}`}>
            <div className="matter-details">
              {currentRequest ? (
                <div className="request-card">
                  <div className="request-card-label">Council Request</div>
                  <p className="request-text">{currentRequest.content}</p>
                  <div className="request-meta">
                    <span className="meta-pill">Requested by {currentRequest.created_by}</span>
                    <span className="meta-pill">{formatTime(currentRequest.created_at)}</span>
                  </div>
                  {isActive ? (
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-summon"
                        onClick={() => setShowSummonAgent(true)}
                        disabled={busy || summonBusy}
                      >
                        Summon Claude
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="muted">No council is in session. Bring a matter before the wise.</p>
              )}
              {council.state?.session?.conclusion ? (
                <div className="conclusion">
                  <div className="solution-label">The Conclusion</div>
                  <p className="conclusion-text">{council.state.session.conclusion.content}</p>
                  <div className="meta-row">
                    Spoken by {council.state.session.conclusion.author} at{" "}
                    {formatDateTime(council.state.session.conclusion.created_at)}
                  </div>
                </div>
              ) : null}
              {!isActive ? (
                <div className="matter-cta">
                  <button type="button" className="btn btn-primary" onClick={() => setShowSummon(true)} disabled={busy}>
                    {summonLabel}
                  </button>
                </div>
              ) : null}
            </div>
            {isActive ? (
              <div className="matter-actions">
                <div className="seal-panel">
                  <label className="label" htmlFor="conclusion-draft">
                    Seal the Matter
                  </label>
                  <textarea
                    id="conclusion-draft"
                    className="textarea"
                    value={conclusionDraft}
                    onChange={(event) => setConclusionDraft(event.target.value)}
                    placeholder="Speak the final word..."
                    rows={3}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => void handleClose()}
                    disabled={busy || !conclusionDraft.trim() || !canCloseCouncil}
                  >
                    Seal the Matter
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel voices-panel">
          <div className="panel-header">
            <h2>Voices of the Council</h2>
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
            <>
              <div className="messages">
                {feedback.length === 0 ? (
                  <div className="empty">The council listens...</div>
                ) : (
                  feedback.map((entry, index) => (
                    <article key={entry.id} className="message">
                      <header className="message-header">
                        <div className="message-meta">
                          <span className="author">{entry.author}</span>
                          <span className="meta">{formatTime(entry.created_at)}</span>
                        </div>
                      </header>
                      <MarkdownPreview
                        className="message-content"
                        source={entry.content}
                        skipHtml
                        pluginsFilter={filterMarkdownPlugins}
                        wrapperElement={{ "data-color-mode": "dark" }}
                      />
                      {index < feedback.length - 1 ? <hr className="message-divider" /> : null}
                    </article>
                  ))
                )}
              </div>
              {isActive ? (
                <div className="composer">
                  <label className="label" htmlFor="response-draft">
                    Your Counsel
                  </label>
                  <textarea
                    id="response-draft"
                    className="textarea"
                    value={responseDraft}
                    onChange={(event) => setResponseDraft(event.target.value)}
                    placeholder="Share your wisdom..."
                    rows={4}
                  />
                  <div className="actions">
                    <button type="button" className="btn btn-primary" onClick={() => void handleSend()} disabled={busy}>
                      {speakLabel}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
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
                <button type="button" className="btn btn-ghost" onClick={() => setShowSummon(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy || !requestDraft.trim()}>
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
                  <button type="button" className="btn btn-ghost" onClick={closeSummonAgentModal} disabled={summonBusy}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={summonBusy || !summonAgentName}>
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
