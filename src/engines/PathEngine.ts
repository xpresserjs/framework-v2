import PATH from "node:path";
import InXpresserError from "../errors/InXpresserError.js";
import { removeLeadingSlash } from "../functions/path.js";
import type Config from "../types/configs.js";
import BaseEngine from "./BaseEngine.js";

export declare module SmartPaths {
    enum AddedPaths {
        npm
    }
    enum ExcludedPaths {
        routesFile,
        node_modules
    }
    type keys = keyof Omit<Config.Paths, keyof typeof ExcludedPaths> | keyof typeof AddedPaths;
    type Path = `${keys}://${string}`;
}

class PathEngine extends BaseEngine {
    /**
     * Get path to base folder.
     * @param str - String to add to base path
     * @returns string
     */
    base(str: string = "") {
        // Get base path from config
        // if str is empty, return base path
        let base = this.$.config.data.paths.base;
        if (!str.length) return base;

        const p: PathEngine = new PathEngine(this.$);

        return this.resolve([base, removeLeadingSlash(str)]);
    }

    resolve(paths: string | string[] | SmartPaths.Path) {
        if (typeof paths === "string") {
            paths = [paths];
        }

        // check and parse smart paths
        for (const index in paths) {
            paths[index] = this.smartPath(paths[index] as SmartPaths.Path);
        }

        return PATH.resolve(...paths);
    }

    smartPath(path: SmartPaths.Path): string {
        // return path if it is not a smart path
        if (!(path.indexOf("://") > 0)) return path;

        const [smartPath, ...segments] = path.split("://");

        // get path from config
        const pathConfig = this.$.config.data.paths[smartPath as keyof Config.Paths];

        // throw error if path is not found
        if (!pathConfig) {
            throw new InXpresserError(
                `Cannot parse smart path "${smartPath}://" because "${smartPath}" is not found in paths config!`
            );
        }

        // pathConfig is a smart path resolve it.
        if (pathConfig.indexOf("://") > 0) {
            return PATH.resolve(this.smartPath(pathConfig as SmartPaths.Path), ...segments);
        }

        return PATH.resolve(pathConfig, ...segments);
    }
}

export default PathEngine;
