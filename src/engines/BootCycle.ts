import type { Xpresser } from "../xpresser.js";

export type BootCycles =
    | "start"
    | "boot"
    | "expressInit"
    | "serverInit"
    | "bootServer"
    | "http"
    | "https"
    | "serverBooted";

export type BootCycleFunction = (next: () => void, $: Xpresser) => any;

export type XpresserOn = Record<BootCycles, (todo: BootCycleFunction) => any>;

/**
 * BootCycle - Boot Cycle Initializer
 * Extends `$.on`, adds boot cycle functions.
 * @param $
 * @constructor
 */
export default function InitializeBootCycle($: Xpresser) {
    // loop through all boot cycles
    for (const cycle of $.getBootCycles()) {
        $.on[cycle] = (todo) => $.addBootCycle(cycle, todo);
    }
}
