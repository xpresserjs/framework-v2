/**
 * Initialize Main
 */
import type { Config } from "./types/configs.js";
import { Xpresser } from "./xpresser.js";

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 * @param modules
 */
export async function init(
    config: Config.InitConfig,
    // register cli and server modules by default
    modules: Array<"server"> = ["server"]
): Promise<Xpresser> {
    const $ = new Xpresser(config);

    await $.modules.useConsoleModule();

    return $;
}
