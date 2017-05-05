import { ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
export declare class ConsoleTransport extends LogurTransport implements IConsoleTransport {
    options: IConsoleTransportOptions;
    /**
      * Console Transport Constructor
      *
      * @param base the base options/defaults instantiated by Logur Instance.
      * @param options the Logur Transport options.
      * @param logur the common Logur instance.
      */
    constructor(base: ILogurInstanceOptions, options: IConsoleTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    action(output: ILogurOutput, done: TransportActionCallback): void;
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    query(): void;
}
