import { ILogurTransport, ILogur, IFileTransportOptions, IFileTransport, TransportActionCallback, ILogurOutput, ILogurInstanceOptions, IParsedPath, ITimer, IQuery, QueryResult, IQueryRange, IQueryRanges, QueryRange, IMetadata } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

import * as _path from 'path';
import * as _fs from 'fs';
import * as _glob from 'glob';
import * as _readline from 'readline';

let fs, createWriteStream, path, glob, readline;

if (!process.env.BROWSER) {
  fs = require('fs');
  path = require('path');
  glob = require('glob');
  readline = require('readline');
}

const defaults = {
  map: ['timestamp', 'level', 'message', 'metadata'],
  filename: 'logs/app.log',
  options: {
    mode: '0666',
    encoding: 'utf8',
    flags: 'a'
  },
  size: 1000000,    // in bytes, default 1(MB)
  max: 21,          // max number of backup before rotating.
  interval: 0,      // set to milliseconds to watch for rotations.
  delimiter: '\t',  // used when json is false.
  json: true        // logs messages in JSON format.
};

export class FileTransport extends LogurTransport implements IFileTransport {

  parsed: IParsedPath;
  running: string;
  interval: ITimer;
  writer: NodeJS.WritableStream;
  options: IFileTransportOptions;

  /**
   * File Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: ILogurInstanceOptions, options: IFileTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);

    if (!u.isNode())
      return;

    // Don't allow comma for delimiter.
    if (this.options.delimiter !== ';' && this.options.delimiter !== '\t')
      this.options.delimiter = ';';

    // Parse the filename path.
    this.parsed = path.parse(path.normalize(this.options.filename));

    // We can use sync here as this will
    // only be used when fired up and constructed.
    // We'll use async methods for other methods
    // in case user wants to roll logs while
    // process is running.
    if (!fs.existsSync(this.parsed.dir)) {
      fs.mkdirSync(this.parsed.dir);
    }

    // Ensure pretty print and stack are disabled.
    this.options.pretty = false;
    this.options.prettystack = false;

  }

  /**
   * Exists
   * Checks if a file or directory exists.
   *
   * @param filename the filename or directory to inspect.
   * @param fn a callback on checked if exists.
   */
  private exists(filename: string, fn: { (exists: boolean) }) {
    fs.stat(filename, (err, stats) => {
      if (err) throw err;
      fn(stats.isFile() || stats.isDirectory());
    });
  }

  /**
   * Glob
   * Gets log paths using glob pattern.
   *
   * @param fn callback on globbed.
   */
  private glob(fn: { (err: Error, files: string[]) }) {

    const parsed = this.parsed;

    // Create path using glob to lookup
    // all log files.
    const globPath = path.join(parsed.dir, parsed.name + '*' + parsed.ext);

    glob(globPath, fn);

  }

  /**
   * Stat
   * Inspects the log file stat size rolling if needed.
   *
   * @param fn callback function returning active log path.
   */
  private stat(fn: { (active: string, rotate: boolean) }) {

    const options = this.options;
    const parsed = this.parsed;

    // Set the orig filename
    // passed in transport options.
    let orig = path.join(parsed.dir, parsed.base);

    // Get all log files.
    this.glob((err, files) => {

      const isMaxCount = files.length >= options.max;

      if (err) {
        throw err;
      }

      else {

        // Get the last filename or
        // set to the orig from options.
        let active = files.pop() || orig;

        // Store the last filename
        // active may change after stat.
        const last = active;

        // stat the file check if should rotate to new file.
        fs.stat(active, (err, stats) => {

          // File doesn't exist we'll just ignore
          if (err) {

            fn(active, false);

          }

          else {

            // Check if the file is at max size.
            const isMaxSize = stats.size >= options.size;

            // Flag that should close stream and
            // reopen with new filename.
            let rotate = false;

            // If max size either get next
            // filename or get rotate filename.
            if (isMaxSize) {

              rotate = true;

              // If 0 just create a new file.
              // unlimited backup files allowed.
              if (options.max === 0 || !isMaxCount) {

                active = path.join(parsed.dir, parsed.name + (files.length + 1) + parsed.ext);

              }

              // Otherwise rotate back to the original file.
              else {

                active = orig;

              }

            }

            fn(active, rotate);

          }

        });

      }

    });

  }

