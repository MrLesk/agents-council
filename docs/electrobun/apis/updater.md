<!-- Source: https://blackboard.sh/electrobun/docs/apis/updater -->

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

# Updater

Electrobun's built-in update mechanism for your app

```
// /src/bun/index.ts
import { Updater } from "electrobun/bun";
```

```
// /electrobun.config
{
 ...

 "release": {
    "baseUrl": "https://your-release-url"
 }
}
```

## Updating Electrobun Apps

Electrobun ships with a built-in update mechanism that lets you ship updates to your app as small as 14KB so you can ship often. All you need to do is specify a url where your artifacts are stored in your `electrobun.config` file. A static file host like AWS S3 + Cloudfront, Cloudflare R2, or even GitHub Releases is more than enough, most likely your app will stay well within the free tier.

The electrobun `cli` will automatically generate a flat `artifacts` folder for each non-dev build (typically `canary` and `stable`). Just upload the files to your host and set the `baseUrl`, then use the API to check for and install updates when your app launches, on an interval, or in response to a system tray menu item.

## Methods

### getLocalInfo

Get the local version info for display in your app or other logic. This will read the `version.json` file bundled with your app.

```
const localInfo = await Electrobun.Updater.getLocal;

localInfo: {
  version: string;
  hash: string;
  baseUrl: string;
  channel: string;
  name: string;
  identifier: string;
};
```

### checkForUpdate

Checks for an update by fetching the `update.json` file from the `baseUrl` for the current channel and platform.

```
const updateInfo = await Electrobun.Updater.checkForUpdate();

updateInfo: {
  version: string;
  hash: string;
  updateAvailable: boolean;
  updateReady: boolean;
  error: string;
};
```

### downloadUpdate

This will initiate a process where it attempts to download patch files and apply them until the patched app matches the current version. If something goes wrong like there isn't a trail of patch files from the user's version to current it will download the latest full version of the app directly.

```
await Electrobun.Updater.downloadUpdate();
```

### applyUpdate

Once the latest version is either patched or downloaded and ready to install you can call `applyUpdate` to quit the current app, replace it with the latest version, and relaunch.

```
if (Electrobun.Updater.updateInfo()?.updateReady) {
  await Electrobun.Updater.applyUpdate();
}
```
