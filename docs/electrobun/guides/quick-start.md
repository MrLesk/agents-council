<!-- Source: https://blackboard.sh/electrobun/docs/guides/quick-start -->

## Navigation

#### Documentation

[Documentation Home](../index.md)

##### Getting Started

[Quick Start](./quick-start.md) [What is Electrobun?](./what-is-electrobun.md) [Hello World](./hello-world.md) [Creating UI](./creating-ui.md) [Bundling & Distribution](./bundling-and-distribution.md)

##### Advanced Guides

[Cross-Platform Development](./cross-platform-development.md) [Compatibility](./compatability.md) [Code Signing](./code-signing.md) [Architecture Overview](./architecture/overview.md) [Webview Tag Architecture](./architecture/webview-tag.md) [Updates](./updates.md) [Migrating from 0.x to v1](./migrating-to-v1.md)

##### Bun APIs

[Bun API](../apis/bun.md) [BrowserWindow](../apis/browser-window.md) [BrowserView](../apis/browser-view.md) [Utils](../apis/utils.md) [Context Menu](../apis/context-menu.md) [Application Menu](../apis/application-menu.md) [Paths](../apis/paths.md) [Tray](../apis/tray.md) [Updater](../apis/updater.md) [Events](../apis/events.md) [BuildConfig](../apis/build-config.md)

##### Browser APIs

[Electroview Class](../apis/browser/electroview-class.md) [Webview Tag](../apis/browser/electrobun-webview-tag.md) [Draggable Regions](../apis/browser/draggable-regions.md) [Global Properties](../apis/browser/global-properties.md)

##### CLI & Configuration

[Build Configuration](../apis/cli/build-configuration.md) [CLI Arguments](../apis/cli/cli-args.md) [Bundled Assets](../apis/bundled-assets.md) [Bundling CEF](../apis/bundling-cef.md) [Application Icons](../apis/application-icons.md)

# Quick Start

Welcome to Electrobun! This guide will help you create your first ultra-fast, tiny desktop application with TypeScript.

## Prerequisites

Before getting started, make sure you have:

-   [Bun](https://bun.sh) installed on your system
-   A text editor or IDE (Blackboard's own [co(lab)](https://blackboard.sh/colab/) recommended)
-   Basic knowledge of TypeScript/JavaScript

## Getting Started

Create a new Electrobun project with a single command:

```
bunx electrobun init
```

It'll ask you which template project you want to get started with.

This creates a new directory with the basic project structure:

```
my-app/
├── src/
│   ├── main.ts          # Main process entry point
│   └── renderer/
│       ├── index.html   # UI template
│       ├── style.css    # Styles
│       └── script.ts    # Frontend logic
├── package.json         # Project dependencies
└── electrobun.config.ts # Build configuration
```

## Running Your App

Navigate to your project directory and start development:

```
cd my-app
bun install
bun start
```

This will use the Electrobun cli:

-   Create a quick start project on your machine
-   Use the Electrobun cli to do a dev build of your app
-   Open your app in dev mode

## Next Steps

Now that you have a basic app running, explore these topics:

-   [Hello World](./hello-world.md) - Create a hello world from scratch.
-   [Creating UI](./creating-ui.md) - Build beautiful interfaces with web technologies
-   [Bun API](../apis/bun.md) - Learn about the main process APIs
-   [BrowserView](../apis/browser-view.md) - Manage multiple webviews
-   [Bundling & Distribution](./bundling-and-distribution.md) - Package your app for distribution

## Need Help?

If you run into any issues:

-   Check the [GitHub repository](https://github.com/blackboardsh/electrobun)
-   Join our [Discord community](https://discord.gg/ueKE4tjaCE)
-   Read through the other documentation guides

[← Documentation Home](../index.md) [What is Electrobun? →](./what-is-electrobun.md)
