<!-- Source: https://blackboard.sh/electrobun/docs/apis/bundling-cef -->

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

# Bundling CEF (Chromium Embedded Framework)

Electrobun supports bundling CEF with your application for cross-platform consistency and advanced features. While the default system webview provides smaller bundle sizes, CEF ensures near-identical rendering and behavior across all platforms.

## Configuration

To bundle CEF with your application, configure the `build` property in your `electrobun.config.ts` file:

```
// electrobun.config.ts
import { type ElectrobunConfig } from "electrobun";

export const config: ElectrobunConfig = {
  build: {
    macos: {
      bundleCEF: true
    },
    win: {
      bundleCEF: true
    },
    linux: {
      bundleCEF: true
    }
  },
  // ... other configuration
};
```

## Platform Considerations

### Windows

On Windows the system renderer is Webview2, which is essentially the inner renderer of Edge, which is Chromium based. So on Windows when using the system webview you get a Chromium-based renderer that the system manages updates for which is great for bundle size and security. But there may be differences between the version of Webview2 on the user's system vs. what Electrobun's binaries are built against, and there may be a difference in Chromium version between a given user's system and Chromium api's you need and so bundling CEF may be still be beneficial to pin the version of Chromium you distribute by including it in the bundle.

### Linux

**Bundling CEF is strongly recommended on Linux** as the default GTKWebKit renderer doesn't support Electrobun's advanced layer compositing features. This means features like the `<electrobun-webview>` tag and complex window layering may not work correctly without CEF.

### Bundle Size Impact

When bundling CEF, your application's initial self-extracting bundle will increase to approximately **100MB** compared to ~14MB with system webviews. However, incremental updates remain small (as little as 14KB) thanks to Electrobun's differential update system.

## Using CEF Renderer

When CEF is bundled, you need to specify `renderer="cef"` when creating windows or webviews:

### BrowserWindow API

```
// src/bun/index.ts
import { BrowserWindow } from "electrobun/bun";

// Create a window using CEF renderer
const cefWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  renderer: "cef",  // Specify CEF renderer
  url: "views://main/index.html"
});

// You can also create a window with system renderer (except on Linux)
const systemWindow = new BrowserWindow({
  width: 800,
  height: 600,
  renderer: "system",  // Use system webview
  url: "views://secondary/index.html"
});
```

### Electrobun Webview Tag

```
<!-- src/main/index.html -->
<!-- Use CEF renderer for the webview -->
<electrobun-webview 
  src="https://example.com"
  renderer="cef"
  style="width: 100%; height: 500px;">
</electrobun-webview>

<!-- On platforms other than Linux, you can mix renderers -->
<electrobun-webview 
  src="https://example.org"
  renderer="system"
  style="width: 100%; height: 300px;">
</electrobun-webview>
```

## Mixed Renderer Support

### macOS and Windows

On macOS and Windows, when CEF is bundled, you can **mix and match renderers** within the same application:

-   Some windows can use the system webview for smaller memory footprint
-   Others can use CEF for consistency or advanced features
-   Individual `<electrobun-webview>` tags can specify their preferred renderer

### Linux Limitation

**On Linux, renderer mixing is not supported.** The build process creates two separate Electrobun binaries:

-   One for system webview (GTKWebKit)
-   One for CEF

This means all your webviews on Linux must use the same renderer - either all CEF or all system webview. You cannot mix them within a single application instance.

## When to Bundle CEF

Consider bundling CEF when you need:

-   **Consistent rendering** across all platforms
-   **Advanced compositing features** (especially on Linux)
-   **Latest Chromium features** not available in system webviews
-   **Predictable behavior** for complex web applications
-   **Full support for modern web standards**

Consider using system webviews when you want:

-   **Smallest possible bundle size** (~14MB vs ~100MB)
-   **Native platform integration** and appearance
-   **Lower memory usage** for simple applications
-   **Faster initial download** for users

## Example: Platform-Specific Configuration

You can selectively bundle CEF for specific platforms:

```
// electrobun.config.ts
import { type ElectrobunConfig } from "electrobun";

export const config: ElectrobunConfig = {
  build: {
    macos: {
      bundleCEF: false  // Use system WebKit on macOS
    },
    win: {
      bundleCEF: true   // Use CEF on Windows for consistency
    },
    linux: {
      bundleCEF: true   // Required for advanced features on Linux
    }
  }
};
```

This configuration provides the best balance between bundle size and functionality for each platform.

## Custom CEF Versions

Each Electrobun release ships with a specific tested CEF version. You can override this with the `cefVersion` option in your build configuration to use a different version from the [Spotify CEF builds](https://cef-builds.spotifycdn.com/) CDN.

### Why Override the CEF Version

There are two main reasons you might want to use a different CEF version:

-   **Pin an older version:** If your app depends on a Chrome API that was deprecated or removed in a newer CEF release, you can pin the CEF version to avoid the breaking change. This lets you ship on your own timeline instead of being forced to update when Electrobun bumps its default.
-   **Use a newer version:** If a newer CEF release includes a security fix or a Chromium feature you need, you don't have to wait for Electrobun to fully test and adopt it. You can point to the newer version immediately and unblock your own release.

### Configuration

Set the `cefVersion` field in the `build` section of your `electrobun.config.ts`. The value must match the version string format used by [cef-builds.spotifycdn.com](https://cef-builds.spotifycdn.com/):

```
// electrobun.config.ts
import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "MyApp",
    identifier: "com.example.myapp",
    version: "1.0.0",
  },
  build: {
    cefVersion: "144.0.11+ge135be2+chromium-144.0.7559.97",
    mac: {
      bundleCEF: true,
    },
    linux: {
      bundleCEF: true,
    },
    win: {
      bundleCEF: true,
    },
  },
} satisfies ElectrobunConfig;
```

The format is `CEF_VERSION+chromium-CHROMIUM_VERSION`. You can find the exact version strings on the [Spotify CEF builds](https://cef-builds.spotifycdn.com/) page — look for the "minimal" distribution for your target platforms.

### How It Works

When `cefVersion` is set, the Electrobun CLI downloads the CEF minimal distribution directly from Spotify's CDN and extracts the runtime files (shared libraries, resource packs, locales) into your local dependency cache. No compilation or build tools are required on your machine.

Electrobun's helper process (`process_helper`) ships pre-built with each Electrobun release and communicates with CEF through its stable C API. This means the helper binary works with different CEF versions without recompilation, as long as the C API is compatible.

### Compatibility

**CEF versions must have a compatible C API with the Electrobun release you're using.** CEF's C API is designed for ABI stability within the same major version line. Across major versions, breaking changes are possible and may cause runtime crashes or unexpected behavior.

As a general rule:

-   **Same major version** (e.g., 144.x to 144.y): Safe. The C API is stable within a major version.
-   **Adjacent major versions** (e.g., 144.x to 145.x): Usually works, but test thoroughly. Breaking changes are uncommon but possible.
-   **Distant major versions** (e.g., 130.x to 145.x): Higher risk of incompatibility. The further apart the versions, the more likely there are C API changes that affect Electrobun's integration.

To see which CEF version your Electrobun release was built and tested against, check the `CEF_VERSION` constant in [package/build.ts](https://github.com/blackboardsh/electrobun/blob/main/package/build.ts) for your release tag.

### Caching

The downloaded CEF files are cached locally per platform and version. If you change `cefVersion`, the CLI detects the mismatch and re-downloads automatically. Removing the override restores the default CEF version shipped with your Electrobun release.

**See also:** You can similarly override the bundled Bun runtime version using the `bunVersion` option. See [Build Configuration — Custom Bun Version](./cli/build-configuration.md).
