<!-- Source: https://blackboard.sh/electrobun/docs/apis/cli/build-configuration -->

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

[Electroview Class](../browser/electroview-class.md) [Webview Tag](../browser/electrobun-webview-tag.md) [Draggable Regions](../browser/draggable-regions.md) [Global Properties](../browser/global-properties.md)

##### CLI & Configuration

[Build Configuration](./build-configuration.md) [CLI Arguments](./cli-args.md) [Bundled Assets](../bundled-assets.md) [Bundling CEF](../bundling-cef.md) [Application Icons](../application-icons.md)

# Build Configuration

This guide covers all configuration options available in `electrobun.config` for building and distributing your Electrobun applications.

## Configuration File

Electrobun uses `electrobun.config.ts` in your project root to control how your application is built and packaged. The config file uses TypeScript with ESM syntax, providing type safety and modern JavaScript features.

### Basic Structure

```
// electrobun.config.ts
import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "MyApp",
    identifier: "com.example.myapp",
    version: "1.0.0",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
  },
} satisfies ElectrobunConfig;
```

## Bun Bundler Options

Both `build.bun` and each entry in `build.views` accept all [Bun.build()](https://bun.sh/docs/bundler) options as pass-through properties. The only required field is `entrypoint` — everything else is optional.

Electrobun controls `entrypoints` (derived from your `entrypoint`), `outdir`, and `target` (`"bun"` for the bun process, `"browser"` for views) automatically. All other Bun bundler options are passed through directly.

### Available Options

Some commonly used options include:

Option

Type

Description

`plugins`

`BunPlugin[]`

Bundler plugins (e.g., for CSS modules, SVG imports, etc.)

`external`

`string[]`

Modules to exclude from bundling

`sourcemap`

`"none" | "linked" | "inline" | "external"`

Source map generation

`minify`

`boolean | { whitespace, identifiers, syntax }`

Minification options

`splitting`

`boolean`

Enable code splitting for shared modules

`define`

`Record<string, string>`

Global identifier replacements at build time

`loader`

`Record<string, Loader>`

Custom file extension loaders

`format`

`"esm" | "cjs" | "iife"`

Output module format

`naming`

`string | { chunk, entry, asset }`

Output file naming patterns

`banner`

`string`

Prepend text to output (e.g., `"use client"`)

`drop`

`string[]`

Remove function calls (e.g., `["console", "debugger"]`)

`env`

`"inline" | "disable" | "PREFIX_*"`

Environment variable handling

`jsx`

`{ runtime, importSource, factory, fragment }`

JSX transform configuration

`packages`

`"bundle" | "external"`

Whether to bundle or externalize all packages

``   For the full list of options, see the [Bun Bundler documentation](https://bun.sh/docs/bundler).  ### Example: Using Plugins  ``` import type { ElectrobunConfig } from "electrobun"; import myPlugin from "./plugins/my-plugin";  export default {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",   },   build: {     bun: {       entrypoint: "src/bun/index.ts",       plugins: [myPlugin()],     },     views: {       mainview: {         entrypoint: "src/mainview/index.ts",         plugins: [myPlugin()],         sourcemap: "linked",       },     },   }, } satisfies ElectrobunConfig; ```  ### Example: Minification and Source Maps  ``` import type { ElectrobunConfig } from "electrobun";  export default {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",   },   build: {     views: {       mainview: {         entrypoint: "src/mainview/index.ts",         minify: true,         sourcemap: "linked",         define: {           "process.env.NODE_ENV": '"production"',         },         drop: ["console"],       },     },   }, } satisfies ElectrobunConfig; ```  **Note:** Since `electrobun.config.ts` is a real TypeScript module, you can dynamically construct plugins and configuration. Plugins are JavaScript objects, so they work natively — no serialization required.  ## URL Schemes (Deep Linking)  Electrobun supports registering custom URL schemes for your application, enabling deep linking. When users click a link like `myapp://some/path`, your app will open and receive the URL.  **Platform support:**  -   macOS: Fully supported. App must be in `/Applications` folder for URL scheme registration to work reliably. -   Windows: Not yet supported -   Linux: Not yet supported  ### Configuration  Add URL schemes to the `app` section of your config:  ``` const config: ElectrobunConfig = {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",     urlSchemes: ["myapp", "myapp-dev"], // Register multiple schemes   },   // ... }; ```  ### Handling URL Opens  Listen for the `open-url` event in your Bun process to handle incoming URLs:  ``` import Electrobun from "electrobun";  Electrobun.events.on("open-url", (e) => {   console.log("Opened with URL:", e.data.url);    // Parse the URL to extract information   const url = new URL(e.data.url);   console.log("Protocol:", url.protocol); // "myapp:"   console.log("Pathname:", url.pathname); // "/some/path"    // Route to appropriate part of your app   if (url.pathname.startsWith("/login")) {     // Handle login deep link   } }); ```  ### How It Works on macOS  When you build your app with URL schemes configured, Electrobun automatically adds the `CFBundleURLTypes` entry to your app's `Info.plist`. The operating system registers these URL schemes when your app is placed in the `/Applications` folder.  **Important notes:**  -   The app must be in `/Applications` (or `~/Applications`) for macOS to register the URL schemes -   During development, URL schemes won't work unless you build and install to Applications -   If another app has already registered the same URL scheme, macOS will use whichever was installed first -   Notarization is recommended for production apps to ensure a smooth user experience  ### Dynamic Configuration  TypeScript config files support dynamic configuration with full type safety:  ``` // electrobun.config.ts import type { ElectrobunConfig } from "electrobun"; import { readFileSync } from 'fs';  // Read version from package.json const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));  export default {   app: {     name: "MyApp",     identifier: process.env.APP_ID || "com.example.myapp",     version: packageJson.version,   },   build: {     bun: {       entrypoint: "src/bun/index.ts",     },   },   release: {     baseUrl: process.env.RELEASE_BASE_URL || "",   }, } satisfies ElectrobunConfig; ```  ## ASAR Packaging  Electrobun supports packaging your application resources into an ASAR archive. ASAR (Atom Shell Archive) is an archive format that combines multiple files into a single file, providing faster file access and improved security for production builds.  ### Configuration Options  ``` const config: ElectrobunConfig = {   build: {     useAsar: true,     asarUnpack: ["*.node", "*.dll", "*.dylib", "*.so"],     // ... rest of config   }, }; ```  #### useAsar  **Type:** `boolean`  **Default:** `false`  Enables ASAR packaging for your application resources. When enabled, the entire `app/` directory is packed into a single `app.asar` file.  #### asarUnpack  **Type:** `string[]`  **Default:** `["*.node", "*.dll", "*.dylib", "*.so"]`  Glob patterns for files and folders that should be excluded from the ASAR archive. These files will remain unpacked in the `app.asar.unpacked` directory alongside the archive.  **Common use cases for unpacking:**  -   Native modules (`*.node`, `*.dll`, `*.dylib`, `*.so`) -   Files that need to be accessed directly by external processes -   Files that need to be executed or dynamically loaded -   Large binary files that don't benefit from archiving  ### Example with ASAR Configuration  ``` import type { ElectrobunConfig } from "electrobun";  export default {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",   },   build: {     useAsar: true,     asarUnpack: [       "*.node",           // Native modules       "*.dll",            // Windows DLLs       "*.dylib",          // macOS dynamic libraries       "*.so",             // Linux shared objects       "data/large/**/*",  // Large data files     ],     bun: {       entrypoint: "src/bun/index.ts",     },   }, } satisfies ElectrobunConfig; ```  ### Benefits of ASAR Packaging  -   **Performance:** Faster file access and reduced I/O operations -   **Security:** App code is extracted to randomized temp files with automatic cleanup -   **Distribution:** Fewer files to manage and distribute -   **Integrity:** Single archive is easier to verify and protect  ## Renderer Configuration  Electrobun supports multiple webview renderers. By default, it uses the system's native webview (WKWebKit on macOS, WebView2 on Windows, GTK WebKit on Linux). You can also bundle CEF (Chromium Embedded Framework) for a consistent cross-platform experience.  ### Platform-specific Renderer Options  Each platform (mac, linux, win) supports the following renderer options:  #### bundleCEF  **Type:** `boolean`  **Default:** `false`  When `true`, CEF (Chromium Embedded Framework) is bundled with your application. This adds approximately 100MB+ to your app bundle but provides a consistent Chromium-based rendering experience across all platforms.  #### defaultRenderer  **Type:** `'native' | 'cef'`  **Default:** `'native'`  Sets the default renderer for all `BrowserWindow` and `BrowserView` instances when no explicit `renderer` option is specified. This allows you to bundle CEF and use it by default without having to specify `renderer: 'cef'` on every window/view.  **Note:** Setting `defaultRenderer: 'cef'` only affects the default. You can still override it per-window or per-view by explicitly passing `renderer: 'native'` or `renderer: 'cef'` in the options.  ### Example: CEF as Default Renderer  ``` const config: ElectrobunConfig = {   // ...   build: {     mac: {       bundleCEF: true,       defaultRenderer: 'cef', // All webviews use CEF by default     },     linux: {       bundleCEF: true,       defaultRenderer: 'cef',     },     win: {       bundleCEF: true,       defaultRenderer: 'cef',     },   }, }; ```  With this configuration, when you create a window without specifying a renderer:  ``` // Uses CEF (the configured default) const mainWindow = new BrowserWindow({   title: "My App",   url: "views://main/index.html", });  // Explicitly use native renderer for this specific window const settingsWindow = new BrowserWindow({   title: "Settings",   url: "views://settings/index.html",   renderer: 'native', // Override the default }); ```  ### Accessing Build Configuration at Runtime  You can access the build configuration at runtime using the `BuildConfig` API. This is useful for knowing which renderers are available and what the default is. See the [BuildConfig API](../build-config.md) documentation for details.  ### Full example from the Electrobun Playground app  ``` // electrobun.config.ts import type { ElectrobunConfig } from "electrobun";  export default {     app: {         name: "Electrobun (Playground)",         identifier: "dev.electrobun.playground",         version: "0.0.1",     },     build: {         bun: {             entrypoint: "src/bun/index.ts",         },         views: {             mainview: {                 entrypoint: "src/mainview/index.ts",             },             myextension: {                 entrypoint: "src/myextension/preload.ts",             },             webviewtag: {                 entrypoint: "src/webviewtag/index.ts",             },         },         copy: {             "src/mainview/index.html": "views/mainview/index.html",             "src/mainview/index.css": "views/mainview/index.css",             "src/webviewtag/index.html": "views/webviewtag/index.html",             "src/webviewtag/electrobun.png": "views/webviewtag/electrobun.png",             "assets/electrobun-logo-32-template.png": "views/assets/electrobun-logo-32-template.png",         },         mac: {             codesign: true,             notarize: true,             bundleCEF: true,             defaultRenderer: 'cef',             entitlements: {                 "com.apple.security.device.camera": "This app needs camera access for video features",                 "com.apple.security.device.microphone": "This app needs microphone access for audio features",             },             icons: "icon.iconset",         },         linux: {             bundleCEF: true,             defaultRenderer: 'cef',         },         win: {             bundleCEF: true,             defaultRenderer: 'cef',         },     },     scripts: {         postBuild: "./buildScript.ts",     },     release: {         baseUrl: "https://static.electrobun.dev/playground/",     }, } satisfies ElectrobunConfig; ```  ## Custom Bun Version  Each Electrobun release ships with a specific tested Bun version. You can override this with the `bunVersion` option in your build configuration to use a different version from [Bun's GitHub releases](https://github.com/oven-sh/bun/releases).  ### Why Override the Bun Version  -   **Use a newer version:** If a newer Bun release includes a performance improvement, bug fix, or API you need, you can adopt it immediately without waiting for Electrobun to update its default. -   **Pin an older version:** If a newer Bun release introduces a regression that affects your app, you can pin to the version that works while you wait for a fix.  ### Configuration  Set the `bunVersion` field in the `build` section of your `electrobun.config.ts`. The value is a semver version string matching a [Bun release tag](https://github.com/oven-sh/bun/releases):  ``` // electrobun.config.ts import type { ElectrobunConfig } from "electrobun";  export default {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",   },   build: {     bunVersion: "1.4.2",     bun: {       entrypoint: "src/bun/index.ts",     },   }, } satisfies ElectrobunConfig; ```  ### How It Works  When `bunVersion` is set, the Electrobun CLI downloads the specified Bun binary from GitHub releases and caches it locally. The cached binary is stored in `node_modules/.electrobun-cache/bun-override/` so it survives both dist rebuilds and `bun install` (which replaces `node_modules/electrobun`).  Unlike the CEF version override, no compilation or restructuring is needed — Bun is a single standalone binary with no external dependencies.  ### Caching  The downloaded Bun binary is cached per platform and version. If you change `bunVersion`, the CLI detects the mismatch and re-downloads automatically. Removing the override restores the default Bun version shipped with your Electrobun release.  **See also:** For overriding the CEF (Chromium) version, see [Bundling CEF — Custom CEF Versions](../bundling-cef.md).  ## Chromium Flags  You can pass custom Chromium command-line flags to CEF during initialization. This is useful for enabling debugging features, overriding browser behavior, or setting values like a custom user agent.  Flags are defined per-platform in the `chromiumFlags` option. Keys are flag names **without** the `--` prefix. Use `true` for switch-only flags, or a string for flags that take a value.  ### chromiumFlags  **Type:** `Record<string, string | true>`  **Default:** `undefined` (no custom flags)  ``` const config: ElectrobunConfig = {   // ...   build: {     mac: {       bundleCEF: true,       chromiumFlags: {         // Switch-only flag (no value)         "show-paint-rects": true,          // Flag with a value         "user-agent": "MyApp/1.0 (custom)",       },     },     linux: {       bundleCEF: true,       chromiumFlags: {         "user-agent": "MyApp/1.0 (custom)",       },     },     win: {       bundleCEF: true,       chromiumFlags: {         "user-agent": "MyApp/1.0 (custom)",       },     },   }, }; ```  ### How It Works  Flags defined in `chromiumFlags` are written into `Resources/build.json` during the build. At runtime, the native wrapper reads them and applies them to CEF's command line via `AppendSwitch` / `AppendSwitchWithValue`.  User flags are applied **after** Electrobun's internal flags. If a user flag duplicates an internal one, CEF's last-write-wins behavior applies for value switches. Each applied flag is logged at startup:  ``` [CEF] Applying user chromium flag: show-paint-rects [CEF] Applying user chromium flag: user-agent=MyApp/1.0 (custom) ```  **Note:** Chromium flags are powerful and can change browser behavior in unexpected ways. Only use flags you understand. Electrobun does not validate flag names or values — they are passed directly to CEF.  ### Common Flags  Flag  Type  Description  `user-agent`  `string`  Override the default user agent string  `show-paint-rects`  `true`  Flash green rectangles over repainted areas (useful for debugging)  `show-composited-layer-borders`  `true`  Show colored borders around GPU-composited layers  For a full list of Chromium command-line flags, see the [Chromium Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/) reference.  ## Runtime Configuration  The `runtime` section defines settings that affect your application's behaviour at runtime. These values are copied into `build.json` during the build and are accessible via the [BuildConfig API](../build-config.md).  ### exitOnLastWindowClosed  **Type:** `boolean`  **Default:** `true`  When `true`, the application automatically quits when the last `BrowserWindow` is closed. This is the most common expected behaviour for desktop applications.  Set to `false` if your app should keep running without any open windows (e.g., menu bar apps, or apps that stay in the system tray).  ``` import type { ElectrobunConfig } from "electrobun";  export default {   app: {     name: "MyApp",     identifier: "com.example.myapp",     version: "1.0.0",   },   runtime: {     exitOnLastWindowClosed: true, // default   },   build: {     // ...   }, } satisfies ElectrobunConfig; ```  ### Custom Runtime Values  You can add arbitrary keys to the `runtime` section. The entire object is copied into `build.json` and available at runtime via `BuildConfig`:  ``` // electrobun.config.ts export default {   // ...   runtime: {     exitOnLastWindowClosed: true,     myCustomSetting: "hello",   }, } satisfies ElectrobunConfig;  // src/bun/index.ts import { BuildConfig } from "electrobun/bun";  const config = await BuildConfig.get(); console.log(config.runtime?.myCustomSetting); // "hello" ```  ## Build Lifecycle Hooks  Electrobun provides lifecycle hooks that let you run custom scripts at various stages of the build process. These hooks are configured in the `scripts` section of your `electrobun.config.ts`.  ### Available Hooks  Hooks are executed in the following order during a build:  Hook  When it runs  Use case  `preBuild`  Before the build starts  Validation, environment setup, generating files, cleanup  `postBuild`  After the inner app bundle is complete (before ASAR/signing)  Modify app bundle contents, add resources  `postWrap`  After self-extracting bundle created, before signing (non-dev only)  Add files to the wrapper bundle (e.g., for macOS features like Liquid Glass)  `postPackage`  After all build artifacts are created  Custom distribution steps, upload, notifications, cleanup  ### Configuration  Specify hooks as paths to TypeScript or JavaScript files that will be executed with Bun:  ``` const config: ElectrobunConfig = {   // ... app and build config   scripts: {     preBuild: "./scripts/pre-build.ts",     postBuild: "./scripts/post-build.ts",     postWrap: "./scripts/post-wrap.ts",     postPackage: "./scripts/post-package.ts",   }, }; ```  ### Environment Variables  All hook scripts receive the following environment variables:  Variable  Description  `ELECTROBUN_BUILD_ENV`  Build environment: `dev`, `canary`, or `stable`  `ELECTROBUN_OS`  Target OS: `macos`, `linux`, or `win`  `ELECTROBUN_ARCH`  Target architecture: `x64` or `arm64`  `ELECTROBUN_BUILD_DIR`  Path to the build output directory  `ELECTROBUN_APP_NAME`  Application name with environment suffix  `ELECTROBUN_APP_VERSION`  Application version from config  `ELECTROBUN_APP_IDENTIFIER`  Bundle identifier from config  `ELECTROBUN_ARTIFACT_DIR`  Path to the artifacts output directory  The `postWrap` hook receives an additional variable:  -   `ELECTROBUN_WRAPPER_BUNDLE_PATH` - Path to the self-extracting wrapper bundle  ### Example: Adding files for Liquid Glass (macOS)  The `postWrap` hook is ideal for adding files to the self-extracting wrapper before it's code signed. This is useful for macOS features like Liquid Glass that require specific files in the app bundle:  ``` // scripts/post-wrap.ts import { join } from "path"; import { cpSync, existsSync, mkdirSync } from "fs";  const wrapperPath = process.env.ELECTROBUN_WRAPPER_BUNDLE_PATH; const buildEnv = process.env.ELECTROBUN_BUILD_ENV;  if (!wrapperPath) {   console.error("ELECTROBUN_WRAPPER_BUNDLE_PATH not set");   process.exit(1); }  // Only add Liquid Glass assets for production builds if (buildEnv !== "dev") {   const resourcesPath = join(wrapperPath, "Contents", "Resources");   const liquidGlassAssets = "./assets/liquid-glass";    if (existsSync(liquidGlassAssets)) {     console.log("Adding Liquid Glass assets to wrapper bundle...");     cpSync(liquidGlassAssets, join(resourcesPath, "liquid-glass"), {       recursive: true     });   } }  console.log("postWrap hook completed"); ```  ### Example: Build validation with preBuild  ``` // scripts/pre-build.ts import { existsSync } from "fs";  const buildEnv = process.env.ELECTROBUN_BUILD_ENV;  // Ensure required environment variables are set for production builds if (buildEnv === "stable") {   const requiredVars = [     "ELECTROBUN_DEVELOPER_ID",     "ELECTROBUN_APPLEID",     "ELECTROBUN_APPLEIDPASS",     "ELECTROBUN_TEAMID",   ];    const missing = requiredVars.filter(v => !process.env[v]);   if (missing.length > 0) {     console.error("Missing required environment variables for stable build:");     missing.forEach(v => console.error(`  - ${v}`));     process.exit(1);   } }  // Validate required files exist const requiredFiles = ["src/bun/index.ts", "src/mainview/index.html"]; for (const file of requiredFiles) {   if (!existsSync(file)) {     console.error(`Required file not found: ${file}`);     process.exit(1);   } }  console.log("preBuild validation passed"); ```  ### Example: Post-package notifications  ``` // scripts/post-package.ts const buildEnv = process.env.ELECTROBUN_BUILD_ENV; const version = process.env.ELECTROBUN_APP_VERSION; const artifactDir = process.env.ELECTROBUN_ARTIFACT_DIR;  console.log(`Build complete: ${buildEnv} v${version}`); console.log(`Artifacts: ${artifactDir}`);  // Send Slack notification for production builds if (buildEnv === "stable" && process.env.SLACK_WEBHOOK_URL) {   await fetch(process.env.SLACK_WEBHOOK_URL, {     method: "POST",     headers: { "Content-Type": "application/json" },     body: JSON.stringify({       text: `New stable release v${version} built successfully!`,     }),   }); } ```  **Note:** Hook scripts are run using the host machine's Bun binary, not the bundled one. This ensures scripts always run regardless of the target platform being built.     ``
