<!-- Source: https://blackboard.sh/electrobun/docs/apis/browser-view -->

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

# BrowserView

> Create and control browser views (sometimes referred to as webviews).

Instead of creating BrowserViews directly from the bun process, you would use the [BrowserWindow](./browser-window.md) class which automatically creates a default BrowserView that fills the window, and then use [Webvew Tags](./browser/electrobun-webview-tag.md) within your html to create nested BrowserViews from the browser context.

```
// Most use cases: Access webview created by BrowserWindow or WebviewTag
import { BrowserView } from "electrobun/bun";
const webview = BrowserView.getById(id);

// or

const win = new BrowserWindow(/*....*/);

const webview = win.webview;

// or

// advnaced use cases: Create BrowserView directly
import { BrowserWindow } from "electrobun/bun";

const webview = new BrowserView({
  url: "views://mainview/index.html",
  frame: {
    width: 1800,
    height: 600,
    x: 2000,
    y: 2000,
  },
});
```

While you can create a BrowserView directly in bun it will only render when you add it to a window.

## Constructor Options

### frame

Set the Webview's dimensions relative to the window. The default webview created via `new BrowserWindow()` will be stretched to cover the window's dimensions automatically.

```
const webview = new BrowserView({
   frame: {
    width: 1800,
    height: 600,
    x: 2000,
    y: 2000,
  },
});
```

### url

Set the initial url for the window's default BrowserView to navigate to when it opens.

```
// Use any url on the internet
const webview = new BrowserView({
   url: "https://electrobun.dev",
});

// or use the views:// url scheme to load local
// content that you've bundled with your app.

const webview = new BrowserView({
   url: "views://mainview/index.html",
});
```

### html

Set an html string for the window's default BrowserView to load when it opens. Anything that would be valid in an html file including javascript and css can be used.

Use this instead of setting the `url` property.

```
const htmlString = "<html><head></head><body><h1>hello world</h1></body></html>";

const webview = new BrowserView({
   html: htmlString,

});
```

### partition

Partitions allow you to separate the browser session. Things like cookies and so on. For example if you have two BrowserViews with the same partition and log into gmail in one, the other will also be logged into gmail. If you use two different partitions then you could log into a different gmail account in each BrowserView.

```
// ephemeral partition. If you close and reopen your app
// even if you use the same partition name it will not
// have persisted.
const webview = new BrowserView({
   partition: "partition1",
});

// To make partitions persistent just prefix it with `persist:`
const webview = new BrowserView({
   partition: "persist:partition1",
});
```

### preload

Set a preload script for the window's default BrowserView to render after html is parsed but before any other javascript is executed. The preload script will be run after any navigation before the page's scripts are run.

You can use either inline javascript or a url.

```
// Use any url on the internet
const webview = new BrowserView({
   preload: "https://electrobun.dev/some/remote/file.js",
});

// or use the views:// preload scheme to load local
// content that you've bundled with your app.

const webview = new BrowserView({
   preload: "views://somebundledview/preloadscript.js",
});

// or use inline javascript

const webview = new BrowserView({
   preload: "document.body.innerHTML = 'Hello world'; console.log('hello console')",
});
```

### rpc

The RPC property allows you to establish RPC (remote procedure calls) between the bun process and this window's default BrowserView. In other words it lets you define functions that execute in the bun process that are callable and return a value back to the browser process and visa versa.

These RPC functions are asynchronous.

`src/shared/types.ts`

```
export type MyWebviewRPCType = {
  // functions that execute in the main process
  bun: RPCSchema<{
    requests: {
      someBunFunction: {
        params: {
          a: number;
          b: number;
        };
        response: number;
      };
    };
    messages: {
      logToBun: {
        msg: string;
      };
    };
  }>;
  // functions that execute in the browser context
  webview: RPCSchema<{
    requests: {
      someWebviewFunction: {
        params: {
          a: number;
          b: number;
        };
        response: number;
      };
    };
    messages: {
      logToWebview: {
        msg: string;
      };
    };
  }>;
};
```

`src/bun/index.ts`

