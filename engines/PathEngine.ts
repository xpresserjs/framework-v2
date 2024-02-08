import * as Path from "node:path";
import InXpresserError from "../errors/InXpresserError.js";
import { removeLeadingSlash } from "../functions/path.js";
import type { Config } from "../types/configs.js";
import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";

export declare module SmartPaths {
    enum Add {
        npm
    }
    enum Exclude {
        routesFile,
        node_modules
    }

    type AddedKeys = keyof typeof Add;
    type ExcludedKeys = keyof typeof Exclude;

    type keys = keyof Omit<Config.Paths, ExcludedKeys> | AddedKeys;
    type Path = `${keys}://${string}`;

    type Aliases = Record<AddedKeys, string>;
}

class PathEngine extends BaseEngine {
    static config: BaseEngineConfig = {
        name: "Xpresser/PathEngine"
    };

    smartAliases: SmartPaths.Aliases = {
        npm: "node_modules"
    };

    /**
     * Get path to base folder.
     * @param str - String to add to base path
     * @returns string
     */
    base(str: string = "") {
        return this.smartPath(`base://${removeLeadingSlash(str)}`);
    }

    /**
     * Get path to backend folder.
     * @param str - String to add to backend path
     * @returns string
     */
    backend(str: string = "") {
        return this.smartPath(`backend://${removeLeadingSlash(str)}`);
    }

    /**
     * Get path to storage folder.
     * @param str - String to add to storage path
     * @returns string
     */
    storage(str: string = "") {
        return this.smartPath(`storage://${removeLeadingSlash(str)}`);
    }

    /**
     * Get path to framework storage folder.
     * @param str - String to add to framework storage path
     * @returns string
     */
    frameworkStorage(str: string = "") {
        return this.smartPath(`storage://framework/${removeLeadingSlash(str)}`);
    }

    /**
     * Get path to jsonConfigs folder
     * @param str - String to add to jsonConfig path
     * @returns string
     */
    jsonConfigs(str: string = "") {
        return this.smartPath(`jsonConfigs://${removeLeadingSlash(str)}`);
    }

    /**
     * Resolve a path, or smart path.
     * @param paths - Paths to resolve
     * @param options
     * @returns string
     */
    resolve(
        paths: SmartPaths.Path | string | string[],
        options?: {
            exclude?: string;
            replace?: string;
        }
    ) {
        if (typeof paths === "string") {
            paths = [paths];
        }

        // check and parse smart paths
        for (const index in paths) {
            paths[index] = this.smartPath(paths[index] as SmartPaths.Path);
        }

        // Get resolved path
        let resolved = Path.resolve(...paths);

        // if exclude is set, remove it from resolved
        if (options && options.exclude) {
            const excludePath = this.maybeSmartPath(options.exclude);
            resolved = resolved.replace(excludePath, options.replace || "");
        }

        return resolved;
    }

    /**
     * Resolve a smart path
     * @param path - Smart path to resolve
     * @returns string
     */
    smartPath(path: SmartPaths.Path): string {
        // return path if it is not a smart path
        if (!(path.indexOf("://") > 0)) return path;

        let [smartPath, ...segments] = path.split("://");

        // check if smartPath is an alias
        if (this.smartAliases[smartPath as SmartPaths.AddedKeys]) {
            smartPath = this.smartAliases[smartPath as SmartPaths.AddedKeys];
        }

        // get path from config
        let pathConfig = this.$.config.data.paths[smartPath as keyof Config.Paths];

        // throw error if path is not found
        if (!pathConfig) {
            throw new InXpresserError(
                `Cannot parse smart path "${smartPath}://" because "${smartPath}" does not exist in paths config!`
            );
        }

        // pathConfig is a smart path resolve it.
        if (pathConfig.indexOf("://") > 0) {
            pathConfig = this.smartPath(pathConfig as SmartPaths.Path);
        }

        return Path.resolve(pathConfig, ...segments);
    }

    /**
     * Alias of .smartPath()
     * But not type strict
     * @param path - Path to resolve
     * @returns string
     */
    maybeSmartPath(path: string) {
        return this.smartPath(path as SmartPaths.Path);
    }

    /**
     * This function resolves all `paths` config
     */
    resolveConfigPaths(keys?: string[]) {
        let hasKeys = !!keys;
        const pathsConfig = this.$.config.path("paths");

        // if no keys, resolve all paths
        if (!keys) keys = pathsConfig.keys();

        for (const key of keys) {
            // if hasKeys === true then there is a possibility of a dot notation being used.
            const pathValue = hasKeys ? pathsConfig.get(key) : pathsConfig.data[key];

            // exit if pathValue is not a string
            if (typeof pathValue !== "string") continue;

            // resolve path
            if (hasKeys) {
                pathsConfig.set(key, this.resolve(pathValue));
            } else {
                pathsConfig.data[key] = this.resolve(pathValue);
            }
        }

        return this;
    }
}

export default PathEngine;
