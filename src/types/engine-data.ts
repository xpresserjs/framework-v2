/**
 * Engine Data Type
 */
declare module EngineData {
    export interface Engines {}

    export interface Main {
        packageDotJson: {
            path: string;
            data: typeof import("../../package.json");
        };
        engines: Engines;
    }
}

export default EngineData;
