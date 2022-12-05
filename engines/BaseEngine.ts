import type { ObjectCollectionTyped } from "object-collection";
import InXpresserError from "../errors/InXpresserError.js";
import type { Xpresser } from "../xpresser.js";

export interface BaseEngineConfig {
    name: string;
    uniqueMemory?: boolean;
}
/**
 * This class provides the base structure for all classes that requires Xpresser
 */
export default class BaseEngine<MemoryData = Record<string, any>> {
    /**
     * Engine Settings
     */
    static readonly config: BaseEngineConfig;

    /**
     * Current Xpresser instance
     */
    protected $!: Xpresser;

    /**
     * BaseEngine Memory Data
     */
    protected memory!: ObjectCollectionTyped<MemoryData>;

    constructor($: Xpresser) {
        // Get Engine Settings
        const config = this.$static().config;

        // if no settings throw error
        if (!config)
            throw new InXpresserError(
                `Engine with name: "${this.$static().name}" is not configured yet!.`
            );

        // if no name throw error
        if (!config.name)
            throw new InXpresserError(`Engine with name: "${config.name}" has no name configured.`);

        if (typeof config.uniqueMemory === "undefined") config.uniqueMemory = true;

        // Get Engine Name
        const name = config.name;

        // set xpresser instance
        Object.defineProperty(this, "$", { enumerable: false, value: $ });

        // get modules engine data
        const engines = this.$.engineData.path(`engines`);

        // If this engine already exists and uniqueMemory === true, throw error
        if (config.uniqueMemory && engines.has(name)) {
            throw new InXpresserError(
                `EngineClass with name: "${name}" already has memory data!`,
                "UniqueMemoryError"
            );
        }

        // Create memory data
        Object.defineProperty(this, "memory", { enumerable: false, value: engines.path(name) });
    }

    /**
     * Get Engine Data
     * @param $
     */
    static $engineData<MemoryData>($: Xpresser) {
        return $.engineData
            .path(`engines`)
            .path(this.config.name) as ObjectCollectionTyped<MemoryData>;
    }

    /**
     * Static Self Reference
     * @returns
     */
    protected $static<Self extends typeof BaseEngine>() {
        return this.constructor as Self;
    }
}
