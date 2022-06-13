/**
 * Initialize Main
 */
import type Config from "./types/configs.js";
import { Xpresser } from "./xpresser.js";

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 * @param modules
 */
export async function init(
    config: Config.InitConfig,
    // register cli and server modules by default
    modules: Array<"cli" | "server"> = ["cli", "server"]
): Promise<Xpresser> {
    const $ = new Xpresser(config);

    /**
     * Use ConsoleEngine & Server Modules
     */
    if (modules.includes("cli")) {
        await $.modules.useConsoleModule();
    }

    if (modules.includes("server")) {
        await $.modules.useServerModule();
    }

    return $;
}
