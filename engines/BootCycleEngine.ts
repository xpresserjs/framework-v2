import type { Xpresser } from "../xpresser.js";
import { NamedFunc } from "../functions/utils.js";

export declare module BootCycle {
    // Boot Cycle Function
    export type Func = (next: () => void, $: Xpresser) => any;

    // Boot Cycle Function without next
    export type FuncWithoutNext = ($: Xpresser) => any;

    // Server Module BootCycles
    // Make use of interface to make it extensible
    export interface DefaultCycles extends Record<string, Func[]> {}

    // Custom Module BootCycles
    export enum Cycles {
        /**
         * `beforeStart` - Runs before xpresser starts, after modules are registered
         */
        beforeStart = "beforeStart",

        /**
         * `start` - Runs after xpresser starts
         */
        start = "start",

        /**
         * `boot` - Runs after xpresser starts and plugins are loaded
         */
        boot = "boot",

        /**
         * `started` - Runs after xpresser starts, and all required setup is done
         * i.e The program is running
         */
        started = "started",

        /**
         * `stop` - Runs before xpresser stops
         */
        stop = "stop",

        /**
         * `stopped` - Runs after xpresser stops
         * i.e The program is stopped
         */
        stopped = "stopped"
    }

    export type Keys = keyof typeof Cycles;
    export type On = Record<Keys, (fn: Func) => On>;
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
                $.on[cycle] = NamedFunc(cycle, (todo) => {
                    $.addToBootCycle(cycle, todo);
                    // This is returned to allow chaining
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
