import { ILogur, IExpressTransportOptions, IExpressTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
export declare class ExpressTransport extends LogurTransport implements IExpressTransport {
    logs: any[];
    options: IExpressTransportOptions;
    /**
     * Express Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: ILogurInstanceOptions, options: IExpressTransportOptions, logur: ILogur);
    middleware(): () => void;
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
