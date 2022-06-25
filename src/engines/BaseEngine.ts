import type { ObjectCollectionTyped } from "object-collection";
import type { Xpresser } from "../xpresser.js";
import InXpresserError from "../errors/InXpresserError.js";

/**
 * This class provides the base structure for all classes that requires Xpresser
 */
export default class BaseEngine<MemoryData = Record<string, any>> {
    protected memory: ObjectCollectionTyped<MemoryData>;

    constructor(protected readonly $: Xpresser) {
        const className = this.constructor.name;

        // set xpresser instance
        this.$ = $;

        // get modules engine data
        const engines = this.$.engineData.path(`engines`);

        // If this engine already exists, throw error
        if (engines.has(className)) {
            throw new InXpresserError(
                `EngineClass with name: "${className}" already has memory data!`
            );
        }

        // Create memory data
        this.memory = engines.path(className) as typeof this.memory;
    }
}
