<!-- Source: https://blackboard.sh/electrobun/docs/guides/architecture/webview-tag -->

## Navigation

#### Documentation

[Documentation Home](../../index.md)

##### Getting Started

[Quick Start](../quick-start.md) [What is Electrobun?](../what-is-electrobun.md) [Hello World](../hello-world.md) [Creating UI](../creating-ui.md) [Bundling & Distribution](../bundling-and-distribution.md)

##### Advanced Guides

[Cross-Platform Development](../cross-platform-development.md) [Compatibility](../compatability.md) [Code Signing](../code-signing.md) [Architecture Overview](./overview.md) [Webview Tag Architecture](./webview-tag.md) [Updates](../updates.md) [Migrating from 0.x to v1](../migrating-to-v1.md)

##### Bun APIs

[Bun API](../../apis/bun.md) [BrowserWindow](../../apis/browser-window.md) [BrowserView](../../apis/browser-view.md) [Utils](../../apis/utils.md) [Context Menu](../../apis/context-menu.md) [Application Menu](../../apis/application-menu.md) [Paths](../../apis/paths.md) [Tray](../../apis/tray.md) [Updater](../../apis/updater.md) [Events](../../apis/events.md) [BuildConfig](../../apis/build-config.md)

##### Browser APIs

[Electroview Class](../../apis/browser/electroview-class.md) [Webview Tag](../../apis/browser/electrobun-webview-tag.md) [Draggable Regions](../../apis/browser/draggable-regions.md) [Global Properties](../../apis/browser/global-properties.md)

##### CLI & Configuration

[Build Configuration](../../apis/cli/build-configuration.md) [CLI Arguments](../../apis/cli/cli-args.md) [Bundled Assets](../../apis/bundled-assets.md) [Bundling CEF](../../apis/bundling-cef.md) [Application Icons](../../apis/application-icons.md)

# The `<electrobun-webview>` Tag

## Overview

The `<electrobun-webview>` tag is Electrobun's implementation of an Out-Of-Process IFrame (OOPIF), providing a secure, isolated, and performant way to embed web content within your application. Unlike traditional iframes or Electron's deprecated `<webview>` tag, Electrobun's approach offers full process isolation while maintaining seamless DOM integration.

**Info:** For a deep dive into the technical implementation and philosophy behind Electrobun's OOPIF approach, check out our blog post: [Building a Better OOPIF](https://blackboard.sh/blog/building-a-better-oopif)

## Why Not Regular IFrames?

Standard iframes come with significant limitations for desktop applications:

-   **Security restrictions**: Modern browsers prevent iframes from loading cross-domain content
-   **Limited control**: Cannot fully customize behavior or bypass same-origin policies
-   **Performance constraints**: Share the same process as the parent page
-   **Feature limitations**: Restricted access to native APIs and advanced browser features

## The OOPIF Advantage

An Out-Of-Process IFrame (OOPIF) solves these limitations by:

-   **Process isolation**: Each webview runs in its own isolated process
-   **Security boundary**: Complete separation between host and embedded content
-   **Performance**: Independent resource allocation and crash protection
-   **Flexibility**: Full control over content loading and permissions

## How It Works

The `<electrobun-webview>` tag functions as a layer positioned above the main window, synchronized with the DOM element's position and size. This architecture provides:

1.  **DOM Integration**: The webview behaves like any other DOM element - you can style, animate, and position it using CSS
2.  **Process Separation**: Content runs in a completely isolated process, preventing cross-contamination
3.  **Transparent Layering**: Support for transparency and layering effects without breaking the host design
4.  **Native Performance**: Direct rendering without the overhead of iframe restrictions

## Key Features

### Full Isolation

Each `<electrobun-webview>` runs in its own process, ensuring:

-   Crash protection (one webview crash doesn't affect others)
-   Memory isolation
-   Security boundaries between different content sources

### Seamless Communication

Fast inter-process communication (IPC) between:

-   The Bun main process
-   The host webview
-   Individual OOPIF webviews

### Not Deprecated

Unlike Electron's `<webview>` tag (which relies on Chromium's deprecated implementation scheduled for removal in January 2025), Electrobun's implementation is built from the ground up and will continue to be supported and improved.

## Usage Example

```
<electrobun-webview 
  src="https://electrobun.dev"
  style="width: 100%; height: 500px;">
</electrobun-webview>
```

The webview integrates seamlessly with your application's DOM while maintaining complete process isolation for security and performance.

## Architecture Benefits

-   **Security**: Complete process isolation prevents cross-site scripting and other attacks
-   **Reliability**: Crash isolation ensures one failing webview doesn't bring down your app
-   **Performance**: Independent resource allocation and rendering
-   **Flexibility**: Full control over content without iframe limitations
-   **Future-proof**: Not dependent on deprecated Chromium features

For more technical details and the evolution of this implementation, read our [Building a Better OOPIF](https://blackboard.sh/blog/building-a-better-oopif) blog post.

[← Architecture Overview](./overview.md) [Updates →](../updates.md)
