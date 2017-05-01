import { ILogur, ILogurInstanceOptions, ILogurInstance, ILogurOptions, ILogurInstances, ILogurTransports, InstanceConstructor } from './interfaces';
declare class Logur implements ILogur {
    static instance: ILogur;
    instances: ILogurInstances;
    transports: ILogurTransports;
    log: ILogurInstance;
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
    get<T>(name?: string): T;
    /**
     * Create
     * Creates and loads a Logur Instance in Logur.
     *
     * @param name the name of the Logur Instance to create.
     * @param options Logur Instance options.
     */
    create<T extends ILogurInstance, U>(name: string, options: ILogurInstanceOptions | InstanceConstructor<T>, Type?: InstanceConstructor<T>): T;
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    remove(name: string): void;
}
/**
 * Get
 * Gets an existing Logur instance by name. If
 * no name is passed the 'default' Logur Instance
 * will be returned.
 *
 * @param name the name of the Logur instance to get.
 */
declare function get(name?: string): ILogurInstance;
export { Logur, get };
