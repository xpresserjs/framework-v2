import type { Xpresser } from "../xpresser.js";

export declare module BootCycle {
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
                $.addToBootCycle(cycle, todo);
                // This is returned to allow chaining
                return $.on;
            };
        }
    }
}

/**
 * Define Cycle Function
 * Only provides types.
 */
export function BootCycleFunction(fn: BootCycle.Func, name?: string) {
    // Provide a name for the function
    // This is important because the name will be used
    // to log errors
    if (name) {
        Object.defineProperty(fn, "name", { value: name });
    }

    return fn;
}
