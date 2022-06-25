/**
 * Engine Data Type
 */
export declare module EngineData {
    export interface EnginesMemory {}
    export interface ModulesMemory {}

    export interface Main {
        packageDotJson: {
            path: string;
            data: typeof import("../../package.json");
        };
        engines: EnginesMemory;
        modules: ModulesMemory;
    }
}
