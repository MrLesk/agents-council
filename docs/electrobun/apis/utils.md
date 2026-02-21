<!-- Source: https://blackboard.sh/electrobun/docs/apis/utils -->

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

# Utils

Various utilities for Electrobun apps.

```
import {Utils} from "electrobun/bun";
```

## moveToTrash

Move a file or folder on your system to the Trash (recycle bin).

On MacOS when you move something to trash from the finder you can open the trash can and see a "restore" button that will put the files/folders back where they were deleted from

When using moveToTrash in Electrobun it moves it to the trash can but does not enable the "restore" button. To restore you will need to manually drag the files and folders back to their originating folder

```
Utils.moveToTrash(absolutePath)
```

## showItemInFolder

Open the file manager (Finder on macOS, Explorer on Windows, etc.) and select the specified file or folder.

```
Utils.showItemInFolder(absolutePath)
```

## openExternal

Open a URL in the default browser or appropriate application. Works with `http://`, `https://`, `mailto:`, custom URL schemes, and more.

### Parameters

Parameter

Type

Description

`url`

`string`

The URL to open (e.g., "https://example.com")

### Returns

`boolean` - Returns `true` if the URL was opened successfully, `false` otherwise.

### Examples

```
// Open a website in the default browser
Utils.openExternal("https://example.com");

// Open an email compose window
Utils.openExternal("mailto:[email protected]?subject=Help");

// Open a custom URL scheme (if registered)
Utils.openExternal("slack://open");

// Open with file:// protocol
Utils.openExternal("file:///Users/me/Documents/report.pdf");
```

## openPath

Open a file or folder with its default application. For files, this opens them with the associated application (e.g., `.pdf` opens with the default PDF reader). For folders, this opens them in the file manager.

### Parameters

Parameter

Type

Description

`path`

`string`

The absolute path to the file or folder

### Returns

`boolean` - Returns `true` if the path was opened successfully, `false` otherwise.

### Examples

```
// Open a PDF with the default PDF reader
Utils.openPath("/Users/me/Documents/report.pdf");

// Open an image with the default image viewer
Utils.openPath("/Users/me/Pictures/photo.jpg");

// Open a folder in the file manager
Utils.openPath("/Users/me/Downloads");

// Open a text file with the default text editor
Utils.openPath("/Users/me/notes.txt");
```

**Difference between openExternal and openPath:**

-   `openExternal()` - Takes a URL (with protocol like `https://`, `mailto:`, `file://`)
-   `openPath()` - Takes a file system path (e.g., `/Users/me/file.pdf`)

Use `openExternal()` for web URLs and email links. Use `openPath()` for local files and folders.

## showNotification

Display a native desktop notification. Works on macOS, Windows, and Linux.

### Options

Property

Type

Required

Description

`title`

`string`

Yes

The title of the notification

`body`

`string`

No

The main body text of the notification

`subtitle`

`string`

No

A subtitle (macOS displays this between title and body; other platforms show it as an additional line)

`silent`

`boolean`

No

If true, the notification will not play a sound (default: false)

### Example: Simple Notification

```
Utils.showNotification({
    title: "Download Complete"
});
```

### Example: Notification with Body

```
Utils.showNotification({
    title: "New Message",
    body: "You have a new message from John"
});
```

### Example: Full Notification

```
Utils.showNotification({
    title: "Reminder",
    subtitle: "Calendar Event",
    body: "Team meeting in 15 minutes",
    silent: false
});
```

### Example: Silent Notification

```
Utils.showNotification({
    title: "Sync Complete",
    body: "All files have been synchronized",
    silent: true
});
```

### Platform Notes

-   **macOS:** Uses NSUserNotificationCenter. Notifications appear in Notification Center.
-   **Windows:** Uses Shell balloon notifications. The notification appears near the system tray.
-   **Linux:** Uses `notify-send` command. Requires `libnotify-bin` to be installed (included by default on most desktop distributions).

## openFileDialog

