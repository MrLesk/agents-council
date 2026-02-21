<!-- Source: https://blackboard.sh/electrobun/docs/apis/browser/electrobun-webview-tag -->

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

# Electrobun Webview Tag

## Introduction

Electrobun's custom webview tag implementation behaves similarly to an enhanced iframe, but with key differences in capabilities and isolation. It serves as a positional anchor within the DOM, communicating with a Zig backend to manage a distinct, isolated BrowserView. This separation ensures full content isolation from the host webview, enhancing both security and performance.

## Basic Usage

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webview tag test</title>
    <script src="views://webviewtag/index.js"></script>
  </head>

  <body>
    <electrobun-webview src="https://electrobun.dev"></electrobun-webview>
  </body>
</html>
```

## Compatibility

The Electrobun webview tag integrates seamlessly with any reactive JavaScript framework, such as React or SolidJS, allowing for dynamic interactions and updates without disrupting the isolation of the webview's contents.

The way the implementation currently works, the html element is just a positional anchor that reports its position and relays events to zig which manages a completely separate BrowserView and overlays it at the same coordinates within the window.

## How is this different to Electron's webview tag

### Chrome plans to deprecate their webview tag

Electron's webview tag is based on a Chrome feature/api designed for Chrome apps which has been deprecated since 2020. You can read about that on [Electron's Github](https://github.com/electron/electron/issues/34356) and in [Chrome's developer docs](https://developer.chrome.com/docs/apps/reference/webviewTag). The warning declares it "remains supported for Enterprise and Education customers on ChromeOS until at least Jan 2025" which is fast approaching.

It's unknown what Electron will do when and if Chrome actually removes webview tag support from Chrome.

Unlike Electron's reliance on Chrome's now-deprecated webview tag, Electrobun introduces its own robust implementation that does not depend on Chrome's lifecycle. This independence ensures longevity and stability for applications using Electrobun's framework, even as Chrome phases out its support.

### Electrobun's webview tag is a separate layer

Because Electrobun's webview tag implementation uses a div anchor and then positions a separate isolated BrowserView above the parent BrowserView there are some interesting edge cases where you may want to click on the parent document or do things within the parent DOM, so Electrobun provides various special methods for handling those situations. For example ways to mirror a screenshot of the webview tag's contents to the host's anchor and hide it or stream an image of the contents.

## Properties and Attributes

### src

**Type:** `string`  
**Description:** URL of the web page to load in the webview.

### html

**Type:** `string`  
**Description:** HTML content to be directly loaded into the webview, useful for dynamic content generation.

### preload

**Type:** `string`  
**Description:** Path to a script that should be preloaded before any other scripts run in the webview.

### partition

**Type:** `string`  
**Description:** Sets a partition to provide separate storage for different sessions, useful in multi-user applications.

### sandbox

**Type:** `boolean`  
**Description:** When set to true, creates the webview in sandbox mode. Sandbox mode disables RPC communication and only allows event emission, making it suitable for loading untrusted third-party content securely.

**Security Model:** In sandbox mode:

-   Events (dom-ready, did-navigate, will-navigate, etc.) still work normally
-   Navigation controls (loadURL, goBack, goForward, reload) still work
-   RPC communication is completely disabled - no messages can be sent between the webview and your application code
-   The webview content cannot access any application APIs or trigger custom handlers

```
<!-- Load untrusted content safely in sandbox mode -->
<electrobun-webview
  src="https://untrusted-site.com"
  sandbox
></electrobun-webview>

<!-- Combine sandbox with navigation rules for maximum security -->
<electrobun-webview
  id="sandbox-webview"
  src="https://example.com"
  sandbox
></electrobun-webview>

<script>
  // Navigation rules still work with sandboxed webviews
  document.getElementById('sandbox-webview').setNavigationRules([
    "^*",                        // Block everything by default
    "*://example.com/*",         // Allow example.com
    "*://cdn.example.com/*",     // Allow CDN
  ]);

  // Events still work in sandbox mode
  document.getElementById('sandbox-webview').on('did-navigate', (e) => {
    console.log('Sandboxed webview navigated to:', e.detail.url);
  });
