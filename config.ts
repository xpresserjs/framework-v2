/**
 * This file represents the default config.
 * This config will be merged with the current app config
 */
import { Config } from "./types/configs.js";

export const DefaultConfig: Config.Main = {
    name: "Xpresser",
    env: "development",

    debug: {
        enabled: true,

        bootCycle: {
            started: false,
            completed: false,
            irrelevantNextError: true,

            bootCycleFunctions: {
                started: false,
                completed: false
            }
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
