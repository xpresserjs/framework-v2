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


/**
 * Compare version function
 * -1 = version1 is less than version 2
 * 1 = version1 is greater than version 2
 * 0 = Both are the same
 */
export function compareVersion(version1: string, version2: string) {
    const v1 = version1.split('.') as (string | number)[];
    const v2 = version2.split('.') as (string | number)[];
    const k = Math.min(v1.length, v2.length);

    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i] as string, 10);
        v2[i] = parseInt(v2[i] as string, 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }

    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}
