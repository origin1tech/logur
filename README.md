<p align="center">
  <a href="http://github.com/origin1tech/logur"><img width="150" src="https://raw.githubusercontent.com/origin1tech/logur/master/assets/logo.png"></a>
</p>
<br/>

Extensible logging library. Logur can be a simple or as advanced as required. It takes few opinons and merely does some of the heavy before handing off the normalized data for logging.

Logur gives you a nice object containing information not only about the logged message but also your environment as well as a handy stack trace on every logged message.

See the included transports to get you going with common use cases but don't be afraid to extend the base classes to create the perfect log transport for your needs. It's far easier than you'd imagine. See <a href="#transports">Transports</a> below for examples on how you can accomplish this.

## TypeScript

Logur is written using TypeScript. Everything is nicely typed which makes working with Logur in your typed project clear and obvious. We won't touch procjets without TypeScript these days. For anything large that needs to scale its imperative.

## Platforms

Logur will work both in NodeJS and your Browser. Currently Logur does not ship with a single file build. You will need to use a module loader like RequireJS, SystemJS, or bundle with Webpack, Gulp, Browserify or Grunt. My guess is you've got that covered.

## Installing

```sh
$ npm install logur -s
```

## Importing

There are two ways to import or use Logur. You can import the instance new it up then create your Instances and Transports and you're off. This is what you'll want to do to setup a logging environment with mutliple logging Instances and Transports.

But to get started let's just create a simple Logur.

**ES6**

```js
import * as logur from 'logur';
const log = logur.get();
```

**ES5**

```js
const logur = require('logur');
const log = logur.get();
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

log.warn('some warning message', (output, done) => {

  // Example output below.
  output = {

  };

  // Handing the output back off
  // here will continue down the chain
  // to your transports. Don't callback
  // and just handle your output here!
  done(output);

});

/* Logging an Error
****************************/

// Logur will detect this as an error
// and will parse out the stacktrace
// for you automatically.

// The built in Transports for Logur will
// get the "message" from the error and
// will display it as the message property
// as shown above in the "output" example.
// The error message will then be merged
// into any metadata.

// Again though it is important to remember
// this is our preference. Don't like it?
// Just extend the desired transport and
// change the action method and you're done.
// We'll get into Transports and action
// methods below.

const err = new Error('some error');
log.error(err);

/* Log then Exit
****************************/

// This is pretty handy in NodeJS if you
// want to show an error message without
// a full blown error but also want to
// exit the application.

log.error('some error message').exit();

/* Log Bypass
****************************/

// Nothing special here just outputs
// to console.log. It's called "write"
// because I hate seeing log.log,
// seriously that's just plain wrong ha ha.

log.write('some direct to console message');

```