  /**
   * Unlink
   * Deletes a file, note this ignores error
   * if file does not exist. We just care about
   * ensuring it doesn't exist.
   *
   * @param filename the filename to unlink.
   * @param fn callback on unlinked.
   */
  private unlink(filename: string, fn: { (err?: Error) }) {
    fs.unlink(filename, fn);
  }

  /**
   * Create
   * Creates the WriteStream for writing log messages.
   *
   * @param filename the filename to use to create the stream.
   */
  private create(filename: string) {

    // Don't allow creation if stream already exists
    // to recreate stream close old stream first.
    if (this.writer)
      return this.writer;

    // Create the stream.
    this.writer =
      fs.createWriteStream(filename, this.options.options);

    this.writer.on('error', (err) => {
      this.log.error(err);
    });

    // Set the running file.
    this.running = filename;

    // Start the timer.
    this.startTimer();

    // Return the writer.
    return this.writer;

  }

  /**
   * Parse Line
   * Parses a logged line from file.
   *
   * @param line the line to parse.
   */
  private parseLine(line: string) {

    if (this.options.json)
      return JSON.parse(line);

    const obj: any = {};
    const split = line.split(this.options.delimiter);

    // map line to object.
    this.options.map.forEach((prop, i) => {
      obj[prop] = split[i];
    });

    return obj;

  }

