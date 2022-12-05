import Url from "node:url";

/**
 * Provide cjs __dirname support.
 * @param url
 */
export function __dirname(url: string) {
    return Url.fileURLToPath(new URL(".", url));
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
