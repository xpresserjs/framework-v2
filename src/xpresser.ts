import PATH from "node:path";
import { ObjectCollection } from "object-collection";
import File from "./classes/File.js";
import { __dirname } from "./functions/path.js";
import ConsoleEngine from "./engines/ConsoleEngine.js";
import BootCycleEngine, { BootCycle } from "./engines/BootCycleEngine.js";
import { DefaultConfig } from "./config.js";
import type Config from "./types/configs.js";
import type EngineData from "./types/engine-data.js";
import type BaseEngine from "./engines/BaseEngine.js";
import ModulesEngine from "./engines/ModulesEngine.js";
import InXpresserError from "./errors/InXpresserError.js";

export class Xpresser {
    /**
     * Options
     */
    public readonly options: Config.Options = {
        requireOnly: false,
        autoBoot: false,
        isConsole: false,
        isTinker: false,
        isFromXjsCli: false
    };

    /**
     * Config Collection
     */
    public readonly config: ObjectCollection<Config.Main>;

    /**
     * Engine Memory Store
     */
    public readonly engineData: ObjectCollection<EngineData.Main> = new ObjectCollection();

    /**
     * Store
     */
    public readonly store: ObjectCollection<any> = new ObjectCollection();

    /**
     * ConsoleEngine Engine
     */
    readonly console: ConsoleEngine;

    /**
     * Default Boot Cycles
     */
    private readonly bootCycles: BootCycle.DefaultCycles = {
        start: [],
        boot: [],
        expressInit: [],
        serverInit: [],
        bootServer: [],
        http: [],
        https: [],
        serverBooted: []
    };

    /**
     * Boot Cycle Functions
     */
    readonly on: BootCycle.On = {} as BootCycle.On;

    /**
     * Has serves a source of truth for the current environment
     */
    readonly has = {
        registeredModules: false
    };

    /**
     * Modules Engine
     */
    readonly modules: ModulesEngine;

    /**
     * Initialize new xpresser instance
     * @param config
     * @param options
     */
    constructor(config: Config.InitConfig, options?: Partial<Config.Options>) {
        // Initialize Config as object-collection type.
        this.config = new ObjectCollection(config as Config.Main).merge(DefaultConfig);

        // Update Options
        this.updateOptions(options);

        // Load xpresser's Package.json file
        this.loadPackageDotJsonFile();

        // Initialize Boot Cycle Functions
        BootCycleEngine.initialize(this);

        // Initialize ConsoleEngine
        this.console = new ConsoleEngine(this);

        // Initialize Modules
        this.modules = new ModulesEngine(this);
    }

    /**
     * Equips any xpresser engine with the current xpresser instance
     * @param engine
     */
    engine<Engine extends typeof BaseEngine>(engine: Engine) {
        return engine.use<Engine>(this);
    }

    /**
     * Update Xpresser Options
     * @param options
     */
    updateOptions(options: Partial<Config.Options> = {}) {
        Object.assign(this.options, options);
        return this;
    }

    /**
     * Loads this package's package.json file
     * Save it to this.engineData collection
     * Using key "packageDotJson"
     * @private
     */
    private loadPackageDotJsonFile() {
        const currentDir = __dirname(import.meta.url);
        let packageDotJsonPath = PATH.resolve(currentDir, "../package.json");

        // if package.json does not exist,
        // try to find it in the parent directory
        if (!File.exists(packageDotJsonPath)) {
            packageDotJsonPath = PATH.resolve(currentDir, "../../package.json");
        }

        // Read package.json file
        type PackageDotJson = typeof import("../package.json");
        const packageDotJson = File.readJson<PackageDotJson>(packageDotJsonPath);

        // Store package.json in engineData
        this.engineData.set("packageDotJson", {
            path: packageDotJsonPath,
            data: packageDotJson
        });

        return this;
    }

    /**
     * Get list of all boot cycles.
     * Since `bootCycles` is a private property,
     * This method is used to get the list of all boot cycles.
     * Preventing from modifying the `bootCycles` property.
     */
    getBootCycles(): BootCycle.Keys[] {
        return Object.keys(this.bootCycles) as BootCycle.Keys[];
    }

