"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var ua_parser_js_1 = require("ua-parser-js");
var stackTrace, os;
var ua;
if (process.env.BROWSER) {
    stackTrace = require('stacktrace-js');
}
else {
    stackTrace = require('stack-trace');
    os = require('os');
}
// Info parser for environment.
ua = new ua_parser_js_1.UAParser();
/**
 * Proc
 * Returns process information such as execPath,
 * memory usage, version and current working directory.
 */
function proc() {
    // Ensure "process" to continue.
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
function opsys() {
    // Ensure "os" module to continue.
    if (!os)
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
exports.opsys = opsys;
/**
 * Stacktrace
 * Gets/formats error stacktrace or gets from generated error.
 *
 * @param err optional error to be parsed.
 */
function stacktrace(err, done) {
    var mapped = [];
    var hasError = !u.isError(err);
    // Handles stacktrace-js mapping to match
    // IStacktrace frames.
    function mapFrames(frames) {
        mapped = frames.map(function (f) {
            return {
                path: f.fileName,
                line: f.lineNumber,
                column: f.columnNumber,
                function: f.functionName,
                method: '',
                native: f.isNative
            };
        });
        if (!hasError)
            mapped.shift();
        done(mapped);
    }
    // Handled caught errors from stacktrace-js errors.
    function onError(err) {
        // TODO: probably should handle this differently
        // for now just throw it.
        throw err;
    }
    // Stack trace in NodeJS.
    if (u.isNode()) {
        var trace = err ? stackTrace.parse(err) : stackTrace.get();
        mapped = trace.map(function (site) {
            return {
                type: site.getTypeName(),
                path: site.getFileName(),
                line: site.getLineNumber(),
                column: site.getColumnNumber(),
                function: site.getFunctionName(),
                method: site.getMethodName(),
                native: site.isNative()
            };
        });
        // If an error wasn't provided
        // shift out of first callsite element.
        if (!hasError)
            mapped.shift();
        done(mapped);
    }
    else {
        // Parse with existing error.
        if (err)
            stackTrace.fromError(err).then(mapFrames).catch(onError);
        else
            stackTrace.get().then(mapFrames).catch(onError);
    }
}
exports.stacktrace = stacktrace;
/**
 * Environment
 * Returns universal environment information.
 */
function environment() {
    return ua.getResult();
}
exports.environment = environment;
//# sourceMappingURL=info.js.map