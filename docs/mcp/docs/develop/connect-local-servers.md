# Connect to local MCP servers

> Learn how to extend Claude Desktop with local MCP servers to enable file system access and other powerful integrations

Model Context Protocol (MCP) servers extend AI applications' capabilities by providing secure, controlled access to local resources and tools. Many clients support MCP, enabling diverse integration possibilities across different platforms and applications.

This guide demonstrates how to connect to local MCP servers using Claude Desktop as an example, one of the [many clients that support MCP](/clients). While we focus on Claude Desktop's implementation, the concepts apply broadly to other MCP-compatible clients. By the end of this tutorial, Claude will be able to interact with files on your computer, create new documents, organize folders, and search through your file system—all with your explicit permission for each action.

<Frame>
  <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=629d7e754dc358d71a408d6ce970c1b1" alt="Claude Desktop with filesystem integration showing file management capabilities" data-og-width="1732" width="1732" data-og-height="2060" height="2060" data-path="images/quickstart-filesystem.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0758ee60aee8acc3035727957612351f 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=3bc6d3ea4a3cd38b6d031ac386700c62 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=9d75e8729b08b452f2e0d08bff8ce393 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=b35c6b531daa84b4ba4b06c9223b1ee2 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c4bb491d17a65e038120b5c39031ab7f 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-filesystem.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=ea7a0ad5ae5eeb866222f4020dc7bba3 2500w" />
</Frame>

## Prerequisites

Before starting this tutorial, ensure you have the following installed on your system:

### Claude Desktop

