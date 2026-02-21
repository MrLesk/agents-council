<!-- Source: https://blackboard.sh/electrobun/docs/guides/what-is-electrobun -->

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

# What is Electrobun?

Electrobun is a desktop application framework that lets you build ultra fast, tiny, and cross-platform applications using TypeScript. It combines the best of native performance with web development simplicity.

## The Problem

Traditional desktop app frameworks force you to choose between developer experience and app performance:

-   **Electron:** Great DX but huge bundle sizes (150MB+), slow startup times (2-5s), and massive update downloads
-   **Native development:** Great performance but complex setup, platform-specific code, and limited web technology integration
-   **Tauri:** Better than Electron but still large updates and you have to learn Rust

## The Solution

Electrobun provides a third option that doesn't compromise:

-   **Ultra-small bundles:** ~14MB compressed (90%+ smaller than Electron)
-   **Lightning-fast startup:** <50ms cold start vs 2-5s for Electron
-   **Tiny updates:** 14KB patches using custom binary diff vs 100MB+ with Electron
-   **Pure TypeScript:** Write TypeScript for both main process and UI
-   **Web technologies:** HTML, CSS, JavaScript - use any frontend framework
-   **Native performance:** Zig bindings with Bun runtime for maximum speed
-   **Optional CEF:** bundle CEF (Chromium) when cross-platform consistency matters most.

## Performance Comparison

Metric

Electron

Tauri

Electrobun

Bundle Size

150MB+

25MB

14MB

Update Size

100MB+

10MB

14KB

Startup Time

2-5s

500ms

<50ms

Memory Usage

100-200MB

30-50MB

15-30MB

## Technical Architecture

Electrobun achieves its performance through a carefully designed architecture:

### Zig, and Native Bindings

Native functionality like window management, system trays, and app menus writtin in C++ and Objc

### Bun Runtime

The main process runs on Bun, providing lightning-fast Typescript execution and built-in bundling without the overhead of Node.js and V8.

### System WebView

Instead of distributing Chromium, By default Electrobun uses your system's native WebView (WebKit on macOS, Edge WebView2 on Windows, WebKitGTK on Linux).

### Custom Update System

Binary diff updates using a SIMD optimized BSDIFF implementation written in zig to allow for incredibly small update patches - often just kilobytes instead of megabytes.

### ZSTD self-extracting distributables

The Electrobun cli bundles your app, then compresses it with state of the art compression making initial downloads as small as possible.

### Custom OOPIF Implementation

Use OOPIFs (super iframes) in your html for secure, isolated, webviews across browser engines and platforms.

## Key Benefits

### 🚀 Faster Development

-   Fast build times - Electrobun cli uses pre-built binaries for your target platform
-   Use any web framework (React, SolidJS, Vue, Svelte, etc.)
-   TypeScript throughout - no context switching
-   Built-in bundling and optimization

### 📦 Better Distribution

-   14MB bundles vs 150MB+ with Electron
-   Kilobyte updates instead of megabyte downloads
-   Built-in code signing and notarization
-   Cross-platform builds from any OS
-   Built-in ZSTD self-extractor

### ⚡ Superior Performance

-   Sub-50ms startup times
-   Minimal memory footprint
-   Native-feeling UI responsiveness
-   Battery-efficient operation

### 🔐 Security First

-   Process isolation by default
-   Secure, encrypted, and typed RPC between processes
-   custom views:// schema for loading bundled assets in webviews
-   Minimal attack surface

## When to Use Electrobun

Electrobun is perfect for:

-   **Startup MVPs:** Ship fast, iterate quickly with small updates
-   **Developer tools:** IDEs, terminals, productivity apps that need native performance
-   **Cross-platform apps:** One codebase, native feel everywhere
-   **High-performance apps:** When Electron is too slow but native development is too complex
-   **Bandwidth-conscious apps:** Frequent updates without user friction
-   **Multi-tab web browsers**Build multi-tab experiences and mix CEF and Webkit webviews

## Getting Started

Ready to build your first Electrobun app? Follow our [Hello World guide](./hello-world.md) to create a new project in minutes.

[← Quick Start](./quick-start.md) [Hello World →](./hello-world.md)
