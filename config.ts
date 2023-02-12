/**
 * This file represents the default config.
 * This config will be merged with the current app config
 */
import { Config } from "./types/configs.js";
import { ObjectCollectionTyped } from "object-collection";

export class XpresserConfig<Datatype extends Config.Main> extends ObjectCollectionTyped<Datatype> {
    // Check if value is true
    isTrue(path: string) {
        return this.get(path) === true;
    }

    // Check if value is false
    isFalse(path: string) {
        return this.get(path) === false;
    }

    isDefined(path: string) {
        return this.has(path) && !!this.get(path);
    }

    isUndefined(path: string) {
        return !this.isDefined(path);
    }
}

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
