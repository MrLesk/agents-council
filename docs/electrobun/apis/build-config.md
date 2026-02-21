<!-- Source: https://blackboard.sh/electrobun/docs/apis/build-config -->

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

# BuildConfig

Access build-time configuration at runtime. This API provides information about how the application was built, including renderer settings.

```
import { BuildConfig } from "electrobun/bun";

// Or via the default export
import Electrobun from "electrobun/bun";
const config = await Electrobun.BuildConfig.get();
```

## Overview

The `BuildConfig` API gives your Bun process access to configuration values that were set at build time in your `electrobun.config.ts`. This is useful for:

-   Knowing which renderers are available in the current build
-   Checking the default renderer configuration
-   Conditional logic based on build settings
-   Debugging and logging build information

## BuildConfig.get()

Asynchronously loads and returns the build configuration. The result is cached after the first call.

### Returns

`Promise<BuildConfigType>`

### BuildConfigType

Property

Type

Description

`defaultRenderer`

`'native' | 'cef'`

The default renderer for BrowserWindow and BrowserView when not explicitly specified

`availableRenderers`

`('native' | 'cef')[]`

List of renderers available in this build. Always includes `'native'`. Includes `'cef'` only if CEF was bundled.

`cefVersion`

`string | undefined`

The CEF version string used in this build (e.g., `"144.0.11+ge135be2+chromium-144.0.7559.97"`). Present only when CEF is bundled. Either the custom override from `electrobun.config.ts` or the default version shipped with the Electrobun release.

`bunVersion`

`string | undefined`

The Bun runtime version used in this build (e.g., `"1.3.8"`). Either the custom override from `electrobun.config.ts` or the default version shipped with the Electrobun release.

`runtime`

`object`

Runtime configuration from the `runtime` section of `electrobun.config.ts`. Includes `exitOnLastWindowClosed` and any custom keys you define.

### Example

```
import { BuildConfig } from "electrobun/bun";

const config = await BuildConfig.get();

console.log("Default renderer:", config.defaultRenderer);
// Output: "cef" or "native"

console.log("Available renderers:", config.availableRenderers);
// Output: ["native", "cef"] or ["native"]

// Check if CEF is available
if (config.availableRenderers.includes('cef')) {
  console.log("CEF is bundled with this app");
}
```

## BuildConfig.getCached()

Synchronously returns the cached build configuration, or `null` if it hasn't been loaded yet.

### Returns

`BuildConfigType | null`

### Example

```
import { BuildConfig } from "electrobun/bun";

// First, load the config (usually done at app startup)
await BuildConfig.get();

// Later, access it synchronously
const cached = BuildConfig.getCached();
if (cached) {
  console.log("Using renderer:", cached.defaultRenderer);
}
```

**Note:** `getCached()` returns `null` if `get()` hasn't been called yet. In most cases, you should use `get()` which handles loading automatically.

## How It Works

When you build your Electrobun app, the CLI reads your `electrobun.config.ts` and generates a `build.json` file in the app's Resources folder. This file contains the runtime-relevant build settings.

The `BuildConfig` API reads this file and caches the result. The configuration includes:

-   **defaultRenderer** - From the platform-specific `defaultRenderer` setting in your config
-   **availableRenderers** - Determined by whether `bundleCEF` was enabled for the target platform
-   **runtime** - The entire `runtime` section from your `electrobun.config.ts`, including `exitOnLastWindowClosed` and any custom keys

## Relationship with BrowserWindow/BrowserView

The `defaultRenderer` setting affects the default behavior of `BrowserWindow` and `BrowserView`:

```
// If defaultRenderer is 'cef' in your config:

// This window will use CEF (the configured default)
const window1 = new BrowserWindow({
  url: "views://main/index.html"
});

// This window explicitly uses native renderer
const window2 = new BrowserWindow({
  url: "views://settings/index.html",
  renderer: 'native'
});
```

See the [Build Configuration](./cli/build-configuration.md) documentation for how to configure these settings.

## Complete Example

```
import Electrobun, { BrowserWindow, BuildConfig } from "electrobun/bun";

// Load and log build configuration at startup
const buildConfig = await BuildConfig.get();

console.log("Build Configuration:");
console.log("  Default Renderer:", buildConfig.defaultRenderer);
console.log("  Available Renderers:", buildConfig.availableRenderers.join(", "));

// Create windows - they'll use the configured default renderer
const mainWindow = new BrowserWindow({
  title: "My App",
  url: "views://main/index.html",
});

// If you need CEF-specific features, check availability first
if (buildConfig.availableRenderers.includes('cef')) {
  const cefWindow = new BrowserWindow({
    title: "CEF Window",
    url: "views://special/index.html",
    renderer: 'cef',
  });
}
```