</script>
```

### transparent

**Type:** `boolean`  
**Description:** When set to true, makes the webview transparent, allowing underlying elements to be visible.

### passthroughEnabled

**Type:** `boolean`  
**Description:** Enables or disables mouse and touch events to pass through to underlying elements.

### hidden

**Type:** `boolean`  
**Description:** Controls the visibility of the webview.

### delegateMode

**Type:** `boolean`  
**Description:** Activates a mode where input is delegated to the webview even when it is visually mirrored to another element.

### hiddenMirrorMode

**Type:** `boolean`  
**Description:** Enables a mode where the webview is hidden and mirrored, allowing smooth interactions during transitions or animations.

### wasZeroRect

**Type:** `boolean`  
**Description:** Indicates if the webview had zero dimensions at any point, used internally to optimize rendering and updates.

### webviewId

**Type:** `number`  
**Description:** A unique identifier for the webview instance, automatically managed by the system.

### id

**Type:** `string`  
**Description:** The DOM ID for the webview element, automatically set to ensure uniqueness.

## Methods

### callAsyncJavaScript

**Parameters:** `{ script: string }`  
**Returns:** `Promise`  
**Description:** Executes JavaScript code asynchronously within the webview and returns a promise with the result.

### canGoBack

**Returns:** `Promise<boolean>`  
**Description:** Determines if the webview can navigate backward.

### canGoForward

**Returns:** `Promise<boolean>`  
**Description:** Determines if the webview can navigate forward.

### on

**Parameters:** `event: WebviewEventTypes, listener: () => {}`  
**Description:** Attach event listeners for webview-specific events such as navigation and loading.

### off

**Parameters:** `event: WebviewEventTypes, listener: () => {}`  
**Description:** Detach event listeners for webview-specific events.

### syncDimensions

**Parameters:** `force: boolean = false`  
**Description:** Synchronizes the dimensions and position of the webview with its anchor element in the DOM, optionally forcing an update.

### goBack

**Description:** Navigates the webview back to the previous page.

### goForward

**Description:** Navigates the webview forward to the next page.

### reload

**Description:** Reloads the current content in the webview.

### loadURL

**Parameters:** `url: string`  
**Description:** Loads a given URL into the webview, similar to setting the `src` attribute.

### setNavigationRules

**Parameters:** `rules: string[]`  
**Description:** Set an allow/block list of URL patterns to control which URLs the webview can navigate to. Rules are evaluated synchronously in native code for maximum performance.

**Rule Format:**

-   Rules use glob-style wildcards where `*` matches any characters
-   Prefix a rule with `^` to make it a block rule
-   Rules without the `^` prefix are allow rules
-   Rules are evaluated top-to-bottom, last matching rule wins
-   If no rule matches, navigation is allowed by default

```
// Block everything except specific domains
document.querySelector('electrobun-webview').setNavigationRules([
  "^*",                           // Block everything by default
  "*://en.wikipedia.org/*",       // Allow Wikipedia
  "*://upload.wikimedia.org/*",   // Allow Wikipedia images
]);

