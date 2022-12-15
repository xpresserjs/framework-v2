import os from "node:os";
import chalk from "chalk";
import { touchMyMustache } from "../functions/inbuilt.js";
import InXpresserError from "../errors/InXpresserError.js";
import BaseEngine, { BaseEngineConfig } from "./BaseEngine.js";
import type { Crawl } from "../types/path-crawler.js";
import type { Config } from "../types/configs.js";

export default class ConsoleEngine extends BaseEngine {
    static config: BaseEngineConfig = {
        name: "Xpresser/ConsoleEngine",
        uniqueMemory: true
    };

    /**
     * Logs a message to the console.
     * @param args
     */
    log(...args: any[]) {
        if (!args.length) return console.log("");

        args.unshift(chalk.white("=>"));

        if (args.length === 2 && typeof args[1] === "string") {
            return console.log(chalk.cyanBright(...args));
        }

        console.log(...args);
    }

    /**
     * Log calmly.
     * @param args
     */
    logCalmly(...args: any[]) {
        if (!args.length) {
            return console.log("");
        }

        args.unshift(chalk.gray("=>"));

        if (args.length === 2 && typeof args[1] === "string") {
            return console.log(chalk.gray(...args));
        }

        console.log(...args);
    }

    /**
     * Log Deprecated
     * @param since
     * @param removedAt
     * @param message
     * @param hasStack
     */
    logDeprecated(since: string, removedAt: string, message: string | string[], hasStack = true) {
        // Check if messages.
        if (Array.isArray(message)) {
            const m: (string | null)[] = message;

            for (const i in m) {
                if (m[i] === null) {
                    m[i] = os.EOL;
                } else {
                    m[i] += " ";
                }
            }

            message = message.join("").trim();
        }

        const mustaches = touchMyMustache(message);

        if (mustaches.length) {
            mustaches.forEach((m) => {
                // remove mustache
                const withoutMustache = m.replace("{{", "").replace("}}", "");
                message = (message as string).replace(m, chalk.cyan(withoutMustache));
            });
        }

        const isDebugEnabled = this.$.config.get<boolean>("debug.enabled", true);
        const depWarnings = this.$.config.get<{
            enabled: boolean;
            showStack: boolean;
        }>("debug.deprecationWarnings");

        if (isDebugEnabled && depWarnings.enabled) {
            console.log(chalk.gray(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"));
            console.log(chalk.whiteBright(`!! DEPRECATED ALERT !!`));

            if (hasStack && depWarnings.showStack) {
                console.log(chalk.white(os.EOL + message));
                console.trace();
                console.log();
            } else {
                console.log(chalk.white(os.EOL + message + os.EOL));
            }

            console.log(
                chalk.whiteBright(`Since: `) +
                    chalk.white(since) +
                    `, ` +
                    chalk.whiteBright(`To be removed: `) +
                    chalk.white(removedAt)
            );
            console.log(chalk.gray("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"));
        }
    }

    /**
     * Log Info
     * @param args
     */
    logInfo(...args: any) {
        if (!args.length) {
            return console.log("");
        }

        args.unshift("=>");

        if (args.length === 2 && typeof args[1] === "string") {
            return console.log(chalk.magentaBright(...args));
        }

        console.log(...args);
    }

    /**
     * Log Success
     * @param args
     */
    logSuccess(...args: any[]) {
        if (!args.length) {
            return console.log("");
        }

        args.unshift("✔✔");

        if (args.length === 2 && typeof args[1] === "string") {
            return console.log(chalk.greenBright(...args));
        }

        console.log(...args);
    }

    /**
     * Log Warning
     * @param args
     */
    logWarning(...args: any[]) {
        if (!args.length) {
            return console.log("");
        }

        args.unshift("!!");

        if (args.length === 2 && typeof args[1] === "string") {
            return console.log(chalk.yellow(...args));
        }

        console.log(...args);
    }

    /**
     * Log if not console.
     * @param args
     */
    logIfNotConsole(...args: any) {
        if (!this.$.options.isConsole) {
            this.log(...args);
        }
    }

    /**
     * Log And Exit
     * @param args
     */
    logAndExit(...args: any) {
        if (args.length) {
            this.log(...args);
        }

        return this.$.exit();
    }

    /**
     * Log Error
     * @param error
     * @param exit
     */
    logError(error: any, exit: boolean = false) {
        if (error instanceof InXpresserError) {
            console.log(chalk.redBright(error.stack));

            if (error.dateString) {
                this.logWarning("Occurred: " + error.dateString);
            }
        } else if (error instanceof Error) {
            console.log(chalk.redBright(error.stack ? error.stack : error));
        } else if (typeof error === "string") {
            console.log(chalk.redBright(error));
        } else {
            console.error(error);
        }

        if (exit) return this.$.exit();
    }

    /**
     * Log Error And Exit
     * @param error
     */
    logErrorAndExit(error: any) {
        return this.logError(error, true);
    }

    /**
     * Log Per Line
     * @param $logs
     * @param $spacePerLine
     */
    logPerLine($logs: (string | Function | Record<string, any>)[] = [], $spacePerLine = false) {
        console.log(); // Spacing
        for (let i = 0; i < $logs.length; i++) {
            const $log = $logs[i];

            if (typeof $log === "function") {
                $log();
            } else if (typeof $log === "object") {
                const key = Object.keys($log)[0];

                // @ts-ignore
                this["log" + lodash.upperFirst(key)]($log[key]);
            } else {
                if (!$log.length) {
                    this.log();
                } else {
                    this.log($log);
                }
            }

            if ($spacePerLine) this.log();
        }
        console.log(); // Spacing
    }

    /**
     * debugIf checks if a debug config is enabled before it runs the function provided.
     * It is used heavily in the framework to debug certain parts of the code.
     *
     * @param key - debug config key to check
     * @param message - message to log
     * @returns {void}
     */
    debugIf(key: string, message: string): void;
    debugIf(key: string, fn: () => void): void;
    debugIf(key: string, fn: string | (() => void)): void {
        // get debug config
        const debug = this.$.config.pathTyped("debug");

        // stop if debug is not enabled
        if (!debug.data.enabled) return;

        // get debug config for key
        const debugKeyValue = debug.get(key);
        if (!debugKeyValue) return;

        // if a string is provided, log it calmly
        if (typeof fn === "string") {
            this.logCalmly(fn);
            return;
        }

        // run fn
        return fn();
    }

    /**
     * Aliases for debugIf
     * But strictly typed debug config keys.
     * Currently experimental.
     * @param key - debug config key to check
     * @param message - message or function to log
     * @experimental
     * @returns {void}
     */
    typedDebugIf(key: string, message: string): void;
    typedDebugIf(key: string, fn: () => void): void;
    typedDebugIf<ConfigPath extends Crawl<Config.Debug>>(
        key: ConfigPath,
        fn: string | (() => void)
    ): void {
        return this.debugIf(key, fn as () => void);
    }
}
