import { useState } from "react";

import logo from "../assets/agents-council-logo.png" with { type: "file" };

type GateProps = {
  onEnter: (name: string) => void;
};

export function Gate({ onEnter }: GateProps) {
  const [draftName, setDraftName] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed) {
      onEnter(trimmed);
    }
  };

  return (
    <div className="gate">
      <div className="gate-stack">
        <img className="logo logo-hero" src={logo} alt="Agents Council" />
        <div className="gate-card">
          <p className="gate-tagline">The council awaits.</p>
          <form className="gate-form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="agent-name">
              Announce Yourself
            </label>
            <input
              id="agent-name"
              className="input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Your name shall be..."
            />
            <button className="btn btn-primary" type="submit">
              Enter the Council Hall
            </button>
          </form>
          <p className="gate-subtitle">You join as an equal voice among the wise.</p>
        </div>
      </div>
    </div>
  );
}
