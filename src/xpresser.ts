import PATH from "node:path";
import { ObjectCollection } from "object-collection";
import type { Config, Options } from "./types/configs.js";
import File from "./engines/File.js";
import { __dirname } from "./functions/path.js";
import Console from "./engines/Console.js";
import InitializeBootCycle, {
    BootCycleFunction,
    BootCycles,
    XpresserOn
} from "./engines/BootCycle.js";
import type BaseEngine from "./engines/BaseEngine.js";

export class Xpresser {
    /**
     * Options
     */
    public options: Options = {
        requireOnly: false,
        autoBoot: false,
        isConsole: false,
        isTinker: false,
        isFromXjsCli: false
    };

    /**
     * Config Collection
     */
    public config: ObjectCollection<Config>;

    /**
     * Engine Memory Store
     */
    public engineData: ObjectCollection<any> = new ObjectCollection();

    /**
     * Store
     */
    public store: ObjectCollection<any> = new ObjectCollection();

    /**
     * Console
     */
    console: Console;

    /**
     * Boot Cycles
     */
    private bootCycles: Record<BootCycles, any[]> = {
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
    readonly on: XpresserOn = {} as XpresserOn;

    /**
     * Initialize new xpresser instance
     * @param config
     * @param options
     */
    constructor(config: Config, options?: Partial<Options>) {
        // Initialize Config as object-collection type.
        this.config = new ObjectCollection<Config>(config);

        // Update Options
        this.updateOptions(options);

        // Load xpresser's Package.json file
        this.loadPackageDotJsonFile();

        // Initialize Boot Cycle Functions
        InitializeBootCycle(this);

        // Initialize Console
        this.console = new Console(this);
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
    updateOptions(options: Partial<Options> = {}) {
        this.options = {
            ...this.options,
            ...options
        };
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
    }

    /**
     * Get list of all boot cycles.
     * Since `bootCycles` is a private property,
     * This method is used to get the list of all boot cycles.
     * Preventing from modifying the `bootCycles` property.
     */
    getBootCycles(): BootCycles[] {
        return Object.keys(this.bootCycles) as BootCycles[];
    }

    /**
     * addBootCycle - Short Hand Function
     * Adds an event to a given key.
     * @param name
     * @param functions
     * @constructor
     */
    addBootCycle(name: BootCycles, functions: BootCycleFunction | BootCycleFunction[]) {
        if (Array.isArray(functions)) {
            for (const fn of functions) {
                this.bootCycles[name].push(functions);
            }
        } else {
            this.bootCycles[name].push(functions);
        }
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
    }

    async start() {}
}