// Allow everything except specific domains
document.querySelector('electrobun-webview').setNavigationRules([
  "^*://malware.com/*",           // Block malware.com
  "^http://*",                    // Block all non-HTTPS
]);
```

### syncScreenshot

**Parameters:** `callback?: () => void`  
**Description:** Captures and synchronizes a screenshot of the webview's contents, useful for visual mirroring.

### clearScreenImage

**Description:** Clears any images set as the webview anchor's background, typically used in conjunction with transparency and mirroring modes.

### tryClearScreenImage

**Description:** Attempts to clear the background image of the webview anchor if conditions are met.

### toggleTransparent

**Parameters:** `transparent?: boolean, bypassState?: boolean`  
**Description:** Toggles the transparency state of the webview.

### togglePassthrough

**Parameters:** `enablePassthrough?: boolean, bypassState?: boolean`  
**Description:** Toggles the ability for mouse and touch events to pass through the webview.

### toggleHidden

**Parameters:** `hidden?: boolean, bypassState?: boolean`  
**Description:** Toggles the visibility of the webview.

### toggleDelegateMode

**Parameters:** `delegateMode?: boolean`  
**Description:** Toggles the delegate mode for input events within the webview.

### toggleHiddenMirrorMode

**Parameters:** `force: boolean`  
**Description:** Toggles the hidden mirror mode, optimizing interaction during transitions or animations.

## Events

Use the `on` method to listen for events from the webview. Events are dispatched as CustomEvents with details in the `detail` property.

### dom-ready

**Description:** Fired when the DOM of the webview's content has finished loading.

### did-navigate

**Description:** Fired when the webview navigates to a new URL.

### did-navigate-in-page

**Description:** Fired for in-page navigations (e.g., hash changes).

### did-commit-navigation

**Description:** Fired when the webview commits to navigating to a new URL.

### new-window-open

**Description:** Fired when the webview attempts to open a new window (e.g., via `window.open()` or a link with `target="_blank"`).

### host-message

**Description:** Fired when the webview's preload script sends a message to the host using `window.__electrobunSendToHost()`. The message payload is available in `event.detail`.

```
// Listen for messages from the webview's preload script
document.querySelector('electrobun-webview').on('host-message', (event) => {
  console.log('Received message from webview:', event.detail);
  // event.detail contains the message object sent from the preload
});
```

## Preload Scripts

Preload scripts run in the context of the webview before any page scripts execute. They have access to special APIs for communicating with the host.

### window.\_\_electrobunSendToHost(message)

**Parameters:** `message: any` (will be JSON serialized)  
**Description:** Sends a message from the webview's preload script to the host BrowserWindow. The message will be received via the `host-message` event on the webview element.

This enables secure communication from nested webviews back to the parent page, allowing preload scripts to forward user interactions, keyboard events, or custom data.

```
<!-- Host page -->
<electrobun-webview
  id="myWebview"
  src="https://example.com"
  preload="
    // Forward click events to the host
    document.addEventListener('click', (e) => {
      window.__electrobunSendToHost({
        type: 'click',
        target: e.target.tagName,
        x: e.clientX,
        y: e.clientY
      });
    });

    // Forward keyboard events to the host
    document.addEventListener('keydown', (e) => {
      window.__electrobunSendToHost({
        type: 'keydown',
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      });
    });
  "
></electrobun-webview>

<script>
  document.getElementById('myWebview').on('host-message', (event) => {
    const msg = event.detail;
    if (msg.type === 'keydown') {
      console.log('Key pressed in webview:', msg.key);
      // Handle the keyboard event in the host context
    }
  });
</script>
```

**Note:** The `__electrobunSendToHost` function is only available inside preload scripts running within an `electrobun-webview`. It is not available in regular page scripts.

## Security Considerations

When embedding third-party content in your application, security is paramount. Electrobun provides multiple layers of protection:

### Sandbox Mode

Always use `sandbox` attribute when loading untrusted content. This completely disables RPC communication, preventing the loaded content from accessing any application APIs.

```
<!-- ALWAYS use sandbox for untrusted content -->
<electrobun-webview
  src="https://untrusted-third-party.com"
  sandbox
></electrobun-webview>
```

### Navigation Rules

Combine sandbox mode with navigation rules to restrict where the webview can navigate. This prevents redirects to malicious sites.

```
const webview = document.querySelector('electrobun-webview');

// Strict allowlist approach
webview.setNavigationRules([
  "^*",                              // Block everything by default
  "*://trusted-domain.com/*",        // Allow specific trusted domains
  "*://cdn.trusted-domain.com/*",    // Allow associated CDNs
]);
```

### Process Isolation

Each `electrobun-webview` runs in a completely separate browser process. This provides:

-   **Memory isolation:** Malicious content cannot read memory from your application
-   **Crash isolation:** If the embedded content crashes, your application continues running
-   **Security boundary:** Browser exploits are contained within the isolated process

### Best Practices

-   **Always sandbox untrusted content:** Use the `sandbox` attribute for any content you don't fully control
-   **Use navigation rules:** Restrict navigation to prevent redirects to malicious sites
-   **Use partitions:** Isolate session storage between different webviews to prevent data leakage
-   **Validate host messages:** If using preload scripts with `__electrobunSendToHost`, always validate and sanitize received messages
-   **Prefer HTTPS:** Block HTTP content with navigation rules to ensure encrypted connections

```
<!-- Complete secure configuration example -->
<electrobun-webview
  id="secure-webview"
  src="https://third-party-widget.com"
  sandbox
  partition="third-party-widget"
></electrobun-webview>

<script>
  const webview = document.getElementById('secure-webview');

  // Restrict navigation
  webview.setNavigationRules([
    "^http://*",                         // Block all HTTP (require HTTPS)
    "^*",                                // Block everything else by default
    "*://third-party-widget.com/*",      // Allow the widget domain
  ]);

  // Monitor navigation for security events
  webview.on('did-navigate', (e) => {
    console.log('Navigation:', e.detail.url);
  });
</script>
```
