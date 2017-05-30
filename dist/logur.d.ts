import { ILogur, ILogurInstanceOptions, ILogurInstance, ILogurOptions, ILogurInstances, ILogurTransports, ILevelMethodsBase, ILevelMethods, IMetadata } from './interfaces';
export declare class Logur implements ILogur {
    static instance: Logur;
    pkg: IMetadata;
    instances: ILogurInstances;
    transports: ILogurTransports;
    log: ILogurInstance<ILevelMethods> & ILevelMethods;
    options: ILogurOptions;
    /**
     * Constructs Logur
     * @param options the Logur options.
     */
    constructor(options?: ILogurOptions);
    /**
     * Set Option
     * Sets/updates options.
     *
     * @param key the key or options object.
     * @param value the associated value to set for key.
     */
    setOption(key: string | ILogurOptions, value?: any): void;
    /**
     * Get
     * Gets a loaded Logur instance or all instances
     * when no name is provided.
     *
     * @param name the name of the Logur Instance to get.
     */
    get<T extends ILevelMethodsBase>(name?: string): ILogurInstance<T> & T;
    /**
     * Create
     * Creates and loads a Logur Instance in Logur.
     *
     * @param name the name of the Logur Instance to create.
     * @param options Logur Instance options.
     */
    create<T extends ILevelMethodsBase>(name: string, options?: ILogurInstanceOptions): ILogurInstance<T> & T;
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    remove(name: string): void;
    /**
     * Dispose
     * Iterates all instances disposing of transports.
     *
     * @param exit when NOT false exit after disposing.
     */
    dispose(exit: boolean | Function, fn?: Function): void;
}
/**
 * Get
 * Gets the default Logur Instance.
 *
 * @param options the Logur Instance options.
 */
export declare function get(options?: ILogurInstanceOptions): ILogurInstance<ILevelMethods> & ILevelMethods;
