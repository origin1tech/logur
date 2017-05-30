import { ILogurInstance, ILogur, ILogurInstanceOptions, ITransportMethods, IMetadata, IEnv, ISerializers, ISerializerMethods, IQuery, QueryResult, ExecCallback, IInstanceMethodsWrap, IInstanceMethodsWrite, IMiddlewareOptions, IMiddleware, IFilterMethods, IFilters } from './interfaces';
import { Notify } from './notify';
import { UAParser } from 'ua-parser-js';
/**
 * Logur Instance
 */
export declare class LogurInstance<T> extends Notify implements ILogurInstance<T> {
    private _browserEnv;
    private _nodeEnv;
    private _exceptionsInit;
    private _exceptionHandler;
    protected _name: string;
    protected _logur: ILogur;
    protected _pkg: IMetadata;
    protected _transports: string[];
    protected _exceptions: string[];
    protected _filters: IFilters;
    protected _serializers: ISerializers;
    private _buffer;
    private _transportFilters;
    private _filtersCount;
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
     * Bind Levels
     * Creates a bound object of instance levels for chaining.
     *
     * @param extended the string or string array of extended methods.
     * @param suppressLevels when true no levels are bound to object.
     * @param fn a callback to be injected on logged via .exec().
     */
    private bindLevels(extended?, suppressLevels?, fn?);
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    private handleExceptions();
    /**
     * Find Level
     * Finds the level value index in log params array.
     *
     * @param params the exec params to be logged.
     */
    private findLevel(params);
    /**
     * Has Buffer
     * Tests if buffer contains any LogurOutput objects.
     */
    private hasBuffer();
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
     * Filters
     * Allows filter of log events preventing
     * transport actions from firing.
     */
    readonly filters: IFilterMethods;
    /**
     * Env
     * Returns the current environment information.
     */
    readonly env: IEnv;
    /**
     * Log
     * Iterates transports then calls base Logur.log method.
     *
     * @param done callback when all transports logged.
     * @param transports list of transports to be called '*' for all.
     * @param type the type of log message.
     * @param args array of arguments.
     */
    exec(done: ExecCallback | string | string[], transports: string | string[], level?: any, ...args: any[]): void;
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
     * With
     * Logs using a specific transport.
     *
     * @param transport the transport to log with.
     * @param exclude when true fire all transports except those provided.
     */
    using(transports: string | string[], exclude?: boolean): T;
    /**
     * Write
     * The equivalent of calling console.log without
     * any intervention from Logur.
     *
     * @param args arguments to pass to console.log.
     */
    write(...args: any[]): IInstanceMethodsWrite<T> & T;
    /**
     * Wrap
     * Wraps a log before and after with the provided value.
     * Valid only for console transport.
     *
     * @param value the value to wrap logged line with.
     * @param args any additional values to pass to console.log.
     */
    wrap(value: any, ...args: any[]): IInstanceMethodsWrap<T> & T;
    /**
     * Exit
     * When env is node process.exit() is called.
     *
     * @param code optional node error code.
     * @param panic when true exit immediately don't wait on buffer.
     */
    exit(code?: number | boolean, panic?: boolean): void;
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
     * Middleware
     * Returns both request and error handlers for
     * Express/Connect middleware.
     *
     * @param options the middleware options.
     */
    middleware(options?: IMiddlewareOptions): IMiddleware;
    /**
     * Dispose
     * Calls dispose on transports on
     * teardown of instance.
     *
     * @param fn callback on done disposing transports.
     */
    dispose(fn: Function, isErr?: boolean): void;
}
