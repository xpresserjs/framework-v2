import type { Xpresser } from "../xpresser.js";

/**
 * This class provides the base structure for all classes that requires Xpresser
 */
export default class BaseEngine {
    constructor(protected readonly $: Xpresser) {
        // Set xpresser instance to this class.
        this.$ = $;
    }

    static use<Engine extends typeof BaseEngine>(this: Engine, $: Xpresser) {
        return new this($) as InstanceType<Engine>;
    }
}
