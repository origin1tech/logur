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

### Logur Output

The output object contains a comprehensive group of properties
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
    env: {

      // Node Example
      // see docs for complete list of
      // properties in interfaces.
      process: IProcess;
      os: IOS;

      // Browser Example
      // see docs for complete list of
      // properties in interfaces.
      ua: string;
      browser: IUABrowser;
      device: IUADevice;
      engine: IUAEngine;
      os: IUAOS;
      cpu: IUACPU;

    },

    // Package.json Info
    // You can set which keys to grab
    // when initializing Logur Instance.
    pkg: {
      // example:
      ver: 1.0.0
    }

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

## Advanced Usage

The following are more advanced techniques for extending Logur Instances.

### Instances

When using the .get() method Logur will automatically create the default
Logur Instance. Alternatively you can create Logur Instances directly as well.
This is useful when you need multiple logurs for with differing transports
and settings.

**Default Log Levels**

```js

import { Logur, ILevelMethodsDefault, ConsoleTransport } from 'logur';

// Default log levels are error, warn, info, verbose, debug.

const logur = new Logur();
const log = logur.create<ILevelMethodsDefault>('myInstance', {

  // Array of ILogurOptionsTransport that
  // should be instantiated with the instance.
  transports: [{
    name: 'console',
    options: {},
    transport: ConsoleTransport
  }]

 });


```

**Custom Log Levels**

```js

import { Logur, ILevelMethods, IInstanceMethodsExtended } from 'logur';

// Create the Logur container.
const logur = new Logur();

// Define the interface for your log levels.
interface LogLevels extends ILevelMethods {
  emerg(...args: any[]): IInstanceMethodsExtended;
  alert(...args: any[]): IInstanceMethodsExtended;
  crit(...args: any[]): IInstanceMethodsExtended;
  err(...args: any[]): IInstanceMethodsExtended;
  warning(...args: any[]): IInstanceMethodsExtended;
  notice(...args: any[]): IInstanceMethodsExtended;
  info(...args: any[]): IInstanceMethodsExtended;
  debug(...args: any[]): IInstanceMethodsExtended;
}

// Define the above interface of levels in your options.
const options = {
  levels: {
    emerg: { level: 0, color: 'red' },
    alert: { level: 1, color: 'red' },
    crit: { level: 2, color: 'red' },
    err: { level: 3, color: 'red' },
    warning: { level: 4, color: 'yellow' },
    notice: { level: 5, color: 'blue' },
    info: { level: 6, color: 'green' },
    debug: { level: 7, color: 'magenta' }
  }
};

// NOTE: your options.levels keys much match your interface.
// When creating dynamic properties this is needed for
// Typescript to know about your log levels.

const log = logur.create<LogLevels>('myInstance', options);


```

### Transports

Adding existing Transports is very simple. Just provide the Transport type or
your own custom extended Transport along with its options to extend the instance.

**Adding, Getting & Removing**

```js

// Import Logur
import * as logur from 'logur';

// Get the default Logur Instance.
const log = logur.get({ catcherr: true });

// Add the Transport.
log.transports.add('file', { json: true }, logur.FileTransport);

// Get
const transport = log.transports.get<ConsoleTransport>('transport_name');

// Remove
log.transports.remove('transport_name');

// See docs for additional methods.

```

**Custom Transports**

Creating custom transports is relatively easy. You can make them as robust or simple as you needed.
Below is a basic example of what you might do.

```js

import { LogurTransport, ILogurOutput, ILogurInstanceOptions, ILogur } from 'logur';

interface IMyTransportOptions {
  // Your custom options here.
}

class MyTransport extends LogurTransport {

  constructor(base: ILogurInstanceOptions, options: IMyTransportOptions, logur: ILogur) {
    super(base, options, logur);
  }

  action(output: ILogurOutput, fn: Function) {

    // Map the output based on our options.
    // To mapped along with some other handy methods
    // is defined in the base class.
    let mapped = this.toMapped(this.options, output);

    // Do something with the mapped output.
    // below we get an array if the strategy was
    // an array.
    const strategy = this.options.strategy;
    const arr = mapped[strategy];

    // In this case we simply call apply and
    // pass the mapped array of values to console.log.
    console.log.apply(console, arr);

  }

}


```

**Default Transports Options**

```ts

// Base options extend this Logur Transport Options
// so that they are available from the Logur Instance in
// your Transport.

export interface ILogurTransportOptions extends ILogurBaseOptions {

  active?: boolean;             // when NOT false is active.
  pretty?: boolean;             // when true objects are pretty printed.
  ministack?: boolean;          // When NOT false log append msgs w/ (file:line:col)
  prettystack?: boolean;        // when true error stack trace is pretty printed.
  exceptions?: boolean;         // whether the transport is fired on exceptions.
  queryable?: boolean;          // whether or not the transport supports queries.
  stripcolors?: boolean;         // when true strips any colors before output.
  strategy?: OutputStrategy;    // storage strategy array, json, object or raw.

}

```

### Filters

Filters allow you to filter a log event for all transports or for only specific transports.

```js

import * as logur from 'logur';

const log = logur.get();

// Where '*' indicates fire for all transports.
// you can also pass an array of transport names.

log.filters.add('filterName', '*', (output) => {

  // Where output is the constructed LogurOutput object.
  // Return true if should filter the log event.
  if (/some text/g.test(output.message))
    return true;
  return false;

});


```

### Serializers

Serializers enable the ability to modify log event properties before transport.action is called.
For example if you have a date that you want to be in a specific format or a number to be fixed
to a specific decimal count serializers are what you're looking for.

```js

// Where 'message' below is a valid property in LogurOutput object.

log.serializers.add('message', (value, output, options) => {

  // do something with value then return
  // for example say our value is too long
  // for logging we might truncate the value.

  return someTruncateFunc(value, 20, '...');


});

```