Open a file dialogue to let the user specify a file or folder and return the path to your app. Typically you would have an event handler in the browser context like clicking an "open" button, this would trigger an rpc call to bun, which would call ``openFileDialog()`}>`` and then optionally pass the response back to the browser context via rpc after the user has made their selection

```
// To simplify this example we'll just show a dialogue after a 2 second timeout

setTimeout(async () => {

    const chosenPaths = await Utils.openFileDialog({
        startingFolder: join(homedir(), "Desktop"),
        allowedFileTypes: "*",
        // allowedFileTypes: "png,jpg",
        canChooseFiles: true,
        canChooseDirectory: false,
        allowsMultipleSelection: true,
    });

    console.log("chosen paths", chosenPaths);
 }, 2000);
```

## showMessageBox

Display a native message box dialog with custom buttons and get the user's response. Similar to Electron's `dialog.showMessageBox()`.

### Options

Property

Type

Default

Description

`type`

`"info" | "warning" | "error" | "question"`

`"info"`

The type of dialog, affects the icon displayed

`title`

`string`

`""`

The title of the dialog window

`message`

`string`

`""`

The main message to display

`detail`

`string`

`""`

Additional detail text (displayed smaller on some platforms)

`buttons`

`string[]`

`["OK"]`

Array of button labels

`defaultId`

`number`

`0`

Index of the button that should be focused by default

`cancelId`

`number`

`-1`

Index of the button to return when dialog is cancelled (Escape key or close button)

### Return Value

Returns a `Promise<{ response: number }>` where `response` is the 0-based index of the clicked button.

### Example: Confirmation Dialog

```
const { response } = await Utils.showMessageBox({
    type: "question",
    title: "Confirm Delete",
    message: "Are you sure you want to delete this file?",
    detail: "This action cannot be undone.",
    buttons: ["Delete", "Cancel"],
    defaultId: 1,  // Focus "Cancel" by default
    cancelId: 1    // Pressing Escape returns 1 (Cancel)
});

if (response === 0) {
    // User clicked "Delete"
    console.log("Deleting file...");
} else {
    // User clicked "Cancel" or closed the dialog
    console.log("Cancelled");
}
```

### Example: Error Dialog

```
await Utils.showMessageBox({
    type: "error",
    title: "Error",
    message: "Failed to save file",
    detail: "The disk may be full or you may not have write permissions.",
    buttons: ["OK"]
});
```

### Example: Multi-choice Dialog

```
const { response } = await Utils.showMessageBox({
    type: "warning",
    title: "Unsaved Changes",
    message: "You have unsaved changes.",
    detail: "What would you like to do?",
    buttons: ["Save", "Don't Save", "Cancel"],
    defaultId: 0,
    cancelId: 2
});

switch (response) {
    case 0: saveAndClose(); break;
    case 1: closeWithoutSaving(); break;
    case 2: /* cancelled */ break;
}
```

## quit

Gracefully quit the application. This fires a `before-quit` event (which can cancel the quit), then performs native cleanup (including CEF shutdown) and terminates the process.

You don't need to call `quit()` directly for most quit scenarios — Electrobun automatically routes system-initiated quits (dock icon, Cmd+Q, Ctrl+C, SIGTERM, window close) through the same lifecycle. Calling `process.exit()` is also intercepted and routed through `quit()`.

```
Utils.quit()

