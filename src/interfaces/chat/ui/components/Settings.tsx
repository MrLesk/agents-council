import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api";

type SettingsProps = {
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function Settings({ currentName, onSave, onClose }: SettingsProps) {
  const [draftName, setDraftName] = useState(currentName);
  const [claudeCodePath, setClaudeCodePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSettings()
      .then((settings) => {
        if (!cancelled) {
          setClaudeCodePath(settings.claude_code_path ?? "");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load settings");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const pathValue = claudeCodePath.trim();
      await updateSettings({
        claude_code_path: pathValue.length > 0 ? pathValue : null,
      });
      onSave(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      setSaving(false);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="settings-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="settings-popup settings-popup-wide">
        <div className="settings-header">
          <h2>Settings</h2>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        {error ? (
          <div className="alert" role="alert">
            {error}
          </div>
        ) : null}
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3 className="settings-section-title">Identity</h3>
            <label className="label" htmlFor="settings-name">
              Your Name
            </label>
            <input
              id="settings-name"
              className="input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Enter your name"
              disabled={saving}
            />
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Summon Configuration</h3>
            <label className="label" htmlFor="settings-claude-path">
              Claude Code Path
            </label>
            <input
              id="settings-claude-path"
              className="input"
              value={claudeCodePath}
              onChange={(event) => setClaudeCodePath(event.target.value)}
              placeholder="claude"
              disabled={loading || saving}
            />
            <p className="settings-hint">
              Path to the Claude Code executable. Leave empty to use <code>claude</code> from PATH.
              Can also be set via <code>CLAUDE_CODE_PATH</code> environment variable.
            </p>
          </div>

          <div className="settings-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-game" disabled={!draftName.trim() || loading || saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
