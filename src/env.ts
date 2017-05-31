import { IProcess, IOS, IStacktrace, IEnvBrowser, MemoryUsage, ILoad, IEnvNode, StackTraceCallback } from './interfaces';
import * as u from './utils';
import { parse } from 'path';
import { parse as parseError, StackFrame } from 'error-stack-parser';
import { UAParser } from 'ua-parser-js';

let stackTrace, os;

if (!process.env.BROWSER) {
  stackTrace = require('stack-trace');
  os = require('os');
}

// Generates an error.
// Must throw to capture stack.
const generateError = () => {
  try {
    throw new Error('Generated error.');
  }
  catch (ex) {
    return ex;
  }
};

/**
 * Memory
 * Gets current memory usage.
 */
export function memory(): MemoryUsage {
  if (!u.isNode())
    return <MemoryUsage>{};
  return process.memoryUsage();
}

/**
 * Load
 * Returns system load information in NodeJs
 */
export function load(): ILoad {
  if (!u.isNode())
    return <ILoad>{};
  return {
    loadavg: os.loadavg(),
    uptime: os.uptime(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
  };
}

/**
 * Proc
 * Returns process information such as execPath,
 * memory usage, version and current working directory.
 */
export function proc(): IProcess {

  // Ensure NodeJS.
  if (!u.isNode())
    return <IProcess>{};

  // Return process info.
  return {
    pid: process.pid,
    uid: process.getuid ? process.getuid() : null,
    gid: process.getgid ? process.getgid() : null,
    cwd: process.cwd(),
    execPath: process.execPath,
    version: process.version,
    argv: process.argv,
    memoryUsage: process.memoryUsage()
  };

}

/**
 * OS
 * Gets operating system information.
 */
export function system(): IOS {

  // Ensure NodeJS.
  if (!u.isNode())
    return <IOS>{};

  // Return OS info.
  return {
    hostname: os.hostname(),
    homedir: os.homedir(),
    arch: os.arch(),
    platform: os.platform(),
    release: os.release(),
    type: os.type(),
    cpus: os.cpus(),
    networkInterfaces: os.networkInterfaces(),
    loadavg: os.loadavg(),
    uptime: os.uptime(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    EOL: os.EOL,
    endianness: os.endianness()
  };

}

/**
 * Stacktrace
 * Gets/formats error stacktrace or gets from generated error.
 *
 * @param err optional error to be parsed.
 * @param offset a number of frames to trim from begining or callback.
 * @param done the callback to call when done.
 */
export function stacktrace(err: Error | number, offset?: number): IStacktrace[] | void {

  let mapped = [];

  if (u.isNumber(err)) {
    offset = <number>err;
    err = undefined;
  }

  // Stack trace in NodeJS.
  if (u.isNode()) {

    let trace = err ? stackTrace.parse(err) : stackTrace.get();

    mapped = trace.map((site) => {
      const filename = site.getFileName();
      return {
        type: site.getTypeName(),
        path: filename,
        file: filename,               // user may expect "file".
        line: site.getLineNumber(),
        column: site.getColumnNumber(),
        function: site.getFunctionName(),
        method: site.getMethodName(),
        native: site.isNative()
      };
    });


    // Just offsets the number of frames
    // to be returned. Handy when trimming
    // known unwated frames from stack.
    if (offset)
      mapped = mapped.slice(offset);

    return mapped;

  }

  // Stacktrace in browser.
  else {

    err = err || generateError();

    mapped = parseError(<Error>err).map((f) => {
      return {
        path: f.fileName,
        url: f.fileName,        // user may expect "url"
        line: f.lineNumber,
        column: f.columnNumber,
        function: f.functionName,
        method: '',
        native: f.isNative
      };

    });

    // Just offsets the number of frames
    // to be returned. Handy when trimming
    // known unwated frames from stack.
    if (offset)
      mapped = mapped.slice(offset);

    return mapped;

  }

}

/**
 * Browser
 * Returns browser environment information.
 */
export function browser(ua: UAParser): IEnvBrowser {

  if (!u.isNode())
    return ua.getResult();
  return <IEnvBrowser>{};

}

/**
 * Node
 * Returns node environment information.
 */
export function node(): IEnvNode {

  if (u.isNode())
    return {
      process: proc(),
      os: system()
    };

  return <IEnvNode>{};

}
