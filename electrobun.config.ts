import type { ElectrobunConfig } from "electrobun";

const appVersion = process.env.AGENTS_COUNCIL_VERSION ?? "0.4.0";

export default {
  app: {
    name: "Agents Council",
    identifier: "dev.agents.council",
    version: appVersion,
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
      "desktop/views/council/styles.css": "views/council/styles.css",
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
