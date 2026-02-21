<!-- Source: https://blackboard.sh/electrobun/docs/ -->

# Electrobun Documentation - Build ultra fast, tiny, cross-platform desktop apps

# Electrobun Documentation

Everything you need to build ultra fast, tiny, cross-platform desktop applications with TypeScript.

## Quick Start

$ bunx electrobun init

```
import { BrowserWindow } from "electrobun/bun";

const win = new BrowserWindow({
  title: "My App",
  url: "views://mainview/index.html",
});
```

## Electrobun

Ultra fast and tiny desktop app framework

Build cross-platform desktop applications with TypeScript that are incredibly small and blazingly fast. Electrobun combines the power of native bindings with Bun's runtime for unprecedented performance.

✓ Native bindings written in C++, ObjC, and Zig

✓ Bun as backend runtime and bundler

✓ System's native webview as renderer, CEF Optional

✓ Custom bsdiff-based update mechanism

✓ Cross-platform: macOS, Windows, Linux

14MB

Bundle Size

14KB

Update Size

<50ms

Startup Time

100%

Native Feel

## Documentation

### Getting Started

-   **[Quick Start](./guides/quick-start.md)**
    
    Create your first Electrobun app in minutes
    
-   **[What is Electrobun?](./guides/what-is-electrobun.md)**
    
    Learn about the framework and its benefits
    
-   **[Hello World](./guides/hello-world.md)**
    
    Build your first app step by step
    
-   **[Creating UI](./guides/creating-ui.md)**
    
    Build beautiful user interfaces
    
-   **[Bundling & Distribution](./guides/bundling-and-distribution.md)**
    
    Package and distribute your apps
    

### Advanced Guides

-   **[Cross-Platform Development](./guides/cross-platform-development.md)**
    
    Build for macOS, Windows, and Linux
    
-   **[Compatibility](./guides/compatability.md)**
    
    Platform compatibility and requirements
    
-   **[Code Signing](./guides/code-signing.md)**
    
    Sign and notarize your applications
    
-   **[Architecture Overview](./guides/architecture/overview.md)**
    
    Understand Electrobun's architecture
    
-   **[Webview Tag Architecture](./guides/architecture/webview-tag.md)**
    
    How webviews work in Electrobun
    
-   **[Updates](./guides/updates.md)**
    
    Update system and binary patches
    

### Bun APIs

-   **[Bun API](./apis/bun.md)**
    
    Main process API and lifecycle management
    
-   **[BrowserWindow](./apis/browser-window.md)**
    
    Native window management and controls
    
-   **[BrowserView](./apis/browser-view.md)**
    
    Create and manage webview windows
    
-   **[Utils](./apis/utils.md)**
    
    File system and OS utility functions
    
-   **[Context Menu](./apis/context-menu.md)**
    
    Native context menus
    
-   **[Application Menu](./apis/application-menu.md)**
    
    Native application menu bars
    
-   **[Paths](./apis/paths.md)**
    
    Global paths for resources and views
    
-   **[Tray](./apis/tray.md)**
    
    System tray implementation
    
-   **[Updater](./apis/updater.md)**
    
    Built-in app update mechanism
    
-   **[Events](./apis/events.md)**
    
    Event system and handling
    

### Browser APIs

-   **[Electroview Class](./apis/browser/electroview-class.md)**
    
    Initialize Electrobun APIs in browser
    
-   **[Webview Tag](./apis/browser/electrobun-webview-tag.md)**
    
    Custom webview HTML element
    
-   **[Draggable Regions](./apis/browser/draggable-regions.md)**
    
    Make HTML elements draggable
    
-   **[Global Properties](./apis/browser/global-properties.md)**
    
    Browser context global properties
    

### CLI & Configuration

-   **[Build Configuration](./apis/cli/build-configuration.md)**
    
    Configure your Electrobun builds
    
-   **[CLI Arguments](./apis/cli/cli-args.md)**
    
    Command line interface reference
    
-   **[Bundled Assets](./apis/bundled-assets.md)**
    
    Asset management with views:// schema
    
-   **[Bundling CEF](./apis/bundling-cef.md)**
    
    CEF bundling across platforms
    
-   **[Application Icons](./apis/application-icons.md)**
    
    Configure app icons for all platforms
    

## Community & Support

Join our growing community of developers building the future of desktop applications.

[GitHub Repository](https://github.com/blackboardsh/electrobun) [Join Discord](https://discord.gg/ueKE4tjaCE)

## Ready to Get Started?

Follow our Getting Started guide to create your first Electrobun app.

[Quick Start Guide](./guides/quick-start.md)
