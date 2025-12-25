import { useState } from "react";

type SettingsProps = {
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function Settings({ currentName, onSave, onClose }: SettingsProps) {
  const [draftName, setDraftName] = useState(currentName);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed) {
      onSave(trimmed);
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
      <div className="settings-popup">
        <div className="settings-header">
          <h2>Settings</h2>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="settings-name">
            Name
          </label>
          <input
            id="settings-name"
            className="input"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Enter your name"
          />
          <div className="settings-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!draftName.trim()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
