import * as u from './utils';
import { ILogur, ILogurInstanceOptions, ILogurTransport, ILogurInstance, ILogurTransportOptions, ILogurOptions, ITransportMethods, ILogurInstances, ILogurTransports, ILevelMethodsBase, ILevelMethods, ILogurOptionsTransport } from './interfaces';

import { LogurInstance } from './instance';
import { ConsoleTransport } from './transports';

const defaults = {
  transports: []
};

class Logur implements ILogur {

  static instance: ILogur;

  instances: ILogurInstances = {};
  transports: ILogurTransports = {};
  log: ILogurInstance & ILevelMethods;  // the default logger instance used internally.
  options: ILogurOptions;

  constructor(options?: ILogurOptions) {

    if (Logur.instance)
      return Logur.instance;

    // Init options with defaults.
    this.options = u.extend({}, defaults, options);

    let instance: ILogurInstance & ILevelMethods;

    // Create the default Logur Instance.
    if (!this.instances['default'])
      instance = this.create<ILevelMethods>('default', LogurInstance);

    // Create the default Console Transport.
    instance.transports.create<ConsoleTransport>('console', ConsoleTransport);

    // Iterate Transports and add
    // to default instance.
    this.options.transports.forEach((conf: ILogurOptionsTransport) => {
      instance.transports.create(conf.name, conf.options, conf.transport);
    });

    // Save the default Logur Instance
    // for internal logging.
    this.log = instance;

    // Store instance for singleton.
    Logur.instance = this;

  }

  /**
   * Set Option
   * Sets/updates options.
   *
   * @param key the key or options object.
   * @param value the associated value to set for key.
   */
  setOption(key: string | ILogurOptions, value?: any): void {

    // If not object of options just set key/value.
    if (!u.isPlainObject(key)) {

      // If not value log error.
      if (!value)
        console.log('error', `cannot set option for key ${key} using value of undefined.`);

      else
        this.options[key as string] = value;

    }

    else {

      this.options = u.extend({}, this.options, key);

    }

  }

  /**
   * Get
   * Gets a loaded Logur instance or all instances
   * when no name is provided.
   *
   * @param name the name of the Logur Instance to get.
   */
  get<T extends ILevelMethodsBase>(name?: string): ILogurInstance & T {
    return this.instances[name];
  }

  /**
   * Create
   * Creates and loads a Logur Instance in Logur.
   *
   * @param name the name of the Logur Instance to create.
   * @param options Logur Instance options.
   */
  create<T extends ILevelMethodsBase>(name: string, options: ILogurInstanceOptions): ILogurInstance & T {

    if (!name)
      throw new Error('Failed to create Logur Instance using name of undefined.');

    return this.instances[name] = <LogurInstance & T>new LogurInstance(name, options || {}, this);

  }

  /**
   * Remove
   * Destroys the specified Logur Instance.
   *
   * @param name
   */
  remove(name: string): void {
    if (name === 'default')
      this.log.error('cannot remove default Logur Instance.').exit();
    delete this.instances[name];
  }

}

/**
 * Get Instance
 * Gets an existing Logur Instance by name.
 *
 * @param name the name of the Logur Instance to get.
 */
function get<T extends ILevelMethodsBase>(name: string): ILogurInstance & T {
  let logur = new Logur();
  return <ILogurInstance & T>logur.get<T>(name);
}

/**
 * Get
 * Gets the default Logur Instance.
 *
 */
function getDefault(): ILogurInstance & ILevelMethods {
  return get<ILevelMethods>('default');
}

export {
  Logur,
  get,
  getDefault
}