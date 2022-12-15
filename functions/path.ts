import Url from "node:url";
import PATH from "node:path";

/**
 * Provide cjs __dirname support.
 * @param url
 * @param add
 */
export function __dirname(url: string, add?: string | string[]) {
    const path = Url.fileURLToPath(new URL(".", url));

    if (add) {
        if (Array.isArray(add)) {
            return PATH.join(path, ...add);
        } else {
            return PATH.join(path, add);
        }
    }

    return path;
}

/**
 * Provide cjs __filename support.
 * @param url
 */
export function __filename(url: string) {
    return Url.fileURLToPath(url);
}

/**
 * Remove leading slash from a string.
 */
export function removeLeadingSlash(str: string) {
    return str.length && str[0] === "/" ? str.substring(1) : str;
}

/**
 * Remove trailing slash from a string.
 */
export function removeTrailingSlash(str: string) {
    return str.length ? str.replace(/\/$/, "") : str;
}
