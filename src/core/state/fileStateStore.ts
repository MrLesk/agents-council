import type { CouncilState } from "../services/council/types";
import { ensureFileDirectory, readJsonFile, withFileLock, writeJsonFileAtomic } from "./fileStore";
import { resolveCouncilStatePath } from "./path";
import type { CouncilStateStore, CouncilStateUpdater } from "./store";

const DEFAULT_STATE_VERSION = 1;

export class FileCouncilStateStore implements CouncilStateStore {
  private readonly statePath: string;

  constructor(statePath?: string) {
    this.statePath = resolveCouncilStatePath(statePath);
  }

  async load(): Promise<CouncilState> {
    return readJsonFile<CouncilState>(this.statePath, createInitialState);
  }

  async save(state: CouncilState): Promise<void> {
    await ensureFileDirectory(this.statePath);
    await withFileLock(this.statePath, async () => {
      await writeJsonFileAtomic(this.statePath, state);
    });
  }

  async update<T>(updater: CouncilStateUpdater<T>): Promise<T> {
    await ensureFileDirectory(this.statePath);
    return withFileLock(this.statePath, async () => {
      const current = await readJsonFile<CouncilState>(this.statePath, createInitialState);
      const { state, result } = await updater(current);
      await writeJsonFileAtomic(this.statePath, state);
      return result;
    });
  }
}

function createInitialState(): CouncilState {
  return {
    version: DEFAULT_STATE_VERSION,
    session: null,
    requests: [],
    feedback: [],
    participants: [],
  };
}
