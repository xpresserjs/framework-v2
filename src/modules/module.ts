import type { Xpresser } from "../xpresser.js";

export default class BaseModule {
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
