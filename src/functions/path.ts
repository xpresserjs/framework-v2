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
