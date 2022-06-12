import type { Xpresser } from "../xpresser.js";

export declare module XpresserBootCycle {
    export type Func = (next: () => void, $: Xpresser) => any;
    export type DefaultKeys =
        | "start"
        | "boot"
        | "expressInit"
        | "serverInit"
        | "bootServer"
        | "http"
        | "https"
        | "serverBooted";

    // Make use of interface to make it extensible
    export interface DefaultCycles extends Record<string, Func[]> {}
    export interface CustomCycles extends Record<DefaultKeys, Func[]> {}
    export type Keys = keyof CustomCycles;
    export type On = Record<Keys, (todo: Func) => On>;
}

/**
 * BootCycle - Boot Cycle Initializer
 * Extends `$.on`, adds boot cycle functions.
 * @param $
 * @constructor
 */
export default function InitializeBootCycle($: Xpresser) {
    // loop through all boot cycles
    // and add them to the `$.on` object
    for (const cycle of $.getBootCycles()) {
        if (!$.on[cycle]) {
            $.on[cycle] = (todo) => {
                $.addBootCycle(cycle, todo);

                // This is returned to allow chaining
                return $.on;
            };
        }
    }
}
