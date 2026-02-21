import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Agents Council",
    identifier: "dev.agents.council",
    version: "0.4.0",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "desktop/bun/index.ts",
    },
    views: {
      council: {
        entrypoint: "desktop/views/council/index.ts",
      },
    },
    copy: {
      "desktop/views/council/index.html": "views/council/index.html",
      "src/interfaces/chat/ui/styles.css": "views/council/styles.css",
    },
    mac: {
      defaultRenderer: "native",
    },
    win: {
      defaultRenderer: "native",
    },
    linux: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
  },
} satisfies ElectrobunConfig;
