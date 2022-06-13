/**
 * ModulesEngine Related Types
 */
declare module Modules {
    export enum Available {
        cli = "ConsoleModule",
        server = "ServerModule"
    }

    export type AvailableKeywords = keyof typeof Available;
}

export default Modules;
