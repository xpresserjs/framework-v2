import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";
import { Xpresser } from "../xpresser.js";
import File from "../classes/File.js";
import InXpresserError from "../errors/InXpresserError.js";
import { compareVersion, importDefault, hasPkg } from "../functions/module.js";
import { ObjTyped } from "object-collection/exports";

/**
 * Plugin data type for plugin index files.
 */
export interface PluginData {
    // Namespace - The keyword used to register plugin.
    namespace: string;

    // Plugin - The path used to register plugin.
    plugin: string;

    // Path - The real path to plugin folder.
    path: string;

    // Paths - Paths to plugin files.
    paths: Record<string, any>;

    // Publishable - If plugin is publishable using xjs publish command.
    publishable?: boolean;

    // Importable - If plugin is importable using xjs import command.
    importable?: boolean;
}

export interface XpresserPlugin {
    dependsOn?: (plugin: PluginData, $: Xpresser) => string[] | Promise<string[]>;
    run?: (plugin: PluginData, $: Xpresser) => void | Promise<void>;
}

export interface PluginUseDotJson {
    // Xpresser version
    // if not set, it will be ignored.
    // if set, it will check if xpresser version is greater than or equal to this version.
    xpresser?: string;

    // Plugin Namespace - the namespace of the plugin.
    namespace: string;

    // Plugin index file path
    // A path to file where plugin is defined and exported.
    // if not set, it will be ignored.
    // if set, it will be imported and run.
    use_index?: string;
}

export default class PluginEngine extends BaseEngine {
    /**
     * Base Engine Config
     */
    static config: BaseEngineConfig = {
        name: "Xpresser/PluginEngine",
        uniqueMemory: true
    };

    /**
     * Check if plugin is valid.
     * @param plugin
     */
    static validatePluginObject(plugin: XpresserPlugin) {
        if (plugin.dependsOn && typeof plugin.dependsOn !== "function") {
            throw new Error("Plugin `dependsOn` property must be a function");
        }

        if (plugin.run && typeof plugin.run !== "function") {
            throw new Error("Plugin `run` property must be a function");
        }
    }

