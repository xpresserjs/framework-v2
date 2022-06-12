## Xpresser v2

We already know what **Xpresser** is, but what is **Xpresser v2**?

Right from the start, xpresser had one goal which is to take an object of `configurations` and return fully
extensible `framework` for you to use.
With the idea of the configuration object as the snapshot or the state of the application.

For example:

```javascript
// Initialize framework with configurations
const $ = init(config);

$.on.start((next) => {
  // Do something on start
  return next();
});

// Start the application
$.start();
```

`$` becomes a fully extensible framework that can be use for either

- Server Requests - Server Part of the Framework
- Console Requests - Cli Part of the Framework

For example

```shell
# Start the server 
node your/app.js

# Start the console
node your/app.js cli myCommand arg1 arg2 ...
```

The presence of the `cli` command will make the framework to start the console and pass the rest of the arguments after `cli` to the console part of the framework.

The current xpresser does this already, but it is not very flexible.

What if I want to build a console first application? or add some other command other than `cli`?

For example, the need for a standalone `event-server` came up and would be fine to have a separate `event-server` command.
instead of creating a new file for it like the current `event-server` plugin does.
```shell
# Start the event-server
node your/app.js event-server --port=3000
```

This means that we have to make the framework more flexible to accept custom commands.

###  Why Dollar Sign?
This is to give a symbol to the framework.
So anywhere you see `$` it means `xpresser`.
