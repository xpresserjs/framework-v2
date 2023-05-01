import type { Xpresser } from "../../xpresser.js";
import type { ObjectCollectionTyped } from "object-collection";
import BaseEngine, { BaseEngineConfig } from "../../engines/BaseEngine.js";
import ConsoleModule, { ConsoleModuleEngineData } from "./ConsoleModule.js";

export declare module CliEngine {
    /**
     * CliCommand Action Interface
     */
    export type CommandAction = (ctx: { args: string[]; $: Xpresser }) => void;

    /**
     * A CliCommand interface
     */
    export interface Command {
        name: string;
        description: string;
        args?: Record<string, boolean>;
        action: CommandAction;
    }

    /**
     * Cli Commands Map Type
     */
    type CommandsMap = Map<string, Command>;
}

// Used to add commands
type CommandWithoutName = Omit<CliEngine.Command, "name"> & { name?: string };
type CommandsObject = Record<
    string,
    CommandWithoutName | (($super?: CliEngine.Command) => CommandWithoutName)
>;

export class CliEngine extends BaseEngine {
    static config: BaseEngineConfig = {
        name: "Xpresser/CliEngine",
        uniqueMemory: false
    };

    /**
     * Console Module Engine Data
     */
    readonly #ConsoleModuleEngineData!: ObjectCollectionTyped<ConsoleModuleEngineData>;

    constructor($: Xpresser) {
        super($);

        // Get ConsoleModule memory data
        Object.defineProperty(this, "ConsoleModuleEngineData", {
            enumerable: false,
            value: ConsoleModule.$engineData($)
        });
    }

    /**
     * Get cli main command
     */
    get mainCommand() {
        return this.#ConsoleModuleEngineData.data.mainCommand;
    }

    /**
     * Get cli sub commands
     */
    get subCommands() {
        return this.#ConsoleModuleEngineData.data.subCommands;
    }

    /**
     * Add cli command
     */
    addCommand(
        name: string,
        command: CommandWithoutName | (($super?: CliEngine.Command) => CommandWithoutName)
    ) {
        const consoleModule = this.$.modules.getActiveInstance<ConsoleModule>();
        const commands = consoleModule.commands as Map<string, CliEngine.Command>;

        // get previous command with the same name.
        // this aids extending commands
        const $super = commands.get(name);
        command = typeof command === "function" ? command($super) : command;

        // override previous command name
        command.name = name;
        // name function for debugging purposes
        Object.defineProperty(command.action, "name", { value: `command:${name}` });

        // add command
        commands.set(name, command as CliEngine.Command);

        return this;
    }

    /**
     * Add cli commands from a file.
     * @param filePath - Path to command file
     * @returns
     */
    async addCommandFile(filePath: string) {
        filePath = this.$.path.resolve(filePath);
        let commands: CommandsObject;

        try {
            commands = (await import(filePath)).default as CommandsObject;
        } catch (e) {
            throw new Error(`Failed to load command file: ${filePath}`);
        }

        for (let [key, command] of Object.entries(commands)) {
            this.addCommand(key, command);
        }

        return this;
    }
}

/**
 * Define Commands
 * @param commands - Commands
 * @returns
 */
export function defineCommands(commands: CommandsObject) {
    return commands;
}
