import BaseEngine from "./BaseEngine.js";
import type Modules from "../types/modules.js";
import type BaseModule from "../modules/module.js";
import type { BootCycle } from "./BootCycleEngine.js";

export default class ModulesEngine extends BaseEngine {
    private default: Modules.AvailableKeywords = "server";
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

    has(keyword: Modules.AvailableKeywords, assert: boolean = false): boolean | never {
        if (assert) {
            const hasModule = this.has(keyword);

            if (!hasModule)
                throw new Error(`Module with keyword: "${keyword}" is not registered yet!.`);

            return hasModule;
        }

        return this.registered[keyword] !== undefined;
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
        let activeModule = process.argv[2];

        // if no active module, return default
        if (!activeModule) activeModule = this.default;

        // save to engineData
        this.$.engineData.data.activeModule = activeModule;

        return activeModule;
    }

    /**
     * Loads and initializes the current active module.
     */
    public async loadActiveModule() {
        const activeModule = this.getActive() as Modules.AvailableKeywords;
        // Assert if active module is not registered
        this.has(activeModule, true);

        // Load module
        const module = this.registered[activeModule];

        // check if module has boot cycles
        const customCycles = module.customBootCycles();
        if (customCycles.length) {
            // if true, add custom cycles to boot cycles
            this.$.addBootCycle(customCycles as BootCycle.Keys[]);
        }

        // Initialize module
        await module.init();
    }

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
