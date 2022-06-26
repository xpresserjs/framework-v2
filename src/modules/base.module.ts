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

export default class BaseModule<MemoryData = Record<string, any>> {
    protected memory: ObjectCollectionTyped<MemoryData>;

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
     * Provide the module with the Xpresser instance.
     * @param $
     */
    constructor(protected readonly $: Xpresser) {
        const className = this.constructor.name;

        // set xpresser instance
        this.$ = $;

        // get modules engine data
        const engines = this.$.engineData.path(`modules`);

        // If this module already exists, throw error
        if (engines.has(className)) {
            throw new InXpresserError(
                `ModuleClass with name: "${className}" already has memory data!`
            );
        }

        // Create memory data
        this.memory = engines.path(className) as typeof this.memory;
    }

    /**
     * Initialize the module.
     */
    async init() {
        // Init module
    }

    /**
     * Provide boot cycles to be added.
     */
    static customBootCycles(): string[] {
        return [];
    }
}
