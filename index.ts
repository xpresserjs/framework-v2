// Import
import type { Config } from "./types/configs.js";
import { Xpresser } from "./xpresser.js";

// Export
export { defineCommands, CliEngine } from "./modules/console/CliEngine.js";
export { __dirname, __filename } from "./functions/path.js";
export { Xpresser };

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 */
export async function init(
    config: Config.InitConfig,
): Promise<Xpresser> {
    const $ = new Xpresser(config);

    // Add Cli Module
    await $.modules.useConsoleModule();

    return $;
}
