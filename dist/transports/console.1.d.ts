import { ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput } from '../interfaces';
import { LogurTransport } from './base';
export declare class ConsoleTransport extends LogurTransport implements IConsoleTransport {
    options: IConsoleTransportOptions;
    constructor(options: IConsoleTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    action(output: ILogurOutput, done?: {
        (type: string, ordered: any[]);
    }): void;
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    query(): void;
}
