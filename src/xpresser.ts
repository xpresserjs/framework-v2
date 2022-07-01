import PATH from "node:path";
import { ObjectCollection, ObjectCollectionTyped } from "object-collection";
import InXpresserError from "./errors/InXpresserError.js";
import File from "./classes/File.js";
import { __dirname } from "./functions/path.js";
import ConsoleEngine from "./engines/ConsoleEngine.js";
import BootCycleEngine, { BootCycle } from "./engines/BootCycleEngine.js";
import { DefaultConfig } from "./config.js";
import ModulesEngine from "./engines/ModulesEngine.js";
import type Config from "./types/configs.js";
import type { EngineData } from "./types/engine-data.js";
import type BaseEngine from "./engines/BaseEngine.js";
import PathEngine from "./engines/PathEngine.js";

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
    public readonly config: ObjectCollectionTyped<Config.Main>;

    /**
     * Engine Memory Store
     */
    public readonly engineData = new ObjectCollectionTyped<EngineData.Main>({} as EngineData.Main);

    /**
     * Store
     */
    public readonly store: ObjectCollection<any> = new ObjectCollection();

    /**
     * PathEngine variable
     */
    readonly path: PathEngine;

    /**
     * ConsoleEngine variable
     */
    readonly console: ConsoleEngine;

    /**
     * Default Boot Cycles
     */
    private readonly bootCycles: BootCycle.DefaultCycles = {
        beforeStart: [],
        start: [],
        boot: [],
        started: []
    };

    /**
     * Boot Cycle Functions
     */
    readonly on: BootCycle.On;

    /**
     * Has serves a source of truth for the current environment
     */
    private readonly has = {
        /**
         * Set to true once modules have been initialized
         */
        registeredModules: false,

        /**
         * Set to true once $.start is called.
         */
        started: false
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
        this.config = ObjectCollectionTyped.useCloned(DefaultConfig).merge(config);

        // setup date
        this.setupDate();

        // Update Options
        this.updateOptions(options);

        // Load xpresser's Package.json file
        this.loadPackageDotJsonFile();

        // Initialize ConsoleEngine
        this.console = new ConsoleEngine(this);

        // Initialize PathEngine
        this.path = new PathEngine(this).resolveConfigPaths();

        /**
         * Since $.on can be populated by other engines,
         * We need to override the default getter
         * And throw an error if a particular boot cycle key is not found
         */
        this.on = new Proxy({} as BootCycle.On, {
            get: (target, prop: BootCycle.Keys) => {
                if (!this.bootCycles[prop] && prop.slice(-1) !== "$") {
                    this.console.logErrorAndExit(
                        new InXpresserError(
                            `$.on.${prop} has not been initialized or is not a valid boot cycle name.`
                        )
                    );
                }

                return target[prop];
            }
        });

        // Initialize Boot Cycle Functions
        BootCycleEngine.initialize(this);

        // Initialize Modules
        this.modules = new ModulesEngine(this);
    }

    /**
     * Equips any xpresser engine with the current xpresser instance
     * @param engine
     */
    engine<Engine extends typeof BaseEngine>(engine: Engine) {
        return new engine(this) as InstanceType<Engine>;
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
            if (this.bootCycles[cycle]) throw Error(`Boot cycle "${cycle}" already exists.`);

            // set the cycle
            this.bootCycles[cycle] = [];
        }

        // Re-initialize Boot Cycle Functions
        BootCycleEngine.initialize(this);

        return this;
    }

    /**
     * Run a boot cycle
     * @param cycle
     */
    runBootCycle(cycle: BootCycle.Keys) {
        if (!this.has.registeredModules) {
            return this.console.logErrorAndExit(
                new InXpresserError(
                    `Cannot run boot cycle "${cycle}" before modules are registered.`
                )
            );
        }

        // Check if cycle exists
        if (!this.bootCycles[cycle]) {
            throw new InXpresserError(`Boot cycle "${cycle}" does not exist.`);
        }

        // get BootCycle engine data as a collection
        const engineData = this.engineData.path("bootCycle");

        // Set this boot cycle key
        const key = `on.${cycle}`;
        const completedKey = `cycles.${cycle}.completed`;

        if (engineData.has(completedKey) && engineData.get(completedKey) === true) {
            // If cycle has already been completed,
            // throw error to prevent from running it again
            throw new InXpresserError(`Boot cycle "${cycle}" can only run once.`);
        }

        // Get all cycle functions
        const cycles = this.bootCycles[cycle];

        // Return promise that will be resolved when all cycles are completed
        return new Promise<void>(async (resolve, reject) => {
            // Log Start of Boot Cycle
            this.console.debugIf("bootCycle.started", () => {
                this.console.logInfo(`Cycle: [${cycle}] started`);
            });

            // on complete function
            const onCycleComplete = () => {
                // Set this key to complete in engineData
                engineData.set(completedKey, true);

                // Log End of Boot Cycle
                this.console.debugIf("bootCycle.completed", () => {
                    this.console.logSuccess(`Cycle: [${cycle}] completed`);
                });

                return resolve();
            };

            // on error function
            const onCycleError = (err: Error, cycleFnName?: string) => {
                // log Error with cycle function name
                this.console.logError(
                    `Error in boot cycle [${cycle}:${cycleFnName || "Anonymous"}] error.`
                );

                return reject(InXpresserError.use(err));
            };

            if (cycles.length) {
                // Record current cycle index;
                engineData.set(key, 0);

                // Add end cycle function
                cycles.push(onCycleComplete);

                /**
                 * Create next cycle function
                 */
                const next = async () => {
                    // get last cycle index for this boot cycle
                    const lastIndex = engineData.get(key, 0);

                    // get current cycle function
                    const currentIndex = lastIndex + 1;
                    engineData.set(key, currentIndex);

                    // if for some reason, currentIndex is not a function,
                    // then throw error
                    if (typeof cycles[currentIndex] !== "function") {
                        throw new InXpresserError(
                            `Boot cycle "${cycle}" has no function at index ${currentIndex}.`
                        );
                    }

                    // Run current cycle function
                    try {
                        await cycles[currentIndex](next, this);
                    } catch (err: any) {
                        return onCycleError(err, cycles[currentIndex].name);
                    }
                };

                /**
                 * Start first cycle function
                 */
                try {
                    await cycles[0](next, this);
                } catch (e: any) {
                    return onCycleError(e, cycles[0].name);
                }
            } else {
                return onCycleComplete();
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
        // Log Error if instance has started already.
        if (this.has.started) {
            this.console.logError(
                new InXpresserError(
                    "$.start has already been called! Application has already started."
                )
            );

            return this;
        }

        // Set started to true
        this.has.started = true;

        await this.modules.initializeActiveModule();

        // Set registered flag
        this.has.registeredModules = true;

        await this.runBootCycle("beforeStart");

        // Run `start` cycle
        await this.runBootCycle("start");

        // Run `boot` cycle
        await this.runBootCycle("boot");

        // Run`started` cycle
        await this.runBootCycle("started");

        return this;
    }

    /**
     * Set timezone to process.env.TZ
     */
    private setupDate() {
        // configure timezone
        const timezone = this.config.getTyped("date.timezone");
        if (timezone) process.env.TZ = timezone;

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
        const packageDotJson = File.readJson(packageDotJsonPath);

        // Store package.json in engineData
        this.engineData.setTyped("packageDotJson", {
            path: packageDotJsonPath,
            data: packageDotJson
        });

        return this;
    }
}