Download and install [Claude Desktop](https://claude.ai/download) for your operating system. Claude Desktop is available for macOS and Windows.

If you already have Claude Desktop installed, verify you're running the latest version by clicking the Claude menu and selecting "Check for Updates..."

### Node.js

The Filesystem Server and many other MCP servers require Node.js to run. Verify your Node.js installation by opening a terminal or command prompt and running:

```bash  theme={null}
node --version
```

If Node.js is not installed, download it from [nodejs.org](https://nodejs.org/). We recommend the LTS (Long Term Support) version for stability.

## Understanding MCP Servers

MCP servers are programs that run on your computer and provide specific capabilities to Claude Desktop through a standardized protocol. Each server exposes tools that Claude can use to perform actions, with your approval. The Filesystem Server we'll install provides tools for:

* Reading file contents and directory structures
* Creating new files and directories
* Moving and renaming files
* Searching for files by name or content

All actions require your explicit approval before execution, ensuring you maintain full control over what Claude can access and modify.

## Installing the Filesystem Server

The process involves configuring Claude Desktop to automatically start the Filesystem Server whenever you launch the application. This configuration is done through a JSON file that tells Claude Desktop which servers to run and how to connect to them.

<Steps>
  <Step title="Open Claude Desktop Settings">
    Start by accessing the Claude Desktop settings. Click on the Claude menu in your system's menu bar (not the settings within the Claude window itself) and select "Settings..."

    On macOS, this appears in the top menu bar:

    <Frame style={{ textAlign: "center" }}>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0c8b57e0e17af3624b6762a3ea944c8e" width="400" alt="Claude Desktop menu showing Settings option" data-og-width="644" data-og-height="568" data-path="images/quickstart-menu.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=f997b6f31398840d3a824fa0eb9fec43 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=062b0b3c342e4e02a8f2d690a48bcb24 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=ae9b08052b7ea30b31d27432d8edf19e 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7962cc4fb841fa0a04a3c6de03cf4d3d 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=86bd79431e35b133d0ae4f74265f3d60 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-menu.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=1b300ae527efb4744aa08d5df94299a0 2500w" />
    </Frame>

    This opens the Claude Desktop configuration window, which is separate from your Claude account settings.
  </Step>

  <Step title="Access Developer Settings">
    In the Settings window, navigate to the "Developer" tab in the left sidebar. This section contains options for configuring MCP servers and other developer features.

    Click the "Edit Config" button to open the configuration file:

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0fb595490a2f9e15c0301e771a57446c" alt="Developer settings showing Edit Config button" data-og-width="1688" width="1688" data-og-height="534" height="534" data-path="images/quickstart-developer.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0a7e615ee50a27a4e514668f7cbd9f57 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=16d6d4721219afd7e2bfa41f0795e7e0 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=612b1de5516ed7321d5b6939b5b3c823 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=840a428450dc0ec97538eb4e05050bcd 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=59ae3a95918ff7f7b15e777c2d606496 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-developer.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7838d7f023a281053786870336914f03 2500w" />
    </Frame>

    This action creates a new configuration file if one doesn't exist, or opens your existing configuration. The file is located at:

    * **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    * **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
  </Step>

  <Step title="Configure the Filesystem Server">
    Replace the contents of the configuration file with the following JSON structure. This configuration tells Claude Desktop to start the Filesystem Server with access to specific directories:

    <CodeGroup>
      ```json macOS theme={null}
      {
        "mcpServers": {
          "filesystem": {
            "command": "npx",
            "args": [
              "-y",
              "@modelcontextprotocol/server-filesystem",
              "/Users/username/Desktop",
              "/Users/username/Downloads"
            ]
          }
        }
      }
      ```

      ```json Windows theme={null}
      {
        "mcpServers": {
          "filesystem": {
            "command": "npx",
            "args": [
              "-y",
              "@modelcontextprotocol/server-filesystem",
              "C:\\Users\\username\\Desktop",
              "C:\\Users\\username\\Downloads"
            ]
          }
        }
      }
      ```
    </CodeGroup>

    Replace `username` with your actual computer username. The paths listed in the `args` array specify which directories the Filesystem Server can access. You can modify these paths or add additional directories as needed.

    <Tip>
      **Understanding the Configuration**

      * `"filesystem"`: A friendly name for the server that appears in Claude Desktop
      * `"command": "npx"`: Uses Node.js's npx tool to run the server
      * `"-y"`: Automatically confirms the installation of the server package
      * `"@modelcontextprotocol/server-filesystem"`: The package name of the Filesystem Server
      * The remaining arguments: Directories the server is allowed to access
    </Tip>

    <Warning>
      **Security Consideration**

      Only grant access to directories you're comfortable with Claude reading and modifying. The server runs with your user account permissions, so it can perform any file operations you can perform manually.
    </Warning>
  </Step>

  <Step title="Restart Claude Desktop">
    After saving the configuration file, completely quit Claude Desktop and restart it. The application needs to restart to load the new configuration and start the MCP server.

    Upon successful restart, you'll see an MCP server indicator <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=2742ec3fb97067e8591e68546c90221e" style={{display: 'inline', margin: 0, height: '1.3em'}} data-og-width="24" width="24" data-og-height="24" height="24" data-path="images/claude-desktop-mcp-slider.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=52839f8519f476623c4fb5bb87ee24bd 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=f0491976e108286441fc6554309c5c4f 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=08e83eb102eda755a7db1eb27d16ebff 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=2524a80752928b0206e68e8e1890d1aa 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=3c0dc88dadad5ed8e8af316965d00e0b 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=702363a955a631c40c342f9557d5cfdd 2500w" /> in the bottom-right corner of the conversation input box:

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=f80a38b720fc0519079bae26e2aae312" alt="Claude Desktop interface showing MCP server indicator" data-og-width="1414" width="1414" data-og-height="410" height="410" data-path="images/quickstart-slider.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=24a0dc6f30664e953cc185ed0c7abc64 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=d670a5fd82405775d7bc1e5f20a9a847 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=5f66fa4bcaaf50ca905415f15af2e276 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4aecd3c4b45c3aaac75a118d2d6edda5 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c7d321e2d25aa34552057a8866782549 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-slider.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=25dc1761b40b11ccb727b36183efa57f 2500w" />
    </Frame>

    Click on this indicator to view the available tools provided by the Filesystem Server:

    <Frame style={{ textAlign: "center" }}>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=18f045f27f31f40896d3710ce9a4a0a0" width="400" alt="Available filesystem tools in Claude Desktop" data-og-width="978" data-og-height="902" data-path="images/quickstart-tools.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=298fc5cf79822ee781d15cf6374d8542 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c1e39ca66d9191dbe493cdcb52ad3fcb 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=d797f46eb55126de14328ede4b735967 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=fcb9d89b6cef95bf9a3ffcd9231a4026 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=23097f8f8b52a255246aeb83f85f949d 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-tools.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0007b81f22a6a9b9a117981091e0221f 2500w" />
    </Frame>

    If the server indicator doesn't appear, refer to the [Troubleshooting](#troubleshooting) section for debugging steps.
  </Step>
</Steps>

## Using the Filesystem Server

With the Filesystem Server connected, Claude can now interact with your file system. Try these example requests to explore the capabilities:

### File Management Examples

* **"Can you write a poem and save it to my desktop?"** - Claude will compose a poem and create a new text file on your desktop
* **"What work-related files are in my downloads folder?"** - Claude will scan your downloads and identify work-related documents
* **"Please organize all images on my desktop into a new folder called 'Images'"** - Claude will create a folder and move image files into it

### How Approval Works

Before executing any file system operation, Claude will request your approval. This ensures you maintain control over all actions:

<Frame style={{ textAlign: "center" }}>
  <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=98cc6e9dfe885fbd6e9bfae40601e494" width="500" alt="Claude requesting approval to perform a file operation" data-og-width="962" data-og-height="464" data-path="images/quickstart-approve.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=d5ab1456f7728dcf93652b6542377ca3 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=06809ba885f94726178efefed355395c 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=a437dd1dd46c0d7cae1767f846eb100a 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=d4323361de72398163de4500fd398cf3 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=b7f5117fb238e9e7e455b58e1637cca1 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-approve.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=ab48fb927eaaf919c5ccf063a958bab6 2500w" />
</Frame>

Review each request carefully before approving. You can always deny a request if you're not comfortable with the proposed action.

## Troubleshooting

If you encounter issues setting up or using the Filesystem Server, these solutions address common problems:

<AccordionGroup>
  <Accordion title="Server not showing up in Claude / hammer icon missing">
    1. Restart Claude Desktop completely
    2. Check your `claude_desktop_config.json` file syntax
    3. Make sure the file paths included in `claude_desktop_config.json` are valid and that they are absolute and not relative
    4. Look at [logs](#getting-logs-from-claude-for-desktop) to see why the server is not connecting
    5. In your command line, try manually running the server (replacing `username` as you did in `claude_desktop_config.json`) to see if you get any errors:

    <CodeGroup>
      ```bash macOS/Linux theme={null}
      npx -y @modelcontextprotocol/server-filesystem /Users/username/Desktop /Users/username/Downloads
      ```

      ```powershell Windows theme={null}
      npx -y @modelcontextprotocol/server-filesystem C:\Users\username\Desktop C:\Users\username\Downloads
      ```
    </CodeGroup>
  </Accordion>

  <Accordion title="Getting logs from Claude Desktop">
    Claude.app logging related to MCP is written to log files in:

    * macOS: `~/Library/Logs/Claude`

    * Windows: `%APPDATA%\Claude\logs`

    * `mcp.log` will contain general logging about MCP connections and connection failures.

    * Files named `mcp-server-SERVERNAME.log` will contain error (stderr) logging from the named server.

    You can run the following command to list recent logs and follow along with any new ones (on Windows, it will only show recent logs):

    <CodeGroup>
      ```bash macOS/Linux theme={null}
      tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
      ```

      ```powershell Windows theme={null}
      type "%APPDATA%\Claude\logs\mcp*.log"
      ```
    </CodeGroup>
  </Accordion>

  <Accordion title="Tool calls failing silently">
    If Claude attempts to use the tools but they fail:

    1. Check Claude's logs for errors
    2. Verify your server builds and runs without errors
    3. Try restarting Claude Desktop
  </Accordion>

  <Accordion title="None of this is working. What do I do?">
    Please refer to our [debugging guide](/legacy/tools/debugging) for better debugging tools and more detailed guidance.
  </Accordion>

  <Accordion title="ENOENT error and `${APPDATA}` in paths on Windows">
    If your configured server fails to load, and you see within its logs an error referring to `${APPDATA}` within a path, you may need to add the expanded value of `%APPDATA%` to your `env` key in `claude_desktop_config.json`:

    ```json  theme={null}
    {
      "brave-search": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {
          "APPDATA": "C:\\Users\\user\\AppData\\Roaming\\",
          "BRAVE_API_KEY": "..."
        }
      }
    }
    ```

    With this change in place, launch Claude Desktop once again.

    <Warning>
      **npm should be installed globally**

      The `npx` command may continue to fail if you have not installed npm globally. If npm is already installed globally, you will find `%APPDATA%\npm` exists on your system. If not, you can install npm globally by running the following command:

      ```bash  theme={null}
      npm install -g npm
      ```
    </Warning>
  </Accordion>
</AccordionGroup>

## Next Steps

Now that you've successfully connected Claude Desktop to a local MCP server, explore these options to expand your setup:

<CardGroup cols={2}>
  <Card title="Explore other servers" icon="grid" href="https://github.com/modelcontextprotocol/servers">
    Browse our collection of official and community-created MCP servers for
    additional capabilities
  </Card>

  <Card title="Build your own server" icon="code" href="/docs/develop/build-server">
    Create custom MCP servers tailored to your specific workflows and
    integrations
  </Card>

  <Card title="Connect to remote servers" icon="cloud" href="/docs/develop/connect-remote-servers">
    Learn how to connect Claude to remote MCP servers for cloud-based tools and
    services
  </Card>

  <Card title="Understand the protocol" icon="book" href="/docs/learn/architecture">
    Dive deeper into how MCP works and its architecture
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://modelcontextprotocol.io/llms.txt