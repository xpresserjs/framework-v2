/**
 * Initialize Main
 */
import type { Config } from "./types/configs.js";
import { Xpresser } from "./xpresser.js";

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 */
export function init(config: Config) {
    return new Xpresser(config);
}
