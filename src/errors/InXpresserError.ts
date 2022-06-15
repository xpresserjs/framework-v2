import os from "node:os";

/**
 * InXpresserError
 *
 * This is xpresser's default Error handler.
 * It defers from the default node Error handler because it has the time of error in its data.
 */
class InXpresserError extends Error {
    // Holds Date
    public date: Date;
    // Holds human-readable DateString
    public dateString: string;

    constructor(message?: string | undefined) {
        super(message);

        this.date = new Date();
        this.dateString = new Date().toLocaleDateString("en-US", {
            day: "numeric",
            weekday: "short",
            year: "numeric",
            month: "short",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });

        // Ensure the name of this error is the same as the class name
        this.name = "Error";
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * use
     * Convert an Error to an InXpresserError
     * @param e
     */
    static use(e: Error) {
        // Initialize InXpresserError
        const error = new this(e.message);

        // Copy stack
        const stack: string[] = e.stack!.split(os.EOL);
        stack.splice(0, 1);
        stack.unshift(error.stack!.split(os.EOL)[0]);

        // Set stack
        error.stack = stack.join(os.EOL);

        // Return error
        return error;
    }

    /**
     * TryOrCatch
     *
     * Runs a function in a try catch.
     * if pass it returns the value of the function called.
     * if fails it will throw error unless a handleError function is passed.
     * @param fn
     * @param handleError
     */
    static tryOrCatch<T>(fn: () => T, handleError?: (error: InXpresserError) => any): T {
        try {
            return fn();
        } catch (e: any) {
            // If error is not an InXpresserError
            // convert it to an InXpresserError
            if (!(e instanceof this)) {
                e = this.use(e);
            }

            if (handleError) return handleError(e);

            console.log(e.message);
            throw e;
        }
    }

    /**
     * Try
     *
     * Runs a function in a try catch.
     * if pass it returns the value of the function called.
     *
     * **Note:** It does not throw errors, only console.logs them.
     * @param fn
     */
    static try<T>(fn: () => T): T {
        return this.tryOrCatch(fn, console.log);
    }
}

export default InXpresserError;
