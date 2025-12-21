#!/usr/bin/env node

const { spawn } = require("node:child_process");

const platformPackages = [
  "agents-council-mcp-linux-x64",
  "agents-council-mcp-linux-arm64",
  "agents-council-mcp-darwin-x64",
  "agents-council-mcp-darwin-arm64",
  "agents-council-mcp-windows-x64",
];

const packageManager = process.env.npm_config_user_agent?.split("/")[0] || "npm";

console.log("Cleaning up platform-specific packages...");

for (const pkg of platformPackages) {
  const args = packageManager === "bun" ? ["remove", "-g", pkg] : ["uninstall", "-g", pkg];

  const child = spawn(packageManager, args, {
    stdio: "pipe",
    windowsHide: true,
  });

  child.on("exit", (code) => {
    if (code === 0) {
      console.log(`Cleaned up ${pkg}`);
    }
  });
}

console.log("Platform package cleanup completed.");