// The quit can be cancelled via the before-quit event
Electrobun.events.on("before-quit", (e) => {
  if (hasUnsavedChanges()) {
    e.response = { allow: false };
  }
});
```

See [Events — Shutdown Lifecycle](./events.md#shutdown-lifecycle) for the full list of quit triggers, shutdown sequence, and how `before-quit` compares to bun's native `process.on("exit")`.

## Clipboard API

Read and write to the system clipboard. Similar to Electron's clipboard module.

### clipboardReadText

Read text from the system clipboard.

```
const text = Utils.clipboardReadText();
if (text) {
    console.log("Clipboard contains:", text);
}
```

### clipboardWriteText

Write text to the system clipboard.

```
Utils.clipboardWriteText("Hello from Electrobun!");
```

### clipboardReadImage

Read image from the clipboard as PNG data. Returns a `Uint8Array` containing PNG bytes, or `null` if no image is available.

```
const pngData = Utils.clipboardReadImage();
if (pngData) {
    // Write to file
    await Bun.write("clipboard-image.png", pngData);
    console.log("Saved clipboard image:", pngData.length, "bytes");
}
```

### clipboardWriteImage

Write PNG image data to the clipboard.

```
// Read a PNG file and write to clipboard
const pngData = await Bun.file("image.png").arrayBuffer();
Utils.clipboardWriteImage(new Uint8Array(pngData));
```

### clipboardClear

Clear the clipboard contents.

```
Utils.clipboardClear();
```

### clipboardAvailableFormats

Get the available formats in the clipboard. Returns an array of format names.

```
const formats = Utils.clipboardAvailableFormats();
console.log("Clipboard contains:", formats);
// Possible values: ["text", "image", "files", "html"]
```

### Example: Copy and Paste Text

```
// Copy text to clipboard
Utils.clipboardWriteText("Hello World");

// Later, read it back
const text = Utils.clipboardReadText();
console.log(text); // "Hello World"
```

### Example: Check Clipboard Contents

```
const formats = Utils.clipboardAvailableFormats();

if (formats.includes("text")) {
    const text = Utils.clipboardReadText();
    console.log("Text:", text);
}

if (formats.includes("image")) {
    const imageData = Utils.clipboardReadImage();
    console.log("Image size:", imageData?.length, "bytes");
}
```

## Paths

Cross-platform access to common OS directories and app-scoped directories. All properties are synchronous getters.

```
import { Utils } from "electrobun/bun";

console.log(Utils.paths.home);      // Home directory
console.log(Utils.paths.downloads); // Downloads folder
console.log(Utils.paths.userData);  // App-specific data directory
```

### OS Directories

```
Utils.paths.home
// macOS:   ~
// Windows: %USERPROFILE%
// Linux:   ~

Utils.paths.appData
// macOS:   ~/Library/Application Support
// Windows: %LOCALAPPDATA%
// Linux:   $XDG_DATA_HOME or ~/.local/share

Utils.paths.config
// macOS:   ~/Library/Application Support
// Windows: %APPDATA%
// Linux:   $XDG_CONFIG_HOME or ~/.config

Utils.paths.cache
// macOS:   ~/Library/Caches
// Windows: %LOCALAPPDATA%
// Linux:   $XDG_CACHE_HOME or ~/.cache

Utils.paths.temp
// macOS:   $TMPDIR
// Windows: %TEMP%
// Linux:   /tmp

Utils.paths.logs
// macOS:   ~/Library/Logs
// Windows: %LOCALAPPDATA%
// Linux:   $XDG_STATE_HOME or ~/.local/state

Utils.paths.documents
// macOS:   ~/Documents
// Windows: %USERPROFILE%\Documents
// Linux:   $XDG_DOCUMENTS_DIR or ~/Documents

Utils.paths.downloads
// macOS:   ~/Downloads
// Windows: %USERPROFILE%\Downloads
// Linux:   $XDG_DOWNLOAD_DIR or ~/Downloads

Utils.paths.desktop
// macOS:   ~/Desktop
// Windows: %USERPROFILE%\Desktop
// Linux:   $XDG_DESKTOP_DIR or ~/Desktop

Utils.paths.pictures
// macOS:   ~/Pictures
// Windows: %USERPROFILE%\Pictures
// Linux:   $XDG_PICTURES_DIR or ~/Pictures

Utils.paths.music
// macOS:   ~/Music
// Windows: %USERPROFILE%\Music
// Linux:   $XDG_MUSIC_DIR or ~/Music

Utils.paths.videos
// macOS:   ~/Movies
// Windows: %USERPROFILE%\Videos
// Linux:   $XDG_VIDEOS_DIR or ~/Videos
```

### App-Scoped Directories

These paths are scoped to your application using the `identifier` and `channel` from your app's `version.json`. The values are lazy-loaded on first access.

```
Utils.paths.userData   // {appData}/{identifier}/{channel}
Utils.paths.userCache  // {cache}/{identifier}/{channel}
Utils.paths.userLogs   // {logs}/{identifier}/{channel}

