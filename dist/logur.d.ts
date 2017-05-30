import { ILogur, ILogurInstanceOptions, ILogurInstance, ILogurInstances, ILogurTransports, ILevelMethods, ILevelMethodsDefault } from './interfaces';
export declare class Logur implements ILogur {
    static instance: Logur;
    instance: ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;
    instances: ILogurInstances;
    transports: ILogurTransports;
    /**
     * Constructs Logur
     */
    constructor();
    /**
     * Log
     * Gets the default internal logger.
     */
    readonly log: ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;
    /**
     * Get
     * Gets a loaded Logur instance or all instances
     * when no name is provided.
     *
     * @param name the name of the Logur Instance to get.
     */
    get<T extends ILevelMethods>(name?: string): ILogurInstance<T> & T;
    /**
     * Create
     * Creates and loads a Logur Instance in Logur.
     *
     * @param name the name of the Logur Instance to create.
     * @param options Logur Instance options.
     */
    create<T extends ILevelMethods>(name: string, options?: ILogurInstanceOptions): ILogurInstance<T> & T;
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
export declare function get(options?: ILogurInstanceOptions): ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;
