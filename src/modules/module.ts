import type { Xpresser } from "../xpresser.js";

export default class BaseModule {
    /**
     * ModulesEngine launch keyword
     */
    readonly keyword: string = "";

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
}