    /**
     * Get Boot Cycle Stats
     * Returns the statistics of the current boot cycle
     *
     */
    getBootCyclesStats() {
        const stats = {} as Record<BootCycle.Keys, number>;
        for (const key of Object.keys(this.bootCycles) as BootCycle.Keys[]) {
            stats[key] = this.bootCycles[key].length;
        }

        return stats;
    }

    /**
     * Adds a cycle to a boot cycle
     * @param cycle
     * @param functions
     * @constructor
     */
    addToBootCycle(cycle: BootCycle.Keys, functions: BootCycle.Func | BootCycle.Func[]) {
        if (Array.isArray(functions)) {
            for (const fn of functions) {
                this.bootCycles[cycle].push(fn);
            }
        } else {
            this.bootCycles[cycle].push(functions);
        }

        return this;
    }

    /**
     * Add Boot Cycle
     * @param cycle
     */
    addBootCycle(cycle: BootCycle.Keys): this;
    /**
     * Add Multiple Boot Cycles
     * @param cycles
     */
    addBootCycle(cycles: BootCycle.Keys[]): this;
    addBootCycle(cycles: BootCycle.Keys | BootCycle.Keys[]) {
        if (typeof cycles === "string") cycles = [cycles];

        for (const cycle of cycles) {
            // check if cycle already exists
            if (this.bootCycles[cycle]) {
                throw Error(`Boot cycle "${cycle}" already exists.`);
            }

            this.bootCycles[cycle] = [];
        }

        // Re-initialize Boot Cycle Functions
        BootCycleEngine.initialize(this);

        return this;
    }

    /**
     * Run a boot cycle
     * @param cycle
     * @param done
     */
    runBootCycle(cycle: BootCycle.Keys) {
        // Check if cycle exists
        if (!this.bootCycles[cycle]) {
            throw new InXpresserError(`Boot cycle "${cycle}" does not exist.`);
        }

        return new Promise<void>(async (onCycleEnd, onCycleError) => {
            // Get all cycle functions
            const cycles = this.bootCycles[cycle];
            // Set this boot cycle key
            const key = `on.${cycle}`;

            if (cycles.length) {
                // Record current cycle index;
                this.engineData.set(key, 0);

                // Add end cycle function
                cycles.push(() => onCycleEnd());

                /**
                 * Create next cycle function
                 */
                const next = () => {
                    // get last cycle index for this boot cycle
                    const lastIndex = this.engineData.get(key, 0);
                    // get current cycle function
                    const currentIndex = lastIndex + 1;
                    this.engineData.set(key, currentIndex);

                    if (typeof cycles[currentIndex] !== "function") {
                        throw new InXpresserError(
                            `Boot cycle "${cycle}" has no function at index ${currentIndex}.`
                        );
                    }

                    return InXpresserError.tryOrCatch(() => {
                        // console.log("Running boot cycle function:", cycles[currentIndex]);
                        cycles[currentIndex](next, this);
                    });
                };

                // Pass next and current xpresser instance
                return InXpresserError.tryOrCatch(() => cycles[0](next, this));
            } else {
                return onCycleEnd();
            }
        });
    }

    /**
     * A shortcut to process.env
     * With option for default value
     * @param key
     * @param $default
     */
    env(key: string, $default: any) {
        if (typeof process.env[key] === "undefined") return $default;
        return process.env[key];
    }

    /**
     * Same as process
     * @param args
     */
    exit(...args: any[]) {
        return process.exit(...args);
    }

    /**
     * Same as `$.start`
     * @description
     * Boot has been renamed to `start`
     * This is because  `start` is the first boot cycle
     * So it makes sense to call it `start`
     * @deprecated
     */
    boot() {
        this.start().finally(() => {
            // do nothing
        });

        return this;
    }

    /**
     * Start the application
     */
    async start() {
        try {
            await this.modules.loadActiveModule();

            // Run `start` cycle
            await this.runBootCycle("start");
            this.console.log("Started!");

            // Run `boot` cycle
            await this.runBootCycle("boot");
            this.console.log("Booted!");
        } catch (error) {
            return this.console.logErrorAndExit(error);
        }

        return this;
    }
}
