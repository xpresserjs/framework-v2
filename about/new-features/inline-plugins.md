# Xpresser Inline Plugins

In the previous version of XpresserJs, plugins were automatically loaded from a defined `plugins.json`. There was no way to create a plugin without creating a folder and adding it to the `plugins.json`.

In XpresserJs v2, you can create a plugin directly in your code without creating a folder. This new feature provides flexibility, allowing the main file of your file-based plugin to be used as an inline plugin.

## How to Create an Inline Plugin

With XpresserJs v2, creating plugins is straightforward. No more folder creation or `plugins.json` configuration. Just define your plugin directly in your code and register it. This streamlined process enhances productivity and simplifies plugin management.

```typescript
import { __dirname, init } from "@xpresser/framework";
import { defineInlinePlugin } from "@xpresser/framework/engines/PluginEngine.js";

// Initialize Xpresser
const $ = await init({
    env: "development",
    name: "Xpresser Cli App",
    paths: { base: __dirname(import.meta.url) }
});

// Set `cli` as default module
$.modules.setDefault("cli");

// Define Inline Plugin
const DemoPlugin = defineInlinePlugin("demo-plugin", {
    run: () => {
        $.console.logInfo("Demo Plugin is running!");
    }
});

// Register an inline plugin
$.usePlugin(DemoPlugin);

// Start Xpresser
$.start().catch($.console.logErrorAndExit);

```