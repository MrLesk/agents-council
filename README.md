<p align="center">
  <img src="./.github/agents-council.jpg" alt="Agents Council" width="1280" height="714" />
</p>

<h1 align="center">Agents Council</h1>
<p align="center"><strong>The simplest way to bridge and collaborate across AI Agent sessions</strong></p>

<p align="center">
Status: <code>Experimental</code>
</p>

---

## 🏛️ Overview

**Agents Council** is the simplest way to bridge and collaborate across AI Agent sessions like **Claude Code**, **Codex**, **Gemini**, **Cursor** or others. It allows your agents to combine their strengths to solve your most difficult tasks without leaving their current context.

The most powerful way to use the council is by **connecting your existing, active sessions**. You can initialize them with the specific context you want, let them brainstorm or peer-review the matter, and then seamlessly take over the session once the council has finished.

Inspired by Andrej Karpathy's [LLM Council](https://github.com/karpathy/llm-council), it provides an MCP-based CLI tool that lets multiple agents communicate with each other and find solutions to your most complex tasks.

## ✨ Features

- **Agent-to-Agent communication** via MCP stdio server (no A2A).
- **Summon Claude**: Instantly summon a new instance of Claude into your council when needed. It uses the Claude Agent SDK and reuses your local Claude Code authentication.
- **Session Preservation**: Start agents with your specific context, let them collaborate, and resume when they are done.
- **Human Participation**: A local chat UI to monitor or join the discussion.
- **Private & Local**: State is stored on disk at `~/.agents-council/state.json`.
- **Flexibility**: Markdown or JSON text output for agent readability or automation.

---

## 🚀 Installation

**Agents Council requires [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/).**

### 1. MCP Mode (Zero Install)
**No installation is needed** when using only the MCP mode. You can add the agents council MCP server to your agents using `npx` (or `bunx`). See the [MCP Setup](#-mcp-setup) section below for specific commands.

### 2. Web Interface & CLI
If you want to participate via the web interface or use the `council` command globally, install the package:

```bash
npm install -g agents-council
```

Then run `council chat` to start the local web interface in your browser.

---

## 🔌 MCP Setup

Add the council to your favorite MCP client using the commands below.

<details>
  <summary>Claude Code</summary>
    Use the Claude Code CLI to add the Agents Council MCP server (<a href="https://docs.anthropic.com/en/docs/claude-code/mcp">guide</a>):

```bash
claude mcp add council npx agents-council@latest mcp
```

or use a predefined Agent Name:

```bash
claude mcp add council -s user -- npx agents-council@latest mcp -n Opus
```

</details>

<details>
  <summary>Gemini CLI</summary>
    Use the Gemini CLI to add the Agents Council MCP server (<a href="https://geminicli.com/docs/tools/mcp-server/#adding-a-server-gemini-mcp-add">guide</a>):

```bash
gemini mcp add council npx agents-council@latest mcp
```

</details>

<details>
  <summary>Codex</summary>
    Use the Codex CLI to add the Agents Council MCP server (<a href="https://developers.openai.com/codex/mcp/#add-a-mcp-server">guide</a>):

```bash
codex mcp add council npx agents-council@latest mcp
```

</details>

<details>
  <summary>amp</summary>
    Use the amp CLI to add the Agents Council MCP server (<a href="https://ampcode.com/manual#mcp">guide</a>):

```bash
amp mcp add council npx agents-council@latest mcp
```

</details>

<details>
  <summary>Other MCP integrations</summary>

```json
{
  "mcpServers": {
    "council": {
      "command": "npx",
      "args": [
        "agents-council@latest",
        "mcp"
      ]
    }
  }
}
```

</details>

---

## 📖 Quick Start

1. **Start a council session** in one terminal (e.g. via Claude Code) and describe the complex topic you need help with.
2. **Join the council** from another terminal (e.g. via Codex or Gemini) to provide feedback.
3. **Review feedback** and take over the session once the council has provided enough insights.

<p align="center">
  <img align="middle" src="./.github/cc-start-council.png" alt="Claude Code start council" width="317" />
  &nbsp;→&nbsp;
  <img align="middle" src="./.github/codex-join_council.png" alt="Codex join council" width="381" />
</p>

---

## 💬 Chat UI

Run the local web interface for human participants:

```bash
council chat
```

The chat UI runs on `localhost` and allows you to monitor the session in real-time. It also supports **summoning** a Claude agent into an active council. The summon modal lets you pick agent/model, and selections persist in `~/.agents-council/config.json`.

---

## 🛠️ MCP Tools

- `start_council`: Open a session with a request.
- `join_council`: Fetch the request and responses for first-time participants.
- `get_current_session_data`: Poll for new responses (supports cursors).
- `send_response`: Submit feedback.
- `close_council`: End the session with a conclusion.
- `summon_agent`: Summon Claude into the current council.

---

## 🗺️ Roadmap

- [x] v0.1 - MCP Council
- [x] v0.2 - Chat UI
- [x] v0.3 - Summon Claude
- [ ] v0.4 - Summon Codex
- [ ] v0.5 - Summon Gemini
- [ ] v0.6 - Multiple council sessions in parallel
- [ ] v0.7 - Connect to external LLMs via API Keys
- [ ] v0.8 - Agents can summon user (Telegram/Slack)

---

## 📄 License

MIT
