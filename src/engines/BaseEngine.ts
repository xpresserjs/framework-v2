import { ObjectCollection } from "object-collection";
import type { Xpresser } from "../xpresser.js";
import InXpresserError from "../errors/InXpresserError.js";

/**
 * This class provides the base structure for all classes that requires Xpresser
 */
export default class BaseEngine<MemoryData = Record<string, any>> {
    protected memory: ObjectCollection<MemoryData>;

    constructor(protected readonly $: Xpresser) {
        // Set xpresser instance to this class.
        this.$ = $;

        // Create memory object.
        const engines = this.$.engineData.path(`engines`);

        if (engines.has(this.constructor.name)) {
            throw new InXpresserError(
                `EngineClass with name: "${this.constructor.name}" already has memory data!`
            );
        }

        this.memory = engines.newInstanceFrom<MemoryData>(this.constructor.name);
    }

    static use<Engine extends typeof BaseEngine>(this: Engine, $: Xpresser) {
        return new this($) as InstanceType<Engine>;
    }
}
