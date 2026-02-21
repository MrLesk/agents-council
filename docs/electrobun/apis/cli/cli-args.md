<!-- Source: https://blackboard.sh/electrobun/docs/apis/cli/cli-args -->

## Navigation

#### Documentation

[Documentation Home](../../index.md)

##### Getting Started

[Quick Start](../../guides/quick-start.md) [What is Electrobun?](../../guides/what-is-electrobun.md) [Hello World](../../guides/hello-world.md) [Creating UI](../../guides/creating-ui.md) [Bundling & Distribution](../../guides/bundling-and-distribution.md)

##### Advanced Guides

[Cross-Platform Development](../../guides/cross-platform-development.md) [Compatibility](../../guides/compatability.md) [Code Signing](../../guides/code-signing.md) [Architecture Overview](../../guides/architecture/overview.md) [Webview Tag Architecture](../../guides/architecture/webview-tag.md) [Updates](../../guides/updates.md) [Migrating from 0.x to v1](../../guides/migrating-to-v1.md)

##### Bun APIs

[Bun API](../bun.md) [BrowserWindow](../browser-window.md) [BrowserView](../browser-view.md) [Utils](../utils.md) [Context Menu](../context-menu.md) [Application Menu](../application-menu.md) [Paths](../paths.md) [Tray](../tray.md) [Updater](../updater.md) [Events](../events.md) [BuildConfig](../build-config.md)

##### Browser APIs

[Electroview Class](../browser/electroview-class.md) [Webview Tag](../browser/electrobun-webview-tag.md) [Draggable Regions](../browser/draggable-regions.md) [Global Properties](../browser/global-properties.md)

##### CLI & Configuration

[Build Configuration](./build-configuration.md) [CLI Arguments](./cli-args.md) [Bundled Assets](../bundled-assets.md) [Bundling CEF](../bundling-cef.md) [Application Icons](../application-icons.md)

# Electrobun CLI Commands

The Electrobun CLI provides commands for initializing new projects and building your applications for different environments.

## Installation

When you install Electrobun, the CLI tool is added to your `node_modules/bin` folder:

```
bun install electrobun
```

This makes the `electrobun` command available in your npm scripts or via `bunx`/`npx`.

## Commands

### `electrobun init`

Initializes a new Electrobun project with starter templates.

#### Usage

```
# Interactive template selection
electrobun init

# Direct template selection
electrobun init [template-name]
```

#### Available Templates

-   `hello-world` - Basic single-window application
-   `photo-booth` - Camera app with photo capture functionality
-   `interactive-playground` - An interactive playground of Electrobun apis
-   `multitab-browser` - Multi-tabbed web browser

#### Examples

```
# Choose template interactively
bunx electrobun init

# Initialize with photo-booth template directly
bunx electrobun init photo-booth

# Initialize with multitab-browser template
bunx electrobun init multitab-browser
```

### `electrobun build`

Builds your Electrobun application according to the configuration in `electrobun.config.ts`.

#### Usage

```
electrobun build [options]
```

#### Options

Option

Description

Values

Default

`--env`

Build environment

`dev`, `canary`, `stable`

`dev`

Builds always target the current host platform and architecture. To build for multiple platforms, use CI runners for each OS/architecture (see [Cross-Platform Development](../../guides/cross-platform-development.md)).

#### Examples

```
# Development build for current platform
electrobun build

# Development build with environment flag
electrobun build --env=dev

# Canary build
electrobun build --env=canary

# Stable (production) build
electrobun build --env=stable
```

## Build Environments

### Development (`dev`)

-   Outputs logs and errors to terminal
-   No code signing or notarization
-   Creates build in `build/` folder
-   No artifacts generated
-   Fast iteration for testing

### Canary

-   Pre-release/beta builds
-   Optional code signing and notarization
-   Generates distribution artifacts
-   Creates update manifests for auto-updates
-   Suitable for testing with limited users

### Stable

-   Production-ready builds
-   Full code signing and notarization (if configured)
-   Optimized and compressed artifacts
-   Ready for distribution to end users
-   Generates all update files

## Build Script Examples

### Basic Setup

```
// package.json
{
  "scripts": {
    "dev": "electrobun build && electrobun dev",
    "build": "electrobun build --env=canary",
    "build:stable": "electrobun build --env=stable"
  }
}
```

### Development Workflow

```
// package.json
{
  "scripts": {
    "dev": "electrobun build --env=dev && electrobun dev",
    "dev:watch": "nodemon --watch src --exec 'bun run dev'",
    "test": "bun test && bun run build"
  }
}
```

### CI Build Scripts

For multi-platform distribution, run the same build command on each platform's CI runner:

```
// package.json
{
  "scripts": {
    "build:dev": "electrobun build",
    "build:canary": "electrobun build --env=canary",
    "build:stable": "electrobun build --env=stable"
  }
}
```
