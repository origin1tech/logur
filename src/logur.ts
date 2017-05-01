import * as u from './utils';
import { ILogur, ILogurInstanceOptions, ILogurTransport, ILogurInstance, ILogurTransportOptions, ILogurOptions, ITransportMethods, ILogurInstances, ILogurTransports, Constructor, InstanceConstructor } from './interfaces';

import { LogurInstance } from './instance';
import { ConsoleTransport } from './transports';


const defaults = {};

class Logur implements ILogur {

  static instance: ILogur;

  instances: ILogurInstances = {};
  transports: ILogurTransports = {};
  log: ILogurInstance;  // the default logger instance used internally.
  options: ILogurOptions;

  constructor(options?: ILogurOptions) {

    if (Logur.instance)
      return Logur.instance;

    // Init options with defaults.
    this.options = u.extend({}, defaults, options);

    // Create the default instance.
    if (!this.instances['default']) {

      // Create the default Logur Instance.
      const instance = this.create<LogurInstance>('default', LogurInstance);

      // Create the default console transport.
      // Because we're using a public "get" in instance
      // we don't pass type arg because Typescript will
      // complain. We don't need it here in case you're
      // wondering. Will work as expected from exposed API.
      instance.transports.create('console', ConsoleTransport);

      // Save the default Logur Instance.
      this.log = instance;

    }

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
  get<T>(name?: string): T {
    return this.instances[name] as T;
  }

  /**
   * Create
   * Creates and loads a Logur Instance in Logur.
   *
   * @param name the name of the Logur Instance to create.
   * @param options Logur Instance options.
   */
  create<T extends ILogurInstance, U>(name: string, options: ILogurInstanceOptions | InstanceConstructor<T>, Type?: InstanceConstructor<T>): T {

    if (!name)
      throw new Error('Failed to create Logur Instance using name of undefined.');

    if (!u.isPlainObject(options)) {
      Type = <InstanceConstructor<T>>options;
      options = undefined;
    }

    return this.instances[name] = new Type(name, options || {}, this);

  }

  /**
   * Remove
   * Destroys the specified Logur Instance.
   *
   * @param name
   */
  remove(name: string): void {
    if (name === 'default')
      return this.log.error('cannot remove default Logur Instance.');
    delete this.instances[name];
  }

}


/**
 * Get
 * Gets an existing Logur instance by name. If
 * no name is passed the 'default' Logur Instance
 * will be returned.
 *
 * @param name the name of the Logur instance to get.
 */
function get(name: string = 'default'): ILogurInstance {
  let logur = new Logur();
  return logur.get<ILogurInstance>(name);
}

export {
  Logur,
  get
}