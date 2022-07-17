import { BootCycleFunction } from "../../engines/BootCycleEngine.js";
import InXpresserError from "../../errors/InXpresserError.js";
import { __dirname } from "../../functions/path.js";
import BaseModule, { BaseModuleConfig } from "../BaseModule.js";
import { CliEngine } from "./CliEngine.js";

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
declare module "../../modules/BaseModule.js" {
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
    /**
     * Module Config.
     */
    static config: BaseModuleConfig = {
        name: "Xpresser/ConsoleModule"
    };

    /**
     * Module Launch keyword.
     */
    static keyword: string = "cli";

    /**
     * Commands Map
     */
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

    /**
     * Custom boot cycles
     */
    static customBootCycles() {
        return [
            // list of boot cycles available on this module
            "consoleInit",
            "consoleReady"
        ];
    }

    /**
     * Initialize Module
     * @returns Promise<void>
     */
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

        // Mark as initialized.
        this.initialized = true;
    }

    /**
     * Boot Module
     */
    async boot() {
        await this.#addDefaultCommands();
        await this.$.runBootCycle("consoleInit");
        await this.$.runBootCycle("consoleReady");
        await this.#runCurrentCommand();
    }

    /**
     * Add default commands
     */
    async #addDefaultCommands() {
        const path = this.$.path.resolve([__dirname(import.meta.url), "commands/default.js"]);
        await this.$.engine(CliEngine).addCommandFile(path);
    }

    /**
     * Run the current command.
     * @returns Promise<void>
     */
    async #runCurrentCommand() {
        const { mainCommand, subCommands } = this.memory.data;
        const command = this.commands.get(mainCommand as CliEngine.commands);

        if (!command) return this.console.logError(`Command "${mainCommand}" not found!`);

        // Check if subCommands has enough args for the command
        if (command.args) {
            // Find arguments where value is true
            let numberOfRequiredArgs = Object.values(command.args).filter(
                (arg) => arg === true
            ).length;

            // if sub arguments are less than required, return error
            if (subCommands.length < numberOfRequiredArgs) {
                const missingArgs = Object.entries(command.args)
                    .filter((arg) => arg[1] === true)
                    .reduce((arr, arg) => {
                        arr.push(arg[0]);
                        return arr;
                    }, [] as string[]);

                const argumentsText = missingArgs.length > 1 ? "arguments" : "argument";

                this.console.logError(
                    `Command "${mainCommand}" requires a minimum of (${numberOfRequiredArgs}) ${argumentsText}!!`
                );

                return this.console.log(`Required ${argumentsText}: [${missingArgs.join(", ")}]`);
            }
        }

        try {
            // Run command
            await command.action({ args: subCommands, $: this.$ });
        } catch (e: any) {
            this.console.logErrorAndExit(InXpresserError.use(e));
        }
    }
}

export default ConsoleModule;
