export interface Config {
    /**
     * Name of Application
     */
    name?: string;

    /**
     * Current environment.
     * Equivalent to NODE_ENV
     */
    env?: string;

    /**
     * Paths Object
     */
    paths: {
        // Base Folder
        base: string;

        // Backend Folder
        backend?: string;
    };
}

export interface Options {}
