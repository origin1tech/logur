/// <reference types="node" />
/**
 * STREAM TRANSPORT
 *
 * By default this Transport is not much different than the
 * Console Transport. This is because the default writable
 * stream used is simply process.stdout which console.log
 * uses. That said if you pass your own stream in options
 * log events will be handed off to the stream you supply
 * as expected which can be handy.
 *
 */
import { ILogur, IStreamTransportOptions, IStreamTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
export declare class StreamTransport extends LogurTransport implements IStreamTransport {
    stream: NodeJS.WritableStream;
    options: IStreamTransportOptions;
    /**
     * Memory Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IStreamTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    action(output: ILogurOutput, fn: TransportActionCallback): void;
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    dispose(): void;
}
