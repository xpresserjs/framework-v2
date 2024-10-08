import { InlinePlugin } from "../engines/PluginEngine.js";

/**
 * Engine Data Type
 */
export declare module EngineData {
    export interface EnginesMemory {}
    export interface ModulesMemory {}

    export interface Main {
        packageDotJson: {
            path: string;
            data: object;
        };
        engines: EnginesMemory;
        modules: ModulesMemory;
        inlinePlugins: Record<string, InlinePlugin>;
    }
}
