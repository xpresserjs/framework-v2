import type { Xpresser } from "../xpresser.js";
import InXpresserError from "../errors/InXpresserError.js";

export declare module BootCycle {
    export type Func = (next: () => void, $: Xpresser) => any;
    export type DefaultKeys = "beforeStart" | "start" | "boot" | "started";

    // Server Module BootCycles
    // Make use of interface to make it extensible
    export interface DefaultCycles extends Record<string, Func[]> {}

    // CustomCycles extends a record of DefaultKeys
    // this is done purposely to make it extensible
    // Since DefaultKeys is a string literal array, it can't be extended.
    export interface CustomCycles extends Record<DefaultKeys, any> {}

    export type Keys = keyof CustomCycles;
    export type Keys$ = `${Keys}$`;
    export type On = Record<Keys | Keys$, (fn: Func) => On>;
}

export default class BootCycleEngine {
    /**
     * BootCycle - Boot Cycle Initializer
     * Extends `$.on`, adds boot cycle functions.
     * @param $
     * @constructor
     */
    static initialize($: Xpresser) {
        // loop through all boot cycles
        // and add them to the `$.on` object
        for (const cycle of $.getBootCycles()) {
            if (!$.on[cycle]) {
                $.on[cycle] = (todo) => {
                    $.addToBootCycle(cycle, todo);
                    // This is returned to allow chaining
                    return $.on;
                };

                // Add $.on.$cycle$Next
                const cycle$ = `${cycle}$` as BootCycle.Keys;
                $.on[cycle$] = (todo) => {
                    $.addToBootCycle(cycle, async (next, xpresser) => {
                        // Run todo function
                        await todo(() => {
                            $.console.logError(
                                new InXpresserError(
                                    `Next function called in $.on.${cycle$} is irrelevant.`
                                )
                            );
                        }, xpresser);

                        // Call next function
                        await next();
                    });

                    return $.on;
                };
            }
        }
    }
}

/**
 * Define Cycle Function
 */
export function BootCycleFunction(fn: BootCycle.Func): BootCycle.Func;
/**
 * Define Cycle Function with name as first argument
 * @param name
 * @param fn
 */
export function BootCycleFunction(name: string, fn: BootCycle.Func): BootCycle.Func;
/**
 * Define Cycle Function with function as first argument
 * @param fn
 * @param name
 */
export function BootCycleFunction(fn: BootCycle.Func, name: string): BootCycle.Func;
export function BootCycleFunction(fn: BootCycle.Func | string, name?: string | BootCycle.Func) {
    // if first argument is a string,
    // we assume it is the name of the function
    if (typeof fn === "string") {
        const $name = fn;
        fn = name as BootCycle.Func;
        name = $name;
    }

    // Provide a name for the function if name is defined
    // This is important because the name will be used
    // to log errors
    if (name) Object.defineProperty(fn, "name", { value: name });

    return fn;
}

/**
 * Add EngineData types
 */
declare module "../types/engine-data.js" {
    module EngineData {
        interface Main {
            bootCycle: {
                on: Record<BootCycle.Keys, number>;
                cycles: Record<BootCycle.Keys, { completed: true }>;
            };
        }
    }
}
