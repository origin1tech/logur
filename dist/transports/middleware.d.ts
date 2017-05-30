import { ILogur, IMiddlewareTransportOptions, IMiddlewareTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
export declare class MiddlewareTransport extends LogurTransport implements IMiddlewareTransport {
    options: IMiddlewareTransportOptions;
    /**
     * Middleware Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IMiddlewareTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    action(output: ILogurOutput, fn: TransportActionCallback): void;
}
