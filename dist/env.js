"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var error_stack_parser_1 = require("error-stack-parser");
var stackTrace, os;
if (process.env.BROWSER) {
    stackTrace = require('stacktrace-js');
}
else {
    stackTrace = require('stack-trace');
    os = require('os');
}
// Generates an error.
// Must throw to capture stack.
var generateError = function () {
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
function memory() {
    if (!u.isNode())
        return {};
    return process.memoryUsage();
}
exports.memory = memory;
/**
 * Load
 * Returns system load information in NodeJs
 */
function load() {
    if (!u.isNode())
        return {};
    return {
        loadavg: os.loadavg(),
        uptime: os.uptime(),
        freemem: os.freemem(),
        totalmem: os.totalmem(),
    };
}
exports.load = load;
/**
 * Proc
 * Returns process information such as execPath,
 * memory usage, version and current working directory.
 */
function proc() {
    // Ensure NodeJS.
    if (!u.isNode())
        return {};
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
exports.proc = proc;
/**
 * OS
 * Gets operating system information.
 */
function system() {
    // Ensure NodeJS.
    if (!u.isNode())
        return {};
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
exports.system = system;
/**
 * Stacktrace
 * Gets/formats error stacktrace or gets from generated error.
 *
 * @param err optional error to be parsed.
 * @param offset a number of frames to trim from begining or callback.
 * @param done the callback to call when done.
 */
function stacktrace(err, offset) {
    var mapped = [];
    if (u.isNumber(err)) {
        offset = err;
        err = undefined;
    }
    // Stack trace in NodeJS.
    if (u.isNode()) {
        var trace = err ? stackTrace.parse(err) : stackTrace.get();
        mapped = trace.map(function (site) {
            var filename = site.getFileName();
            return {
                type: site.getTypeName(),
                path: filename,
                file: filename,
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
    else {
        err = err || generateError();
        mapped = error_stack_parser_1.parse(err).map(function (f) {
            return {
                path: f.fileName,
                url: f.fileName,
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
exports.stacktrace = stacktrace;
/**
 * Browser
 * Returns browser environment information.
 */
function browser(ua) {
    if (!u.isNode())
        return ua.getResult();
    return {};
}
exports.browser = browser;
/**
 * Node
 * Returns node environment information.
 */
function node() {
    if (u.isNode())
        return {
            process: proc(),
            os: system()
        };
    return {};
}
exports.node = node;
//# sourceMappingURL=env.js.map