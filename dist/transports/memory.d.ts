import { ILogur, IMemoryTransportOptions, IMemoryTransport, ILogurOutput, TransportActionCallback } from '../interfaces';
import { LogurTransport } from './base';
export declare class MemoryTransport extends LogurTransport implements IMemoryTransport {
    logs: ILogurOutput[];
    options: IMemoryTransportOptions;
    constructor(options: IMemoryTransportOptions, logur: ILogur);
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an callback on Transport done.
     */
    action(output: ILogurOutput, done: TransportActionCallback): void;
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    query(): void;
}
