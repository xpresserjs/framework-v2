/**
 * This file represents the default config.
 * This config will be merged with the current app config
 */
import Config from "./types/configs.js";

export const DefaultConfig: Config.Main = {
    name: "Xpresser",
    env: "development",

    debug: {
        enabled: true,

        bootCycle: {
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

    server: {
        maintenanceMiddleware: "MaintenanceMiddleware.js",
        port: 2000,
        protocol: "http",
        domain: "localhost",
        root: "/",
        includePortInUrl: true,
        baseUrl: "",
        poweredBy: true,
        servePublicFolder: true,

        ssl: {
            enabled: false,
            port: 443
        },

        use: {
            bodyParser: true,
            flash: false
        },

        router: {
            pathCase: "snake"
        }
    },

    date: {
        timezone: null,
        format: "YYYY-MM-DD H:mm:ss"
    },

    paths: {
        base: "./",
        backend: "base://backend",
        frontend: "frontend",
        public: "public",
        storage: "storage",
        node_modules: "base://node_modules",
        routesFile: "backend://routes.js",
        events: "backend://events",
        controllers: "backend://controllers",
        models: "backend://models",
        middlewares: "backend://middlewares",
        views: "backend://views",
        jsonConfigs: "backend://",
        configs: "backend://configs"
    }
};
