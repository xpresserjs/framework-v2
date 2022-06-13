import BaseModule from "./module.js";

/**
 * This module handles the console section of the application.
 * key: cli
 */
class ServerModule extends BaseModule {
    // ModulesEngine launch keyword
    keyword: string = "server";

    async init() {}
}

export default ServerModule;
