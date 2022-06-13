import BaseEngine from "./BaseEngine.js";
import type BaseModule from "../modules/module.js";
import Modules from "../types/modules.js";

export default class ModulesEngine extends BaseEngine {
    private default: Modules.AvailableKeywords | undefined;
    protected readonly registered: Record<string, InstanceType<typeof BaseModule>> = {};

    /**
     * Set the default module to be used,
     * When no module is specified
     * @param keyword
     */
    setDefault(keyword: Modules.AvailableKeywords) {
        // check if keyword is registered
        if (!this.registered[keyword]) {
            throw new Error(`Module with keyword: "${keyword}" is not registered yet!.`);
        }

        // set as default
        this.default = keyword;

        return this;
    }

    /**
     * Load the current application module.
     */
    async register<M extends typeof BaseModule>(Module: M) {
        const module = new Module(this.$);
        // register module
        this.registered[module.keyword] = module;
    }

    /**
     * Get the current active modules.
     */
    public getActive() {
        // if already in engineData, return
        if (this.$.engineData.data.activeModule) {
            return this.$.engineData.data.activeModule;
        }
        // The second argument passed to console is the active module
        const activeModule = process.argv[2];

        // save to engineData
        this.$.engineData.data.activeModule = activeModule;

        return activeModule;
    }

    public loadActiveModule() {}

    /**
     * Register Server ModulesEngine
     */
    async useServerModule() {
        // Import and use ConsoleEngine ModulesEngine
        const ServerModule = await import("../modules/server.module.js");
        await this.register(ServerModule.default);
    }

    /**
     * Register ConsoleEngine ModulesEngine
     */
    async useConsoleModule() {
        // Import and use ConsoleEngine ModulesEngine
        const ConsoleModule = await import("../modules/console.module.js");
        await this.register(ConsoleModule.default);
    }
}
