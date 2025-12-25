const NAME_KEY = "agents-council.name";

export function loadName(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(NAME_KEY);
    return stored && stored.trim().length > 0 ? stored : null;
  } catch {
    return null;
  }
}

export function saveName(value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  try {
    window.localStorage.setItem(NAME_KEY, trimmed);
  } catch {
    // Ignore storage errors.
  }
}

export function clearName(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(NAME_KEY);
  } catch {
    // Ignore storage errors.
  }
}
