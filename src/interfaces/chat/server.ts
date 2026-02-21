import type { Server } from "bun";

import type { CouncilStateWatcher } from "../../core/state/watcher";
import { watchCouncilState } from "../../core/state/watcher";
import {
  BridgeApiError,
  closeCouncilAction,
  getCurrentSessionDataAction,
  getErrorMessage,
  getErrorStatus,
  getSettingsAction,
  getSummonSettingsAction,
  joinCouncilAction,
  refreshSummonModelsAction,
  sendResponseAction,
  startCouncilAction,
  summonAgentAction,
  updateSettingsAction,
  updateSummonSettingsAction,
} from "./bridge/actions";
import chatUi from "./ui/index.html";

type ChatServerOptions = {
  port: number;
  hostname?: string;
};

export type ChatServer = {
  server: Server<undefined>;
  url: string;
  close: () => void;
};

const STATE_TOPIC = "council-state";
const STATE_CHANGED_EVENT = JSON.stringify({ type: "state-changed" });

export function startChatServer(options: ChatServerOptions): ChatServer {
  const hostname = options.hostname ?? "127.0.0.1";
  const port = options.port;
  let server: Server<undefined>;
  let watcher: CouncilStateWatcher | null = null;

  try {
    server = Bun.serve({
      hostname,
      port,
      routes: {
        "/": chatUi,
      },
      async fetch(req, bunServer) {
        try {
          const url = new URL(req.url);
          if (req.method === "GET" && url.pathname === "/ws") {
            const upgraded = bunServer.upgrade(req);
            if (upgraded) {
              return;
            }
            return jsonError(400, "WebSocket upgrade failed.");
          }

          if (req.method === "POST") {
            switch (url.pathname) {
              case "/start-council":
                return await handleJsonAction(req, startCouncilAction);
              case "/join-council":
                return await handleJsonAction(req, joinCouncilAction);
              case "/get-current-session-data":
                return await handleJsonAction(req, getCurrentSessionDataAction);
              case "/send-response":
                return await handleJsonAction(req, sendResponseAction);
              case "/close-council":
                return await handleJsonAction(req, closeCouncilAction);
              case "/get-summon-settings":
                return Response.json(await getSummonSettingsAction());
              case "/refresh-summon-models":
                return Response.json(await refreshSummonModelsAction());
              case "/update-summon-settings":
                return await handleJsonAction(req, updateSummonSettingsAction);
              case "/summon-agent":
                return await handleJsonAction(req, summonAgentAction);
              case "/get-settings":
                return Response.json(await getSettingsAction());
              case "/update-settings":
                return await handleJsonAction(req, updateSettingsAction);
              default:
                return jsonError(404, "Not found.");
            }
          }

          return jsonError(404, "Not found.");
        } catch (error) {
          return jsonError(getErrorStatus(error), getErrorMessage(error));
        }
      },
      websocket: {
        open(ws) {
          try {
            ws.subscribe(STATE_TOPIC);
          } catch {
            // Ignore subscription errors.
          }
        },
        message() {
          // Ignore incoming messages from clients.
        },
        close(ws) {
          try {
            ws.unsubscribe(STATE_TOPIC);
          } catch {
            // Ignore unsubscribe errors.
          }
        },
      },
    });
  } catch (error) {
    if (isErrno(error, "EADDRINUSE")) {
      throw new Error(
        `Port ${port} is already in use. Close the other council chat instance or launch with --port/-p to use a different port.`,
      );
    }
    throw error;
  }

  watcher = watchCouncilState({
    onChange: () => {
      try {
        server.publish(STATE_TOPIC, STATE_CHANGED_EVENT);
      } catch {
        // Ignore publish errors to avoid destabilizing the server.
      }
    },
  });

  return {
    server,
    url: `http://localhost:${server.port}`,
    close: () => {
      watcher?.close();
      watcher = null;
    },
  };
}

async function handleJsonAction<T>(req: Request, action: (payload: unknown) => Promise<T>): Promise<Response> {
  const body = await readJsonBody(req);
  const result = await action(body);
  return Response.json(result);
}

async function readJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new BridgeApiError(400, "Invalid JSON body.");
  }
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

function isErrno(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === code
  );
}
