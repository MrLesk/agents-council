import { type KeyboardEvent } from "react";

import { MessageBubble, type HallAgentType, type HallMessage } from "./MessageBubble";

type CouncilHallProps = {
  sessionTitle: string;
  sessionStatus: "active" | "closed" | "none";
  request: {
    content: string;
    created_by: string;
    created_at: string;
  } | null;
  messages: HallMessage[];
  pendingParticipants: string[];
  activeAgents: string[];
  responseDraft: string;
  onResponseDraftChange: (value: string) => void;
  onResponseKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendResponse: () => void;
  canSendResponse: boolean;
  conclusionDraft: string;
  onConclusionDraftChange: (value: string) => void;
  onCloseCouncil: () => void;
  canCloseCouncil: boolean;
  onOpenSummonAgent: () => void;
  summonDisabled: boolean;
};

export function CouncilHall({
  sessionTitle,
  sessionStatus,
  request,
  messages,
  pendingParticipants,
  activeAgents,
  responseDraft,
  onResponseDraftChange,
  onResponseKeyDown,
  onSendResponse,
  canSendResponse,
  conclusionDraft,
  onConclusionDraftChange,
  onCloseCouncil,
  canCloseCouncil,
  onOpenSummonAgent,
  summonDisabled,
}: CouncilHallProps) {
  const inSession = sessionStatus !== "none";

  return (
    <section className="council-hall" aria-label="Council hall">
      <header className="council-hall-header">
        <div>
          <h2>{sessionTitle}</h2>
          <p>
            {sessionStatus === "active"
              ? "Council In Session"
              : sessionStatus === "closed"
                ? "Council Concluded"
                : "No Session"}
          </p>
        </div>
        <div className="council-hall-actions">
          <div className="council-avatar-stack" aria-label="Active agents">
            {activeAgents.slice(0, 6).map((name) => (
              <span key={name} title={name}>
                {initials(name)}
              </span>
            ))}
          </div>
          {sessionStatus === "active" ? (
            <button type="button" className="btn-game" onClick={onOpenSummonAgent} disabled={summonDisabled}>
              Summon Agent
            </button>
          ) : null}
        </div>
      </header>

      <div className="council-messages" role="log" aria-live="polite">
        {!inSession ? (
          <p className="council-empty">No council is in session. Spawn a session from the sidebar.</p>
        ) : (
          <>
            {request ? (
              <article className="council-request panel-secondary">
                <header>
                  <strong>The Matter Before the Council</strong>
                  <span>
                    {request.created_by} · {formatDateTime(request.created_at)}
                  </span>
                </header>
                <p>{request.content}</p>
              </article>
            ) : null}

            {messages.length === 0 && pendingParticipants.length === 0 ? (
              <p className="council-empty">The council listens...</p>
            ) : null}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {pendingParticipants.map((name) => (
              <MessageBubble
                key={`pending-${name}`}
                message={{
                  id: `pending-${name}`,
                  author: name,
                  content: "thinking...",
                  created_at: new Date().toISOString(),
                  message_type: "system",
                  agent_type: getAgentType(name),
                  own: false,
                }}
              />
            ))}
          </>
        )}
      </div>

      {sessionStatus === "active" ? (
        <div className="council-composer-wrap">
          <textarea
            className="council-composer"
            value={responseDraft}
            onChange={(event) => onResponseDraftChange(event.target.value)}
            onKeyDown={onResponseKeyDown}
            placeholder="Address the council..."
            rows={4}
          />
          <div className="council-composer-actions">
            <span>Enter to send · Shift+Enter for newline</span>
            <button type="button" className="btn-game" onClick={onSendResponse} disabled={!canSendResponse}>
              Send Response
            </button>
          </div>
        </div>
      ) : null}

      {sessionStatus === "active" ? (
        <div className="council-close-wrap">
          <label htmlFor="hall-conclusion">Conclusion (to seal)</label>
          <textarea
            id="hall-conclusion"
            className="textarea"
            value={conclusionDraft}
            onChange={(event) => onConclusionDraftChange(event.target.value)}
            rows={2}
            placeholder="Speak the final word..."
          />
          <button type="button" className="btn-game btn-game-seal" onClick={onCloseCouncil} disabled={!canCloseCouncil}>
            Seal the Matter
          </button>
        </div>
      ) : null}
    </section>
  );
}

function initials(name: string): string {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return "?";
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAgentType(name: string): HallAgentType {
  const lower = name.toLowerCase();
  if (lower.includes("claude")) return "claude";
  if (lower.includes("codex")) return "codex";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("human")) return "human";
  return "other";
}
