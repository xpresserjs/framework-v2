/**
 * This is the main entry point for xpresser.
 * This file contains frequently used imports and exports.
 * It makes it easier to import everything from one file.
 */

// Import
import type { Config } from "./types/configs.js";
import { Xpresser } from "./xpresser.js";

// Export
export { defineCommands, CliEngine } from "./modules/console/CliEngine.js";
export { __dirname, __filename } from "./functions/path.js";
export { Xpresser };
export { importDefault, importDefaultFn } from "./functions/module.js";
export { BootCycleFunction } from "./engines/BootCycleEngine.js";

/**
 * ShortHand Initialize Xpresser Function
 * @param config
 */
export async function init(config: Config.InitConfig): Promise<Xpresser> {
    // Initialize Xpresser
    const $ = new Xpresser(config);

    // Use Cli Module
    await $.modules.useConsoleModule();

    // return xpresser instance
    return $;
}

/**
 * ShortHand Initialize Xpresser Function without cli module
 */
export async function initWithoutCli(config: Config.InitConfig): Promise<Xpresser> {
    return new Xpresser(config);
}
