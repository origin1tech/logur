import { ILogur, IFileTransportOptions, IFileTransport, TransportActionCallback, ILogurOutput } from '../interfaces';
import { LogurTransport } from './base';
export declare class FileTransport extends LogurTransport implements IFileTransport {
    options: IFileTransportOptions;
    constructor(options: IFileTransportOptions, logur: ILogur);
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
