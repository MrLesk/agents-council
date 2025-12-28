import { promises as fs } from "node:fs";
import path from "node:path";

const LOCK_STALE_MS = 30_000;
const LOCK_RETRY_DELAY_MS = 50;
const LOCK_MAX_WAIT_MS = 10_000;

export async function ensureFileDirectory(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readJsonFile<T>(filePath: string, fallback: () => T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (isErrno(error, "ENOENT") || error instanceof SyntaxError) {
      return fallback();
    }

    throw error;
  }
}

export async function writeJsonFileAtomic(filePath: string, data: unknown): Promise<void> {
  const directory = path.dirname(filePath);
  const tempPath = path.join(directory, `data.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`);
  const handle = await fs.open(tempPath, "wx");

  try {
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }

  try {
    await fs.rename(tempPath, filePath);
  } catch (error) {
    await fs.unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

export async function withFileLock<T>(filePath: string, action: () => Promise<T>): Promise<T> {
  const lockPath = `${filePath}.lock`;
  await acquireLock(lockPath);

  try {
    return await action();
  } finally {
    await releaseLock(lockPath);
  }
}

async function acquireLock(lockPath: string): Promise<void> {
  const start = Date.now();

  while (true) {
    try {
      const payload = JSON.stringify({
        pid: process.pid,
        createdAt: new Date().toISOString(),
      });
      await fs.writeFile(lockPath, payload, { flag: "wx" });
      return;
    } catch (error) {
      if (!isErrno(error, "EEXIST")) {
        throw error;
      }

      if (await isLockStale(lockPath)) {
        await releaseLock(lockPath);
        continue;
      }

      if (Date.now() - start > LOCK_MAX_WAIT_MS) {
        throw new Error("Timed out waiting for file lock");
      }

      await delay(LOCK_RETRY_DELAY_MS);
    }
  }
}

async function releaseLock(lockPath: string): Promise<void> {
  try {
    await fs.unlink(lockPath);
  } catch (error) {
    if (!isErrno(error, "ENOENT")) {
      throw error;
    }
  }
}

async function isLockStale(lockPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(lockPath);
    return Date.now() - stats.mtimeMs > LOCK_STALE_MS;
  } catch (error) {
    if (isErrno(error, "ENOENT")) {
      return false;
    }

    throw error;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isErrno(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === code
  );
}
