<!-- Source: https://blackboard.sh/electrobun/docs/apis/context-menu -->

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

# Context Menu

Show a context menu

Typically you'd wire up a rightclick event with preventDefault in the browser context, rpc to bun, then create a native context menu from the bun context. But you can also create and show a context menu entirely from bun which will show at the mouse cursor's position globally positioned on screen even outside of your application window. Even if you have no windows open and another app is focused.

```
import {ContextMenu} from "electrobun/bun";

// Show a context menu wherever the mouse cursor is on screen
// after 5 seconds.
setTimeout(() => {
  ContextMenu.showContextMenu([
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
    {
      label: "Custom menu disabled",
      enabled: false,
      action: "custom-action-2",
      // todo: support a data property on all menus (app, tray, context)
      data: {
        some: "data",
        that: "is serialized",
        nested: { thing: 23 },
      },
    },
    { type: "separator" },
    { role: "cut" },
    { role: "copy" },
    { role: "paste" },
    { role: "pasteAndMatchStyle" },
    { role: "delete" },
    { role: "selectAll" },
  ]);
}, 5000);

Electrobun.events.on("context-menu-clicked", (e) => {
  console.log("context event", e.data.action);
});
```

## Menu Item Properties

### accelerator

You can set a custom keyboard shortcut hint for context menu items using the ``accelerator`}>`` property. This displays the shortcut next to the menu item label.

```
ContextMenu.showContextMenu([
  {
    label: "Save",
    action: "save",
    accelerator: "s"  // Shows Cmd+S on macOS
  },
  {
    label: "New Tab",
    action: "new-tab",
    accelerator: "t"
  },
  { type: "separator" },
  { role: "copy" },
  { role: "paste" },
]);
```

#### Platform Support

-   **macOS:** Full support. Accelerators are displayed next to menu items with Command as the default modifier.
-   **Windows:** Supports simple single-character accelerators.
-   **Linux:** Context menus are not currently supported on Linux.

### Other Properties

-   **label:** The text displayed for the menu item
-   **action:** A string identifier emitted when the item is clicked
-   **role:** Use a built-in role instead of a custom action (e.g., "copy", "paste", "cut")
-   **enabled:** Set to false to show the item as disabled
-   **checked:** Set to true to show a checkbox
-   **hidden:** Set to true to hide the item
-   **tooltip:** Tooltip text shown on hover
-   **data:** Arbitrary data passed through with the click event
-   **submenu:** Nested array of menu items for submenus
