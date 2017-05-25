import { ILogurInstance, ILogur, ILogurInstanceOptions, ITransportMethods, ILogurOutput, IEnv, ISerializerMethods, IQuery, QueryResult } from './interfaces';
import { Notify } from './notify';
import { UAParser } from 'ua-parser-js';
/**
 * Logur Instance
 */
export declare class LogurInstance extends Notify implements ILogurInstance {
    private _browserEnv;
    private _nodeEnv;
    private _exceptionsInit;
    private _exceptionHandler;
    protected _name: string;
    protected _logur: ILogur;
    protected _transports: string[];
    protected _exceptions: string[];
    protected _active: boolean;
    ua: UAParser;
    options: ILogurInstanceOptions;
    /**
     * Logur Instance Contructor
     *
     * @param options the Logur Instance options.
     * @param logur the common instance of Logur.
     */
    constructor(name: string, options: ILogurInstanceOptions, logur: ILogur);
    private initLevels(levels);
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    private handleExceptions();
    /**
     * Log
     * Gets the internal logger.
     */
    private readonly log;
    /**
     * Transport
     * Exposes methods for adding, removing and getting transports.
     */
    readonly transports: ITransportMethods;
    /**
     * Serializers
     * Gets, creates and removes serializers.
     * NOTE: Serializers are called before pretty
     * print formatting and colorization.
     */
    readonly serializers: ISerializerMethods;
    /**
     * Env
     * Returns the current environment information.
     */
    readonly env: IEnv;
    /**
     * Log
     * Iterates transports then calls base Logur.log method.
     *
     * @param type the type of log message.
     * @param args array of arguments.
     */
    logger(transports: string | string[], type: any, ...args: any[]): ILogurOutput;
    /**
     * Set Option
     * Sets/updates options.
     *
     * @param key the key or options object.
     * @param value the associated value to set for key.
     * @param cascade allows toggling cascade on single set.
     */
    setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any, cascade?: boolean): void;
    /**
     * Active
     * Sets the active state of the instance.
     *
     * @param state the active state to set for the Logur Instance.
     */
    active(state?: boolean): boolean;
    /**
     * Write
     * The equivalent of calling console.log without
     * any intervention from Logur.
     *
     * @param args arguments to pass to console.log.
     */
    write(...args: any[]): void;
    /**
     * Exit
     * When env is node process.exit() is called.
     *
     * @param code optional node error code.
     */
    exit(code?: number): void;
    /**
     * Query
     * Queries a transport.
     *
     * @param transport the transport to be queried.
     * @param q the query object to execute.
     * @param fn the callback function on done.
     */
    query(transport: string, q: IQuery, fn: QueryResult): void;
    /**
     * Dispose
     * Calls dispose on transports on
     * teardown of instance.
     *
     * @param fn callback on done disposing transports.
     */
    dispose(fn: Function): void;
}
