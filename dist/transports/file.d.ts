/// <reference types="node" />
import { ILogur, IFileTransportOptions, IFileTransport, ILogurOutput, ILogurInstanceOptions, IParsedPath, ITimer, IQuery, QueryResult } from '../interfaces';
import { LogurTransport } from './base';
export declare class FileTransport extends LogurTransport implements IFileTransport {
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
     * Parse Line
     * Parses a logged line from file.
     *
     * @param line the line to parse.
     */
    private parseLine(line);
    /**
     * Map Fields
     * Takes a parsed log line/object then maps
     * to requested fields in query.
     *
     * @param fields the fields to be returned in object.
     * @param obj the source object to map from.
     */
    private mapFields(fields, obj?);
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
     */
    action(output: ILogurOutput): void;
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