```
import { BrowserView } from "electrobun/bun";
import { type MyWebviewRPCType } from "../shared/types";

// Create an RPC object for the bun handlers with the shared type
const myWebviewRPC = BrowserView.defineRPC<MyWebviewRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      someBunFunction: ({ a, b }) => {
        console.log(`browser asked me to do math with: ${a} and ${b}`);
        return a + b;
      },
    },
    // When the browser sends a message we can handle it
    // in the main bun process
    messages: {
      "*": (messageName, payload) => {
        console.log("global message handler", messageName, payload);
      },
      logToBun: ({ msg }) => {
        console.log("Log to bun: ", msg);
      },
    },
  },
});

// Pass the RPC object to the BrowserWindow, which will set it
// on the window's default BrowserView
const webview = new BrowserView({
  title: "my window",
  url: "views://mainview/index.html",
  frame: {
    width: 1800,
    height: 600,
    x: 2000,
    y: 2000,
  },
  rpc: myWebviewRPC,
});

// ... later on

// Note: These RPC methods will inherit types from the shared type

// Call a browser function from bun
const answer = await webview.rpc.someWebviewFunction(4, 6);

// Send a message to the BrowserView from bun
webview.rpc.logToBrowser("my message");
```

The above code snippet shows defining the bun process rpc handlers and calling the browser process handlers from bun. To see how to handle the Browser context code take a look at the [Browser API](./browser-view.md).

### sandbox

When set to `true`, the BrowserView runs in sandbox mode. This is a security feature that disables RPC (remote procedure calls) and only allows event emission. Use sandbox mode for untrusted content like remote URLs.

```
// Sandboxed BrowserView for untrusted content
const webview = new BrowserView({
  url: "https://untrusted-site.com",
  sandbox: true,  // Disables RPC, events still work
});

// Events work normally in sandbox mode
webview.on("dom-ready", () => {
  console.log("Page loaded in sandboxed view");
});

webview.on("will-navigate", (event) => {
  console.log("Navigation:", event.data.detail);
});
```

See the [BrowserWindow sandbox documentation](./browser-window.md) for a complete overview of the security model and use cases.

## Static Methods

### BrowserView.getAll

Get a list of references to all BrowserViews. This includes the default Browserviews created via `new BrowserWindow`, Browserviews created as nested OOPIFs via [WebviewTags](./browser/electrobun-webview-tag.md), and BrowserViews that you create manually via `new BrowserView()` for advanced use cases.

```
import { BrowserView } from "electrobun/bun";

const webviews = BrowserView.getAll();
```

### BrowserView.getById

Get a specific BrowserView by id. This includes the default Browserviews created via `new BrowserWindow`, Browserviews created as nested OOPIFs via [WebviewTags](./browser/electrobun-webview-tag.md), and BrowserViews that you create manually via `new BrowserView()` for advanced use cases.

```
import { BrowserWindow, BrowserView } from "electrobun/bun";

const win = new BrowserWindow({
  title: "my url window",
  url: "views://mainview/index.html",
  frame: {
    width: 1800,
    height: 600,
    x: 2000,
    y: 2000,
  },
});

const webview = BrowserView.getById(win.webview.id);
```

### BrowserView.defineRPC

Whenever you create a BrowserWindow with async RPC you'll use this static method to create an RPC instance.

`src/shared/types.ts`

```
export type MyWebviewRPCType = {
  // functions that execute in the main process
  bun: RPCSchema<{
    requests: {
      someBunFunction: {
        params: {
          a: number;
          b: number;
        };
        response: number;
      };
    };
    messages: {
      logToBun: {
        msg: string;
      };
    };
  }>;
  // functions that execute in the browser context
  webview: RPCSchema<{
    requests: {
      someWebviewFunction: {
        params: {
          a: number;
          b: number;
        };
        response: number;
      };
    };
    messages: {
      logToWebview: {
        msg: string;
      };
    };
  }>;
};
```

`src/bun/index.ts`

```
import { BrowserWindow, BrowserView } from "electrobun/bun";
import { type MyWebviewRPCType } from "../shared/types";

// Create an RPC object for the bun handlers with the shared type
const myWebviewRPC = BrowserView.defineRPC<MyWebviewRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      someBunFunction: ({ a, b }) => {
        console.log(`browser asked me to do math with: ${a} and ${b}`);
        return a + b;
      },
    },
    // When the browser sends a message we can handle it
    // in the main bun process
    messages: {
      "*": (messageName, payload) => {
        console.log("global message handler", messageName, payload);
      },
      logToBun: ({ msg }) => {
        console.log("Log to bun: ", msg);
      },
    },
  },
});
```

## Methods

### executeJavascript

Execute arbitrary js in the webview. Unlike a `preload` script that you would typically set as a [BrowserWindow](./browser-window.md) configuratino option, `executeJavascript()` can be called at any time.

