declare module Config {
    export interface Debug {
        /**
         * If set to false all debugging && debug logs are disabled
         * While if set to true all debug settings are set to their configuration values.
         */
        enabled: boolean;

        /**
         * Boot Cycle debug settings
         */
        bootCycle: Partial<{
            /**
             * Log when boot cycle starts
             */
            started: boolean;

            /**
             * Log when boot cycle completes
             */
            completed: boolean;
        }>;

        /**
         * Enable showing controller action on every request.
         */
        requests: Partial<{
            /**
             * Enable Request Debugging
             */
            enabled: boolean;

            /**
             * Enable color in logs
             */
            colored: boolean;

            /**
             * Show all request log data
             */
            showAll: boolean;

            /**
             * Items to show in the request debug log
             */
            show: {
                /**
                 * Show time of the request
                 */
                time: boolean;

                /**
                 * Show status code of the request
                 */
                statusCode: boolean;

                /**
                 * Show status message of the request
                 */
                statusMessage: boolean;
            };

            // Ignore specific urls
            ignore: Array<string | number>;
        }>;

        /**
         * Deprecated warnings Configuration
         */
        deprecationWarnings: Partial<{
            /**
             * Enable Deprecated warnings
             */
            enabled: boolean;

            /**
             * Show stack trace of deprecated warnings
             */
            showStack: boolean;
        }>;
    }

    // todo: Move to server module
    export interface Server {
        /**
         * Middleware to handle server under maintenance mood
         * if not found default is used.
         */
        maintenanceMiddleware: string;

        /**
         * Server Port for http connections
         */
        port: number;

        /**
         * Url protocol (http|https)
         * Use https if ssl is enabled.
         */
        protocol: "http" | "https";

        /**
         * Server domain
         * e.g "localhost"
         */
        domain: string;

        /**
         * Root Folder
         * if calling xpresser from another folder not route
         * specify e.g  root: '/folder/'
         *
         * must end with trailing slash
         */
        root: `${string}/`;

        /**
         * In most development environment this is required to be true.
         * When true url helpers will append server port after server url
         *
         * @example
         * http://localhost:2000/some/path
         */
        includePortInUrl: boolean;

        /**
         * Specify Application BaseUrl directly
         */
        baseUrl: string;

        /**
         * SSL Configurations.
         */
        ssl: {
            /**
             * Enable ssl
             * default: false
             */
            enabled: boolean;

            /**
             * Ssl Port (if ssl is enabled)
             * default: 443
             */
            port: number;
        };

        /**
         * Enable or disable PoweredBy
         * For security purposes this is advised to be false.
         * default: xpresser
         */
        poweredBy: boolean;

        /**
         * Enable if you want public folder to be served
         */
        servePublicFolder: boolean;

        /**
         * Xpresser comes with a few packages for security,
         * You can enable or disable them here.
         * ['bodyParser', 'flash' 'helmet']
         */
        use: {
            /**
             * Use bodyParser package.
             */
            bodyParser: boolean;

            /**
             * Enable Flash package.
             */
            flash: boolean;
        };

        // requestEngine: {
        //     dataKey: "data";
        //     proceedKey: "proceed";
        //     messageKey: "_say";
        // };

        /**
         * Xpresser Router Config
         */
        router: {
            /**
             * Route url path case
             */
            pathCase: "snake" | "kebab"; // snake or kebab
        };
    }

    export interface Paths {
        /** Base Folder */
        base: string;

        /** Configs Folder */
        configs: string;

        /** Backend Folder */
        backend: string;

        /** Frontend Folder */
        frontend: string;

        /** Public Folder */
        public: string;

        /** Storage Folder */
        storage: string;

        /** Node modules Folder */
        node_modules: string;

        /** Events Folder */
        events: string;

        /** Controllers Folder */
        controllers: string;

        /** Models Folder */
        models: string;

        /** Middlewares Folder */
        middlewares: string;

        /** Views Folder */
        views: string;

        /** Json Configs Folder */
        jsonConfigs: string;

        /** Other Paths */
        routesFile: string;
    }

    /**
     * Xpresser's main configuration.
     */
    export interface Main {
        /**
         * Name of Application
         */
        name: string;

        /**
         * Current environment.
         * Equivalent to NODE_ENV
         */
        env: string;

        /**
         * Paths Object
         */
        paths: Paths;

        /**
         * Debug configurations
         */
        debug: Partial<Debug>;

        /**
         * Server Configuration
         */
        server: Partial<Server>;

        /**
         * Date Configurations
         */
        date: {
            // Date time zone
            timezone: null | string;
            // Date format
            format: string;
        };
    }

    export interface Options {
        requireOnly: boolean;
        autoBoot: boolean;
        isConsole: boolean;
        isTinker: boolean;
        isFromXjsCli: boolean;
    }

    /**
     * Xpresser Initialization Options
     * Sets required options for Xpresser to work.
     */
    export type InitConfig = Partial<Omit<Main, "env" | "paths">> & {
        env: string;

        paths: Partial<Paths> & {
            base: string;
        };
    };
}

export default Config;
