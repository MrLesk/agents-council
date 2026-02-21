<!-- Source: https://blackboard.sh/electrobun/docs/apis/events -->

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

# Events

Event system in the main bun process

## Event Propagation

### Global Events

Most events can be listened to directly on the thing firing them or globally.

For most events, global event handlers fire first. Then handlers are fired in the sequence that they were registered in.

**Exception:** For window `close` events, per-window handlers fire before global handlers. This ensures that your window close handlers always run before the internal `exitOnLastWindowClosed` logic.

```
// listen to global event
Electrobun.events.on("will-navigate", (e) => {
    // handle
});

// listen to event on object
win.webview.on('will-navigate', (e) => {
    // handle
})
```

### Event.response

You can set a response on some events. Typically these are events initiated from zig which freeze the zig process while waiting for a reply from bun. An example of this is the BrowserView `will-navigate` where objc requires a synchronous response. By freezing the zig process and waiting for bun we allow bun to remain async while the events propagate.

```
Electrobun.events.on("will-navigate", (e) => {
  console.log(
    "example global will-navigate handler",
    e.data.url,
    e.data.webviewId
  );
  e.response = { allow: true };
});
```

As the event propagates through different handlers you can both read and write from the e.response value.

### Event.responseWasSet

A property that indicates the response has been set to something which can be useful when an event propagates through multiple handlers instead of trying to infer from the response value whether it was set or not.

### Event.clearResponse

If a previous handler has set the e.response to something and you want to clear it, you can simply call `e.clearResponse()`

### Event.data

Each event will set different event data

## Application Events

### open-url

Fired when the application is opened via a custom URL scheme (deep linking). This event is only available on macOS.

**Event data:**

-   `url` - The full URL that was used to open the app (e.g., `myapp://some/path?query=value`)

```
// Listen for URL scheme opens
Electrobun.events.on("open-url", (e) => {
  console.log("App opened with URL:", e.data.url);

  // Parse the URL to extract path and query params
  const url = new URL(e.data.url);
  console.log("Protocol:", url.protocol); // "myapp:"
  console.log("Host:", url.host);         // might be empty for simple URLs
  console.log("Pathname:", url.pathname); // "/some/path"
  console.log("Search:", url.searchParams.get("query")); // "value"
});
```

**Platform support:**

-   macOS: Fully supported. App must be in `/Applications` folder for URL scheme registration to work reliably.
-   Windows: Not yet supported
-   Linux: Not yet supported

**Setup:** To register URL schemes for your app, add them to your `electrobun.config.ts`. See the [Build Configuration](./cli/build-configuration.md) docs for details.

### before-quit

Fired before the application quits. This event fires regardless of what triggered the quit — whether from `Utils.quit()`, `process.exit()`, `exitOnLastWindowClosed`, or the updater.

You can cancel the quit by setting `event.response = { allow: false }`.

```
// Listen for quit and do cleanup
Electrobun.events.on("before-quit", (e) => {
  console.log("App is about to quit, saving state...");
  saveAppState();
});

// Prevent quit (e.g. unsaved changes)
Electrobun.events.on("before-quit", (e) => {
  if (hasUnsavedChanges()) {
    e.response = { allow: false };
  }
});
```

**Event data:** None

**Event response:**

-   `allow` - Set to `false` to cancel the quit. If not set or set to `true`, the application will proceed to quit.

## Shutdown Lifecycle

Electrobun provides a unified shutdown flow that ensures your app's `before-quit` handler fires regardless of how the quit was triggered.

### Quit Triggers

All of the following quit paths go through the same lifecycle:

-   **Programmatic:** Calling `Utils.quit()` from your app code
-   **process.exit():** Electrobun intercepts `process.exit()` and routes it through the quit lifecycle
-   **exitOnLastWindowClosed:** When the last window closes and this option is enabled
-   **System-initiated:** macOS dock icon → Quit, Cmd+Q, Windows taskbar close, etc.
-   **Signals:** Ctrl+C (SIGINT) and SIGTERM from the terminal or process managers
-   **Updater:** When the updater needs to restart the app

### Shutdown Sequence

When any quit trigger fires, the following sequence occurs:

1.  The `before-quit` event fires on the bun worker thread
2.  Your handlers run — you can do cleanup (save state, close connections, flush logs) or cancel the quit by setting `event.response = { allow: false }`
3.  If the quit is not cancelled, the native event loop stops (CEF shuts down, windows close)
4.  The process exits cleanly

**Linux note:** On Linux, system-initiated quit paths (Ctrl+C, window manager close, taskbar quit) do not currently fire `before-quit`. Programmatic quit via `Utils.quit()` and `process.exit()` works correctly on all platforms.

### Ctrl+C Behavior (Dev Mode)

In dev mode (`bun dev`), Ctrl+C triggers a graceful shutdown:

-   **First Ctrl+C:** Fires `before-quit`, gives your app time to clean up. The terminal stays busy (no prompt) until shutdown completes.
-   **Second Ctrl+C:** Force-kills the entire process tree immediately, including any CEF helper processes.
-   **Safety timeout:** If the app hangs during shutdown for more than 10 seconds, it is automatically force-killed.

### Comparison with Node.js / Bun Exit Events

Bun (and Node.js) provide built-in process exit events. Here's how they compare to Electrobun's `before-quit`:

Event

Async

Can Cancel

Fires on quit

Notes

`Electrobun.events.on("before-quit")`

Yes

Yes

Yes

Recommended for app cleanup

`process.on("exit")`

No (sync only)

No

Yes

Runs after before-quit. No async work (no `await`, no timers, no I/O).

`process.on("beforeExit")`

Yes

No

No

Does not fire when `process.exit()` is called explicitly, which is how Electrobun terminates.

**Recommendation:** Use Electrobun's `before-quit` event for all shutdown cleanup. It fires for every quit path, supports async operations, and can cancel the quit. The native `process.on("exit")` can be used as a last-resort sync hook, but `process.on("beforeExit")` will not fire in Electrobun apps.

### Example: Complete Shutdown Handling

```
import Electrobun from "electrobun/bun";

// Main cleanup handler — fires for all quit triggers
Electrobun.events.on("before-quit", async (e) => {
  console.log("Saving application state...");
  await saveAppState();
  await closeDatabase();
  console.log("Cleanup complete, quitting.");
});

// Optional: sync-only last-resort hook (no async, no I/O)
process.on("exit", (code) => {
  console.log("Process exiting with code:", code);
});
```
