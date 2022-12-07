/**
 * Import Default Module
 * @param fn
 */
export async function importDefault<T>(fn: () => Promise<{ default: T }>): Promise<T> {
    const module = await fn();
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
