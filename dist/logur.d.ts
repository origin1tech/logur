import { ILogur, ILogurInstance, ILogurOptions, ILevelMethodsBase, ILevelMethods } from './interfaces';
/**
 * Init
 * Initializes Logur.
 *
 * @param options Logur options to initialize with.
 */
declare function init(options?: ILogurOptions): ILogur;
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
 */
declare function getDefault(): ILogurInstance & ILevelMethods;
export { init, get, getDefault };
