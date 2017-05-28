/// <reference types="node" />
/**
 * FILE TRANSPORT
 *
 * File Transport handles basic log rotation and is provided as
 * proof of concept. It should work fine in most cases however you
 * may wish to extend the base "LogurTransport" and uses something
 * like "StreamRoller" for better control/rotations of logs.
 * @see https://www.npmjs.com/package/streamroller
 *
 */
import { ILogur, IFileTransportOptions, IFileTransport, ILogurOutput, ILogurInstanceOptions, IQuery, QueryResult, TransportActionCallback } from '../interfaces';
import { LogurTransport } from './base';
export declare class FileTransport extends LogurTransport implements IFileTransport {
    private _parsed;
    private _running;
    private _interval;
    private _writer;
    options: IFileTransportOptions;
    /**
     * File Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IFileTransportOptions, logur: ILogur);
    /**
     * Exists
     * Checks if a file or directory exists.
     *
     * @param filename the filename or directory to inspect.
     * @param fn a callback on checked if exists.
     */
    private exists(filename, fn);
    /**
     * Glob
     * Gets log paths using glob pattern.
     *
     * @param fn callback on globbed.
     */
    private glob(fn);
    /**
     * Stat
     * Inspects the log file stat size rolling if needed.
     *
     * @param fn callback function returning active log path.
     */
    private stat(fn);
    /**
     * Unlink
     * Deletes a file, note this ignores error
     * if file does not exist. We just care about
     * ensuring it doesn't exist.
     *
     * @param filename the filename to unlink.
     * @param fn callback on unlinked.
     */
    private unlink(filename, fn);
    /**
     * Create
     * Creates the WriteStream for writing log messages.
     *
     * @param filename the filename to use to create the stream.
     */
    private create(filename);
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
    private findRange(files, from, to?, fn?);
    /**
     * Query Range
     * Queries a range of records returning matching log records.
     *
     * @param q the query to be applied.
     * @param range files within range to be parsed.
     * @param fn callback on done to return results.
     */
    private queryRange(q, range, fn);
    /**
     * Start Timer
     * Starts an interveral to watch for log roll changes.
     */
    startTimer(): void;
    /**
     * Stop Timer
     * Clears the roll change timer.
     */
    stopTimer(): void;
    /**
     * Open
     * Creates/opens the file stream.
     */
    open(fn?: {
        (stream?: NodeJS.WritableStream);
    }): void;
    /**
     * Close
     * Closes the write stream.
     */
    close(fn?: Function): void;
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    action(output: ILogurOutput, fn: TransportActionCallback): void;
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    query(q: IQuery, fn: QueryResult): void;
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    dispose(): void;
}
