/**
 * Engine Data Type
 */
declare module EngineData {
    export interface Main {
        packageDotJson: {
            path: string;
            data: typeof import("../../package.json");
        };
        activeModule: string;
    }
}

export default EngineData;
