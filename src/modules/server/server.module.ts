import BaseModule from "../BaseModule.js";

/**
 * Add BootCycle types
 */

declare module "../../engines/BootCycleEngine.js" {
    module BootCycle {
        enum Cycles {
            expressInit = "expressInit",
            serverInit = "serverInit",
            bootServer = "bootServer",
            http = "http",
            https = "https",
            serverBooted = "serverBooted"
        }
    }
}

/**
 * Add Modules Related Types
 */
declare module "../../modules/BaseModule.js" {
    module Modules {
        enum Available {
            server = "ServerModule"
        }
    }
}

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ServerModule extends BaseModule {
    // ModulesEngine launch keyword
    static keyword: string = "server";

    static customBootCycles(): string[] {
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

    init() {}
}

export default ServerModule;
