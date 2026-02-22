import { BrowserView, BrowserWindow } from "electrobun/bun";

import type { CouncilStateWatcher } from "../../src/core/state/watcher";
import { watchCouncilState } from "../../src/core/state/watcher";
import {
  closeCouncilAction,
  getCurrentSessionDataAction,
  getErrorMessage,
  getSettingsAction,
  getSummonSettingsAction,
  joinCouncilAction,
  listSessionsAction,
  refreshSummonModelsAction,
  sendResponseAction,
  setActiveSessionAction,
  startCouncilAction,
  summonAgentAction,
  updateSettingsAction,
  updateSummonSettingsAction,
} from "../../src/interfaces/chat/bridge/actions";
import type {
  BridgeResult,
  CloseCouncilPayload,
  CouncilStateChangedEvent,
  GetCurrentSessionDataPayload,
  JoinCouncilPayload,
  SetActiveSessionPayload,
  SendResponsePayload,
  StartCouncilPayload,
  SummonAgentPayload,
  UpdateSettingsPayload,
  UpdateSummonSettingsPayload,
} from "../../src/interfaces/chat/bridge/contract";

const DEFAULT_WINDOW_SIZE = {
  x: 80,
  y: 80,
  width: 1280,
  height: 820,
};

const STATE_CHANGED_EVENT: CouncilStateChangedEvent = {
  type: "state-changed",
};

const councilBridgeRpc = BrowserView.defineRPC({
  handlers: {
    requests: {
      startCouncil: (payload: StartCouncilPayload) => runBridgeAction(() => startCouncilAction(payload)),
      joinCouncil: (payload: JoinCouncilPayload) => runBridgeAction(() => joinCouncilAction(payload)),
      getCurrentSessionData: (payload: GetCurrentSessionDataPayload) =>
        runBridgeAction(() => getCurrentSessionDataAction(payload)),
      listSessions: () => runBridgeAction(() => listSessionsAction({})),
      setActiveSession: (payload: SetActiveSessionPayload) => runBridgeAction(() => setActiveSessionAction(payload)),
      sendResponse: (payload: SendResponsePayload) => runBridgeAction(() => sendResponseAction(payload)),
      closeCouncil: (payload: CloseCouncilPayload) => runBridgeAction(() => closeCouncilAction(payload)),
      getSummonSettings: () => runBridgeAction(() => getSummonSettingsAction()),
      refreshSummonModels: () => runBridgeAction(() => refreshSummonModelsAction()),
      updateSummonSettings: (payload: UpdateSummonSettingsPayload) =>
        runBridgeAction(() => updateSummonSettingsAction(payload)),
      summonAgent: (payload: SummonAgentPayload) => runBridgeAction(() => summonAgentAction(payload)),
      getSettings: () => runBridgeAction(() => getSettingsAction()),
      updateSettings: (payload: UpdateSettingsPayload) => runBridgeAction(() => updateSettingsAction(payload)),
    },
    messages: {
      "*": () => {
        // No browser->bun messages are currently required.
      },
    },
  },
});

const window = openCouncilWindow();
let watcher: CouncilStateWatcher | null = watchCouncilState({
  onChange: () => {
    try {
      void window.webview.rpc.stateChanged(STATE_CHANGED_EVENT);
    } catch {
      // Ignore transient publish errors while the webview loads.
    }
  },
});

setupRuntimeCleanup(() => {
  watcher?.close();
  watcher = null;
});

function openCouncilWindow(): BrowserWindow {
  return new BrowserWindow({
    title: "Agents Council",
    url: "views://council/index.html",
    frame: DEFAULT_WINDOW_SIZE,
    rpc: councilBridgeRpc,
  });
}

async function runBridgeAction<T>(action: () => Promise<T>): Promise<BridgeResult<T>> {
  try {
    const data = await action();
    return {
      ok: true,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

function setupRuntimeCleanup(cleanup: () => void): void {
  let closed = false;

  const runCleanup = () => {
    if (closed) {
      return;
    }
    closed = true;
    cleanup();
  };

  process.on("exit", runCleanup);
  process.on("SIGINT", runCleanup);
  process.on("SIGTERM", runCleanup);
}
