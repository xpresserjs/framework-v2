import { findPackageDotJsonFile } from "./inbuilt.js";
import File from "../classes/File.js";

/**
 * Import Default Module
 * @param fn
 */
export async function importDefault<T>(fn: string | (() => Promise<{ default: T }>)): Promise<T> {
    let module: { default: T };

    if (typeof fn === "string") {
        module = await import(fn);
    } else {
        module = await fn();
    }

    if (module.default === undefined) {
        return module as unknown as T;
    }

    return module.default;
}

/**
 * A Function that returns the importDefault function result.
 * @param fn
 */
export async function importDefaultFn<T>(fn: () => Promise<{ default: T }>) {
    return () => importDefault(fn);
}

/**
 * Compare version function
 *
 * -1 = version 1 is less than version 2
 *
 * 1 = version 1 is greater than version 2
 *
 * 0 = Both are the same
 */
export function compareVersion(version1: string, version2: string): 0 | 1 | -1 {
    const v1 = version1.split(".") as (string | number)[];
    const v2 = version2.split(".") as (string | number)[];
    const k = Math.min(v1.length, v2.length);

    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i] as string, 10);
        v2[i] = parseInt(v2[i] as string, 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }

    return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}

/**
 * HasPkg function
 * @param pkg
 */
export function hasPkg(pkg: string) {
    // using import since require is not supported in esm
    try {
        const packageDotJson = findPackageDotJsonFile();
        if (packageDotJson) {
            const nodeModulesFolder = packageDotJson.dir + "/node_modules";
            const pkgPath = nodeModulesFolder + "/" + pkg;
            const pkgJsonPath = pkgPath + "/package.json";
            return File.exists(pkgJsonPath);
        }

        return false;
    } catch (e) {
        return false;
    }
}
