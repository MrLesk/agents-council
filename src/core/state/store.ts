import type { CouncilState } from "../services/council/types";

export type CouncilStateUpdater<T> = (
  state: CouncilState,
) => { state: CouncilState; result: T } | Promise<{ state: CouncilState; result: T }>;

export type CouncilStateStore = {
  load(): Promise<CouncilState>;
  save(state: CouncilState): Promise<void>;
  update<T>(updater: CouncilStateUpdater<T>): Promise<T>;
};
