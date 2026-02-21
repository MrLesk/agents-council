<!-- Source: https://blackboard.sh/electrobun/docs/guides/compatability -->

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

# Compatibility

## Dependencies and Versions

Dependency

Version

Notes

Bun

1.3.0

Zig

0.13.0

CEF

125.0.22

optionally bundled

## Platform Support

### Development Platform

-   **macOS**: Required for building Electrobun apps (Intel and Apple Silicon supported)
-   **Windows**: Development support available
-   **Linux**: Development support available

### Target Platforms

Apps built with Electrobun can be distributed to:

Platform

Architecture

Status

Notes

macOS

ARM64 (Apple Silicon)

✅ Stable

Full support with system WebKit

macOS

x64 (Intel)

✅ Stable

Full support with system WebKit

Windows

x64

✅ Stable

WebView2 (Edge) or bundled CEF

Windows

ARM64

✅ Via Emulation

Runs x64 binary through Windows emulation

Linux

x64

✅ Stable

WebKitGTK or bundled CEF

Linux

ARM64

✅ Stable

WebKitGTK or bundled CEF

### Webview Engines

Electrobun supports both system webviews and bundled engines:

Platform

System Webview

Bundled Option

macOS

WebKit (WKWebView)

CEF (Chromium) - Optional

Windows

WebView2 (Edge)

CEF (Chromium) - Optional

Linux

WebKitGTK

CEF (Chromium) - Optional

[← Cross-Platform Development](./cross-platform-development.md) [Code Signing →](./code-signing.md)
