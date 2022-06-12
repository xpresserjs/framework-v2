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

The current xpresser does this already, but it is not very flexible.

For example

```shell
# Start the server 
node your/app.js

# Start the console
node your/app.js cli myCommand arg1 arg2 ...
```

###  Why Dollar Sign?
This is to give a symbol to the framework.
So anywhere you see `$` it means `xpresser`.
