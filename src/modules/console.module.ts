import BaseModule from "./module.js";

export interface ConsoleModuleEngineData {
    mainCommand?: string;
    otherCommands?: string[];
}

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ConsoleModule extends BaseModule {
    // ModulesEngine launch keyword
    keyword: string = "cli";

    customBootCycles() {
        return [
            // list of boot cycles available on this module
            "consoleInit",
            "consoleReady"
        ];
    }

    async init() {
        // Engine Data Storage
        const ed = this.$.engineData.newInstanceFrom<ConsoleModuleEngineData>("ConsoleModule", {});

        this.console.logInfo("Initializing Console Module");

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
        if (!args.length) {
            return this.console.logError("No command provided!");
        }

        // get main command
        let [mainCommand, ...otherCommands] = args;

        // Trim mainCommand
        mainCommand = mainCommand.trim();

        // save main command to engineData
        ed.data.mainCommand = mainCommand;

        // save other commands to engineData
        ed.data.otherCommands = otherCommands;

        // this.$.on.cons(() => {
        //     console.log("Starting Console Module");
        // });

        await this.$.runBootCycle("consoleInit");

        //
    }

    static getConsoleArgs(exclude: number = 3) {
        // clone process.argv
        // prevent changing process.argv
        const clonedArgs = [...process.argv];

        // Remove first 3 arguments
        return clonedArgs.splice(exclude);
    }
}

export default ConsoleModule;
