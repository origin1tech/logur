"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var u = require("../utils");
var _readline = require("readline");
var fs, createWriteStream, path, glob, readline;
if (!process.env.BROWSER) {
    fs = require('fs');
    path = require('path');
    glob = require('glob');
    readline = require('readline');
}
var defaults = {
    map: ['timestamp', 'level', 'message', 'metadata'],
    filename: 'logs/app.log',
    options: {
        mode: '0666',
        encoding: 'utf8',
        flags: 'a'
    },
    size: 1000000,
    max: 21,
    interval: 0,
    delimiter: '\t',
    json: true // logs messages in JSON format.
};
var FileTransport = (function (_super) {
    __extends(FileTransport, _super);
    /**
     * File Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function FileTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        if (!u.isNode())
            return _this;
        // Don't allow comma for delimiter.
        if (_this.options.delimiter !== ';' && _this.options.delimiter !== '\t')
            _this.options.delimiter = ';';
        // Parse the filename path.
        _this.parsed = path.parse(path.normalize(_this.options.filename));
        // We can use sync here as this will
        // only be used when fired up and constructed.
        // We'll use async methods for other methods
        // in case user wants to roll logs while
        // process is running.
        if (!fs.existsSync(_this.parsed.dir)) {
            fs.mkdirSync(_this.parsed.dir);
        }
        // Ensure pretty print and stack are disabled.
        _this.options.pretty = false;
        _this.options.prettystack = false;
        return _this;
    }
    /**
     * Exists
     * Checks if a file or directory exists.
     *
     * @param filename the filename or directory to inspect.
     * @param fn a callback on checked if exists.
     */
    FileTransport.prototype.exists = function (filename, fn) {
        fs.stat(filename, function (err, stats) {
            if (err)
                throw err;
            fn(stats.isFile() || stats.isDirectory());
        });
    };
    /**
     * Glob
     * Gets log paths using glob pattern.
     *
     * @param fn callback on globbed.
     */
    FileTransport.prototype.glob = function (fn) {
        var parsed = this.parsed;
        // Create path using glob to lookup
        // all log files.
        var globPath = path.join(parsed.dir, parsed.name + '*' + parsed.ext);
        glob(globPath, fn);
    };
    /**
     * Stat
     * Inspects the log file stat size rolling if needed.
     *
     * @param fn callback function returning active log path.
     */
    FileTransport.prototype.stat = function (fn) {
        var options = this.options;
        var parsed = this.parsed;
        // Set the orig filename
        // passed in transport options.
        var orig = path.join(parsed.dir, parsed.base);
        // Get all log files.
        this.glob(function (err, files) {
            var isMaxCount = files.length >= options.max;
            if (err) {
                throw err;
            }
            else {
                // Get the last filename or
                // set to the orig from options.
                var active_1 = files.pop() || orig;
                // Store the last filename
                // active may change after stat.
                var last = active_1;
                // stat the file check if should rotate to new file.
                fs.stat(active_1, function (err, stats) {
                    // File doesn't exist we'll just ignore
                    if (err) {
                        fn(active_1, false);
                    }
                    else {
                        // Check if the file is at max size.
                        var isMaxSize = stats.size >= options.size;
                        // Flag that should close stream and
                        // reopen with new filename.
                        var rotate = false;
                        // If max size either get next
                        // filename or get rotate filename.
                        if (isMaxSize) {
                            rotate = true;
                            // If 0 just create a new file.
                            // unlimited backup files allowed.
                            if (options.max === 0 || !isMaxCount) {
                                active_1 = path.join(parsed.dir, parsed.name + (files.length + 1) + parsed.ext);
                            }
                            else {
                                active_1 = orig;
                            }
                        }
                        fn(active_1, rotate);
                    }
                });
            }
        });
    };
    /**
     * Unlink
     * Deletes a file, note this ignores error
     * if file does not exist. We just care about
     * ensuring it doesn't exist.
     *
     * @param filename the filename to unlink.
     * @param fn callback on unlinked.
     */
    FileTransport.prototype.unlink = function (filename, fn) {
        fs.unlink(filename, fn);
    };
    /**
     * Create
     * Creates the WriteStream for writing log messages.
     *
     * @param filename the filename to use to create the stream.
     */
    FileTransport.prototype.create = function (filename) {
        var _this = this;
        // Don't allow creation if stream already exists
        // to recreate stream close old stream first.
        if (this.writer)
            return this.writer;
        // Create the stream.
        this.writer =
            fs.createWriteStream(filename, this.options.options);
        this.writer.on('error', function (err) {
            _this.log.error(err);
        });
        // Set the running file.
        this.running = filename;
        // Start the timer.
        this.startTimer();
        // Return the writer.
        return this.writer;
    };
    /**
     * Parse Line
     * Parses a logged line from file.
     *
     * @param line the line to parse.
     */
    FileTransport.prototype.parseLine = function (line) {
        if (this.options.json)
            return JSON.parse(line);
        var obj = {};
        var split = line.split(this.options.delimiter);
        // map line to object.
        this.options.map.forEach(function (prop, i) {
            obj[prop] = split[i];
        });
        return obj;
    };
    /**
     * Map Fields
     * Takes a parsed log line/object then maps
     * to requested fields in query.
     *
     * @param fields the fields to be returned in object.
     * @param obj the source object to map from.
     */
    FileTransport.prototype.mapFields = function (fields, obj) {
        if (!fields.length)
            return obj;
        var tmp = {};
        fields.forEach(function (f) {
            if (obj[f])
                tmp[f] = obj[f];
        });
        return tmp;
    };
    /**
     * Find Range
     * Using date range finds relevant files
     * that should be queried.
     *
     * @param files array of files to inspect.
     * @param from the from date.
     * @param to the to date.
     * @param fn the callback on range found.
     */
    FileTransport.prototype.findRange = function (files, from, to, fn) {
        var _this = this;
        var obj = {};
        var ctr = 0;
        var fileOpts = this.options.options;
        var _from, _to;
        if (u.isFunction(from)) {
            fn = from;
            from = undefined;
        }
        var done = function () {
            var arr = [];
            // sort files to build end dates.
            var keys = u.keys(obj);
            keys.sort();
            // Normalize dates.
            to = to || new Date();
            // Convert to milliseconds.
            _from = (from && from.getTime()) || obj[0].start;
            _to = (to && to.getTime());
            // We'll take start date from next file as end date for
            // current. Prevents need for reading each file to end. Yes
            // if log is fired precisely at midnight it is possible
            // this will cause us to include a record that shouldn't be
            // in a query but again the cost savings probably out-
            // weighs the penalty.
            keys.forEach(function (k, i) {
                var file = obj[k];
                var next = obj[keys[i + 1]];
                if (!next)
                    file.end = file.start;
                else
                    file.end = next.start;
                if (_from < file.end)
                    arr.push(obj[k]);
                else if (_to > file.end)
                    arr.push(obj[k]);
            });
            fn(arr);
        };
        // Iterate each file to get range
        // Read only first line building
        // start and end dates for each file.
        // Once we have relevant files we'll query.
        files.forEach(function (f) {
            var lines = 0;
            var parsed = path.parse(f);
            var idx = /\d/g.test(parsed.name) ? parsed.name.match(/\d/g) : [0];
            if (!idx.length)
                throw new Error('Fatal error log file name is not valid.');
            // Join all numbers.
            idx = idx.join("");
            obj[idx] = {};
            var o = obj[idx];
            o.filename = f;
            o.index = idx;
            var rs = fs.createReadStream(f, { encoding: fileOpts.encoding });
            var line;
            rs.on('data', function (chunk) {
                line = chunk.split('\n')[0];
                rs.close();
            });
            rs.on('close', function () {
                o.line = line;
                var parsedLine = u.parseLine(line, _this.options);
                o.start = (new Date(parsedLine.timestamp)).getTime();
                ctr++;
                if (ctr === files.length)
                    done();
            });
            rs.on('error', function (err) {
                _this.log.error(err);
            });
        });
    };
    /**
     * Query Range
     * Queries a range of records returning matching log records.
     *
     * @param q the query to be applied.
     * @param range files within range to be parsed.
     * @param fn callback on done to return results.
     */
    FileTransport.prototype.queryRange = function (q, range, fn) {
        var _this = this;
        var ctr = 0;
        var fileOpts = this.options.options;
        // Get epoch dates if From undefined
        // just set to zero. If To is undefined
        // set to today plus a day essentially
        // including all dates.
        var from = q.from ? q.from.getTime() : 0;
        var to = q.to ? q.to.getTime() : 0;
        var result = [];
        range.forEach(function (r) {
            var lineCtr = 0;
            var rl = _readline.createInterface({
                input: fs.createReadStream(r.filename, { encoding: fileOpts.encoding })
            });
            rl.on('line', function (line) {
                // Parse the current line.
                var parsed = u.parseLine(line, _this.options);
                var ts = (new Date(parsed.timestamp)).getTime();
                var skip = lineCtr < q.skip;
                var take = !q.take ? true : result.length < q.take ? true : false;
                // If timestamp is greater than
                // the to date close reader.
                if (ts > to && to !== 0) {
                    rl.close();
                }
                else if (ts >= from && (to === 0 || ts <= to)) {
                    var mapped = _this.mapFields(q.fields, parsed);
                    result.push(mapped);
                }
                lineCtr++;
            });
            rl.on('close', function () {
                ctr++;
                if (ctr === range.length) {
                    if (q.order === 'desc')
                        result.reverse();
                    fn(result.slice(q.skip, q.take + 1));
                }
            });
            rl.on('error', function (err) {
                _this.log.error(err);
            });
        });
    };
    /**
     * Start Timer
     * Starts an interveral to watch for log roll changes.
     */
    FileTransport.prototype.startTimer = function () {
        var _this = this;
        // If 0 watching for log rolling disabled.
        if (this.options.interval === 0)
            return;
        this.interval = setInterval(function () {
            _this.stat(function (active) {
            });
        }, this.options.interval);
    };
    /**
     * Stop Timer
     * Clears the roll change timer.
     */
    FileTransport.prototype.stopTimer = function () {
        if (this.interval)
            clearInterval(this.interval);
    };
    /**
     * Open
     * Creates/opens the file stream.
     */
    FileTransport.prototype.open = function (fn) {
        var _this = this;
        fn = fn || u.noop;
        // Close existing stream if open.
        this.close(function () {
            // Stat log file check if
            // should rotate.
            _this.stat(function (active, rotate) {
                // If rotate check if should
                // unlink if active exists.
                if (rotate) {
                    _this.unlink(active, function () {
                        fn(_this.create(active));
                    });
                }
                else {
                    fn(_this.create(active));
                }
            });
        });
    };
    /**
     * Close
     * Closes the write stream.
     */
    FileTransport.prototype.close = function (fn) {
        fn = fn || u.noop;
        this.running = undefined;
        this.stopTimer();
        if (this.writer)
            return this.writer.end(null, null, fn);
        fn();
    };
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     */
    FileTransport.prototype.action = function (output) {
        var _this = this;
        // Get colorized mapped array.
        var mapped = this.toMapped(this.options, output);
        var options = this.options;
        // Write out the log message.
        var write = function (stream) {
            stream = stream || _this.writer;
            var term = '\n';
            if (options.json)
                stream.write(mapped.json + term);
            else
                stream.write(mapped.array.join(_this.options.delimiter) + term);
        };
        if (!this.writer) {
            this.open(write);
        }
        else {
            write();
        }
    };
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    FileTransport.prototype.query = function (q, fn) {
        var _this = this;
        q = u.normalizeQuery(q);
        // Get list of avail log files.
        this.glob(function (err, files) {
            if (!files.length)
                return _this.log.warn('cannot query logs using log files of undefined.');
            // Find range of files to be queried.
            _this.findRange(files, q.from, q.to, function (range) {
                if (!range || !range.length)
                    return _this.log.warn('query provided returned 0 results.');
                _this.queryRange(q, range, fn);
            });
        });
    };
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    FileTransport.prototype.dispose = function () {
        this.close();
    };
    return FileTransport;
}(base_1.LogurTransport));
exports.FileTransport = FileTransport;
//# sourceMappingURL=file.js.map