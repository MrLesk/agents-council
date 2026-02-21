<!-- Source: https://blackboard.sh/electrobun/docs/guides/hello-world -->

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

# Hello World

**Info:** Electrobun will install a specific version of bun as a dependency in `node_modules`.

**Info:** This guide assumes you have bun installed globally, if you're using node.js or another package manager then you may need to adjust the terminal commands and package.json scripts accordingly.

## Step 0: Init templates

This guide will walk you through building a hello world from scratch.

If you'd prefer to be up and running in seconds we offer starter templates including a `hello-world`, `photo-booth`, and multi-tabbed `web-browser`. If you have bun installed and want to get started in a few clicks.

Just run **`bunx electrobun init`** and choose the starter template you want to explore.

## Step 1: Initialize your project folder

Create a new folder for your project. Let's call it `/electrobun-test`.

In your `electrobun-test` folder run `bun init .` You'll be prompted to enter a package name, let's use `my-app` and an entrypoint which we don't need so just hit enter.

## Step 2: Install Electrobun as a dependency

Let's install electrobun. Just run: `bun install electrobun` to add it as a dependency.

## Step 3: Add package.json scripts to build and run your app

Open your `package.json` in a code editor and add a build:dev script and a start script so that your `package.json` looks like this:

```
{
  "name": "my-app",
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "electrobun": "^0.0.1"
  },
  "scripts": {
    "start": "bun run build:dev && electrobun dev",
    "build:dev": "bun install && electrobun build"
  }
}
```

**Note:** That we've modified the default package.json that bun creates

-   Removed the "type": "module" and "module": "index.ts" properties since we don't need them.
-   Added two npm scripts that will use the electrobun cli that should now be in your node\_modules/.bin folder.

## Step 4: Hello World

We now have electrobun installed and a way to build and run our hello world app, let's add some code.

Create a file in `src/bun/index.ts` with the following contents:

```
import { BrowserWindow } from "electrobun/bun";
const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "https://electrobun.dev",
});
```

## Step 5: Configure Electrobun

One last thing, we need to a way to let the Electrobun cli know where our bun entrypoint file is and how to build it. We do that by creating an ``electrobun.config.ts`}>`` file in the root of the project.

```
export default {
  app: {
    name: "My App",
    identifier: "dev.my.app",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
  },
};
```

## Step 6: Run your app

With this we can now go back to our terminal and run `bun start` and you should see a window pop up and load the site.

To stop running the app just hit `cmd+c`

[← Quick Start](./quick-start.md) [Creating UI →](./creating-ui.md)
