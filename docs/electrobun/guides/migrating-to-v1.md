<!-- Source: https://blackboard.sh/electrobun/docs/guides/migrating-to-v1 -->

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

# Migrating from 0.x to v1

Electrobun v1 includes breaking changes to artifact naming and configuration. This guide covers what changed and how to migrate your existing apps.

## Breaking Changes

### 1\. Config: `bucketUrl` renamed to `baseUrl`

The `release.bucketUrl` configuration option has been renamed to `release.baseUrl` to better reflect that it supports any HTTP host, not just S3-style buckets.

#### Before:

```
// electrobun.config.ts
export default {
  // ...
  release: {
    bucketUrl: "https://example.com/releases",
  },
};
```

#### After:

```
// electrobun.config.ts
export default {
  // ...
  release: {
    baseUrl: "https://example.com/releases",
  },
};
```

### 2\. Artifact Naming: Folder-based to Prefix-based (Flat Structure)

Artifact URLs have changed from a folder-based structure to a flat prefix-based structure. This enables hosting on GitHub Releases and other platforms that don't support folders.

#### Before (folder-based):

```
https://example.com/releases/canary-macos-arm64/update.json
https://example.com/releases/canary-macos-arm64/MyApp.app.tar.zst
https://example.com/releases/canary-macos-arm64/abc123.patch
```

#### After (prefix-based / flat):

```
https://example.com/releases/canary-macos-arm64-update.json
https://example.com/releases/canary-macos-arm64-MyApp.app.tar.zst
https://example.com/releases/canary-macos-arm64-abc123.patch
```

The local `artifacts/` folder is now flat with prefixed filenames instead of containing platform subfolders.

## Migration Steps

If you have an app already deployed with the old folder-based structure, follow these steps to migrate your users:

### Step 1: Build a Transitional Release

Before upgrading to v1, build and release one final version using your current Electrobun version (pre-v1). This ensures all your users update to a version that can still read the old URL structure.

```
# Using your current Electrobun version (pre-v1)
bun run build --env=canary  # or stable
# Deploy artifacts to your bucket with the OLD folder structure
```

### Step 2: Upgrade Electrobun

Update your Electrobun dependency to v1:

```
bun add electrobun@latest
```

### Step 3: Update Your Config

Rename `bucketUrl` to `baseUrl` in your `electrobun.config.ts`:

```
release: {
  baseUrl: "https://example.com/releases",  // was: bucketUrl
},
```

### Step 4: Switch Your Bucket to Flat Structure

Once you're confident that most users have updated to the transitional release from Step 1, you can switch your bucket/hosting to use the new flat structure:

1.  Build your app with Electrobun v1 - artifacts will now be generated with the flat naming convention
2.  Upload the new flat-named artifacts to your bucket
3.  Optionally remove the old folder-based artifacts

```
# Using Electrobun v1
bun run build --env=canary
# Deploy the flat-named artifacts from artifacts/ folder
```

### Step 5: Release Updates

From now on, all releases will use the new flat structure. Users who updated in Step 1 will seamlessly transition to fetching updates from the new URLs.

## Why This Change?

The folder-based structure worked well with S3 and R2 buckets, but GitHub Releases and many other hosting platforms don't support folder hierarchies. The new flat prefix-based naming works everywhere while maintaining clear organization through the prefix.

## API Changes

If you're using the Updater API directly, note that `Updater.localInfo.bucketUrl()` has been renamed to `Updater.localInfo.baseUrl()`.

## Need Help?

If you run into issues during migration, please open an issue on the [Electrobun GitHub repository](https://github.com/nicksellen/electrobun).
