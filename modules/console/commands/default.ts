import chalk from "chalk";
import { defineCommands } from "../CliEngine.js";
import type ConsoleModule from "../ConsoleModule.js";

export default defineCommands({
    /**
     * ls - List all commands
     */
    ls: {
        description: "List all Commands",
        async action({ $ }) {
            const cli = $.modules.getActiveInstance<ConsoleModule>();

            /**
             * Calculate the length of the key tab
             * This will be the length of the longest key + 10
             *
             * First find the length of longest key.
             */
            let longestKeyLength = 0;
            for (const key of ["[Command]", ...cli.commands.keys()])
                longestKeyLength = Math.max(longestKeyLength, key.length);

            // Log List Header
            console.log(); // space
            $.console.logCalmly(
                `${chalk.cyan(addSpace("[Command]", longestKeyLength))} - ${chalk.cyan(
                    "[Description]"
                )}`
            );

            // Log Header Border.
            $.console.logCalmly("-".repeat(50 + longestKeyLength));

            // List Command
            for (let [key, command] of cli.commands) {
                let args: string = "";

                if (command.args) {
                    for (let [arg, required] of Object.entries(command.args)) {
                        if (required) args += `<${arg}> `;
                        else args += `<${arg}?> `;
                    }
                }

                $.console.logCalmly(
                    [
                        `${chalk.yellowBright(addSpace(key, longestKeyLength))}`,
                        "-",
                        `${chalk.magenta(command.description)}`,
                        args
                    ].join(" ")
                );
            }

            // Endline
            $.console.logCalmly("-".repeat(50 + longestKeyLength));
            console.log(); // space
        }
    },

    /**
     * config - Show Config
     */
    config: {
        description: "Show config in console.",
        args: { path: false },
        action: async ({ args, $ }) => {
            const path = args[0];
            console.dir(path ? $.config.get(path) : $.config.all(), { depth: null });
        }
    }
});

/**
 * Add space to a string
 * @param str - String to add space to
 * @param length - length of longest key
 * @returns
 */
function addSpace(str: string, length: number = 20) {
    const addSpace = length + 5 - str.length;
    return `${str}${" ".repeat(addSpace)}`;
}
