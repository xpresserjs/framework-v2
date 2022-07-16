import { BootCycleFunction } from "../../engines/BootCycleEngine.js";
import InXpresserError from "../../errors/InXpresserError.js";
import BaseModule, { BaseModuleConfig } from "../base.module.js";
import type { CliEngine } from "./CliEngine.js";

/**
 * Add EngineData types
 */
export interface ConsoleModuleEngineData {
    mainCommand: string;
    subCommands: string[];
}

declare module "../../types/engine-data.js" {
    module EngineData {
        interface ModulesMemory {
            ConsoleModule: ConsoleModuleEngineData;
        }
    }
}

/**
 * Add BootCycle types
 */
declare module "../../engines/BootCycleEngine.js" {
    module BootCycle {
        enum Cycles {
            consoleInit = "consoleInit",
            consoleReady = "consoleReady"
        }
    }
}

/**
 * Add Modules Related Types
 */
declare module "../../modules/base.module.js" {
    module Modules {
        export enum Available {
            cli = "ConsoleModule"
        }
    }
}

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ConsoleModule extends BaseModule<ConsoleModuleEngineData> {
    // Module Config
    static config: BaseModuleConfig = {
        name: "Xpresser/ConsoleModule"
    };

    // ModulesEngine launch keyword
    static keyword: string = "cli";

    // Commands
    public commands: CliEngine.CommandsMap = new Map();

    /**
     * Get console args
     * @param exclude
     * @returns
     */
    static getConsoleArgs(exclude: number = 3) {
        // clone process.argv
        // prevent changing process.argv
        const clonedArgs = [...process.argv];

        // Remove first 3 arguments
        return clonedArgs.splice(exclude);
    }

    static customBootCycles() {
        return [
            // list of boot cycles available on this module
            "consoleInit",
            "consoleReady"
        ];
    }

    async init() {
        if (this.initialized) return;

        // get console args
        const args = ConsoleModule.getConsoleArgs();

        // Check if command is from xjs-cli
        if (args[args.length - 1] === "--from-xjs-cli") {
            // if true, set isFromXjsCli to true,
            this.$.options.isFromXjsCli = true;

            // remove --from-xjs-cli from args and process.argv
            args.length = args.length - 1;
            process.argv.length = process.argv.length - 1;
        }

        // return error if no command is defined.
        if (!args.length) return this.console.logError("No command provided!");

        // get main command
        let [mainCommand, ...otherCommands] = args;

        // Trim mainCommand
        mainCommand = mainCommand.trim();

        // save main command to engineData
        this.memory.data.mainCommand = mainCommand;

        // save other commands to engineData
        this.memory.data.subCommands = otherCommands;

        // Run on started boot cycle
        this.$.on.started(
            BootCycleFunction("___CONSOLE_MODULE___", async (next) => {
                await this.boot();
                return next();
            })
        );

        // Mark as initialized
        this.initialized = true;
    }

    async boot() {
        await this.$.runBootCycle("consoleInit");
        await this.$.runBootCycle("consoleReady");
        await this.#runCurrentCommand();
    }

    async #runCurrentCommand() {
        const { mainCommand, subCommands } = this.memory.data;
        const command = this.commands.get(mainCommand as CliEngine.commands);

        if (!command) return this.console.logErrorAndExit(`Command "${mainCommand}" not found!`);

        try {
            // Run command
            await command.action({ args: subCommands, $: this.$ });
        } catch (e: any) {
            this.console.logErrorAndExit(InXpresserError.use(e));
        }
    }
}

export default ConsoleModule;
