import InXpresserError from "../errors/InXpresserError.js";
import type { ObjectCollectionTyped } from "object-collection";
import type { Xpresser } from "../xpresser.js";
import type { OC_TObject } from "object-collection/types";

export interface BaseEngineConfig {
    /**
     * Name of the engine
     */
    name: string;

    /**
     * If true, engine memory will be unique.
     * When memory is unique, you can only have one instance of the engine.
     * 
     * @default true
     */
    uniqueMemory?: boolean;
}

/**
 * This class provides the base structure for all classes that requires Xpresser
 */
export default class BaseEngine<MemoryData extends OC_TObject = Record<string, any>> {
    /**
     * Engine Configuration
     */
    static readonly config: BaseEngineConfig;

    /**
     * Current Xpresser instance
     */
    protected $!: Xpresser;

    /**
     * Engine Memory - This is where all data for this engine is stored.
     * It extends xpresser's engine data.
     * 
     * @example
     * this.memory.set('key', 'value')
     * // is same as
     * $.engineData.set('engines.{engineName}.key', 'value')
     */
    protected memory!: ObjectCollectionTyped<MemoryData>;

    /**
     * Initialize Engine
     * @param $ Xpresser Instance
     */
    constructor($: Xpresser) {
        // get engine settings
        const config = this.$static().config;

        // if no settings throw error
        if (!config)
            throw new InXpresserError(
                `Engine with name: "${this.$static().name}" is not configured yet!.`
            );

        // if no name, throw error
        if (!config.name)
            throw new InXpresserError(`Engine with name: "${config.name}" has no name configured.`);

        // enable unique memory by default
        if (typeof config.uniqueMemory === "undefined") config.uniqueMemory = true;

        // get Engine Name
        const name = config.name;

        // set xpresser instance
        Object.defineProperty(this, "$", { enumerable: false, value: $ });

        // get modules engine data
        const engines = this.$.engineData.path(`engines`);

        // if this engine already exists and uniqueMemory === true, throw error
        if (config.uniqueMemory && engines.has(name)) {
            throw new InXpresserError(
                `EngineClass with name: "${name}" already has memory data!`,
                "UniqueMemoryError"
            );
        }

        // create memory data
        Object.defineProperty(this, "memory", {
            enumerable: false,
            value: engines.path(name)
        });
    }

    /**
     * Get Engine Data from memory
     * @param $
     */
    static $engineData<MemoryData extends OC_TObject>($: Xpresser) {
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
