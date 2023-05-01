import chalk from "chalk";
import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";
import InXpresserError from "../errors/InXpresserError.js";
import BaseModule, { BaseModuleConfig, type Modules } from "../modules/BaseModule.js";
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
            ModuleEngine: ModuleEngineMemoryData;
        }
    }
}

export interface RegisterModuleConfig {
    /**
     * Add Boot Cycles to add to module.
     * This enables you to add extra boot cycles to a module.
     * These cycles will be concatenated to the module's custom boot cycles.
     */
    addBootCycles?: BootCycle.Keys[];
    /**
     * Over
     */
    keyword?: Modules.Keywords;

    // Todo: reconsider this option
    // /**
    //  * Is Copying Module?
    //  * If you are copying a module, or registering a module that is already registered but with a different keyword.
    //  */
    // isCopying?: boolean;
}

/**
 * Default ModuleEngine Class
 */
export default class ModuleEngine extends BaseEngine<ModuleEngineMemoryData> {
    /**
     * Base Engine Config
     */
    static readonly config: BaseEngineConfig = {
        name: "Xpresser/ModuleEngine"
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
        // check if the keyword is registered
        if (!this.registered[keyword]) {
            throw new InXpresserError(`Module with keyword: "${keyword}" is not registered yet!.`);
        }

        // set as default
        this.#default = keyword;
        return this;
    }

    has(keyword: Modules.Keywords): boolean;
    has(keyword: Modules.Keywords, assert: true): boolean | never;
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
    async register(Module: Modules.Module, config: RegisterModuleConfig = {}) {
        let keyword = Module.config.keyword;
        // throw error if name is undefined
        if (!keyword) {
            throw new InXpresserError(
                `Module: "${Module.name}" does not have a keyword property in config!`
            );
        }

        // check if custom keyword is set
        const hasCustomKeyword = typeof config.keyword !== "undefined";

        // check if the original keyword is registered
        // this way we can detect if we are copying or not.
        const isCopying = hasCustomKeyword && this.has(keyword as Modules.Keywords);
        if (hasCustomKeyword) keyword = config.keyword as string;

        // register module
        this.registered[keyword] = Module as typeof BaseModule;

        // if it is not copying, we add boot cycles
        if (!isCopying) {
            // register boot cycles
            let customCycles = [
                ...this.registered[keyword].customBootCycles(),
                ...(config.addBootCycles || [])
            ];

            if (customCycles.length) {
                // make sure bootCycles are unique
                customCycles = [...new Set(customCycles)];

                // Add custom cycles to boot cycles
                this.$.addBootCycle(customCycles as BootCycle.Keys[]);
            }
        }
    }

    /**
     * Register Module Using a function
     */
    async registerFn(
        fn: () => Modules.Module | Promise<Modules.Module>,
        config: RegisterModuleConfig = {}
    ) {
        const Module = await fn();
        // Register Module
        return this.register(Module, config);
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
        if (!activeModule) {
            return this.#noActiveModuleError();
        }

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
     * No Active Module Error Log
     * @private
     */
    #noActiveModuleError() {
        this.$.console.logError(
            `No 'default' module found, Set default module or pass a module to run.`
        );

        const registeredKeys = Object.keys(this.registered);
        if (registeredKeys.length) {
            // show help
            this.$.console.spacing();
            this.$.console.log(`Below are the available modules:`);
            // log all registered modules (numbered)
            for (const [index, keyword] of registeredKeys.entries()) {
                // get module
                const m = this.registered[keyword];
                let msg = `${index + 1}. ${chalk.yellow(keyword)}`;

                if (m.config.description) {
                    msg += ` => ${chalk.whiteBright(m.config.description)}`;
                }

                this.$.console.log(msg);
            }

            this.$.console.spacing();
        }

        return this.$.exit();
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
     * Check if a module is active
     * @param keyword - Module Keyword
     */
    isActive(keyword: Modules.Keywords): boolean;
    /**
     * Run a function if module is active
     * @param keyword - Module Keyword
     * @param fn - Function to run if module is active
     */
    isActive(keyword: Modules.Keywords, fn: () => void): void;
    /**
     * Check if a module is active and run a function if provided.
     * Note: Function will only run if the module is active.
     * @param keyword - Module Keyword
     * @param fn - Function to run if module is active
     */
    isActive(keyword: Modules.Keywords, fn?: () => void): boolean | void {
        // if (this.getActive() === keyword) fn();
        // return this;

        const isActive = this.getActive() === keyword;

        if (fn && isActive) return fn();

        return isActive;
    }

    /**
     * Check if a module is not active
     * @param keyword - Module Keyword
     */
    isNotActive(keyword: Modules.Keywords): boolean;

    /**
     * Run a function if module is not active
     * @param keyword - Module Keyword
     * @param fn - Function to run if module is not active
     */
    isNotActive(keyword: Modules.Keywords, fn: () => void): void;

    /**
     * Check if a module is not active and run a function if provided.
     * Note: Function will only run if the module is not active.
     * @param keyword - Module Keyword
     * @param fn - Function to run if module is not active
     */
    isNotActive(keyword: Modules.Keywords, fn?: () => void): boolean | void {
        const isNotActive = this.getActive() !== keyword;

        if (fn && isNotActive) return fn();

        return isNotActive;
    }
}
