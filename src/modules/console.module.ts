import BaseModule from "./module.js";

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ConsoleModule extends BaseModule {
    // ModulesEngine launch keyword
    keyword: string = "cli";

    async init() {}

    static getConsoleArgs() {
        // clone process.argv
        // prevent changing process.argv
        const clonedArgs = [...process.argv];

        // Remove first 3 arguments
        const args = clonedArgs.splice(3);

        console.log(args);
    }
}

export default ConsoleModule;
