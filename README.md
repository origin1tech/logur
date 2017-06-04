<br/>
<p align="left">
  <a href="http://github.com/origin1tech/logur"><img width="175" src="https://raw.githubusercontent.com/origin1tech/logur/master/assets/logo.png"></a>
</p>

## Pre-Release

This is a bit of a pre-release. Not production ready just yet. Probably safe for new projects. Need to write more
tests, check for leaks test in Browser more.

A few TODOs as well:

+ Breakout Transports into own modules to limit footprint.
+ Headless browser tests.
+ More examples and docs
+ Debugging & general testing.
+ Colorization for Browser console (btw u can do this now just pass css styles using built in string formatting.)

## Description

Extensible logging library. Logur can be a simple or as advanced as required. It makes few opinons and merely does some of the heavy before handing off the normalized data for logging.

Logur gives you a nice object containing information not only about the logged message but also your environment as well as a handy stack trace on every logged message.

See <a href="#transports">Transports</a> below for examples on how you can consume the included Transports.

## TypeScript

Logur is written using TypeScript. Everything is nicely typed which makes working with Logur in your Typescript project clear and obvious.

## Platforms

Logur will work both in NodeJS and your Browser. Currently Logur does not ship with a single file build. You will need to use a module loader such as Webpack to compile it. My guess is you've got that covered and are already using something similar.

