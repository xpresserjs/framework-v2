export declare module Config {
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

            /**
             * Hide irrelevant next error
             */
            irrelevantNextError: boolean;

            /**
             * Boot Cycle Function Logs
             */
            bootCycleFunctions: Partial<{
                /**
                 * Log when boot cycle function starts
                 */
                started: boolean;

                /**
                 * Log when boot cycle function completes
                 */
                completed: boolean;
            }>;
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

        /** Jobs Folder */
        jobs: string;

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
        paths: Partial<Paths>;

        /**
         * Debug configurations
         */
        debug: Partial<Debug>;

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
