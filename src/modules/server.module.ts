import BaseModule from "./base.module.js";

/**
 * Add BootCycle types
 */

declare module "../engines/BootCycleEngine.js" {
    module BootCycle {
        interface CustomCycles {
            expressInit: BootCycle.Func[];
            serverInit: BootCycle.Func[];
            bootServer: BootCycle.Func[];
            http: BootCycle.Func[];
            https: BootCycle.Func[];
            serverBooted: BootCycle.Func[];
        }
    }
}

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ServerModule extends BaseModule {
    // ModulesEngine launch keyword
    keyword: string = "server";

    customBootCycles(): string[] {
        return [
            // list of boot cycles available on this module
            "serverInit",
            "expressInit",
            "bootServer",
            "http",
            "https",
            "serverBooted"
        ];
    }

    async init() {}
}

export default ServerModule;