See [Building for Browser](#building-for-browser) for examples on importing and building for the browser.

## Quick Start

Getting Logur going is nor more than two lines. Import and then call logur.get() which returns the default Logur Instance configuration.


### Installing

```sh
$ npm install logur -s
```

### Importing

There are two ways to import or use Logur. You can import the instance new it up then create your Instances and Transports and you're off. This is what you'll want to do to setup a logging environment with mutliple logging Instances and Transports.

But to get started let's just create a simple Logur using default log methods:

**ES6**

```ts
import * as logur from 'logur';
const log = logur.get(/* options here */);
```

**ES5**

```js
const logur = require('logur');
const log = logur.get(/* options here */);
```

See [Building for Browser](#building-for-browser) for examples on importing and building for the browser.

### Default Methods

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

```ts

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

```ts

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
// to the File Transport. Accepts string name of Transport
// or array of Transport names.

log.using('file').info('some message only logged to file transport.');

// You can also exclude the provided value(s)
log.using('http', true).info('some message logged to transports NOT named "http".');

```

### Mapping

One of the nice things about Logur is that it allows you to map whatever
you like individually in each Transport. For example we personally like
our timestamps to be the first property when logging to file. Whereas
when logging to the console it is customary to have the log level
as the first property. Logur makes this pretty straight forward. By
default Transports take the mapping from the defaults in Logur Instance
but they can be overriden.

```ts

const map = ['timestamp', 'level', 'message', 'metadata'];

```

Each key in the map array corresponds with the properties in the [Logour Output](#logur-output)
object. Keys may also be dot notated nested properties. For example lets say
while using Logur in Node you want log messages in the File Transport to
include the version of your app.

```ts

const map = ['timestamp', 'level', 'pkg.version', 'message', 'metadata'];

```

**Mapped Result**

Once the above map is iterated multiple results are provided. First an array
of the mapped values, json an object and the raw original output object.

For example the following map outputs as follows:

```ts

// Using this map:
const map = ['timestamp', 'level', 'message', 'metadata'];

// If we logged the following:
log.info('some log message', { name: 'Bob' });

// The mapped result would be once "toMapped" is
// called internally within a transport.
const result = {
  array: ['2017-05-31T02:12:03.725Z', 'info', 'some log message', { name: 'Bob' }],
  json: {
    "timestamp": "2017-05-31T02:12:03.725Z",
    "level": "info",
    "message": "some log message",
    "metadata": {
      "name": "Bob"
    }
  },
  object: {
    timestamp: "2017-05-31T02:12:03.725Z",
    level: "info",
    message: "some log message",
    metadata: {
      name: "Bob"
    }
  },
  raw: 'the original Logur Output object would be here.'
};

```

**String Formatting**

Internally Logur uses [sprintf-js](https://www.npmjs.com/package/sprintf-js) for string formatting.
This works much like Nodes util.format but with serveral more features and also works in the browser.

List of specifier characters:

+ % — yields a literal % character
+ b — yields an integer as a binary number
+ c — yields an integer as the character with that ASCII value
+ d or i — yields an integer as a signed decimal number
+ e — yields a float using scientific notation
+ u — yields an integer as an unsigned decimal number
+ f — yields a float as is; see notes on precision above
+ g — yields a float as is; see notes on precision above
+ o — yields an integer as an octal number
+ s — yields a string as is
+ t — yields true or false
+ T — yields the type of the argument1
+ v — yields the primitive value of the specified argument
+ x — yields an integer as a hexadecimal number (lower-case)
+ X — yields an integer as a hexadecimal number (upper-case)
+ j — yields a JavaScript object or array as a JSON encoded string

see: https://www.npmjs.com/package/sprintf-js.

### Logur Output

The output object contains a comprehensive group of properties
that are useful to logging. The object is consumed by the "toMapped"
method internally by Logur Tranports. This object is output on log
callbacks and emitted events.

```ts

// Example Output
// NOTE below is mixed with example values
// and Typescript types just to give an
// idea of what is output. Types have been
// used instead of actual values as those
// values would be too verbose. In those cases
// see types in docs for better understanding.

  output = {

    activeid: 2                             // the default log level id.
    levelid: 1,                             // the log level id of this message.
    levels: {
      // the default log levels or
      // levels you supplied
      error: { level: 0, color: 'red' }
    }
    map: ['timestamp', 'level', 'message', 'metadata']

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
    serializers: {                           // object of serializers tht should be applied.
      metadata: function(value, output, options) {

        // value - the value for Logur Output key "metadata".
        // output - the Logur Output object.
        // options - the options passed for your instance.

        // Do something with the value then return.
        return value;

      }
    },

    // Stack
    stacktrace: [],                       // stack trace of logged message.

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

```ts

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

### Custom Log Levels

```ts

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

**Included Transports**

NOTE: With the exception of the ConsoleTransport all of the below will eventually
be migrated to own module to limit the footrpint of the core module.

+ LogurTransport          - base class all Transport inherit from.
+ ConsoleTransport        - logs to node or browser console.
+ FileTransport           - Node only Transport which logs to file.
+ MemoryTransport         - In memory transport, useful for testing or profiling.
+ StreamTransport         - Node only writeable stream Transport, defaults to process.stdout.
+ HttpTransport           - handles Node based Http requests.
+ XMLHttpTransport        - handles XMLHttpRequests (Ajax) logging.

**Adding, Getting & Removing**

```ts

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

```ts

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

**Base Transports Options**

```ts

// Base options extend this Logur Transport Options
// so that they are available from the Logur Instance in
// your Transport.

// NOTE: base Transports below are overriden or forced
// withing Transport. For example "pretty" and "prettystack"
// aren't the best options for File Transport as they would
// create unwated line returns.

export interface ILogurTransportOptions extends ILogurBaseOptions {

  active?: boolean;             // when NOT false is active.
  pretty?: boolean;             // when true objects are pretty printed.
  ministack?: boolean;          // When NOT false log append msgs w/ (file:line:col)
  prettystack?: boolean;        // when true error stack trace is pretty printed.
  exceptions?: boolean;         // whether the transport is fired on exceptions.
  queryable?: boolean;          // whether or not the transport supports queries.
  stripcolors?: boolean;        // when true strips any colors before output.
  strategy?: OutputStrategy;    // storage strategy array, json, object or raw.

}

```

**Console Transport Options**

```ts

export interface IConsoleTransportOptions extends ILogurTransportOptions {
  padding?: PadStrategy;        // the strategy for pading levels.
  colorize?: boolean;           // when NOT false colorization is applied.
}

```

**File Transport Options**

```ts

export interface IFileTransportOptions extends ILogurTransportOptions {
  filename: string;             // filename.
  options?: {
    encoding?: string;          // defaults to 'utf8'.
    mode?: number;              // defaults to 0644.
    flags?: string;             // defaults to 'a'.
  };
  size?: number;                // max size of a log file.
  max: number;                  // maximum number of backup files.
  interval: number;             // 0 to disable or milliseconds to check log roll at.
  delimiter: '\t' | ';';        // delimiter to be used when json is set to false.
}

```

**Memory Transport Options**

```ts

export interface IMemoryTransportOptions extends ILogurTransportOptions {
  max?: number;                 // maximum number of logs.
}

```

**Http Transport Options**

```ts

export interface IHttpTransportOptions extends ILogurTransportOptions {
  path?: string;
  host?: string;
  port?: number;
  ssl?: boolean;
  encoding: string;
  headers?: IMetadata;
  method?: 'POST' | 'PUT';
  auth?: IAuth;
  params?: IMetadata;
  agent?: boolean | Agent;
}

```

**Stream Transport Options**

```ts

export interface IStreamTransportOptions extends ILogurTransportOptions {
  stream: NodeJS.WritableStream;  // A writeable stream
  options?: {
    encoding?: string;            // defaults to 'utf8'.
    mode?: number;                // defaults to undefined.
    flags?: string;               // defaults to undefined.
  };
  padding?: PadStrategy;          // the strategy for pading levels.
  colorize?: boolean;             // when NOT false colorization is applied.
}

```

### Filters

Filters allow you to filter a log event for all transports or for only specific transports.

```ts

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

```ts

// Where 'message' below is a valid property in LogurOutput object.

log.serializers.add('message', (value, output, options) => {

  // do something with value then return
  // for example say our value is too long
  // for logging we might truncate the value.

  return someTruncateFunc(value, 20, '...');


});

```

## Middleware

Logur has built in middleware for use with your Express/Connect app. This makes it very
easy to log request events for your Express app.

```ts

import * as express from 'express';
import * as http from 'http';
import * as logur from 'logur';

const app: express.Application = express();
const log = logur.get();
let server: http.Server;

// Inject Logur middleware into your app.
app.use(log.middleware().handler);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('ok');
})


server = http.createServer(app);
server.listen(3000, '127.0.0.1', () => {
  const host = server.address().address;
  const port = server.address().port;
  log.write('-- Spec server listening at %s:%s --\n', host, port);
});

```

**Middleware Options**

You can specify in options to only log to specific transports and can
map http status codes to your log levels. Middleware also allows you
to build an object of properties from tokens which you generate from
the Express Request and Response objects.

```ts

export interface IMiddlewareOptions {
  map?: string[];                         // array of props for mapping from parsed obj.
  transports?: string | string[];         // transport or array of transports
  levelmap?: {                            // maps status code to Logur levels.
    [code: number]: string;
    default: string;                      // the default level to use if no match.
  };
  tokens?: IMiddlewareTokens;             // path or token callbacks.
  filters?: MiddlewareFilter[];           // array of filters for filtering out log events.
  metadata?: boolean;                     // when true all tokens are logged as metadata.
}


```

**Middleware Tokens**

Tokens are simply functions that receive the Request and Response objects
from Express. Parse the objects or generate whatever you like and then
return the value.

Using the "map" property the key you provide can then be mapped to
the result and then subsequently logged.

For example if you create a token called "account" and then return
the account number from an Express param for example you can then
specify the "account" property in your map as shown below.

This works in the same manner that Logur does for typical log messages.

```ts

const map = ['method', 'url', 'code', 'account', 'elapsed'],

```

```ts

const tokens = {
  method: 'req.method',
  protocol: 'req.protocol',
  url: (req, res) => { return req.originalUrl || req.url; },
  code: (req, res) => { return res.statusCode; },
  message: (req, res) => { return res.statusMessage; },
  address: (req, res) => {
    return req.ip || (req.connection && req.connection.remoteAddress);
  },
  version: (req, res) => { return req.httpVersionMajor + '.' + req.httpVersionMinor; },
  agent: (req, res) => { return req.headers['user-agent']; },
  type: (req, res) => {
    const type = res.getHeader('content-type');
    const split = type.split(';');
    return split[0];
  },
  length: (req, res) => { return res.getHeader('content-length'); },
  params: (req, res) => { return req.params; },
  query: (req, res) => { return req.query; },
  elapsed: (req, res) => {
    const elapsed: any = res['_elapsedTime'] || 0;
    return elapsed.toFixed(2);
  }
}


```

## Building for Browser

There is no single file build for Logur. In today's world it is somewhat rare to not have some sort of
compiling tool in your project. As such no single file build is provided. Going into how these workflows
work is beyond the scope of this document, however it is important to note when building for the browser
you must provide the following node variable:

**process.env.BROWSER**

This is required as it tells Logur whether to build for Node or the Browser. There are several ways to accomplish this this is how we do it.

In your package.json you just pass in the variable in a script. Please note the below is just an example. Your project's build needs may differ slightly but this should put you in the right direction.

```json

"scripts: {
  "dev": "NODE_ENV=development BROWSER=true node ./node_modules/webpack-dev-server/bin/webpack-dev-server -d --hot --colors --watch --progress --profile"
}

```

### Building with Webpack

After supplying the above BROWSER=true env flag you'll need to consume this in your Webpack build. This is accomplished by defining a plugin as follows:

```js

  plugins = [

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(options.env),
        BROWSER: options.browser
      }
    }

  ]

```

In the above we're defining access to both the NODE_ENV var and the BROWSER var which our Webpack build uses.

## License

See [LICENSE.md](License.md)






