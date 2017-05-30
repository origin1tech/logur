import * as u from './utils';
import { ILogur, ILogurInstanceOptions, ILogurTransport, ILogurInstance, ILogurTransportOptions, ITransportMethods, ILogurInstances, ILogurTransports, ILevelMethods, ILevelMethodsDefault, ILogurOptionsTransport, IConsoleTransportOptions, ISerializers, IMetadata } from './interfaces';

import { LogurInstance } from './instance';
import { ConsoleTransport } from './transports';

export class Logur implements ILogur {

  static instance: Logur;

  instance: ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;

  instances: ILogurInstances = {};
  transports: ILogurTransports = {};
  // log: ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;

  /**
   * Constructs Logur
   */
  constructor() {

    if (Logur.instance)
      return Logur.instance;

    Logur.instance = this;

  }

  /**
   * Log
   * Gets the default internal logger.
   */
  get log(): ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault {

    // If log exists just return it.
    //if (this._log)
    return this.instance;

    // // Create the instance.
    // let instance = this.create<ILevelMethodsDefault>('default');

    // return this._log = instance;

  }

  /**
   * Get
   * Gets a loaded Logur instance or all instances
   * when no name is provided.
   *
   * @param name the name of the Logur Instance to get.
   */
  get<T extends ILevelMethods>(name?: string): ILogurInstance<T> & T {
    return this.instances[name];
  }

  /**
   * Create
   * Creates and loads a Logur Instance in Logur.
   *
   * @param name the name of the Logur Instance to create.
   * @param options Logur Instance options.
   */
  create<T extends ILevelMethods>(name: string, options?: ILogurInstanceOptions): ILogurInstance<T> & T {

    if (!name)
      throw new Error('Failed to create Logur Instance using name of undefined.');

    this.instances[name] = new LogurInstance<T>(name, options, this);

    return this.instances[name];

  }

  /**
   * Remove
   * Destroys the specified Logur Instance.
   *
   * @param name
   */
  remove(name: string): void {
    if (name === 'default')
      throw Error('cannot remove default Logur Instance.');
    delete this.instances[name];
  }

  /**
   * Dispose
   * Iterates all instances disposing of transports.
   *
   * @param exit when NOT false exit after disposing.
   */
  dispose(exit: boolean | Function, fn?: Function) {

    const funcs = [];

    if (u.isFunction(exit)) {
      fn = exit as Function;
      exit = undefined;
    }

    fn = fn || u.noop;

    u.keys(this.instances).forEach((k) => {
      const instance = this.instances[k];
      funcs.push(instance.dispose);
    });

    u.asyncEach(funcs, () => {

      // Exit if true and is Node.
      if (exit && u.isNode())
        process.exit(0);

      // Otherwise call callback.
      else
        fn();

    });

  }

}

/**
 * Get
 * Gets the default Logur Instance.
 *
 * @param options the Logur Instance options.
 */
export function get(options?: ILogurInstanceOptions): ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault {

  // Get Logur.
  const logur = new Logur();

  // Get the default instance if exists.
  let instance = <ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault>logur.get<ILevelMethodsDefault>('default');

  // If no instance create it.
  if (!instance) {

    const consoleTransport = {
      name: 'console',
      transport: ConsoleTransport
    };

    // Ensure options.
    options = options || {
      transports: [consoleTransport]
    };
    options.transports = options.transports || [];

    // Check if Console Transport exists.
    const hasConsole = options.transports.filter((t) => {
      return t.name === 'console' || u.isInstance(t.transport, ConsoleTransport);
    })[0];

    // If no Console Transport push config and create instance.
    if (!hasConsole)
      options.transports.push(consoleTransport);

    // Create the instance.
    instance = logur.create<ILevelMethodsDefault>('default', options);

    logur.instance = instance;

  }

  return instance;

}