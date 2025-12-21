#!/usr/bin/env node

const { spawn } = require("node:child_process");
const { resolveBinaryPath } = require("./resolveBinary.cjs");

let binaryPath;
try {
  binaryPath = resolveBinaryPath();
} catch {
  console.error(`Binary package not installed for ${process.platform}-${process.arch}.`);
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const cleanedArgs = rawArgs.filter((arg) => {
  if (arg === binaryPath) return false;
  try {
    const pattern = /node_modules[/\\]agents-council-mcp-(darwin|linux|windows)-[^/\\]+[/\\]council(\.exe)?$/i;
    return !pattern.test(arg);
  } catch {
    return true;
  }
});

const child = spawn(binaryPath, cleanedArgs, {
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

child.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.error(`Binary not found: ${binaryPath}`);
    console.error(`Please ensure you have the correct version for your platform (${process.platform}-${process.arch})`);
  } else {
    console.error("Failed to start council:", err);
  }
  process.exit(1);
});
