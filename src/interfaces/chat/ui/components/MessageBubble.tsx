import MarkdownPreview, { type MarkdownPreviewProps } from "@uiw/react-markdown-preview";

export type HallAgentType = "claude" | "codex" | "gemini" | "human" | "other" | "system";

export type HallMessage = {
  id: string;
  author: string;
  content: string;
  created_at: string;
  message_type: "text" | "code" | "system";
  agent_type: HallAgentType;
  own: boolean;
};

const filterMarkdownPlugins: NonNullable<MarkdownPreviewProps["pluginsFilter"]> = (type, plugins) => {
  if (type !== "rehype") {
    return plugins;
  }

  return plugins.filter((plugin) => {
    const candidate = Array.isArray(plugin) ? plugin[0] : plugin;
    if (typeof candidate !== "function") {
      return true;
    }
    return candidate.name !== "rehypeRaw";
  });
};

export function MessageBubble({ message }: { message: HallMessage }) {
  if (message.message_type === "system") {
    return (
      <div className="hall-system-message" role="status">
        {message.content}
      </div>
    );
  }

  const bubbleClasses = ["hall-message", `hall-agent-${message.agent_type}`];
  if (message.own) {
    bubbleClasses.push("hall-message-own");
  }

  return (
    <article className={bubbleClasses.join(" ")}>
      <header className="hall-message-header">
        <span className="hall-message-author">{message.author}</span>
        <span className="hall-message-time">{formatTime(message.created_at)}</span>
      </header>
      <div className="hall-message-body">
        {message.message_type === "code" ? (
          <pre className="hall-code-block">{stripCodeFence(message.content)}</pre>
        ) : (
          <MarkdownPreview
            className="hall-markdown"
            source={message.content}
            skipHtml
            pluginsFilter={filterMarkdownPlugins}
            wrapperElement={{ "data-color-mode": "dark" }}
          />
        )}
      </div>
    </article>
  );
}

function stripCodeFence(value: string): string {
  return value.replace(/^```\w*\n?|```$/g, "").trim();
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
