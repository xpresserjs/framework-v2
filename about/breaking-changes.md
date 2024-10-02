# Xpresser v2 Breaking Changes

Moving to v2 especially to PURE Esm with CommonJS support is a big step.
It came with almost a complete rewrite of the entire framework.

But not to worry, it is for the best, and we will give you all the details to help you to migrate to v2.

## Dollar Sign

So many properties of the old `$` have been moved to various files and functions

### $

`$` xpresser variable is an instance of `Xpresser` class.
<br> No longer an object. Making it fully extensible.

### $.boot()

`$.boot()` has been renamed to `$.start()`. This is because `start` is the first boot cycle.
So it makes sense to call it `start`

### ConsoleEngine log functions

All log functions have been moved to `$.console`

For example:

```javascript
// Old
$.log()
$.logError()
$.logWarning()
$.logInfo()
$.logSuccess()
// .... etc is now

$.console.log()
$.console.logError()
$.console.logWarning()
$.console.logInfo()
$.console.logSuccess()
```

### $.base64

This is no longer available in the `$` variable.
It has been moved to `xpresser/classes/Base64.js`

```javascript
// Before
$.base64.encode()

// Now
import Base64 from 'xpresser/classes/Base64.js'

Base64.encode()
```

### $.modules

This is no longer holds a helper your favorite packages.
Unfortunately we had to drop that support and use the keyword for something else.

```javascript
// Before
const lodash = $.modules.lodash()

// Now, you have to import it.
import lodash from 'lodash';
```