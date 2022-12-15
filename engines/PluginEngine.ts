import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";
import { Xpresser } from "../xpresser.js";
import File from "../classes/File.js";
import InXpresserError from "../errors/InXpresserError.js";
import {compareVersion} from "../functions/module.js";
import {Obj} from "object-collection/exports";

/**
 * Plugin data type for plugin index files.
 */
export interface PluginData {
    namespace: string;
    plugin: string;
    path: string;
    paths: Record<string, any>;

    publishable?: boolean;
    importable?: boolean;
}

export interface XpresserPlugin {
    dependsOn?: () => string[];
    run?: (plugin: PluginData, $: Xpresser) => void | Promise<void>;
}

export interface PluginUseDotJson {
    // Xpresser version
    // if not set, it will be ignored.
    // if set, it will check if xpresser version is greater than or equal to this version.
    xpresser?: string

    // Plugin Namespace - the namespace of the plugin.
    namespace: string;

    // Plugin index file path
    // A path to file where plugin is defined and exported.
    // if not set, it will be ignored.
    // if set, it will be imported and run.
    use_index?: string;

}

export default class PluginEngine extends BaseEngine {
    static config: BaseEngineConfig = {
        name: "Xpresser/PluginEngine"
    };

    /**
     * Check if
     * @param plugin
     */
    static validatePluginObject(plugin: XpresserPlugin) {
        if (plugin.dependsOn && typeof plugin.dependsOn !== "function") {
            throw new Error("Plugin must have a dependsOn function");
        }

        if (plugin.run && typeof plugin.run !== "function") {
            throw new Error("Plugin must have a run function");
        }
    }

    /**
     * Load Plugins from plugin.json
     */
    static async loadPluginsFromJson($: Xpresser) {
        const logPlugins = $.config.data.log.plugins;
        let plugins: Record<string, boolean | { load?: boolean; env?: string | string[] }>;
        const pluginsJsonPath = $.path.jsonConfigs("plugins.json");

        /**
         * Check if plugin.json exists
         * if yes, load plugins from plugin.json
         */
        if (!File.exists(pluginsJsonPath)) {
            // import plugins from plugin.json
            return;
        }

        try {
            plugins = File.readJson(pluginsJsonPath, true);
        } catch (e) {
            $.console.logError(`Error loading plugins from ${pluginsJsonPath}`);
            return;
        }

        if (typeof plugins !== "object") {
            $.console.logWarning("Plugins not loaded! Typeof plugins is expected to be an object.");
            return;
        }

        const pluginKeys = Object.keys(plugins);
        const env = $.config.data.env;

        // Caches plugin paths.
        const pluginPaths: Record<string, any> = {};

        // Caches plugin Data
        const pluginData: Record<string, any> = {};

        /**
         * Loop through and process plugins.
         *
         * We want to log all plugin names before loading them.
         * Just in any case plugins have logs it does not interfere with the plugin names list.
         *
         * Also check if a particular plugin is meant for the environment your project is in.
         */
        const loadedPlugins: typeof plugins = {};
        for (const pluginKey of pluginKeys) {
            const pluginUseDotJsonValue = plugins[pluginKey];

            // if plugin has a boolean value,
            // and it is false, skip it.
            if (typeof pluginUseDotJsonValue === "boolean" && !pluginUseDotJsonValue) continue;

            // if plugin has an object value,
            if (typeof pluginUseDotJsonValue === "object") {
                // if it has a load property and it is false, skip it.
                if (
                    pluginUseDotJsonValue.hasOwnProperty("load") &&
                    pluginUseDotJsonValue.load === false
                ) {
                    continue;
                }

                // if it has an env property and it is not equal to the current env, skip it.
                if (pluginUseDotJsonValue.hasOwnProperty("env")) {
                    if (
                        typeof pluginUseDotJsonValue.env === "string" &&
                        pluginUseDotJsonValue.env !== env
                    )
                        continue;

                    if (
                        Array.isArray(pluginUseDotJsonValue.env) &&
                        !pluginUseDotJsonValue.env.includes(env)
                    )
                        continue;
                }
            }

            loadedPlugins[pluginKey] = pluginUseDotJsonValue;
        }

        /**
         * Start Processing loaded plugins
         */
        const listOfPluginNamespaces: string[] = [];
        for (const plugin of Object.keys(loadedPlugins)) {
            // get plugin real path.
            const $pluginPath: string = (pluginPaths[plugin] = $.path.resolve(plugin));

            try {
                const $data = pluginData[plugin] = PluginEngine.loadPluginUseData($, $pluginPath);
                listOfPluginNamespaces.push($data.namespace);
            } catch (e) {
                // Throw any error from processing and stop xpresser.
                $.console.logPerLine([
                    {error: plugin},
                    {error: e},
                    {errorAndExit: ""},
                ], true);
            }
        }

        $.modules.ifIsNot("cli", () => {
            if (logPlugins) {
                $.console.logSuccess(`Using plugins: [${listOfPluginNamespaces.join(", ")}]`);
            } else {
                const pluginsLength = listOfPluginNamespaces.length;
                $.console.logSuccess(
                    `Using (${pluginsLength}) ${pluginsLength === 1 ? "plugin" : "plugins"}`
                );
            }
        });

        //
        // for (const plugin of Object.keys(loadedPlugins)) {
        //     if (plugin.length) {
        //         // get plugin real path.
        //         const $pluginPath: string = pluginPaths[plugin];
        //
        //         // Try processing plugin use.json
        //         try {
        //             const $data = pluginData[plugin];
        //             PluginNamespaceToData[$data.namespace] = await PluginEngine.usePlugin(
        //                 plugin, $pluginPath, $data
        //             );
        //
        //             // Save to engineData
        //             $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
        //         } catch (e) {
        //             // Throw any error from processing and stop xpresser.
        //             $.logPerLine([
        //                 {error: plugin},
        //                 {error: e},
        //                 {errorAndExit: ""},
        //             ], true);
        //         }
        //     }
        // }
    }

