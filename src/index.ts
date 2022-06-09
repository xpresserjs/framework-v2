/**
 * Initialize Main
 */
import { Config } from "./types";
import { Xpresser } from "./xpresser";

export function init(config: Config) {
    return new Xpresser(config);
}
