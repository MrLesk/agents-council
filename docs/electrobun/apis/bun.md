<!-- Source: https://blackboard.sh/electrobun/docs/apis/bun -->

## Navigation

#### Documentation

[Documentation Home](../index.md)

##### Getting Started

[Quick Start](../guides/quick-start.md) [What is Electrobun?](../guides/what-is-electrobun.md) [Hello World](../guides/hello-world.md) [Creating UI](../guides/creating-ui.md) [Bundling & Distribution](../guides/bundling-and-distribution.md)

##### Advanced Guides

[Cross-Platform Development](../guides/cross-platform-development.md) [Compatibility](../guides/compatability.md) [Code Signing](../guides/code-signing.md) [Architecture Overview](../guides/architecture/overview.md) [Webview Tag Architecture](../guides/architecture/webview-tag.md) [Updates](../guides/updates.md) [Migrating from 0.x to v1](../guides/migrating-to-v1.md)

##### Bun APIs

[Bun API](./bun.md) [BrowserWindow](./browser-window.md) [BrowserView](./browser-view.md) [Utils](./utils.md) [Context Menu](./context-menu.md) [Application Menu](./application-menu.md) [Paths](./paths.md) [Tray](./tray.md) [Updater](./updater.md) [Events](./events.md) [BuildConfig](./build-config.md)

##### Browser APIs

[Electroview Class](./browser/electroview-class.md) [Webview Tag](./browser/electrobun-webview-tag.md) [Draggable Regions](./browser/draggable-regions.md) [Global Properties](./browser/global-properties.md)

##### CLI & Configuration

[Build Configuration](./cli/build-configuration.md) [CLI Arguments](./cli/cli-args.md) [Bundled Assets](./bundled-assets.md) [Bundling CEF](./bundling-cef.md) [Application Icons](./application-icons.md)

# Bun API

The Bun API is the main process API that manages your application's lifecycle, creates windows, handles system events, and provides the bridge between your UI and the operating system.

Electrobun is just an npm dependency in your bun project. If you're just starting to look around take a look at the Getting Started Guide first to learn how to set up your first project.

In Electrobun you simply write Typescript for the main process, when your app is all bundled up it will ship with a version of the bun runtime and it'll execute your main bun process with that, so any bun-compatible typescript is valid.

You should explicitely import the `electrobun/bun` api for the main process:

```
import Electrobun from "electrobun/bun";

const win = new Electrobun.BrowserWindow(/*...*/);

// or

import {
  BrowserWindow,
  ApplicationMenu,
  // other specified imports
} from "electrobun/bun";

const win = new BrowserWindow(/*...*/);
```

[← Creating UI](../guides/creating-ui.md) [BrowserView →](./browser-view.md)
