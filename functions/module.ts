import InXpresserError from "../errors/InXpresserError.js";

/**
 * Import Default Module
 * @param fn
 */
async function importDefault<T>(fn: () => Promise<{ default: T }>): Promise<T> {
    const module = await fn();
    if (module.default === undefined) {
        throw new InXpresserError(`Module does not have a default export!`);
    }
    return module.default;
}
