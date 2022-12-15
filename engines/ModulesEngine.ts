import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";
import InXpresserError from "../errors/InXpresserError.js";
import BaseModule, { type Modules } from "../modules/BaseModule.js";
import type { BootCycle } from "./BootCycleEngine.js";

/**
 * Add EngineData types
 */
export interface ModuleEngineMemoryData {
    activeModule?: string;
}

declare module "../types/engine-data.js" {
    module EngineData {
        interface EnginesMemory {
            ModulesEngine: ModuleEngineMemoryData;
        }
    }
}

/**
 * Default ModulesEngine Class
 */
export default class ModulesEngine extends BaseEngine<ModuleEngineMemoryData> {
    /**
     * Base Engine Config
     */
    static config: BaseEngineConfig = {
        name: "Xpresser/ModulesEngine"
    };

    /**
     * Active Module Instance
     */
    protected activeInstance?: BaseModule<any>;

    /**
     * Default
     */
    #default?: Modules.Keywords;

    /**
     * Registered Modules
     */
    protected readonly registered: Record<string, typeof BaseModule> = {};

    /**
     * Set the default module to be used,
     * When no module is specified
     * @param keyword
     */
    setDefault(keyword: Modules.Keywords) {
        // check if keyword is registered
        if (!this.registered[keyword]) {
            throw new InXpresserError(`Module with keyword: "${keyword}" is not registered yet!.`);
        }

        // set as default
        this.#default = keyword;
        return this;
    }

    has(keyword: Modules.Keywords, assert: boolean = false): boolean | never {
        if (assert) {
            const hasModule = this.has(keyword);

            if (!hasModule)
                throw new InXpresserError(
                    `Module with keyword: "${keyword}" is not registered yet!.`
                );

            return hasModule;
        }

        return this.registered[keyword] !== undefined;
    }

    /**
     * Load the current application module.
     */
    async register<M extends typeof BaseModule<any>>(Module: M) {
        const name = Module.keyword;

        // throw error if name is undefined
        if (!name) {
            throw new InXpresserError(
                `Module: "${Module.name}" does not have a static keyword property!`
            );
        }

        // register module
        this.registered[Module.keyword] = Module;

        this.has(Module.keyword as Modules.Keywords, true);

        // register boot cycles
        const customCycles = Module.customBootCycles();
        if (customCycles.length) {
            // if true, add custom cycles to boot cycles
            this.$.addBootCycle(customCycles as BootCycle.Keys[]);
        }
    }

    /**
     * Register Module Using a function
     */
    async registerFn<M extends typeof BaseModule<any>>(fn: () => M | Promise<M>) {
        const Module = await fn();
        // Register Module
        return this.register(Module);
    }

    /**
     * Get the current active modules.
     */
    public getActive() {
        // if already in return
        if (this.memory.data.activeModule) return this.memory.data.activeModule;

        // The second argument passed to console is the active module
        let activeModule: string | undefined = process.argv[2];

        // if no active module, return default
        if (!activeModule) activeModule = this.#default;

        // save to engine
        this.memory.data.activeModule = activeModule;

        // return
        return activeModule;
    }

    /**
     * Get the active module instance.
     */
    public getActiveInstance<Module extends BaseModule<any>>() {
        if (!this.activeInstance) throw new InXpresserError(`No active module instance found!`);
        return this.activeInstance as Module;
    }

    /**
     * Loads and initializes the current active module.
     */
    public async initializeActiveModule() {
        const activeModule = this.getActive() as Modules.Keywords;
        if (!activeModule) return this.$.console.logError(`No 'default' module found!`);

        // Assert if active module is not registered
        try {
            this.has(activeModule, true);
        } catch (e: any) {
            return this.$.console.logErrorAndExit(e.message);
        }

        // Load module
        const Module = this.registered[activeModule];

        // initialize module
        const module = new Module(this.$);

        // Initialize module
        await module.init();

        // Set as active instance
        this.activeInstance = module;
    }

    /**
     * Register Console Module
     */
    useConsoleModule() {
        return this.registerFn(async () => {
            const ConsoleModule = await import("../modules/console/ConsoleModule.js");
            return ConsoleModule.default;
        });
    }

    /**
     * If is module
     * Run the function passed to it.
     */
    ifIs(keyword: Modules.Keywords, fn: () => void) {
        if (this.getActive() === keyword) fn();
        return this;
    }

    /**
     * If is not module
     * Run the function passed to it.
     */
    ifIsNot(keyword: Modules.Keywords, fn: () => void) {
        if (this.getActive() !== keyword) fn();
        return this;
    }
}
