import type { SessionListItemDto } from "../types";

type CouncilSidebarProps = {
  operatorName: string;
  sessions: SessionListItemDto[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
  busy: boolean;
};

export function CouncilSidebar({
  operatorName,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onOpenSettings,
  busy,
}: CouncilSidebarProps) {
  const activeChronicles = sessions.filter((session) => session.status === "active");
  const archives = sessions.filter((session) => session.status === "closed");

  return (
    <aside className="council-sidebar" aria-label="Council sessions">
      <div className="council-sidebar-header">
        <h1>Agents Council</h1>
        <p>Collaborative Intelligence</p>
        <button type="button" className="btn-game" onClick={onNewSession} disabled={busy}>
          Spawn Session
        </button>
      </div>

      <div className="council-sidebar-section">
        <h2>Active Chronicles</h2>
        {activeChronicles.length === 0 ? (
          <p className="council-empty">No active chronicles.</p>
        ) : (
          <ul className="council-session-list">
            {activeChronicles.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                active={session.id === activeSessionId}
                onSelectSession={onSelectSession}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="council-sidebar-section">
        <h2>Archives</h2>
        {archives.length === 0 ? (
          <p className="council-empty">No archived scrolls found.</p>
        ) : (
          <ul className="council-session-list">
            {archives.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                active={session.id === activeSessionId}
                onSelectSession={onSelectSession}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className="council-sidebar-footer">
        <div className="council-identity">
          <strong>{operatorName}</strong>
          <span>Human Operative</span>
        </div>
        <button type="button" className="btn-ghost" onClick={onOpenSettings}>
          Settings
        </button>
      </footer>
    </aside>
  );
}

function SessionRow({
  session,
  active,
  onSelectSession,
}: {
  session: SessionListItemDto;
  active: boolean;
  onSelectSession: (sessionId: string) => void;
}) {
  const classes = ["council-session-row"];
  if (active) {
    classes.push("council-session-row-active");
  }

  return (
    <li>
      <button type="button" className={classes.join(" ")} onClick={() => onSelectSession(session.id)}>
        <span className="council-session-title">{session.title}</span>
        <span className="council-session-meta">
          {formatDate(session.created_at)} · {session.participant_count} agents · {session.message_count} messages
        </span>
      </button>
    </li>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
