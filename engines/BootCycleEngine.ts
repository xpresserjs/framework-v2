import type { Xpresser } from "../xpresser.js";
import InXpresserError from "../errors/InXpresserError.js";
import { NamedFunc } from "../functions/utils.js";

export declare module BootCycle {
    // Boot Cycle Function
    export type Func = (next: () => void, $: Xpresser) => any;

    // Server Module BootCycles
    // Make use of interface to make it extensible
    export interface DefaultCycles extends Record<string, Func[]> {}

    // Custom Module BootCycles
    export enum Cycles {
        beforeStart = "beforeStart",
        start = "start",
        boot = "boot",
        started = "started"
    }

    export type Keys = keyof typeof Cycles;
    export type Keys$ = `${Keys}$`;
    export type On = Record<Keys | Keys$, (fn: Func) => On>;
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
                $.on[cycle] = NamedFunc(`cycle:"${cycle}"`, (todo) => {
                    $.addToBootCycle(cycle, todo);
                    // This is returned to allow chaining
                    return $.on;
                });

                // Add $.on.$cycle$Next
                const cycle$ = `${cycle}$` as BootCycle.Keys;
                $.on[cycle$] = NamedFunc(cycle$, (todo) => {
                    // Make cycle function with next called
                    const funcName = todo.name || "anonymous";
                    const func = BootCycleFunction(funcName, async (next, xpresser) => {
                        // Run todo function
                        await todo(() => {
                            // Todo: Add
                            $.console.typedDebugIf("bootCycle.irrelevantNextError", () =>
                                $.console.logError(
                                    new InXpresserError(
                                        `Next function called in $.on.${cycle$}(${funcName}) is irrelevant.`
                                    )
                                )
                            );
                        }, xpresser);

                        // Call next function
                        next();
                    });

                    // Add to cycle
                    $.addToBootCycle(cycle, func);

                    return $.on;
                });
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
    return NamedFunc<BootCycle.Func>(fn as BootCycle.Func, name as string);
}
