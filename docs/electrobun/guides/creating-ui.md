<!-- Source: https://blackboard.sh/electrobun/docs/guides/creating-ui -->

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

# Creating UI

Continuing on from the [Hello World](./hello-world.md) guide we're going to add some UI.

Currently our app is opening a browser window and just loading a url. Let's make a simple web browser.

Create a new folder `src/main-ui/` and add an `index.ts` file. This is where our browser code will go. The Electrobun CLI will automatically transpile this into javascript and make it available at the url `views://main-ui/index.js`.

```
import { Electroview } from "electrobun/view";

// Instantiate the electrobun browser api
const electrobun = new Electroview({ rpc: null });

window.loadPage = () => {
  const newUrl = document.querySelector("#urlInput").value;
  const webview = document.querySelector(".webview");

  webview.src = newUrl;
};

window.goBack = () => {
  const webview = document.querySelector(".webview");
  webview.goBack();
};

window.goForward = () => {
  const webview = document.querySelector(".webview");
  webview.goForward();
};
```

Now create an HTML file to load into the BrowserView that will import the transpiled javascript above:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Browser</title>
    <script src="views://main-ui/index.js"></script>
</head>
<body>
    <h1>My Web Browser</h1>
    <input type="text" id="urlInput" placeholder="Enter URL">
    <button onclick="loadPage()">Go</button>
    <button onclick="goBack()">Back</button>
    <button onclick="goForward()">Forward</button>

    <electrobun-webview class="webview" width="100%" height="100%" src="https://electrobun.dev">

</body>
</html>
```

Update `electrobun.config.ts` so that it knows to transpile the new TypeScript and copy the HTML file for `main-ui`:

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
    views: {
      "main-ui": {
        entrypoint: "src/main-ui/index.ts",
      },
    },
    copy: {
      "src/main-ui/index.html": "views/main-ui/index.html",
    },
  },
};
```

Finally, update the bun process code to load the new HTML file:

```
import { BrowserWindow } from "electrobun/bun";

const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "views://main-ui/index.html",
});
```

In your terminal press `ctrl+c` if the dev server is running and then `bun start` to rebuild and launch. You should now see a window with an input—type in `https://google.com` and hit go, then try the back and forward buttons.

You'll notice that while you can right click on the text input and choose copy and paste from the default context menu, keyboard shortcuts like `cmd+c`, `cmd+v`, and `cmd+a` don't work. Let's update our main bun file to set up an Application Edit menu to enable those keyboard shortcuts.

```
import { BrowserWindow, ApplicationMenu } from "electrobun/bun";

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ label: "Quit", role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      {
        label: "Custom Menu Item  🚀",
        action: "custom-action-1",
        tooltip: "I'm a tooltip",
      },
      {
        label: "Custom menu disabled",
        enabled: false,
        action: "custom-action-2",
      },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" },
    ],
  },
]);

const win = new BrowserWindow({
  title: "Hello Electrobun",
  url: "views://main-ui/index.html",
});
```

Your app now shows an Edit menu when focused, and because we used roles for the cut/copy/paste/selectAll menu items those global keyboard shortcuts now work in your app's URL input.

**Congratulations!** You just built a simple web browser in Electrobun!

[← Hello World](./hello-world.md) [Bundling & Distribution →](./bundling-and-distribution.md)