// Example: app with identifier "com.mycompany.myapp", channel "canary", on macOS:
Utils.paths.userData   // ~/Library/Application Support/com.mycompany.myapp/canary
Utils.paths.userCache  // ~/Library/Caches/com.mycompany.myapp/canary
Utils.paths.userLogs   // ~/Library/Logs/com.mycompany.myapp/canary
```

### Example: Store App Data

```
import { Utils } from "electrobun/bun";
import { join } from "path";
import { mkdirSync, writeFileSync, readFileSync } from "fs";

// Ensure the directory exists
mkdirSync(Utils.paths.userData, { recursive: true });

// Write a settings file
const settingsPath = join(Utils.paths.userData, "settings.json");
writeFileSync(settingsPath, JSON.stringify({ theme: "dark" }));

// Read it back
const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
```

### Example: Save Downloads to User's Downloads Folder

```
import { Utils } from "electrobun/bun";
import { join } from "path";

const savePath = join(Utils.paths.downloads, "report.pdf");
await Bun.write(savePath, pdfData);
```

**Linux XDG Support:** On Linux, user directories (`documents`, `downloads`, etc.) are resolved by reading `~/.config/user-dirs.dirs`. If the file is not present, standard fallbacks like `~/Documents` are used.

## GlobalShortcut

Register global keyboard shortcuts that work even when your app doesn't have focus. Similar to Electron's globalShortcut module.

```
import { GlobalShortcut } from "electrobun/bun";
```

### register

Register a global keyboard shortcut with a callback function.

Parameter

Type

Description

`accelerator`

`string`

The keyboard shortcut (e.g., "CommandOrControl+Shift+Space")

`callback`

`() => void`

Function to call when the shortcut is triggered

**Returns:** `boolean` - true if registered successfully, false otherwise

```
const success = GlobalShortcut.register("CommandOrControl+Shift+Space", () => {
    console.log("Global shortcut triggered!");
    // Show your app, toggle a feature, etc.
});

if (!success) {
    console.log("Failed to register shortcut (may already be in use)");
}
```

### unregister

Unregister a previously registered global shortcut.

```
GlobalShortcut.unregister("CommandOrControl+Shift+Space");
```

### unregisterAll

Unregister all global shortcuts registered by your app.

```
GlobalShortcut.unregisterAll();
```

### isRegistered

Check if a shortcut is currently registered.

```
if (GlobalShortcut.isRegistered("CommandOrControl+Shift+Space")) {
    console.log("Shortcut is active");
}
```

### Accelerator Syntax

Accelerators are strings that describe keyboard shortcuts. They consist of modifier keys and a regular key, separated by `+`.

**Modifiers:**

-   `Command` / `Cmd` - Command key (macOS)
-   `Control` / `Ctrl` - Control key
-   `CommandOrControl` / `CmdOrCtrl` - Command on macOS, Control on Windows/Linux
-   `Alt` / `Option` - Alt key (Option on macOS)
-   `Shift` - Shift key
-   `Super` / `Meta` / `Win` - Windows key / Super key

**Keys:**

-   Letters: `A` through `Z`
-   Numbers: `0` through `9`
-   Function keys: `F1` through `F12`
-   Special: `Space`, `Enter`, `Tab`, `Escape`, `Backspace`, `Delete`
-   Navigation: `Up`, `Down`, `Left`, `Right`, `Home`, `End`, `PageUp`, `PageDown`
-   Symbols: `-`, `=`, `[`, `]`, `\`, `;`, `'`, `,`, `.`, `/`, `` \` ``

### Example: Toggle App Visibility

```
import { GlobalShortcut, BrowserWindow } from "electrobun/bun";

// Register a shortcut to show/hide the main window
GlobalShortcut.register("CommandOrControl+Shift+H", () => {
    const win = BrowserWindow.getById(1);
    if (win) {
        // Toggle visibility
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.focus();
        }
    }
});
```

### Platform Notes

