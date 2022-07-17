# Xpresser Console Module.
Xpresser v2 comes with a console module by default.

This module has the launch keyword `cli`

```sh
node app.js cli
```

It creates a command line framework where you can define commands or add a file of commands.
All commands are loaded on boot

## Adding a command
```ts
import CliEngine from "xpresser/src/modules/console/CliEngine.js";

// Get CliEngine
const cli = $.engine(CliEngine);

cli.addCommand("say_my_name", {
    description: "Print my name in the console",
    action(){
        console.log("Your name is: Peter Parker!");
    }
})
```

## Call the command
```sh
node app.js cli say_my_name
```