    static loadPluginUseData($: Xpresser, pluginPath: string): any {
        const PackageDotJson: Record<string, any> = $.engineData.data.packageDotJson.data;
        const data = File.readJson<PluginUseDotJson>(pluginPath + "/use.json", true);
        if (!data.namespace) {
            throw new InXpresserError(`Cannot read property 'namespace'`);
        }

        /**
         * Version checker
         */
        if (data.xpresser) {
            let version = data.xpresser;
            const xpresserVersion = PackageDotJson.version;

            const compareWith = version.substring(0, 2);
            version = data.xpresser.substring(2);


            if (compareWith === ">=" && compareVersion(xpresserVersion, version) === -1) {
                $.console.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${compareWith + version}],\nUpgrade xpresser to continue.`
                );
            } else if (
                compareWith === "<=" &&
                compareVersion(version, xpresserVersion) === -1
            ) {
                $.console.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${compareWith + version}],\nDowngrade xpresser to continue.`
                );
            }
        }

        return data;
    }


    static async usePlugin($: Xpresser, plugin: string, pluginPath: string, data: any) {
        const $data = Obj(data);
        let pluginData: PluginData = {
            namespace: $data.get("namespace"),
            plugin,
            path: pluginPath,
            paths: {}
        }


        $.modules.ifIs("cli", () => {
            // if ($data.has('publishable')) {
            //     pluginData.publishable = $data.get('publishable')
            // }
            //
            // if ($data.has('importable')) {
            //     pluginData.publishable = $data.get('importable')
            // }
            //
            // // check if plugin use.json has paths.Commands only if console
            // if ($data.has("paths.commands")) {
            //     let commandPath: any = $data.get("paths.commands");
            //     commandPath = pluginPathExistOrExit(plugin, path, commandPath);
            //     pluginData.paths.commands = commandPath;
            //
            //     const cliCommandsPath = path + "/cli-commands.json";
            //
            //     if ($.file.isFile(cliCommandsPath)) {
            //         pluginData.commands = {};
            //
            //         const cliCommands = require(cliCommandsPath);
            //         if (cliCommands && Array.isArray(cliCommands)) {
            //             for (const command of cliCommands) {
            //                 let commandAction = command['action'];
            //
            //                 if (!commandAction) {
            //                     commandAction = command.command.split(" ")[0];
            //                 }
            //
            //                 pluginData.commands[commandAction] = pluginPathExistOrExit(plugin, commandPath, command.file);
            //             }
            //         }
            //     }
            // }
        })

    }
}

export function definePlugin(plugin: XpresserPlugin) {
    // validate plugin object
    PluginEngine.validatePluginObject(plugin);

    // return plugin object
    return plugin;
}
