<!-- Source: https://blackboard.sh/electrobun/docs/apis/browser/draggable-regions -->

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

[Electroview Class](./electroview-class.md) [Webview Tag](./electrobun-webview-tag.md) [Draggable Regions](./draggable-regions.md) [Global Properties](./global-properties.md)

##### CLI & Configuration

[Build Configuration](../cli/build-configuration.md) [CLI Arguments](../cli/cli-args.md) [Bundled Assets](../bundled-assets.md) [Bundling CEF](../bundling-cef.md) [Application Icons](../application-icons.md)

# Draggable Regions

Configure an html element to function as a draggable region allowing you to move the native application window by clicking and dragging on the element.

When building desktop apps with Electrobun a common pattern is to create a frameless window, sometimes with the traffic light (close, minimize, maximize) buttons overlayed with the html content. You would then use html and css to create a top-bar and set that top-bar to be a draggable region allowing you full control over the style of the window.

You can set any html element to be a draggable region.

### Step 1: Instantiate the Electroview class

```
// /src/mainview/index.ts
import { Electroview } from "electrobun/view";

const electrobun = new Electroview();
```

### Step 2: Add the draggable region css class

Instantiating `Electroview()` will configure any element with the `electrobun-webkit-app-region-drag` css class as a draggable area.

```
<!-- /src/mainview/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Electrobun app</title>
    <script src="views://mainview/index.js"></script>
    <link rel="stylesheet" href="views://mainview/index.css" />
  </head>
  <body>
    <div class="electrobun-webkit-app-region-drag">
      click here and drag to move this window
    </div>
    <h1>hi World</h1>
  </body>
</html>
```

### Step 3: Exclude interactive elements with no-drag

When you have interactive elements (like buttons) inside a draggable region, you need to exclude them from the drag behavior. Use the `electrobun-webkit-app-region-no-drag` css class to make elements non-draggable.

```
<!-- Custom titlebar with window controls -->
<div class="titlebar electrobun-webkit-app-region-drag">
    <!-- Window controls should NOT be draggable -->
    <div class="window-controls electrobun-webkit-app-region-no-drag">
        <button class="close-btn" id="closeBtn"></button>
        <button class="minimize-btn" id="minimizeBtn"></button>
        <button class="maximize-btn" id="maximizeBtn"></button>
    </div>
    <span class="title">My App</span>
</div>
```

## Complete Custom Titlebar Example

Here's a complete example of implementing a custom titlebar with window controls when using `titleBarStyle: "hidden"`:

**Bun process (src/bun/index.ts):**

```
import { BrowserWindow, BrowserView } from "electrobun/bun";

const rpc = BrowserView.defineRPC({
  handlers: {
    requests: {},
    messages: {
      closeWindow: () => win.close(),
      minimizeWindow: () => win.minimize(),
      maximizeWindow: () => {
        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
      },
    },
  },
});

const win = new BrowserWindow({
  title: "Custom Titlebar",
  url: "views://mainview/index.html",
  frame: { width: 800, height: 600, x: 100, y: 100 },
  titleBarStyle: "hidden",
  rpc,
});
```

**Browser process (src/mainview/index.ts):**

```
import { Electroview } from "electrobun/view";

const electrobun = new Electroview();

// Wire up window control buttons
document.getElementById("closeBtn")?.addEventListener("click", () => {
  electrobun.rpc.send.closeWindow();
});

document.getElementById("minimizeBtn")?.addEventListener("click", () => {
  electrobun.rpc.send.minimizeWindow();
});

document.getElementById("maximizeBtn")?.addEventListener("click", () => {
  electrobun.rpc.send.maximizeWindow();
});
```

**HTML (src/mainview/index.html):**

```
<div class="titlebar electrobun-webkit-app-region-drag">
    <div class="window-controls electrobun-webkit-app-region-no-drag">
        <button class="close-btn" id="closeBtn"></button>
        <button class="minimize-btn" id="minimizeBtn"></button>
        <button class="maximize-btn" id="maximizeBtn"></button>
    </div>
    <span class="title">My App</span>
</div>
<main>
    <!-- Your app content here -->
</main>
```

**CSS (src/mainview/index.css):**

```
.titlebar {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: #2d2d2d;
    user-select: none;
}

.window-controls {
    display: flex;
    gap: 8px;
}

.window-controls button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

.close-btn { background: #ff5f57; }
.minimize-btn { background: #febc2e; }
.maximize-btn { background: #28c840; }

.title {
    flex: 1;
    text-align: center;
    font-size: 13px;
    color: #ccc;
}
```

See the [BrowserWindow API](../browser-window.md) documentation for more details on `titleBarStyle` and `transparent` window options.
