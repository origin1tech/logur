import { ILogur, IHttpTransportOptions, IHttpTransport, ILogurOutput, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
export declare class HttpTransport extends LogurTransport implements IHttpTransport {
    options: IHttpTransportOptions;
    /**
     * Http Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IHttpTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     */
    action(output: ILogurOutput): void;
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    query(): void;
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    dispose(): void;
}