    /**
     * Load Plugins from plugin.json
     */
    async loadPluginsFromJson() {
        if (this.$.hasLoadedPlugins()) {
            throw new InXpresserError(`Plugins already loaded.`);
        }

        const logPlugins = this.$.config.data.log.plugins;
        let plugins: Record<string, boolean | { load?: boolean; env?: string | string[] }>;
        const pluginsJsonPath = this.$.path.jsonConfigs("plugins.json");

        /**
         * Check if plugin.json exists
         * if yes, load plugins from plugin.json
         */
        if (!File.exists(pluginsJsonPath)) {
            return;
        }

        try {
            plugins = File.readJson(pluginsJsonPath, true);
        } catch (e) {
            this.$.console.logError(`Error loading plugins from ${pluginsJsonPath}`);
            return;
        }

        if (typeof plugins !== "object") {
            this.$.console.logWarning(
                "Plugins not loaded! Typeof plugins is expected to be an object."
            );
            return;
        }

        const pluginKeys = Object.keys(plugins);
        const env = this.$.config.data.env;

        // Caches plugin paths.
        const pluginPaths: Record<string, any> = {};

        // Caches plugin Data
        const pluginData: Record<string, PluginUseDotJson> = {};

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
                // if it has a load property, and it is false, skip it.
                if (
                    pluginUseDotJsonValue.hasOwnProperty("load") &&
                    pluginUseDotJsonValue.load === false
                ) {
                    continue;
                }

                // if it has an env property, and it is not equal to the current env, skip it.
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
            const $pluginPath: string = (pluginPaths[plugin] = this.$.path.resolve(plugin));

            try {
                const $data = (pluginData[plugin] = this.#loadPluginUseData($pluginPath));
                listOfPluginNamespaces.push($data.namespace);
            } catch (e) {
                // Throw any error from processing and stop xpresser.
                this.$.console.logPerLine(
                    [{ error: plugin }, { error: e }, { errorAndExit: "" }],
                    true
                );
            }
        }

        this.$.modules.isNotActive("cli", () => {
            if (logPlugins) {
                this.$.console.logSuccess(`Using plugins: [${listOfPluginNamespaces.join(", ")}]`);
            } else {
                const pluginsLength = listOfPluginNamespaces.length;
                this.$.console.logSuccess(
                    `Using (${pluginsLength}) ${pluginsLength === 1 ? "plugin" : "plugins"}`
                );
            }
        });

        /**
         * PluginNamespaceToData - Holds plugin data using namespaces as keys.
         */
        const PluginNamespaceToData: Record<string, PluginData> = {};
        for (const plugin of Object.keys(loadedPlugins)) {
            if (plugin.length) {
                // get plugin real path.
                const $pluginPath: string = pluginPaths[plugin];

                // Try processing plugin use.json
                try {
                    const $data = pluginData[plugin];
                    PluginNamespaceToData[$data.namespace] = (await this.#usePlugin(
                        plugin,
                        $pluginPath,
                        $data
                    ))!;

                    // Save to engineData
                    this.useMemory().set("namespaces", PluginNamespaceToData);
                } catch (e) {
                    // Throw any error from processing and stop xpresser.
                    this.$.console.logPerLine(
                        [{ error: plugin }, { error: e }, { errorAndExit: "" }],
                        true
                    );
                }
            }
        }
    }

    #loadPluginUseData(pluginPath: string): any {
        const PackageDotJson: Record<string, any> = this.$.engineData.data.packageDotJson.data;
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
                this.$.console.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${
                        compareWith + version
                    }],\nUpgrade xpresser to continue.`
                );
            } else if (compareWith === "<=" && compareVersion(version, xpresserVersion) === -1) {
                this.$.console.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${
                        compareWith + version
                    }],\nDowngrade xpresser to continue.`
                );
            }
        }

        return data;
    }

    async #usePlugin(plugin: string, pluginPath: string, useDotJsonValue: PluginUseDotJson) {
        const use = ObjTyped(useDotJsonValue);

        let pluginData: PluginData = {
            namespace: use.data.namespace,
            plugin,
            path: pluginPath,
            paths: {}
        };

        // check if plugin defined an index file.
        const indexFile = use.data.use_index;
        if (indexFile) {
            const indexFilePath = this.#pluginPathExistOrExit(plugin, pluginPath, indexFile);

            if (indexFilePath) {
                // import index file.
                const indexFileData = await importDefault<XpresserPlugin | undefined>(
                    indexFilePath
                );

                if (indexFileData) {
                    /**
                     * Run plugin indexFile.
                     */
                    const { run, dependsOn } = indexFileData;

                    // check for packages plugin dependsOn
                    if (dependsOn && typeof dependsOn === "function") {
                        let pluginDependsOn: string[] | undefined = await dependsOn(
                            pluginData,
                            this.$
                        );

                        // Validate function return type.
                        if (!pluginDependsOn || !Array.isArray(pluginDependsOn))
                            return this.$.console.logErrorAndExit(
                                `dependsOn() function for plugin {${pluginData.namespace}} must return an array of packages.`
                            );

                        // Log warning for missing required packages.
                        if (pluginDependsOn.length) {
                            let missingPkgs = 0;

                            // Loop through and check packages.
                            pluginDependsOn.forEach((pkg) => {
                                // Show warning for every missing package.
                                if (!hasPkg(pkg)) {
                                    // Intro log.
                                    if (missingPkgs === 0)
                                        this.$.console.logError(
                                            `Plugin: (${pluginData.namespace}) requires the following dependencies:`
                                        );

                                    console.log(`- ${pkg}`);

                                    missingPkgs++;
                                }
                            });

                            // Stop if missing package
                            if (missingPkgs)
                                return this.$.console.logErrorAndExit(
                                    `Install required ${
                                        missingPkgs > 1 ? "dependencies" : "dependency"
                                    } and restart server.`
                                );
                        }
                    }

                    /**
                     * Call Run function.
                     */
                    if (run && typeof run === "function") await run(pluginData, this.$);
                }
            }
        }

        return pluginData;
    }

    /**
     * Check if plugin file exists or throw error.
     * @param plugin
     * @param pluginPath
     * @param file
     */
    #pluginPathExistOrExit(plugin: string, pluginPath: string, file: string) {
        /**
         * ResolvedRoutePath - get file real path,
         * Just in any case smartPaths are used.
         */
        const ResolvedRoutePath = this.$.path.resolve([pluginPath, file]);

        if (file === ResolvedRoutePath) {
            // Merge plugin base path to file.
            file = pluginPath + "/" + file;
        } else {
            // file is ResolvedPath
            file = ResolvedRoutePath;
        }

        // If file or folder does not exist throw error.
        if (!File.exists(file)) {
            return this.$.console.logPerLine(
                [
                    { error: plugin },
                    { error: `REQUIRED FILE or DIR MISSING: ${file}` },
                    { errorAndExit: "" }
                ],
                true
            );
        }

        // return real path.
        return file;
    }
}

export function definePlugin(plugin: XpresserPlugin) {
    // validate plugin object
    PluginEngine.validatePluginObject(plugin);

    // return plugin object
    return plugin;
}
