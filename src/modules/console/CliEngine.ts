import type { Xpresser } from "../../xpresser.js";
import type { ObjectCollectionTyped } from "object-collection";
import BaseEngine, { BaseEngineConfig } from "../../engines/BaseEngine.js";
import ConsoleModule, { ConsoleModuleEngineData } from "./console.module.js";

export default class CliEngine extends BaseEngine {
    static config: BaseEngineConfig = {
        name: "Xpresser/CliEngine",
        uniqueMemory: false
    };

    /**
     * Console Module Engine Data
     */
    private readonly ConsoleModuleEngineData: ObjectCollectionTyped<ConsoleModuleEngineData>;

    constructor($: Xpresser) {
        super($);

        // Get ConsoleModule memory data
        this.ConsoleModuleEngineData = ConsoleModule.$engineData($);
    }

    /**
     * Get cli main command
     */
    get mainCommand() {
        return this.ConsoleModuleEngineData.data.mainCommand;
    }

    /**
     * Get cli sub commands
     */
    get subCommands() {
        return this.ConsoleModuleEngineData.data.subCommands;
    }
}
