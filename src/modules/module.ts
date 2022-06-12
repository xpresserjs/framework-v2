import type { Xpresser } from "../xpresser.js";

export default class XpresserModule {
    constructor(protected readonly $: Xpresser) {
        this.$ = $;
    }
}
