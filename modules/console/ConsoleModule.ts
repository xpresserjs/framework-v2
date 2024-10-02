import { BootCycleFunction } from "../../engines/BootCycleEngine.js";
import InXpresserError from "../../errors/InXpresserError.js";
import { __dirname } from "../../functions/path.js";
import BaseModule, { type BaseModuleConfig } from "../BaseModule.js";
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
 * Extend App Config
 */
export interface ConsoleModuleConfig {
    /**
     * Default Command - the command to run when no command is passed.
     */
    defaultCommand?: string;
    /**
     * Add Default Commands - add default commands to cli.
     * if false, you will have to add commands manually.
     *
     * This can be useful if you want to use xpresser cli for other things.
     */
    addDefaultCommands?: boolean;
}

declare module "../../types/configs.js" {
    module Config {
        interface Main {
            cli?: Partial<ConsoleModuleConfig>;
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
            consoleComplete = "consoleComplete"
        }
    }
}

/**
 * Add Modules Related Types
 */
declare module "../BaseModule.js" {
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
    static readonly config: BaseModuleConfig = {
        name: "Xpresser/ConsoleModule",
        keyword: "cli",
        description: "Xpresser command-line module"
    };

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
            "consoleComplete"
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

        // set default config
        this.#setDefaultConfig();
        const { defaultCommand } = this.$.config.data.cli!;

        // return error if no command is defined.
        if (!args.length) {
            if (defaultCommand) args.push(defaultCommand);
            else return this.console.logError("No command provided!");
        }

        // get main command
        let [mainCommand, ...otherCommands] = args;

        // Trim mainCommand
        mainCommand = mainCommand.trim();

        // save main command to engineData
        this.memory.data.mainCommand = mainCommand;

        // save other commands to engineData
        this.memory.data.subCommands = otherCommands;

        // Disable ascii art if command is not `ls`
        if (mainCommand !== "ls") this.$.config.data.log.asciiArt = false;

        // Run on started boot cycle
        this.$.on.started(
            BootCycleFunction(ConsoleModule.prependName("Started"), async (next) => {
                await this.#boot();
                return next();
            })
        );

        // Mark as initialized.
        this.initialized = true;
    }

    #setDefaultConfig() {
        const currentConfig = this.$.config.get("cli", {});

        // default config
        const defaultConfig: ConsoleModuleConfig = {
            defaultCommand: "ls",
            addDefaultCommands: true
        };

        // merge default config with current config
        this.$.config.set("cli", { ...defaultConfig, ...currentConfig });
    }

    /**
     * Boot Module
     */
    async #boot() {
        if (this.$.config.data.cli!.addDefaultCommands) {
            // add default commands
            await this.#addDefaultCommands();
        }

        // Run `consoleInit` boot cycle
        await this.$.runBootCycle("consoleInit");

        // Run current command
        console.log(); // space
        await this.#runCurrentCommand();
        console.log(); // space

        // Run `consoleComplete` boot cycle
        await this.$.runBootCycle("consoleComplete");
    }

    /**
     * Add default commands
     */
    async #addDefaultCommands() {
        // path to default commands
        const path = this.$.path.resolve([__dirname(import.meta.url), "commands/default.js"]);
        // add path.
        await this.$.engine(CliEngine).addCommandFile(path);
    }

    /**
     * Run the current command.
     * @returns Promise<void>
     */
    async #runCurrentCommand() {
        const { mainCommand, subCommands } = this.memory.data;
        const command = this.commands.get(mainCommand);

        if (!command) return this.console.logError(`Command "${mainCommand}" not found!`);

        // Check if subCommands has enough args for the command
        if (command.args) {
            // Find arguments where value is true
            let numberOfRequiredArgs = Object.values(command.args).filter((arg) => arg).length;

            // if sub arguments are less than required, return error
            if (subCommands.length < numberOfRequiredArgs) {
                const missingArgs = Object.entries(command.args)
                    .filter((arg) => arg[1])
                    .reduce((arr, arg) => {
                        arr.push(arg[0]);
                        return arr;
                    }, [] as string[]);

                const argumentText = missingArgs.length > 1 ? "arguments" : "argument";

                this.console.logWarning(
                    `Command "${mainCommand}" requires a minimum of (${numberOfRequiredArgs}) ${argumentText}!!`
                );

                return this.console.log(`Required ${argumentText}: [${missingArgs.join(", ")}]`);
            }
        }

        try {
            // Run command
            await this.runCommand(command, subCommands);
        } catch (e: any) {
            return this.console.logError(InXpresserError.use(e));
        }
    }

    /**
     * Run command function.
     * This function is not made private on purpose.
     * To enable extendability, it allows you to change how commands run in custom modules.
     * @param command
     * @param args
     */
    async runCommand(command: CliEngine.Command, args: string[] = []) {
        await command.action({ args, $: this.$ });
    }
}

export default ConsoleModule;