  /**
   * Map Fields
   * Takes a parsed log line/object then maps
   * to requested fields in query.
   *
   * @param fields the fields to be returned in object.
   * @param obj the source object to map from.
   */
  private mapFields(fields: any, obj?: any) {
    if (!fields.length)
      return obj;
    const tmp: any = {};
    fields.forEach((f) => {
      if (obj[f])
        tmp[f] = obj[f];
    });
    return tmp;
  }

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
  private findRange(files: string[], from: Date | QueryRange, to?: Date, fn?: QueryRange) {

    let obj: IQueryRanges = {};
    let ctr = 0;
    const fileOpts = this.options.options;

    let _from, _to;

    if (u.isFunction(from)) {
      fn = from as QueryRange;
      from = undefined;
    }

    const done = () => {

      const arr: IQueryRange[] = [];

      // sort files to build end dates.
      const keys = u.keys(obj);
      keys.sort();

      // Normalize dates.
      to = to || new Date();

      // Convert to milliseconds.
      _from = (from && (from as Date).getTime()) || obj[0].start;
      _to = (to && to.getTime());

      // We'll take start date from next file as end date for
      // current. Prevents need for reading each file to end. Yes
      // if log is fired precisely at midnight it is possible
      // this will cause us to include a record that shouldn't be
      // in a query but again the cost savings probably out-
      // weighs the penalty.
      keys.forEach((k, i) => {

        const file = obj[k];
        const next = obj[keys[i + 1]];

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
    files.forEach((f) => {

      let lines = 0;

      const parsed = path.parse(f);
      let idx: any = /\d/g.test(parsed.name) ? parsed.name.match(/\d/g) : [0];

      if (!idx.length)
        throw new Error('Fatal error log file name is not valid.');

      // Join all numbers.
      idx = idx.join("");

      obj[idx] = {};
      const o = obj[idx];
      o.filename = f;
      o.index = idx;

      const rs = fs.createReadStream(f, { encoding: fileOpts.encoding });
      let line;

      rs.on('data', (chunk) => {
        line = chunk.split('\n')[0];
        rs.close();
      });

      rs.on('close', () => {
        o.line = line;
        const parsedLine = u.parseLine(line, this.options);
        o.start = (new Date(parsedLine.timestamp)).getTime();
        ctr++;
        if (ctr === files.length)
          done();
      });

      rs.on('error', (err) => {
        this.log.error(err);
      });

    });

  }

  /**
   * Query Range
   * Queries a range of records returning matching log records.
   *
   * @param q the query to be applied.
   * @param range files within range to be parsed.
   * @param fn callback on done to return results.
   */
  private queryRange(q: IQuery, range: IQueryRange[], fn: QueryResult) {

    let ctr = 0;
    const fileOpts = this.options.options;

    // Get epoch dates if From undefined
    // just set to zero. If To is undefined
    // set to today plus a day essentially
    // including all dates.
    let from: any = q.from ? (q.from as Date).getTime() : 0;
    let to: any = q.to ? (q.to as Date).getTime() : 0;
    let result = [];

    range.forEach((r) => {

      let lineCtr = 0;

      const rl = _readline.createInterface({
        input: fs.createReadStream(r.filename, { encoding: fileOpts.encoding })
      });

      rl.on('line', (line) => {

        // Parse the current line.
        const parsed = u.parseLine(line, this.options);
        const ts = (new Date(parsed.timestamp)).getTime();
        const skip = lineCtr < q.skip;
        const take = !q.take ? true : result.length < q.take ? true : false;

        // If timestamp is greater than
        // the to date close reader.
        if (ts > to && to !== 0) {
          rl.close();
        }

        // check if within range.
        else if (ts >= from && (to === 0 || ts <= to)) {

          const mapped = this.mapFields(q.fields, parsed);
          result.push(mapped);

        }

        lineCtr++;

      });

      rl.on('close', () => {
        ctr++;
        if (ctr === range.length) {
          if (q.order === 'desc')
            result.reverse();
          fn(result.slice(q.skip, q.take + 1));
        }
      });

      rl.on('error', (err) => {
        this.log.error(err);
      });

    });

  }

  /**
   * Start Timer
   * Starts an interveral to watch for log roll changes.
   */
  startTimer() {
    // If 0 watching for log rolling disabled.
    if (this.options.interval === 0)
      return;
    this.interval = setInterval(() => {
      this.stat((active) => {

      });
    }, this.options.interval);
  }

  /**
   * Stop Timer
   * Clears the roll change timer.
   */
  stopTimer() {
    if (this.interval)
      clearInterval(this.interval);
  }

  /**
   * Open
   * Creates/opens the file stream.
   */
  open(fn?: { (stream?: NodeJS.WritableStream) }): void {

    fn = fn || u.noop;

    // Close existing stream if open.
    this.close(() => {

      // Stat log file check if
      // should rotate.
      this.stat((active, rotate) => {

        // If rotate check if should
        // unlink if active exists.
        if (rotate) {

          this.unlink(active, () => {

            fn(this.create(active));

          });

        }

        else {

          fn(this.create(active));

        }

      });

    });

  }

  /**
   * Close
   * Closes the write stream.
   */
  close(fn?: Function) {
    fn = fn || u.noop;
    this.running = undefined;
    this.stopTimer();
    if (this.writer)
      return this.writer.end(null, null, fn);
    fn();
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   */
  action(output: ILogurOutput) {

    // Get colorized mapped array.
    let mapped = this.toMapped(this.options, output);

    let options = this.options;

    // Write out the log message.
    const write = (stream?: NodeJS.WritableStream) => {

      stream = stream || this.writer;

      const term = '\n';

      if (options.json)
        stream.write(mapped.json + term);
      else
        stream.write(mapped.array.join(this.options.delimiter) + term);

    };

    if (!this.writer) {
      this.open(write);
    }

    else {
      write();
    }

  }

  /**
   * Query
   * Queries the logs.
   *
   * @param q the query options.
   * @param fn the query result callback.
   */
  query(q: IQuery, fn: QueryResult) {

    q = u.normalizeQuery(q);

    // Get list of avail log files.
    this.glob((err, files) => {

      if (!files.length)
        return this.log.warn('cannot query logs using log files of undefined.');

      // Find range of files to be queried.
      this.findRange(files, <Date>q.from, <Date>q.to, (range) => {

        if (!range || !range.length)
          return this.log.warn('query provided returned 0 results.');

        this.queryRange(q, range, fn);

      });

    });

  }

  /**
   * Dispose
   * Use the dispose method to close streams and any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose() {
    this.close();
  }

}

