/// <reference types="node" />
/**
 * HTTP TRANSPORT
 *
 * This Transport uses ONLY native Node http(s) request.
 * Although it will work fine for simple requests it might be best
 * to create a custom Transport extending the base Transport "LogurTransport"
 * while using the "request" module for example
 * @see https://www.npmjs.com/package/request
 *
 */
import { ILogur, IHttpTransportOptions, IHttpTransport, ILogurOutput, ILogurInstanceOptions, TransportActionCallback, HttpTransportCallback, IMetadata, IQuery, QueryResult, IInstanceMethodsExtended } from '../interfaces';
import { LogurTransport } from './base';
import { RequestOptions } from 'http';
export declare class HttpTransport extends LogurTransport implements IHttpTransport {
    private _requestOptions;
    options: IHttpTransportOptions;
    /**
     * Http Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IHttpTransportOptions, logur: ILogur);
    private handleError(err);
    private hanldeStatus(res);
    /**
     * Request
     * Makes an Http(s) request.
     *
     * @param options the http(s) request options.
     * @param fn callback upon http response.
     */
    request(options: RequestOptions, data: string | IMetadata | HttpTransportCallback, fn?: HttpTransportCallback): void;
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    action(output: ILogurOutput, fn?: TransportActionCallback): void;
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    query(q: IQuery, fn: QueryResult): IInstanceMethodsExtended;
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    dispose(): void;
}
