/**
 * Initialize Main
 */
import { Config } from "./types";
import { Xpresser } from "./xpresser";

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 */
export function init(config: Config) {
    return new Xpresser(config);
}
