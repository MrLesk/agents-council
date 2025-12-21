# Connect to remote MCP Servers

> Learn how to connect Claude to remote MCP servers and extend its capabilities with internet-hosted tools and data sources

Remote MCP servers extend AI applications' capabilities beyond your local environment, providing access to internet-hosted tools, services, and data sources. By connecting to remote MCP servers, you transform AI assistants from helpful tools into informed teammates capable of handling complex, multi-step projects with real-time access to external resources.

Many clients now support remote MCP servers, enabling a wide range of integration possibilities. This guide demonstrates how to connect to remote MCP servers using [Claude](https://claude.ai/) as an example, one of the [many clients that support MCP](/clients). While we focus on Claude's implementation through Custom Connectors, the concepts apply broadly to other MCP-compatible clients.

## Understanding Remote MCP Servers

Remote MCP servers function similarly to local MCP servers but are hosted on the internet rather than your local machine. They expose tools, prompts, and resources that Claude can use to perform tasks on your behalf. These servers can integrate with various services such as project management tools, documentation systems, code repositories, and any other API-enabled service.

The key advantage of remote MCP servers is their accessibility. Unlike local servers that require installation and configuration on each device, remote servers are available from any MCP client with an internet connection. This makes them ideal for web-based AI applications, integrations that emphasize ease-of-use and services that require server-side processing or authentication.

## What are Custom Connectors?

Custom Connectors serve as the bridge between Claude and remote MCP servers. They allow you to connect Claude directly to the tools and data sources that matter most to your workflows, enabling Claude to operate within your favorite software and draw insights from the complete context of your external tools.

With Custom Connectors, you can:

* [Connect Claude to existing remote MCP servers](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp) provided by third-party developers
* [Build your own remote MCP servers to connect with any tool](https://support.anthropic.com/en/articles/11503834-building-custom-connectors-via-remote-mcp-servers)

## Connecting to a Remote MCP Server

The process of connecting Claude to a remote MCP server involves adding a Custom Connector through the [Claude interface](https://claude.ai/). This establishes a secure connection between Claude and your chosen remote server.

<Steps>
  <Step title="Navigate to Connector Settings">
    Open Claude in your browser and navigate to the settings page. You can access this by clicking on your profile icon and selecting "Settings" from the dropdown menu. Once in settings, locate and click on the "Connectors" section in the sidebar.

    This will display your currently configured connectors and provide options to add new ones.
  </Step>

  <Step title="Add a Custom Connector">
    In the Connectors section, scroll to the bottom where you'll find the "Add custom connector" button. Click this button to begin the connection process.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=b5ae9b23164875bbaa3aff4c178cdc64" alt="Add custom connector button in Claude settings" data-og-width="1038" width="1038" data-og-height="809" height="809" data-path="images/quickstart-remote/1-add-connector.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=df494c13492290da8cbf33320405bc60 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=a2dce224fb5e1636218ea2806962c89f 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=de18294dd3cad23989c04cedbacff74f 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c55cb3531701df2b5dfd721dcd3f48dc 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=b0d3e56c4c445ba6896d49997dcdf2c0 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/1-add-connector.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=9d83f4f2db7441a39ff8733d97243ab9 2500w" />
    </Frame>

    A dialog will appear prompting you to enter the remote MCP server URL. This URL should be provided by the server developer or administrator. Enter the complete URL, ensuring it includes the proper protocol (https\://) and any necessary path components.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=0934f16d8e016cade8e560c8f89d011b" alt="Dialog for entering remote MCP server URL" data-og-width="1616" width="1616" data-og-height="282" height="282" data-path="images/quickstart-remote/2-connect.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=e3d7318b0b8e691d25e1887e80200b60 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=be3edc7b361eecaabf688c2058b5e466 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=31be86114b31e1c5e813d92a4c0cb1c3 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=15b6cd3819fabd3655a52b930d384b51 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=5ef180101a7fb0901f7ecf1b5efd254f 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/2-connect.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c024f625ec6ee3f7959513ba15adf524 2500w" />
    </Frame>

    After entering the URL, click "Add" to proceed with the connection.
  </Step>

  <Step title="Complete Authentication">
    Most remote MCP servers require authentication to ensure secure access to their resources. The authentication process varies depending on the server implementation but commonly involves OAuth, API keys, or username/password combinations.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=89af6e1b85718637231388697cc7b015" alt="Authentication screen for remote MCP server" data-og-width="490" width="490" data-og-height="806" height="806" data-path="images/quickstart-remote/3-auth.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=cde1e30b4c3b99b5edc5575c5958e9e7 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=e2cef2daadce577ce335949d3f425257 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4e06599391ebf6bcb521cb4000469844 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=e78e71303fd5bb7d1e5c1602dca7641b 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=2e49d390bddf2a37fef4cba409e9950f 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/3-auth.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=47ec70901a76a3209267b2078f9f8011 2500w" />
    </Frame>

    Follow the authentication prompts provided by the server. This may redirect you to a third-party authentication provider or display a form within Claude. Once authentication is complete, Claude will establish a secure connection to the remote server.
  </Step>

  <Step title="Access Resources and Prompts">
    After successful connection, the remote server's resources and prompts become available in your Claude conversations. You can access these by clicking the paperclip icon in the message input area, which opens the attachment menu.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=ecc6234b0fe5625e24cc2b02b7893c67" alt="Attachment menu showing available resources" data-og-width="735" width="735" data-og-height="666" height="666" data-path="images/quickstart-remote/4-select-resources-menu.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=6e853446286f2c2caf1c7137e4293db4 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7c3c5b7d2f8d078bc263b0603a4136d1 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=280e1d1547925f73f33fcf404eac5ba2 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=00fc5842c2d6592f41f96c2051b016e2 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=505d4ec95d83f4e52cf9c60780b225fe 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/4-select-resources-menu.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=07178c22a89472b962639854dc029953 2500w" />
    </Frame>

    The menu displays all available resources and prompts from your connected servers. Select the items you want to include in your conversation. These resources provide Claude with context and information from your external tools.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=30c522540c7ff5abd8617d20b329eca2" alt="Selecting specific resources and prompts from the menu" data-og-width="648" width="648" data-og-height="920" height="920" data-path="images/quickstart-remote/5-select-prompts-resources.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7361585026d3dd1f0c218232ce475d59 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=eb5162947ac8110569225e4ff36ac54c 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=93b0b1de76b11785deb6cd2b8bbbb33e 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=19d1f1de9b7b38dff6fabaea260fc700 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=587ee6b0f0831f7b9c827db58e4c53a6 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/5-select-prompts-resources.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=a875a3599b478977e1322c07b82a5879 2500w" />
    </Frame>
  </Step>

  <Step title="Configure Tool Permissions">
    Remote MCP servers often expose multiple tools with varying capabilities. You can control which tools Claude is allowed to use by configuring permissions in the connector settings. This ensures Claude only performs actions you've explicitly authorized.

    <Frame>
      <img src="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=1e55fd2f7da85150bfcf9dfbd7a31f44" alt="Tool permission configuration interface" data-og-width="604" width="604" data-og-height="745" height="745" data-path="images/quickstart-remote/6-configure-tools.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=280&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=6ece557353a2b8227cfc033ee7533fbc 280w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=560&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=aa954f4a018077d6a4a3c9406cdd4a63 560w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=309fd1583dd23081ed93eca4fb85c5e0 840w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=1100&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=8b7ea5b326ea5cf8947e9b9aba28f2f7 1100w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7e02024cdcae2b7c41aab3d5c4f4e75e 1650w, https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/quickstart-remote/6-configure-tools.png?w=2500&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=f953404ab1cb149e160eaa139c53d701 2500w" />
    </Frame>

    Navigate back to the Connectors settings and click on your connected server. Here you can enable or disable specific tools, set usage limits, and configure other security parameters according to your needs.
  </Step>
</Steps>

## Best Practices for Using Remote MCP Servers

When working with remote MCP servers, consider these recommendations to ensure a secure and efficient experience:

**Security considerations**: Always verify the authenticity of remote MCP servers before connecting. Only connect to servers from trusted sources, and review the permissions requested during authentication. Be cautious about granting access to sensitive data or systems.

**Managing multiple connectors**: You can connect to multiple remote MCP servers simultaneously. Organize your connectors by purpose or project to maintain clarity. Regularly review and remove connectors you no longer use to keep your workspace organized and secure.

## Next Steps

Now that you've connected Claude to a remote MCP server, you can explore its capabilities in your conversations. Try using the connected tools to automate tasks, access external data, or integrate with your existing workflows.

<CardGroup cols={2}>
  <Card title="Build your own remote server" icon="cloud" href="https://support.anthropic.com/en/articles/11503834-building-custom-connectors-via-remote-mcp-servers">
    Create custom remote MCP servers to integrate with proprietary tools and
    services
  </Card>

  <Card title="Explore available servers" icon="grid" href="https://github.com/modelcontextprotocol/servers">
    Browse our collection of official and community-created MCP servers
  </Card>

  <Card title="Connect local servers" icon="computer" href="/docs/develop/connect-local-servers">
    Learn how to connect Claude Desktop to local MCP servers for direct system
    access
  </Card>

  <Card title="Understand the architecture" icon="book" href="/docs/learn/architecture">
    Dive deeper into how MCP works and its architecture
  </Card>
</CardGroup>

Remote MCP servers unlock powerful possibilities for extending Claude's capabilities. As you become familiar with these integrations, you'll discover new ways to streamline your workflows and accomplish complex tasks more efficiently.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://modelcontextprotocol.io/llms.txt