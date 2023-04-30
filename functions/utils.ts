/**
 * Define Cycle Function
 */
export function NamedFunc<FN extends Function>(fn: FN): FN;
/**
 * Define Cycle Function with name as first argument
 * @param name
 * @param fn
 */
export function NamedFunc<FN extends Function>(name: string, fn: FN): FN;
/**
 * Define Cycle Function with function as first argument
 * @param fn
 * @param name
 */
export function NamedFunc<FN extends Function>(fn: FN, name: string): FN;
export function NamedFunc<FN extends Function>(fn: FN | string, name?: string | FN) {
    // if the first argument is a string,
    // we assume it is the name of the function
    if (typeof fn === "string") {
        const $name = fn;
        fn = name as FN;
        name = $name;
    }

    // Provide a name for the function if name is defined,
    // This is important because the name will be used
    // to log errors
    if (name) Object.defineProperty(fn, "name", { value: name });

    // return the function
    return fn;
}