-   **macOS:** Uses `NSEvent addGlobalMonitorForEventsMatchingMask`. Shortcuts are observed but cannot block the event from reaching other apps.
-   **Windows:** Uses `RegisterHotKey`. Provides exclusive access to the shortcut.
-   **Linux:** Uses X11 `XGrabKey`. Provides exclusive access to the shortcut. Requires X11 display server.

**Note:** Some shortcuts may already be reserved by the operating system or other applications. If registration fails, try a different key combination.

## Screen

The Screen module provides information about connected displays and the cursor position. This is useful for positioning windows, detecting multi-monitor setups, and getting screen dimensions.

```
import { Screen } from "electrobun/bun";
```

### Types

```
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Display {
  id: number;           // Unique display identifier
  bounds: Rectangle;    // Full screen bounds
  workArea: Rectangle;  // Available area (excludes dock/taskbar/menu bar)
  scaleFactor: number;  // DPI scale (e.g., 2.0 for Retina/HiDPI)
  isPrimary: boolean;   // Whether this is the primary display
}

interface Point {
  x: number;
  y: number;
}
```

### Screen.getPrimaryDisplay()

Returns the primary display information.

```
const primary = Screen.getPrimaryDisplay();
console.log(`Primary display: ${primary.bounds.width}x${primary.bounds.height}`);
console.log(`Scale factor: ${primary.scaleFactor}x`);
console.log(`Work area: ${primary.workArea.width}x${primary.workArea.height}`);
```

### Screen.getAllDisplays()

Returns an array of all connected displays.

```
const displays = Screen.getAllDisplays();
console.log(`Found ${displays.length} display(s)`);

displays.forEach((display, index) => {
  console.log(`Display ${index}: ${display.bounds.width}x${display.bounds.height}`);
  console.log(`  Position: (${display.bounds.x}, ${display.bounds.y})`);
  console.log(`  Scale: ${display.scaleFactor}x`);
  console.log(`  Primary: ${display.isPrimary}`);
});
```

### Screen.getCursorScreenPoint()

Returns the current cursor position in screen coordinates.

```
const cursor = Screen.getCursorScreenPoint();
console.log(`Cursor at: (${cursor.x}, ${cursor.y})`);
```

### Example: Center Window on Primary Display

```
import { Screen, BrowserWindow } from "electrobun/bun";

const primary = Screen.getPrimaryDisplay();
const windowWidth = 800;
const windowHeight = 600;

// Calculate centered position
const x = Math.round((primary.workArea.width - windowWidth) / 2) + primary.workArea.x;
const y = Math.round((primary.workArea.height - windowHeight) / 2) + primary.workArea.y;

const win = new BrowserWindow({
  title: "Centered Window",
  url: "views://mainview/index.html",
  frame: {
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
  },
});
```

### Example: Open Window on Display with Cursor

```
import { Screen, BrowserWindow } from "electrobun/bun";

function getDisplayAtCursor() {
  const cursor = Screen.getCursorScreenPoint();
  const displays = Screen.getAllDisplays();

  return displays.find(display => {
    const { x, y, width, height } = display.bounds;
    return cursor.x >= x && cursor.x < x + width &&
           cursor.y >= y && cursor.y < y + height;
  }) || Screen.getPrimaryDisplay();
}

const targetDisplay = getDisplayAtCursor();
console.log(`Opening window on display: ${targetDisplay.id}`);
```

### Platform Notes

-   **macOS:** Uses `NSScreen` and `CGMainDisplayID`. Coordinates are converted from bottom-left origin to top-left origin for consistency.
-   **Windows:** Uses `EnumDisplayMonitors` and `GetDpiForMonitor` for scale factor.
-   **Linux:** Uses GDK `gdk_display_get_n_monitors` and related APIs.

## Session

The Session module provides cookie and storage management for webview partitions. Each partition has isolated storage, allowing you to manage cookies and clear data independently.

```
import { Session } from "electrobun/bun";
```

### Types

