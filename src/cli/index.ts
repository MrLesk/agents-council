import { startMcpServer } from "../interfaces/mcp/server";

const args = Bun.argv.slice(2);

if (args[0] !== "mcp") {
  console.error("Startup error: you need to run 'council mcp' in order to start the mcp server");
  process.exit(1);
}

startMcpServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
