import * as u from './utils';
import { ILogur, ILogurInstanceOptions, ILogurTransport, ILogurInstance, ILogurTransportOptions, ILogurOptions, ITransportMethods, ILogurInstances, ILogurTransports, ILevelMethodsBase, ILevelMethods, ILogurOptionsTransport, IConsoleTransportOptions, ISerializers, IMetadata } from './interfaces';

import { LogurInstance } from './instance';
import { ConsoleTransport } from './transports';

let pkg;

// If NodeJS get package info.
if (u.isNode()) {
  const resolve = require('path').resolve;
  pkg = require(resolve(process.cwd(), 'package.json'));
}

const defaults = {

  // Keys to grab from package.json when using Node.
  package: ['name', 'description', 'version', 'main', 'repository', 'author', 'license']

};

export class Logur implements ILogur {

  static instance: Logur;

  pkg: IMetadata = {};
  instances: ILogurInstances = {};
  transports: ILogurTransports = {};
  log: ILogurInstance<ILevelMethods> & ILevelMethods;
  options: ILogurOptions;

  /**
   * Constructs Logur
   * @param options the Logur options.
   */
  constructor(options?: ILogurOptions) {

    if (Logur.instance)
      return Logur.instance;

    // Init options with defaults.
    this.options = u.extend({}, defaults, options);

    if (pkg && this.options.package && this.options.package.length) {
      this.options.package.forEach((k) => {
        const found = u.get(pkg, k);
        if (found)
          this.pkg[k] = found;
      });
    }

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
        throw new Error(`Cannot set option for key ${key} using value of undefined.`);

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
  get<T extends ILevelMethodsBase>(name?: string): ILogurInstance<T> & T {
    return this.instances[name];
  }

  /**
   * Create
   * Creates and loads a Logur Instance in Logur.
   *
   * @param name the name of the Logur Instance to create.
   * @param options Logur Instance options.
   */
  create<T extends ILevelMethodsBase>(name: string, options?: ILogurInstanceOptions): ILogurInstance<T> & T {

    if (!name)
      throw new Error('Failed to create Logur Instance using name of undefined.');

    this.instances[name] = new LogurInstance<T>(name, options, this);

    // If no default logger set it.
    if (u.isUndefined(this.log))
      this.log = this.instances[name];

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
export function get(options?: ILogurInstanceOptions): ILogurInstance<ILevelMethods> & ILevelMethods {

  // Get Logur.
  const logur = new Logur();

  // Get the default instance if exists.
  let instance = <ILogurInstance<ILevelMethods> & ILevelMethods>logur.get<ILevelMethods>('default');

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
    instance = logur.create<ILevelMethods>('default', options);

  }

  return instance;

}