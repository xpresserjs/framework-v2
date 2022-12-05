import InXpresserError from "../errors/InXpresserError.js";

/**
 * Import Default Module
 * @param fn
 */
export async function importDefault<T>(fn: () => Promise<{ default: T }>): Promise<T> {
    const module = await fn();
    if (module.default === undefined) {
        throw new InXpresserError(`Module does not have a default export!`);
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
