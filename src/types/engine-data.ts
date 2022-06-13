/**
 * Engine Data Type
 */
export default interface EngineData {
    packageDotJson: {
        path: string;
        data: typeof import("../../package.json");
    };
    activeModule: string;
}