```
interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'no_restriction' | 'lax' | 'strict';
  expirationDate?: number; // Unix timestamp in seconds
}

interface CookieFilter {
  url?: string;
  name?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  session?: boolean;
}

type StorageType =
  | 'cookies'
  | 'localStorage'
  | 'sessionStorage'
  | 'indexedDB'
  | 'webSQL'
  | 'cache'
  | 'all';
```

### Session.fromPartition(partition)

Get or create a session for a specific partition. Partitions starting with `persist:` are stored on disk, others are ephemeral.

```
// Persistent session (survives app restarts)
const session = Session.fromPartition("persist:myapp");

// Ephemeral session (cleared when app closes)
const tempSession = Session.fromPartition("temp");
```

### Session.defaultSession

Get the default session (equivalent to `persist:default` partition).

```
const session = Session.defaultSession;
console.log(session.partition); // "persist:default"
```

### session.cookies.get(filter?)

Get cookies matching the optional filter criteria. Returns an array of Cookie objects.

```
const session = Session.fromPartition("persist:myapp");

// Get all cookies
const allCookies = session.cookies.get();
console.log(`Found ${allCookies.length} cookies`);

// Get cookies by name
const authCookies = session.cookies.get({ name: "auth_token" });

// Get cookies by domain
const domainCookies = session.cookies.get({ domain: "example.com" });

// Get cookies by URL
const urlCookies = session.cookies.get({ url: "https://api.example.com" });
```

### session.cookies.set(cookie)

Set a cookie. Returns `true` if successful.

```
const session = Session.fromPartition("persist:myapp");

// Set a basic cookie
session.cookies.set({
  name: "user_id",
  value: "12345",
  domain: "myapp.com",
  path: "/"
});

// Set a secure cookie with expiration
session.cookies.set({
  name: "auth_token",
  value: "abc123xyz",
  domain: "api.myapp.com",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "strict",
  expirationDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
});
```

### session.cookies.remove(url, name)

Remove a specific cookie by URL and name. Returns `true` if successful.

```
const session = Session.fromPartition("persist:myapp");

// Remove a specific cookie
session.cookies.remove("https://myapp.com", "user_id");
```

### session.cookies.clear()

Clear all cookies for this session.

```
const session = Session.fromPartition("persist:myapp");

// Clear all cookies
session.cookies.clear();
```

### session.clearStorageData(types?)

Clear storage data for this session. You can specify which types to clear, or use `'all'` to clear everything.

```
const session = Session.fromPartition("persist:myapp");

// Clear all storage
session.clearStorageData();

// Clear specific storage types
session.clearStorageData(['cookies', 'localStorage']);

// Clear just the cache
session.clearStorageData(['cache']);
```

### Example: User Logout

```
import { Session } from "electrobun/bun";

function logout() {
  const session = Session.fromPartition("persist:user");

  // Clear auth cookies
  session.cookies.remove("https://api.myapp.com", "auth_token");
  session.cookies.remove("https://api.myapp.com", "refresh_token");

  // Clear local storage data
  session.clearStorageData(['localStorage', 'sessionStorage']);

  console.log("User logged out");
}
```

### Example: Multi-account Support

```
import { Session, BrowserWindow } from "electrobun/bun";

// Create a webview with its own session
function createAccountWindow(accountId: string) {
  const partition = `persist:account-${accountId}`;
  const session = Session.fromPartition(partition);

  // Each account has isolated cookies/storage
  const win = new BrowserWindow({
    title: `Account: ${accountId}`,
    url: "https://myapp.com/dashboard",
    partition: partition,
    frame: { width: 800, height: 600, x: 100, y: 100 }
  });

  return { window: win, session };
}
```

### Platform Notes

-   **macOS:** Uses `WKHTTPCookieStore` for WebKit and CEF's cookie manager.
-   **Windows:** Uses `ICoreWebView2CookieManager` for WebView2.
-   **Linux:** Uses `WebKitCookieManager` for WebKit2GTK and CEF's cookie manager.

**Partition Naming:** Use `persist:` prefix for persistent storage (e.g., `persist:myapp`). Sessions without this prefix are ephemeral and cleared when the app closes.
