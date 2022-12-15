import fs from "node:fs";
import PATH from "node:path";
import fse from "fs-extra";

type encodingType =
    | "ascii"
    | "utf8"
    | "utf-8"
    | "utf16le"
    | "ucs2"
    | "ucs-2"
    | "base64"
    | "base64url"
    | "latin1"
    | "binary"
    | "hex";

export default class File {
    /**
     * Return Node fs getInstance
     * @return {fs}
     */
    static fs() {
        return fs;
    }

    /**
     * Return Node fs-extra getInstance
     * @return {fse}
     */
    static fsExtra() {
        return fse;
    }

    /**
     * Check file size.
     * @param path
     */
    static size(path: string): number {
        try {
            return fs.statSync(path).size;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Check if path is a file.
     * @param path
     */
    static isFile(path: string): boolean {
        try {
            return fs.statSync(path).isFile();
        } catch (e) {
            return false;
        }
    }

    /**
     * isSymbolicLink
     * @param path
     */
    static isSymbolicLink(path: string): boolean {
        try {
            return fs.statSync(path).isSymbolicLink();
        } catch (e) {
            return false;
        }
    }

    /**
     * isDirectory
     * @param path
     */
    static isDirectory(path: string): boolean {
        try {
            return fs.statSync(path).isDirectory();
        } catch (e) {
            return false;
        }
    }

    /**
     *
     * @param path
     * @param options
     */
    static get(
        path: string,
        options?: { encoding?: encodingType; flag?: string } | null
    ): string | Buffer | false {
        const fileExists = this.exists(path);

        if (!fileExists) {
            return false;
        }

        return fs.readFileSync(path, options);
    }

    /**
     * @param path
     * @param options
     */
    static read(
        path: string,
        options?: { encoding?: encodingType; flag?: string }
    ): string | Buffer | false {
        return this.get(path, options);
    }

    /**
     * Read Directory
     * @param path
     * @param options
     */
    static readDirectory(
        path: string,
        options?: {
            encoding?: encodingType;
            writeFileTypes?: string;
        }
    ): string[] | Buffer[] | false {
        return this.getDirectory(path, options);
    }

    /**
     * Get Directory
     * @param path
     * @param options
     */
    static getDirectory(
        path: string,
        options?: {
            encoding?: encodingType;
            writeFileTypes?: string;
        }
    ): string[] | Buffer[] | false {
        const fileExists = this.exists(path);

        if (!fileExists) {
            return false;
        }

        return fs.readdirSync(path, options);
    }

    /**
     * Check if a path or an array of paths exists.
     *
     * if $returnList is true and path is an array,
     * the list of files found will be returned.
     * @param {string|string[]} path - Path or Paths to find.
     * @param {boolean} $returnList - Return list of found files in array.
     */
    static exists(path: string | string[], $returnList = false): boolean | string[] {
        // If Array, loop and check if each files exists
        if (Array.isArray(path)) {
            const files = path as string[];
            // Holds files found
            const filesFound = [] as string[];

            for (const file of files) {
                const fileExists = this.exists(file);

                // If we are not returning lists then we should stop once a path is not found.
                if (!$returnList && !fileExists) {
                    return false;
                }

                if (fileExists) {
                    filesFound.push(file);
                }
            }

            return $returnList ? filesFound : true;
        } else {
            // to check data passed.
            try {
                return fs.existsSync(path);
            } catch (e) {
                return false;
            }
        }
    }

    /**
     * Delete File or multiple files.
     * @param path
     * @param $returnList
     */
    static delete(path: string | string[], $returnList = false) {
        // If Array, loop and check if each files exists
        if (Array.isArray(path)) {
            const paths = path as string[];
            // Holds files found
            const pathsDeleted = [] as string[];

            for (const path of paths) {
                const pathExists = this.delete(path);

                // If we are not returning lists then we should stop once a path is not found.
                if (!$returnList && !pathExists) {
                    return false;
                }

                if (pathExists) {
                    pathsDeleted.push(path);
                }
            }

            return $returnList ? pathsDeleted : true;
        } else {
            // to check data passed.
            try {
                fs.unlinkSync(path);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    /**
     * Delete Directory or multiple directories.
     * @param path
     * @param options
     */
    static deleteDirectory(
        path: string | string[],
        options?: fs.RmDirOptions & { returnList: boolean }
    ) {
        // If Array, loop and check if each files exists
        if (Array.isArray(path)) {
            const paths = path as string[];
            const returnList = options && options.returnList;
            // Holds files found
            const pathsDeleted = [] as string[];

            for (const path of paths) {
                const deleted = this.deleteDirectory(path, options);

                // If we are not returning lists then we should stop once a path is not found.
                if (!returnList && !deleted) {
                    return false;
                }

                if (deleted) pathsDeleted.push(path);
            }

            return returnList ? pathsDeleted : true;
        } else {
            // to check data passed.
            try {
                let rmDirOptions: any = undefined;

                if (options) {
                    const { returnList, ...others } = options;
                    rmDirOptions = others;
                }

                fs.rmdirSync(path, rmDirOptions);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    /**
     * Read Json File
     * @param path
     * @param fileExists
     */
    static readJson<T extends object>(path: string, fileExists = false) {
        /**
         * Check if path exists
         */
        if (!fileExists && !fs.existsSync(path)) {
            throw Error(`File.readJson: Path (${path}) does not exists.`);
        }

        try {
            const file = fs.readFileSync(path).toString();
            return JSON.parse(file) as T;
        } catch (e) {
            throw Error(`File.readJson: Error parsing json file (${path})`);
        }
    }

    /**
     * Save to json file.
     * @param path
     * @param $content
     * @param options
     */
    static saveToJson(
        path: string,
        $content: any,
        options: {
            checkIfFileExists?: boolean;
            replacer?: any;
            space?: number;
        } = {}
    ) {
        options = Object.assign(
            {
                checkIfFileExists: false,
                replacer: null,
                space: 2
            },
            options
        );

        if (options.checkIfFileExists && !fs.existsSync(path)) {
            throw Error(`File..saveToJson: Path (${path}) does not exists.`);
        }

        try {
            fs.writeFileSync(path, JSON.stringify($content, options.replacer, options.space));
            return true;
        } catch (e) {
            console.log(e);
            throw Error(`File.saveToJson: Error saving data to json file (${path})`);
        }
    }

    /**
     * Makes a dir if it does not exist.
     * @param path
     * @param $isFile
     */
    static makeDirIfNotExist(path: string, $isFile = false) {
        if ($isFile) {
            path = PATH.dirname(path);
        }

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        return path;
    }
}
