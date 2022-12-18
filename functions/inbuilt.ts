import os from "node:os";
import fs from "node:fs";
import PATH from "node:path";
import File from "../classes/File.js";

/**
 * Get LanIp
 */
export const getLocalExternalIp = (): string => {
    const values = Object.values(os.networkInterfaces());
    return (
        []
            .concat(...(values as any[]))
            .find((details: any) => details.family === "IPv4" && !details.internal) as any
    )?.address;
};

/**
 * Generate a randomStr
 * @param length
 */
export const randomStr = (length: number): string => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * Get All files in a given path.
 * @param path
 * @returns {Array}
 */
export const getAllFiles = (path: string): string[] => {
    const list: string[] = [];

    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        for (const file of files) {
            const fullPath: string = path + "/" + file;

            if (fs.lstatSync(fullPath).isDirectory()) {
                const folderFiles = getAllFiles(fullPath);
                for (const folderFile of folderFiles) {
                    list.push(folderFile);
                }
            } else {
                list.push(fullPath);
            }
        }
    }

    return list;
};

/**
 * Finds {{keys}} in string.
 *
 * @example
 * const mustaches = "I ate {{2}} {{cakes}} today";
 * // ['2', 'cakes']
 */
export function touchMyMustache(str: string) {
    // Stop if {{ is not found in string.
    if (str.indexOf("{{") < 0) return [];

    const match = str.match(new RegExp(/{{(.*?)}}/, "g"));
    return match ? match : [];
}

/**
 * Find package.json in a given path.
 * if no path is given, it will search from the parent directory.
 * @param dir
 */
export function findPackageDotJsonFile(dir?: string): { dir: string; file: string } | undefined {
    let filePath: string;

    if (dir) {
        filePath = PATH.resolve(dir, "package.json");
    } else {
        if (process.env.npm_package_json) {
            filePath = process.env.npm_package_json as string;
            dir = PATH.dirname(filePath);
        } else {
            dir = process.cwd();
            filePath = PATH.resolve(dir, "package.json");
        }
    }

    // if package.json does not exist,
    // try to find it in the parent directory
    if (!File.exists(filePath)) {
        const parentDir = PATH.resolve(dir, "..");
        if (parentDir !== dir && File.isDirectory(parentDir)) {
            return findPackageDotJsonFile(parentDir);
        } else {
            return undefined;
        }
    }

    return { dir: dir, file: filePath };
}
