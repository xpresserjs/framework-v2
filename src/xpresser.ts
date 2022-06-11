import PATH from "node:path";
import { ObjectCollection } from "object-collection";
import type { Config, Options } from "./types/configs.js";
import File from "./engines/File.js";
import { __dirname } from "./functions/path.js";
import Console from "./engines/Console.js";

export class Xpresser {
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

        // Initialize Console
        this.console = new Console(this);
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
}
