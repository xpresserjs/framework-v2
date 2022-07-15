import InXpresserError from "../errors/InXpresserError.js";
import type { Xpresser } from "../xpresser.js";
import type { ObjectCollectionTyped } from "object-collection";

/**
 * ModulesEngine Related Types
 */
export declare module Modules {
    export enum Available {}
    export type Keywords = keyof typeof Available;
}

export interface BaseModuleConfig {
    name: string;
}

export default class BaseModule<MemoryData = Record<string, any>> {
    /**
     * Module Settings
     */
    static config: BaseModuleConfig;

    /**
     * Holds the module memory data.
     */
    protected memory: ObjectCollectionTyped<MemoryData>;

    /**
     * Holds the current initialized state of this module.
     */
    protected initialized: boolean = false;

    /**
     * ModulesEngine launch keyword
     */
    static readonly keyword: string = "";

    /**
     * Get xpresser console instance.
     */
    protected get console() {
        return this.$.console;
    }

    /**
     * Xpresser instance
     */
    protected readonly $!: Xpresser;

    /**
     * Provide the module with the Xpresser instance.
     * @param $
     */
    constructor($: Xpresser) {
        // Get Module Config
        const config = this.$static().config;

        // if no settings throw error
        if (!config)
            throw new InXpresserError(
                `Module with name: "${this.$static().name}" is not configured yet!.`
            );

        // if no name throw error
        if (!config.name)
            throw new InXpresserError(
                `Engine with name: "${this.$static().name}" has no name configured.`
            );

        // if no settings throw error
        if (!config)
            throw new InXpresserError(
                `Engine with name: "${this.$static().name}" is not configured yet!.`
            );

        // Get Module Name
        const name = config.name || this.$static().name;

        // set xpresser instance
        Object.defineProperty(this, "$", { enumerable: false, value: $ });

        // get modules engine data
        const engines = this.$.engineData.path(`modules`);

        // If this module already exists, throw error
        if (engines.has(name)) {
            throw new InXpresserError(`ModuleClass with name: "${name}" already has memory data!`);
        }

        // Create memory data
        this.memory = engines.path(name) as ObjectCollectionTyped<MemoryData>;
    }

    /**
     * Static Self Reference
     * @returns
     */
    $static<Self extends typeof BaseModule>() {
        return this.constructor as Self;
    }

    /**
     * Get Engine Data
     * @param $
     */
    static $engineData<MemoryData>($: Xpresser) {
        return $.engineData
            .path(`modules`)
            .path(this.config.name) as ObjectCollectionTyped<MemoryData>;
    }

    /**
     * Initialize the module.
     */
    init(): void | Promise<void> {
        // Init module
    }

    /**
     * Provide boot cycles to be added.
     */
    static customBootCycles(): string[] {
        return [];
    }
}
