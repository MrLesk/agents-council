import { useCallback, useEffect, useMemo, useState } from "react";

import {
  closeCouncil,
  getCurrentSessionData,
  joinCouncil,
  listSessions,
  sendResponse,
  setActiveSession,
  startCouncil,
  subscribeCouncilStateChanges,
} from "../api";
import type { CouncilStateDto, FeedbackDto, RequestDto, SessionListItemDto } from "../types";

export type ConnectionStatus = "listening" | "offline";

export type SessionStatus = "active" | "closed" | "none";

export type HallState = "idle" | "active" | "closed";

export type CouncilContext = {
  state: CouncilStateDto | null;
  connection: ConnectionStatus;
  busy: boolean;
  error: string | null;
  notice: string | null;
  lastUpdated: string | null;
  sessionStatus: SessionStatus;
  hallState: HallState;
  sessions: SessionListItemDto[];
  activeSessionId: string | null;
  currentRequest: RequestDto | null;
  feedback: FeedbackDto[];
  pendingParticipants: string[];
  canClose: (name: string) => boolean;
  refresh: () => Promise<void>;
  start: (name: string, request: string) => Promise<boolean>;
  join: (name: string) => Promise<boolean>;
  send: (name: string, content: string) => Promise<boolean>;
  close: (name: string, conclusion: string) => Promise<boolean>;
  selectSession: (name: string, sessionId: string) => Promise<boolean>;
  clearError: () => void;
  clearNotice: () => void;
};

export function useCouncil(name: string | null): CouncilContext {
  const [state, setState] = useState<CouncilStateDto | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>("offline");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wsAttempt, setWsAttempt] = useState(0);
  const [pendingParticipants, setPendingParticipants] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionListItemDto[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const sessionStatus: SessionStatus = state?.session?.status ?? "none";

  const currentRequest: RequestDto | null = useMemo(() => {
    if (!state?.session?.current_request_id) {
      return null;
    }
    return state.requests.find((r) => r.id === state.session?.current_request_id) ?? null;
  }, [state]);

  const feedback: FeedbackDto[] = state?.feedback ?? [];

  const hallState: HallState = useMemo(() => {
    if (sessionStatus === "active" && currentRequest) {
      return "active";
    }
    if (sessionStatus === "closed" && currentRequest) {
      return "closed";
    }
    return "idle";
  }, [sessionStatus, currentRequest]);

  const canClose = useCallback(
    (_userName: string): boolean => {
      return Boolean(hallState === "active" && currentRequest);
    },
    [hallState, currentRequest],
  );

  const loadSnapshot = useCallback(async (agentName: string) => {
    const [sessionData, chronicle] = await Promise.all([getCurrentSessionData(agentName), listSessions()]);
    setState(sessionData.state);
    setPendingParticipants(sessionData.pending_participants);
    setSessions(chronicle.sessions);
    setActiveSessionId(chronicle.active_session_id);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const refresh = useCallback(async () => {
    if (!name) {
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await loadSnapshot(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh session.");
    } finally {
      setBusy(false);
    }
  }, [name, loadSnapshot]);

  // Initial fetch when name is set
  useEffect(() => {
    if (name) {
      void refresh();
    }
  }, [name, refresh]);

  // Real-time state updates via desktop bridge (primary) or WebSocket fallback.
  useEffect(() => {
    if (!name) {
      return;
    }

    // wsAttempt triggers reconnection when the fallback websocket disconnects.
    const _attempt = wsAttempt;
    void _attempt;

    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleReconnect = () => {
      if (reconnectTimer) {
        return;
      }
      setConnection("offline");
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        setWsAttempt((attempt) => attempt + 1);
      }, 1500);
    };

    const subscription = subscribeCouncilStateChanges({
      onConnect: () => {
        setConnection("listening");
        void refresh();
      },
      onDisconnect: scheduleReconnect,
      onChange: () => {
        void refresh();
      },
    });

    if (!subscription) {
      setConnection("offline");
      return;
    }

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      subscription.close();
    };
  }, [name, refresh, wsAttempt]);

  const start = useCallback(
    async (userName: string, request: string): Promise<boolean> => {
      if (!request.trim()) {
        return false;
      }
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await startCouncil(userName, request.trim());
        await loadSnapshot(userName);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start the council.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadSnapshot],
  );

  const join = useCallback(
    async (userName: string): Promise<boolean> => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const result = await joinCouncil(userName);
        await loadSnapshot(userName);
        if (!result.session_id || !result.request) {
          setNotice("No active council found.");
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to join the council.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadSnapshot],
  );

  const send = useCallback(
    async (userName: string, content: string): Promise<boolean> => {
      if (!content.trim()) {
        return false;
      }
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await sendResponse(userName, content.trim());
        await loadSnapshot(userName);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send response.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadSnapshot],
  );

  const close = useCallback(
    async (userName: string, conclusion: string): Promise<boolean> => {
      if (!conclusion.trim()) {
        return false;
      }
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await closeCouncil(userName, conclusion.trim());
        await loadSnapshot(userName);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to close the council.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadSnapshot],
  );

  const selectSession = useCallback(
    async (userName: string, sessionId: string): Promise<boolean> => {
      if (!sessionId) {
        return false;
      }

      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await setActiveSession(userName, sessionId);
        await loadSnapshot(userName);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to switch sessions.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadSnapshot],
  );

  return {
    state,
    connection,
    busy,
    error,
    notice,
    lastUpdated,
    sessionStatus,
    hallState,
    sessions,
    activeSessionId,
    currentRequest,
    feedback,
    pendingParticipants,
    canClose,
    refresh,
    start,
    join,
    send,
    close,
    selectSession,
    clearError: () => setError(null),
    clearNotice: () => setNotice(null),
  };
}