```
webview.executeJavascript('document.body.innerHTML += "hello"');
```

### loadURL

Load a url into the webview. This will navigate the webview and trigger navigation events.

```
webview.loadURL("https://electrobun.dev");

// or

webview.loadURL("views://mainview/somepage.html");
```

### loadHTML

Load html directly into the webview. This will completely replace any content that was previously loaded and trigger navigation events.

```
const htmlString =
  "<html><head></head><body><h1>hello world</h1></body></html>";

webview.loadHTML({
  html: htmlString,
});
```

### setNavigationRules

Set an allow/block list of URL patterns to control which URLs the webview can navigate to. Rules are evaluated synchronously in native code for maximum performance - no callback to the Bun process is needed.

**Rule Format:**

-   Rules use glob-style wildcards where `*` matches any characters
-   Prefix a rule with `^` to make it a block rule
-   Rules without the `^` prefix are allow rules
-   Rules are evaluated top-to-bottom, last matching rule wins
-   If no rule matches, navigation is allowed by default

```
// Block everything except specific domains
webview.setNavigationRules([
  "^*",                           // Block everything by default
  "*://en.wikipedia.org/*",       // Allow Wikipedia
  "*://upload.wikimedia.org/*",   // Allow Wikipedia images
]);

// Allow everything except specific domains
webview.setNavigationRules([
  "^*://malware.com/*",           // Block malware.com
  "^http://*",                    // Block all non-HTTPS
]);

// Complex rules - block admin paths even on allowed domains
webview.setNavigationRules([
  "^*",                           // Block everything by default
  "https://*.myapp.com/*",        // Allow myapp.com subdomains
  "https://api.trusted.com/*",    // Allow trusted API
  "^*/admin/*",                   // But block admin paths
]);

// Clear all rules (allow all navigation)
webview.setNavigationRules([]);
```

Navigation rules are evaluated entirely in native code without calling back to the Bun process, making them very fast. The `will-navigate` event will still fire with an `allowed` property indicating whether the navigation was permitted.

### findInPage

Search for text in the webview content. Highlights all matches and scrolls to the first (or next) match.

```
// Basic search - find "hello" moving forward
webview.findInPage("hello");

// Search backwards through matches
webview.findInPage("hello", { forward: false });

// Case-sensitive search
webview.findInPage("Hello", { matchCase: true });

// Combined options
webview.findInPage("query", {
  forward: true,      // Search direction (default: true)
  matchCase: false    // Case sensitivity (default: false)
});
```

Call `findInPage` repeatedly with the same search text to navigate through matches. Use `stopFindInPage()` to clear the search highlighting.

### stopFindInPage

Clear the find-in-page search highlighting and results.

```
// Clear search highlighting
webview.stopFindInPage();
```

### openDevTools

Open the DevTools window for this webview.

```
// Open DevTools for this webview
webview.openDevTools();
```

### closeDevTools

Close (or hide) the DevTools window for this webview.

```
// Close DevTools for this webview
webview.closeDevTools();
```

### toggleDevTools

Toggle the DevTools window for this webview.

```
// Toggle DevTools for this webview
webview.toggleDevTools();
```

DevTools behavior varies by renderer and platform. On macOS with CEF, Electrobun uses remote DevTools and opens a separate window per webview (including OOPIFs). Closing the window hides it so it can be re-opened safely.

### on(name, handler)

Subscribe to BrowserWindow events (see below)

## Properties

### id

This is the webview's id.

### hostWebviewId

This is only used for BrowserViews created using the [WebviewTag](./browser/electrobun-webview-tag.md) as a nested OOPIF. It's the id of the parent BrowserView.

### rpc

Once you've configured async rpc for a webview (typically via new BrowserWindow and Webview.defineRPC()) you'll use the rpc property to access the generated typed request and message methods.

```
// ... configure BrowserWindow with BrowserView.defineRPC and new BrowserWindow()

// Call a browser function from bun
const answer = await webview.rpc.someWebviewFunction(4, 6);

// Send a message to the BrowserView from bun
webview.rpc.logToBrowser("my message");
```

### rpc.request.evaluateJavascriptWithResponse

Electrobun includes a built-in RPC method that is automatically available on any webview with RPC configured. This allows you to execute arbitrary JavaScript in the webview and get a result back, without needing to define a custom RPC handler.

