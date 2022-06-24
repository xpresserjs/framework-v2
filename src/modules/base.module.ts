import type { Xpresser } from "../xpresser.js";
import { ObjectCollection } from "object-collection";
import InXpresserError from "../errors/InXpresserError.js";

export default class BaseModule<MemoryData = any> {
    protected memory: ObjectCollection<MemoryData>;

    /**
     * ModulesEngine launch keyword
     */
    readonly keyword: string = "";

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
        this.$ = $;

        // Set xpresser instance to this class.
        const engines = this.$.engineData.path(`modules`);

        if (engines.has(this.constructor.name)) {
            throw new InXpresserError(
                `ModuleClass with name: "${this.constructor.name}" already has memory data!`
            );
        }

        this.memory = engines.newInstanceFrom<MemoryData>(this.constructor.name);
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
    customBootCycles(): string[] {
        return [];
    }
}
