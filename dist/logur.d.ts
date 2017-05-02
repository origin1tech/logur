import { ILogur, ILogurInstanceOptions, ILogurInstance, ILogurOptions, ILogurInstances, ILogurTransports, ILevelMethodsBase, ILevelMethods } from './interfaces';
declare class Logur implements ILogur {
    static instance: ILogur;
    instances: ILogurInstances;
    transports: ILogurTransports;
    log: ILogurInstance & ILevelMethods;
    options: ILogurOptions;
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
    get<T extends ILevelMethodsBase>(name?: string): ILogurInstance & T;
    /**
     * Create
     * Creates and loads a Logur Instance in Logur.
     *
     * @param name the name of the Logur Instance to create.
     * @param options Logur Instance options.
     */
    create<T extends ILevelMethodsBase>(name: string, options: ILogurInstanceOptions): ILogurInstance & T;
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    remove(name: string): void;
}
/**
 * Get Instance
 * Gets an existing Logur Instance by name.
 *
 * @param name the name of the Logur Instance to get.
 */
declare function get<T extends ILevelMethodsBase>(name: string): ILogurInstance & T;
/**
 * Get
 * Gets the default Logur Instance.
 *
 */
declare function getDefault(): ILogurInstance & ILevelMethods;
export { Logur, get, getDefault };
