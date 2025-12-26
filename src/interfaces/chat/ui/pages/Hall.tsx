import { useState } from "react";

import { Settings } from "../components/Settings";
import type { CouncilContext } from "../hooks/useCouncil";
import logo from "../assets/agents-council-logo.png" with { type: "file" };

type HallProps = {
  name: string;
  council: CouncilContext;
  onNameChange: (name: string) => void;
};

export function Hall({ name, council, onNameChange }: HallProps) {
  const [requestDraft, setRequestDraft] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [conclusionDraft, setConclusionDraft] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const {
    connection,
    busy,
    error,
    notice,
    lastUpdated,
    sessionStatus,
    hallState,
    currentRequest,
    feedback,
    canClose,
    start,
    join,
    send,
    close,
  } = council;

  const isActive = hallState === "active";
  const isIdle = hallState === "idle";
  const canCloseCouncil = canClose(name);

  const sessionLabel =
    sessionStatus === "none" ? "The chamber is quiet" : sessionStatus === "active" ? "In session" : "Concluded";
  const signalLabel = connection === "listening" ? "Connected" : "Lost";

  const handleStart = async () => {
    const success = await start(name, requestDraft);
    if (success) {
      setRequestDraft("");
    }
  };

  const handleJoin = async () => {
    await join(name);
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

  return (
    <div className="app">
      <header className="hero">
        <div>
          <div className="brand">
            <img className="logo logo-header" src={logo} alt="Agents Council" />
          </div>
          <div className="tagline">Council Hall</div>
        </div>
        <div className="status">
          <div className={`status-pill status-${sessionStatus}`}>{sessionLabel}</div>
          <div className={`status-pill status-${connection}`}>{signalLabel}</div>
          {lastUpdated ? <div className="stamp">Last update: {lastUpdated}</div> : null}
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

      <main className="grid">
        <section className="panel request-panel">
          <div className="panel-header">
            <h2>The Matter Before the Council</h2>
          </div>
          {currentRequest ? (
            <div>
              <p className="request-text">{currentRequest.content}</p>
              <div className="meta-row">
                Summoned by {currentRequest.created_by} at {formatTime(currentRequest.created_at)}
              </div>
            </div>
          ) : (
            <p className="muted">Convene a council to bring a matter before the wise.</p>
          )}
          {council.state?.session?.conclusion ? (
            <div className="conclusion">
              <div className="panel-header">
                <h3>The Conclusion</h3>
              </div>
              <p className="conclusion-text">{council.state.session.conclusion.content}</p>
              <div className="meta-row">Spoken by {council.state.session.conclusion.author}</div>
            </div>
          ) : null}
        </section>

        <section className="panel chat-panel">
          <div className="panel-header">
            <h2>Voices of the Council</h2>
            <span className="meta">{feedback.length} {feedback.length === 1 ? "voice" : "voices"}</span>
          </div>
          {isIdle ? (
            <div className="empty">No council is in session.</div>
          ) : (
            <>
              <div className="messages">
                {feedback.length === 0 ? (
                  <div className="empty">The council listens...</div>
                ) : (
                  feedback.map((entry) => (
                    <article key={entry.id} className="message">
                      <header>
                        <span className="author">{entry.author}</span>
                        <span className="meta">{formatTime(entry.created_at)}</span>
                      </header>
                      <p>{entry.content}</p>
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
                      Speak
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="panel control-panel">
          <div className="panel-section">
            <div className="panel-header">
              <h2>Your Role</h2>
            </div>
            <p className="role-name">You are: <strong>{name}</strong></p>
            <button type="button" className="btn btn-ghost" onClick={() => setShowSettings(true)}>
              Settings
            </button>
          </div>

          {!isActive ? (
            <div className="panel-section">
              <div className="panel-header">
                <h2>Convene</h2>
              </div>
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
              <div className="actions">
                <button type="button" className="btn btn-primary" onClick={() => void handleStart()} disabled={busy}>
                  Summon the Council
                </button>
                {isIdle ? (
                  <button type="button" className="btn btn-ghost" onClick={() => void handleJoin()} disabled={busy}>
                    Join the Council
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {isActive ? (
            <div className="panel-section">
              <div className="panel-header">
                <h2>Seal the Matter</h2>
              </div>
              <label className="label" htmlFor="conclusion-draft">
                The Conclusion
              </label>
              <textarea
                id="conclusion-draft"
                className="textarea"
                value={conclusionDraft}
                onChange={(event) => setConclusionDraft(event.target.value)}
                placeholder="Speak the final word..."
                rows={3}
                disabled={!canCloseCouncil}
              />
              {!canCloseCouncil ? (
                <div className="helper">Only the one who summoned the council may seal it.</div>
              ) : null}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void handleClose()}
                disabled={busy || !canCloseCouncil}
              >
                Seal the Matter
              </button>
            </div>
          ) : null}
        </aside>
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
