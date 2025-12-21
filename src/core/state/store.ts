import type { CouncilState } from "../services/council/types";

export type CouncilStateStore = {
  load(): Promise<CouncilState>;
  save(state: CouncilState): Promise<void>;
};
