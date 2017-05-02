import { ILogurInstance, ILogur, ILogurInstanceOptions, ITransportMethods, IEnv, IProfiles, IProfileMethods } from './interfaces';
import { Notify } from './notify';
import { UAParser } from 'ua-parser-js';
/**
 * Logur Instance
 */
export declare class LogurInstance extends Notify implements ILogurInstance {
    private _browserEnv;
    private _nodeEnv;
    protected _name: string;
    protected _logur: ILogur;
    protected _transports: string[];
    protected _exceptions: string[];
    protected _profiles: IProfiles;
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
    /**
     * Log
     * Iterates transports then calls base Logur.log method.
     *
     * @param type the type of log message.
     * @param args array of arguments.
     */
    protected logger(transports: string | string[], type: any, ...args: any[]): void;
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    protected handleExceptions(): void;
    /**
     * Log
     * Gets the internal logger.
     */
    private readonly log;
    private common();
    /**
     * Transport
     * Exposes methods for adding, removing and getting transports.
     */
    readonly transports: ITransportMethods;
    /**
     * Profile
     * Allows for profiling logs.
     * TODO: Really needs its on class!
     */
    readonly profiles: IProfileMethods;
    /**
     * Env
     * Returns the current environment information.
     */
    readonly env: IEnv;
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
    write(...args: any[]): ILogurInstance;
    /**
     * Exit
     * When env is node process.exit() is called.
     *
     * @param code optional node error code.
     */
    exit(code?: number): void;
}
