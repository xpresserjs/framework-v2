import PATH from "node:path";
import InXpresserError from "../errors/InXpresserError.js";
import { removeLeadingSlash } from "../functions/path.js";
import type Config from "../types/configs.js";
import BaseEngine from "./BaseEngine.js";

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
     * Resolve a path, or smart path.
     * @param paths - Paths to resolve
     * @returns string
     */
    resolve(paths: SmartPaths.Path | string | string[]) {
        if (typeof paths === "string") {
            paths = [paths];
        }

        // check and parse smart paths
        for (const index in paths) {
            paths[index] = this.smartPath(paths[index] as SmartPaths.Path);
        }

        return PATH.resolve(...paths);
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
                `Cannot parse smart path "${smartPath}://" because "${smartPath}" is not found in paths config!`
            );
        }

        // pathConfig is a smart path resolve it.
        if (pathConfig.indexOf("://") > 0) {
            pathConfig = this.smartPath(pathConfig as SmartPaths.Path);
        }

        return PATH.resolve(pathConfig, ...segments);
    }
}

export default PathEngine;
