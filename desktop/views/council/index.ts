import { Electroview } from "electrobun/view";

import type {
  CouncilDesktopBridge,
  CouncilStateChangedEvent,
  CloseCouncilPayload,
  GetCurrentSessionDataPayload,
  JoinCouncilPayload,
  SendResponsePayload,
  StartCouncilPayload,
  SummonAgentPayload,
  UpdateSettingsPayload,
  UpdateSummonSettingsPayload,
} from "../../../src/interfaces/chat/bridge/contract";

const listeners = new Set<(event: CouncilStateChangedEvent) => void>();

const rpc = Electroview.defineRPC({
  handlers: {
    requests: {},
    messages: {
      stateChanged: (event: CouncilStateChangedEvent) => {
        for (const listener of listeners) {
          listener(event);
        }
      },
    },
  },
});

const electroview = new Electroview({ rpc });

const bridge: CouncilDesktopBridge = {
  startCouncil(payload: StartCouncilPayload) {
    return electroview.rpc.request.startCouncil(payload);
  },
  joinCouncil(payload: JoinCouncilPayload) {
    return electroview.rpc.request.joinCouncil(payload);
  },
  getCurrentSessionData(payload: GetCurrentSessionDataPayload) {
    return electroview.rpc.request.getCurrentSessionData(payload);
  },
  sendResponse(payload: SendResponsePayload) {
    return electroview.rpc.request.sendResponse(payload);
  },
  closeCouncil(payload: CloseCouncilPayload) {
    return electroview.rpc.request.closeCouncil(payload);
  },
  getSummonSettings() {
    return electroview.rpc.request.getSummonSettings({});
  },
  refreshSummonModels() {
    return electroview.rpc.request.refreshSummonModels({});
  },
  updateSummonSettings(payload: UpdateSummonSettingsPayload) {
    return electroview.rpc.request.updateSummonSettings(payload);
  },
  summonAgent(payload: SummonAgentPayload) {
    return electroview.rpc.request.summonAgent(payload);
  },
  getSettings() {
    return electroview.rpc.request.getSettings({});
  },
  updateSettings(payload: UpdateSettingsPayload) {
    return electroview.rpc.request.updateSettings(payload);
  },
  subscribeStateChanged(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

window.__COUNCIL_DESKTOP_BRIDGE__ = bridge;

void import("../../../src/interfaces/chat/ui/main.tsx");
