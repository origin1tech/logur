<p align="center">
  <a href="http://github.com/origin1tech/logur"><img width="200" src="https://raw.githubusercontent.com/origin1tech/logur/master/assets/logo.png"></a>
</p>
<br/>

## Description

Extensible logging library. Logur can be a simple or as advanced as required. It makes few opinons and merely does some of the heavy before handing off the normalized data for logging.

Logur gives you a nice object containing information not only about the logged message but also your environment as well as a handy stack trace on every logged message.

See the included transports to get you going with common use cases. See <a href="#transports">Transports</a> below for examples on how you can accomplish this.

## TypeScript

Logur is written using TypeScript. Everything is nicely typed which makes working with Logur in your Typescript project clear and obvious.

## Platforms

Logur will work both in NodeJS and your Browser. Currently Logur does not ship with a single file build. You will need to use a module loader such as Webpack to compile it. My guess is you've got that covered and are already using something similar.

## Installing

```sh
$ npm install logur -s
```

## Importing

There are two ways to import or use Logur. You can import the instance new it up then create your Instances and Transports and you're off. This is what you'll want to do to setup a logging environment with mutliple logging Instances and Transports.

But to get started let's just create a simple Logur using default log methods:

**ES6**

```js
import * as logur from 'logur';
const log = logur.get(/* options here */);
```

**ES5**

```js
const logur = require('logur');
const log = logur.get(/* options here */);
```

## Usage

Using Logur is as you'd expect. By default Logur has the following log methods.
You can extend these methods, change log levels and so on but we'll get to that
below.

- error     logs error messages.
- warn      logs warning messages.
- info      logs information messages. (default level)
- verbose   logs verbose messages.
- debug     logs debug messages and fires when in NodeJS debug mode.

**Extended Methods**

- using     when called before above method uses only the supplied transport.
- wrap      wraps the logged message with the value you provide.
- write     skips all Logur processing and simply outputs via console.log.
- exit      using chaining .exit() can be called to log and then exit.

**Logging a Message**

```js

/* Log Message
****************************/

log.info('hey Logur is working!');

/* Log with Metadata
****************************/

log.info('this is a person', { name: 'Ramanujan', discipline: 'mathematics' });

/* Logging with Callback
****************************/

log.warn('some warning message', (output) => {
  // see link below for output example.
});

```

see: [Logur Output](#logur-output) for example Logur Output object.

```js

/* Log then Exit
****************************/

// This is pretty handy in NodeJS if you
// want to show an error message without
// a full blown error but also want to
// exit the application.

// NOTE: the below will wait for the log
// buffer to clear before exiting. If you
// want to exit immediately pass "true"
// when calling exit.

log.info('some message').exit();

/* Log Bypass
****************************/

// Nothing special here just outputs
// to console.log. It's called "write"
// because I hate seeing log.log,
// seriously that's just plain wrong ha ha.

log.write('some direct to console message');

/* Wrapping
*****************************/

// The below would result in
// - blank line
// info   : 2017-05-30T04:29:48.410Z some wrapped message.
// - blank line

log.wrap('\n').info('some wrapped message.');

/* Using
*****************************/

// The below would result in the message only logging
// to the File Transport.

log.using('file').info('some message only logged to file transport.');


```

## Logur Output

The <a id="output">output</a> object contains a comprehensive group of properties
that are useful to logging. The object is consumed by the "toMapped"
method internally by Logur Tranports. This object is output on log
callbacks and emitted events.

```js

// Example output below.
  output = {

    activeid: 2                             // the default log level id.
    levelid: 1,                             // the log level id of this message.
    levels: {
      // the default log levels or
      // levels you supplied
      // example:
      error: { level: 0, color: 'red' }
    }
    map: []                                  // ['timestamp', 'level', 'message', 'metadata']

    // Primary Fields
    timestamp: '2017-05-30T04:29:48.410Z',   // the timestamp of the message.
    uuid: '1234-4567-8989-3456',             // the uuid of the log event.
    level: 'warn',                           // the log level
    instance: 'default',                     // the Logur Instance.
    message: 'some log message',             // the message that was logged.
    untyped: [],                             // untyped values not matching specific type.
    metadata: {},                            // merged metadata objects from logged message.
    args: params,                            // the original arguments loged.
    transports: ['console'],                 // array of transports message was logged to.
    serializers: {                           // list of serializers tht should be applied.
      metadata: function(value, output, options) {

        // value - the value for Logur Output key "metadata".
        // output - the Logur Output object.
        // options - the options passed for your instance.

        // Do something with the value then return.
        return value;

      }
    },

    // Stack
    stacktrace: stack,                       // stack trace of logged message.

    // Environment Info
    env: sysinfo,                            // node or browser env info.
    pkg: this._logur.pkg                     // node packgage.json info if applicable.

    // Function for normalizing the object
    // for transport. Not avail. within
    // Transport.
    toMapped: function(options) {

      // applies optional options to the LogurOutput object.
      // this is what Logur uses internally within transports
      // it is attached here for emitted events.

      // A normalized object will be returned formatting
      // the Logur Output object into the following formats.
      // See docs for more information.
      return {
        array,
        json,
        object,
        raw
      }

    }

  };

```






