import type { Config } from "./types/configs.js";
import { ObjectCollectionTyped } from "object-collection";

export class XpresserConfig<Datatype extends Config.Main> extends ObjectCollectionTyped<Datatype> {
    /**
     * Check if the value of a path is true
     * @param path - Path to check
     */
    isTrue(path: string) {
        return this.get(path) === true;
    }

    /**
     * Check if the value of a path is false
     * @param path - Path to check
     */
    isFalse(path: string) {
        return this.get(path) === false;
    }

    /**
     * Check if the value of a path is not `null` or `undefined`
     * @param path
     */
    isDefined(path: string) {
        const value = this.get(path);
        return value !== null && typeof value !== "undefined";
    }

    /**
     * Check if the value of a path is `null` or `undefined`
     * @param path
     */
    isNotdefined(path: string) {
        return !this.isDefined(path);
    }
}

/**
 * Default Config - This config will be merged with the current app config
 * @constructor
 */
export function DefaultConfig(): Config.Main {
    return {
        name: "Xpresser",
        env: "development",

        log: {
            plugins: true,
            asciiArt: true
        },

        debug: {
            enabled: true,

            bootCycle: {
                started: false,
                completed: false,
                irrelevantNextError: true
            },

            bootCycleFunction: {
                started: false,
                completed: false
            },

            requests: {
                enabled: true,
                colored: true,
                showAll: true,

                show: {
                    time: false,
                    statusCode: true,
                    statusMessage: false
                },

                ignore: []
            },

            deprecationWarnings: {
                enabled: true,
                showStack: false
            }
        },

        date: {
            timezone: null,
            format: "YYYY-MM-DD H:mm:ss"
        },

        paths: {
            base: "./",
            backend: "base://backend",
            frontend: "base://frontend",
            public: "base://public",
            storage: "base://storage",
            node_modules: "base://node_modules",
            routesFile: "backend://routes.js",
            events: "backend://events",
            jobs: "backend://jobs",
            controllers: "backend://controllers",
            models: "backend://models",
            middlewares: "backend://middlewares",
            views: "backend://views",
            jsonConfigs: "backend://",
            configs: "backend://configs"
        }
    };
}