```
// Execute JavaScript and get a result back
const title = await webview.rpc.request.evaluateJavascriptWithResponse({
  script: "document.title"
});

// Works with expressions
const sum = await webview.rpc.request.evaluateJavascriptWithResponse({
  script: "2 + 2"
});

// Also handles async code - Promises are automatically awaited
const data = await webview.rpc.request.evaluateJavascriptWithResponse({
  script: "fetch('/api/data').then(r => r.json())"
});
```

This built-in method is useful for quick one-off JavaScript execution. For frequently used operations, consider defining typed RPC handlers instead for better type safety and maintainability.

## Events

### will-navigate

Fired when a webview is about to navigate. The event includes an `allowed` property indicating whether the navigation was permitted by the navigation rules (set via `setNavigationRules()`).

```
event.data = {
    url: string,      // The URL being navigated to
    allowed: boolean  // Whether navigation rules permit this URL
}
```

**Example - Monitor navigation decisions:**

```
// Set up navigation rules
webview.setNavigationRules([
  "^*",                        // Block everything by default
  "*://en.wikipedia.org/*",    // Allow Wikipedia
]);

// Listen for navigation attempts
webview.on("will-navigate", (e) => {
  console.log("Navigation to:", e.data.url);
  console.log("Allowed by rules:", e.data.allowed);

  if (!e.data.allowed) {
    // Navigation was blocked - you could show a message to the user
    console.log("Navigation blocked by rules");
  }
});
```

Navigation decisions are made synchronously in native code based on the rules set via `setNavigationRules()`. The `will-navigate` event is informational - by the time it fires, the allow/block decision has already been made. To control navigation, use `setNavigationRules()` to update the rules.

### did-navigate

After a webview navigates.

```
event.data = {
    detail: string // the url
}
```

### did-navigate-in-page

After an in-page navigation.

```
event.data = {
    detail: string // the url
}
```

### did-commit-navigation

The webview has started to receive content for the main frame after a navigation.

```
event.data = {
    detail: string // the url
}
```

### dom-ready

The dom ready event is fired from the browser context.

### new-window-open

The browser context is attempting to open a new window. For example a popup or a user right clicked and selected "open in new window".

```
event.detail = string | {
    url: string;
    isCmdClick: boolean;
    modifierFlags?: number;
    targetDisposition?: number;
    userGesture?: boolean;
}
```

**Properties:**

-   `url` - The URL that should be opened in the new window
-   `isCmdClick` - Whether the Command key (macOS) or Ctrl key was held during the click
-   `modifierFlags` - Additional modifier flags for the event (optional)
-   `targetDisposition` - Target disposition indicating how the new window should be opened (optional)
-   `userGesture` - Whether this new window request was triggered by a user gesture (optional)

**Example:**

```
webview.on("new-window-open", (event) => {
  if (typeof event.detail === 'object') {
    console.log("New window requested:", event.detail.url);
    console.log("Command/Ctrl key held:", event.detail.isCmdClick);
    console.log("User gesture:", event.detail.userGesture);
  } else {
    // Legacy string format
    console.log("New window requested:", event.detail);
  }
});
```

### download-started

Fired when a file download begins in the webview.

```
event.detail = {
    filename: string,  // The name of the file being downloaded
    path: string       // The full path where the file will be saved
}
```

**Example:**

```
webview.on("download-started", (event) => {
  console.log("Download started:", event.detail.filename);
  console.log("Saving to:", event.detail.path);
});
```

### download-progress

Fired periodically during a file download to report progress.

```
event.detail = {
    progress: number  // Download progress as a percentage (0-100)
}
```

**Example:**

```
webview.on("download-progress", (event) => {
  console.log(`Download progress: ${event.detail.progress}%`);
});
```

### download-completed

Fired when a file download completes successfully.

```
event.detail = {
    filename: string,  // The name of the downloaded file
    path: string       // The full path where the file was saved
}
```

**Example:**

```
webview.on("download-completed", (event) => {
  console.log("Download completed:", event.detail.filename);
  console.log("Saved to:", event.detail.path);
});
```

### download-failed

Fired when a file download fails or is canceled.

```
event.detail = {
    filename: string,  // The name of the file that failed to download
    path: string,      // The path where the file would have been saved
    error: string      // Error message describing why the download failed
}
```

**Example:**

```
webview.on("download-failed", (event) => {
  console.log("Download failed:", event.detail.filename);
  console.log("Error:", event.detail.error);
});
```
