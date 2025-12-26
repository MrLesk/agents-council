#!/usr/bin/env node

const { spawn } = require("node:child_process");

const platformPackages = [
  "agents-council-linux-x64",
  "agents-council-linux-arm64",
  "agents-council-darwin-x64",
  "agents-council-darwin-arm64",
  "agents-council-windows-x64",
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
