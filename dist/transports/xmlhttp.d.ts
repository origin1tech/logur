import { ILogur, IXMLHttpTransportOptions, IXMLHttpTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions, IQuery, QueryResult, IInstanceMethodsExtended, IMetadata, XMLHttpRequestCallback } from '../interfaces';
import { LogurTransport } from './base';
export declare class XMLHttpTransport extends LogurTransport implements IXMLHttpTransport {
    options: IXMLHttpTransportOptions;
    /**
     * Memory Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IXMLHttpTransportOptions, logur: ILogur);
    /**
     * Try ActiveXObject
     * Tries to get XMLHttp via ActiveXObject.
     */
    private tryActiveXObject();
    /**
     * Get XMLHttp Client
     * Tries to get browser compatible XMLHttp Request.
     */
    private getXMLHttpRequest();
    /**
     * Handle Error
     * Handles error throw by request.
     *
     * @param err the XMLHttp Error.
     */
    private handleError(err);
    /**
     * Handle Status
     * Handles status warnings when 200 and 201 are not returned.
     *
     * @param xhr the XMLHttpRequest object.
     */
    private handleStatus(xhr);
    /**
     * Request
     * Makes XMLHttpRequest.
     *
     * @param options the options for the xmlhttp request.
     * @param data data object for posts.
     */
    request(options: IXMLHttpTransportOptions, data?: string | IMetadata, fn?: XMLHttpRequestCallback): void;
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
    query(q: IQuery, fn: QueryResult): IInstanceMethodsExtended;
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions.
     */
    dispose(fn: Function): void;
}
