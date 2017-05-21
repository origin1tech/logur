
import { ILogurInstance, ILogur, ILogurInstanceOptions, ILogurTransportOptions, ILogurTransport, ITransportMethods, ILogurTransports, ILogurInstances, IMetadata, ILevel, TimestampCallback, ILogurOutput, ILoad, MemoryUsage, IProcess, IOS, IEnvBrowser, IEnvNode, IEnv, IProfiles, IProfileMethods, IProfileResult, IProfileOptions, IProfile, IStacktrace, TransportConstructor, ILogurOptionsTransport, ILevels, ILevelMethods, ISerializers, ISerializerMethods, Serializer, IError, ILogurOutputMapped } from './interfaces';
import { LogurTransport, ConsoleTransport, FileTransport, HttpTransport } from './transports';
import { Notify } from './notify';

import * as env from './env';
import * as u from './utils';
import * as sprintf from 'sprintf-js';
import { UAParser } from 'ua-parser-js';

const defaults: ILogurInstanceOptions = {

  level: 5,
  cascade: true,
  map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],

  levels: {
    error: { level: 0, color: 'red' },
    warn: { level: 1, color: 'yellow' },
    info: { level: 2, color: 'blue' },
    verbose: { level: 3, color: 'green' },
    debug: { level: 4, color: 'magenta' },
  },

  timestamp: 'utctime',
  uuid: undefined,
  transports: [],
  catcherr: false,
  exiterr: false,

  // Maps Logur Output
  // property to color.
  colormap: {

    timestamp: 'yellow',
    uuid: 'magenta',
    instance: 'gray',
    ministack: 'gray',
    error: 'bgRed.white',
    function: 'cyan'

  }

};

const profileDefaults: IProfileOptions = {
  transports: [],
  max: 25
};

/**
 * Logur Instance
 */
export class LogurInstance extends Notify implements ILogurInstance {

  // Env
  private _browserEnv: IEnvBrowser;
  private _nodeEnv: IEnvNode;

  // Exceptions
  private _exceptionsInit: boolean = false;
  private _exceptionHandler;


  protected _name: string;
  protected _logur: ILogur;
  protected _transports: string[] = [];
  protected _exceptions: string[] = [];
  protected _profiles: IProfiles;
  protected _active: boolean = true;

  ua: UAParser;
  options: ILogurInstanceOptions;

  /**
   * Logur Instance Contructor
   *
   * @param options the Logur Instance options.
   * @param logur the common instance of Logur.
   */
  constructor(name: string, options: ILogurInstanceOptions, logur: ILogur) {

    super();

    this._name = name;
    this._logur = logur;
    this.options = u.extend({}, defaults, options);

    // Extend class with log method handlers.
    u.keys(this.options.levels).forEach((k) => {

      const level = this.options.levels[k];

      // If a number convert to object.
      if (u.isNumber(level))
        this.options.levels[k] = { level: level };

      this[k] = (...args: any[]) => {
        this.logger(k, args);
        return this;
      };

    });

    // Iterate Transports in options
    // and bind to the Instance.
    this.options.transports.forEach((t: ILogurOptionsTransport) => {
      this.transports.add(t.name, t.options, t.transport);
    });

    // Init UAParser, expose it publicly
    // in case user wants to parse headers
    // in http requests.
    this.ua = new UAParser();

    if (u.isNode())
      this._nodeEnv = env.node();
    else
      this._browserEnv = env.browser(this.ua);

  }

  // PRIVATE METHODS

  /**
   * Handle Exceptions
   * Enables handling uncaught NodeJS exceptions.
   */
  private handleExceptions(): void {

    const EOL = this.env.node && this.env.node.os ? this.env.node.os.EOL : '\n';
    const isNode = u.isNode();

    // Handle uncaught exceptions in NodeJS.
    if (isNode) {

      this._exceptionHandler = (err: IError) => {

        // Remove the listener to prevent loops.
        process.removeListener('uncaughtException', this._exceptionHandler);

        this.logger(this._exceptions, 'error', err, () => {

          // Call dispose method on transports.

        });

      };

      process.on('uncaughtException', this._exceptionHandler);

    }

    // Handle uncaught exceptions in brwoser.
    else if (u.isBrowser()) {

      const browser = this.ua.getBrowser().name.toLowerCase();

      this._exceptionHandler = (message: string, url: string, line: number, column: number, err: IError) => {

        // If not exceptions just return.
        if (!this._exceptions.length)
          return;

        // Ahh the good browsers
        if (err) {

          this.logger(this._exceptions, 'error', err);

        }

        // And these are the shitty ones...
        else {

          let stack = `Error: ${message}\ngetStack@${url}:${line}:${column}`;

          if (browser === 'chrome' || browser === 'opera')
            stack = `Error: ${message}\nat getStack (${url}:${line}:${column})`;

          // We'll parse this in log method.
          this.logger(this._exceptions, 'error', {

            name: 'unhandledException',
            message: message,
            stack: stack,
            frames: [{
              path: url,
              line: line,
              column: column
            }],
            __generated__: true

          });

        }

      };

      window.onerror = this._exceptionHandler;

    }

  }

  /**
   * Log
   * Gets the internal logger.
   */
  private get log(): ILogurInstance & ILevelMethods {
    return this._logur.log;
  }

  // GETTERS

  /**
   * Transport
   * Exposes methods for adding, removing and getting transports.
   */
  get transports(): ITransportMethods {

    let methods;

    /**
     * Has
     * Check if instance has the specified Transport.
     *
     * @param name the name of the Transport to lookup.
     */
    const has = (name: string): boolean => {
      return u.contains(this._transports, name);
    };

    /**
     * Get
     * Gets a loaded transport.
     * @param name the Transport name.
     */
    const get = <T>(name?: string): T => {
      return this._logur.transports[name].instance;
    };

    /**
     * Get All
     * Gets all Logur Instance Transports.
     */
    const getAll = (): ILogurTransports => {

      const transports: ILogurTransports = {};
      this._transports.forEach((k) => {
        if (!u.isUndefined(k))
          transports[k] = this._logur.transports[k];
      });
      return transports;

    };

    /**
     * Get List
     * Simply returns the list of loaded Transports.
     */
    const getList = (): string[] => {
      return this._transports;
    };

    /**
     * Create
     * Creates and adds Transport to instance.
     *
     * @param name the name of the Transport to add.
     * @param options the options for the Transport.
     * @param Transport a Transport that extends LogurTransport.
     */
    const add = <T extends ILogurTransport>(name: string, options?: IMetadata | TransportConstructor<T>, Transport?: TransportConstructor<T>): ITransportMethods => {

      // Ensure name is lowered.
      name = (name as string).toLowerCase();

      // Allow Type as second arg.
      if (options && !u.isPlainObject(options)) {
        Transport = <TransportConstructor<T>>options;
        options = undefined;
      }

      if (!Transport)
        throw new Error(`Cannot create Transport ${name} using Type of undefined.`);

      const transport = new Transport(this.options, options, this._logur);

      // If transport handles exception add
      // to list of transport exceptions.
      if (transport.options.catcherr) {

        this._exceptions.push(name);

        // Add uncaught/window exception handler listeners.
        if (!this._exceptionsInit) {
          this.handleExceptions();
          this._exceptionsInit = true;
        }

      }

      // Add the transport to local collection.
      this._transports.push(name);

      // If Transport create and save instance.
      this._logur.transports[name] = {
        Transport: Transport,
        instance: transport
      };

      return methods;

    };

    /**
     * Extend
     * Extends the Logur Instance with the specified Transport if exists.
     *
     * @param name the name of the Transport to extend to instance.
     */
    const extend = (name: string): ITransportMethods => {

      // Ensure name is lowered.
      name = (name as string).toLowerCase();

      // Check if Transport exists.
      let exists = this._logur.transports[name as string];

      if (!exists)
        throw new Error(`Cannot extend instance with undefined Transport ${name}.`);

      // Push the transport name to the collection.
      this._transports.push(name);

      return methods;

    };

    /**
     * Remove
     * Removes the specified Transport.
     *
     * @param name the name of the Transport to be removed.
     */
    const remove = (name: string): ITransportMethods => {

      delete this._transports[name];

      return methods;

    };

    /**
     * Active
     * Set the active state of the transport.
     * If no state is passed the state is toggled from
     * the previous state.
     *
     * @param name the name of the transport to set state on.
     * @param state the state to be set.
     */
    const active = (name: string, state?: boolean): ITransportMethods => {

      const trans = this.transports.get<ILogurTransport>(name);
      const curState = trans.active();
      const nextState = !curState;

      // If state passed just set.
      if (state)
        trans.active(true);

      // Otherwise toggle from previous state.
      else
        trans.active(nextState);

      return methods;

    };

    /**
     * Set Option
     * Sets option(s) on specified Transport.
     *
     * @param name the name of the Logur Transport to set option(s) for.
     * @param key the key or options object to set.
     * @param value the related value for the key to be updated.
     */
    const setOption = <T extends ILogurTransportOptions>(name: string, key: string | T, value?: any): ITransportMethods => {

      const trans = this.transports.get<ILogurTransport>(name);
      trans.setOption(key, value);

      return methods;

    };

    methods = {
      has,
      get,
      add,
      extend,
      remove,
      active,
      setOption
    };

    return methods;

  }

  /**
   * Profile
   * Allows for profiling logs.
   * TODO: Really needs its on class!
   */
  get profiles(): IProfileMethods {

    let methods;

    /**
     * Get
     * Gets an existing Profile.
     *
     * @param name the name of the Profile to get.
     */
    const get = (name: string): IProfile => {
      return this._profiles[name];
    };

    /**
     * Get All
     * Gets all profiles stored in instance.
     */
    const getAll = (): IProfiles => {
      return this._profiles;
    };

    /**
     * Active
     * Sets or gets the active state of a Profile.
     *
     * @param name the name of the Profile to get/set active state for.
     * @param state the optional state to set.
     */
    const active = (name: string, state?: boolean): boolean => {

      const profile = this.profiles.get(name);

      if (!profile)
        return;

      if (u.isUndefined(state))
        return profile.active;

      return profile.active = state;

    };

    /**
     * Until
     * Inspects until property and max size property
     * allows profile to run until false is returned.
     *
     * @param name the name of the Profile to check.
     */
    const until = (name: string): boolean => {
      const profile = this.profiles.get(name);
      if (!profile)
        return;
      if (!u.isUndefined(profile.options.until))
        return profile.options.until();
      const max = profile.options.max;
      const count = profile.count;
      if (max && ((count + 1) < max))
        return true;
      return false;
    };

    /**
     * Add
     * Adds a profiler.
     *
     * @param name the name of the profile.
     * @param transports the Transports to run for this profiler or options object.
     * @param options the profile options.
     */
    const add = (name: string, transports: string[] | IProfileOptions, options?: IProfileOptions): IProfile => {

      if (u.isPlainObject(transports)) {
        options = transports as IProfileOptions;
        transports = undefined;
      }

      let profile;

      // Extend the options with defaults.
      options = u.extend({}, profileDefaults, options) as IProfileOptions;

      // Ensure transports.
      transports = transports || options.transports;

      if (!transports || !(transports as string[]).length)
        throw new Error(`Cannot start profile ${name} using transports of none.`);

      const valid = [];

      // Ensure transports can be used for profiling.
      (transports as string[]).forEach((t) => {

        // Get the transport.
        const transport = this.transports.get<ILogurTransport>(t);

        if (!transport)
          throw new Error(`The Transport ${t} was NOT found, ensure the Transport is loaded.`);

        if (!transport.options.profiler)
          throw new Error(`Attempted to load Transport ${t} but profiling is NOT enabled..`);

        valid.push(t);

      });

      // Add the profile.
      profile = {
        name: name,
        options: options,
        running: false,
        instance: this._name,
        transports: valid,
        started: 0,
        elapsed: 0,
        count: 0,
        start: methods.start.bind(this, name),
        stop: methods.stop.bind(this, name),
        remove: methods.remove.bind(this, name)
      };

      this._profiles[name] = profile;

      return profile;

    };

    /**
     * Start
     * Starts an existing Profile instance.
     *
     * @param profile the Profile configuration.
     */
    const start = (name: string): void => {

      const profile = this.profiles.get(name);

      if (!profile)
        return;

      if (profile.active)
        throw new Error(`Cannot start already active Profile ${name}.`);

      profile.started = Date.now();
      profile.active = true;

    };

    /**
     * Stop
     * Stops and returns the specified Profile result.
     */
    const stop = (name: string): IProfileResult => {

      const profile = this.profiles.get(name);

      if (!profile)
        return;

      profile.active = false;

      const result = {
        name: profile.name,
        instance: profile.instance,
        transports: profile.transports,
        started: profile.started,
        stopped: profile.stopped,
        elapsed: profile.elapsed,
        count: profile.count
      };

      if (profile.options.remove === 'stop')
        delete this._profiles[profile.name];

      return result;

    };

    /**
     *
     * @param name the name of the Profile to remove
     * @param force when true will remove an active Profile.
     */
    const remove = (name: string, force?: boolean): void => {
      const profile = this.profiles.get(name);
      if (!profile)
        return;
      if (profile.active && !force)
        throw new Error(`Cannot remove active Profile ${name}, stop or set force to true to remove.`);

      delete this._profiles[name];
    };

    methods = {
      get,
      getAll,
      active,
      until,
      add,
      start,
      stop,
      remove
    };

    return methods;

  }

  /**
   * Serializers
   * Gets, creates and removes serializers.
   */
  get serializers(): ISerializerMethods {

    let methods;

    const get = (name: string): Serializer => {
      return this._logur.serializers[name];
    };

    const getAll = (): ISerializers => {
      return this._logur.serializers;
    };

    const add = (name: string, serializer: Serializer): ISerializerMethods => {
      this._logur.serializers[name] = serializer;
      return methods;
    };

    const remove = (name: string): ISerializerMethods => {
      delete this._logur.serializers[name];
      return methods;
    };

    methods = {
      get,
      getAll,
      add,
      remove
    };

    return methods;

  }

  /**
   * Env
   * Returns the current environment information.
   */
  get env(): IEnv {
    return {
      node: this._nodeEnv,
      browser: this._browserEnv
    };
  }

  // INSTANCE METHODS

  /**
   * Log
   * Iterates transports then calls base Logur.log method.
   *
   * @param type the type of log message.
   * @param args array of arguments.
   */
  logger(transports: string | string[], type: any, ...args: any[]): ILogurOutput {

    // If Logur Instance isn't active return.
    if (!this._active)
      return;

    // Get and flatten params.
    let params = u.flatten([].slice.call(arguments, 1));
    let isException;

    // If transports is string
    if (u.isString(transports)) {
      type = transports;
      transports = undefined;
    }

    // If tranports passed remove
    // the type from params.
    else if (u.isArray(transports)) {
      params.shift();
    }

    // If we have transports this is an unhandled
    // exception. If not clear exception loop.
    if (transports && transports.length)
      isException = true;

    // Clone the args.
    let untyped = params.slice(0);

    // Get level info.
    let levelObj = this.options.levels[type];

    // If no level object throw error.
    if (!levelObj)
      throw new Error(`Cannot log using level ${type} no available method was found.`);

    // Get the level index.
    const level = levelObj.level;

    // If is NodeJS debug mode set an override flag to always log.
    let debugOverride = u.isNode() && u.isDebug() && type === 'debug' ? true : false;

    // Transports either passed from unhandled
    // exceptions or get the Instance's Transports.
    transports = transports || this._transports;

    let msg = untyped[0];
    let meta: any;
    let fn, stack, err;

    /* Check Last is Callback
    ****************************************/

    if (u.isFunction(u.last(untyped)))
      fn = untyped.pop();

    /* Normalize Message Arguments
    **************************************/

    // If error remove from untyped.
    if (u.isError(msg)) {
      untyped.shift();
      // err = { name: msg.name || 'Error', message: msg.message || 'Unknown error.', stack: env.stacktrace(msg) };
    }

    else if (u.isPlainObject(msg)) {
      meta = msg;
      untyped.shift();
      msg = undefined;
    }

    // If string inspect/format.
    else if (u.isString(msg)) {

      // If is a string shift the first arg.
      untyped.shift();

      // Get the number of sprintf tokens in message.
      // Note this RegExp isn't complete it just looks
      // for matches that are token like, won't match entire
      // sprintf expression but we don't really need that
      // just need to know how many there are.
      const tokens = msg.match(/%(\.|\(|[0-9])?\$?[0-9bcdieufgosxXj]/g);

      // If there are tokens then we need to get the same
      // number of args from our array as they are used
      // for formatting. Whatever is left is likely metadata.
      if (tokens && tokens.length) {

        // Format the message.
        msg = sprintf.vsprintf(msg, untyped.slice(0, tokens.length));

        // Get resulting array.
        untyped = params.slice(tokens.length + 1);

      }

    }

    /* Build Metadata
    *****************************************/

    // Merge any metadata that was passed.
    // remove from untyped array.
    let i = untyped.length;
    while (i--) {
      if (u.isPlainObject(untyped[i]) && !u.isError(untyped[i])) {
        meta = meta || {};
        u.extend(meta, untyped[i]);
        untyped.splice(i, 1);
      }
    }

    /* Get Environment
    *****************************************/

    // For node we get env again because
    // we need accurate load and memory usage.

    // Get the stacktrace for calling log method.
    stack = env.stacktrace(3);

    let sysinfo;

    if (u.isNode())
      sysinfo = env.node();
    else
      sysinfo = this.env.browser;

    /* BUILD OUTPUT OBJECT
    *****************************************/

    // Return if the level is greater
    // that the transport's level.
    if (!debugOverride && level > this.options.level)
      return;

    /* Timestamp or User Defined Timestamp
    *****************************************/

    // Get all timestamp formats.
    const timestamps = u.timestamp();
    let ts;

    // If is function call to get timestamp
    // and format from user.
    if (u.isFunction(this.options.timestamp)) {
      const func: TimestampCallback = <TimestampCallback>this.options.timestamp;
      ts = func(timestamps);
    }

    // Otherwise get timestamp from Logur
    // defined timestamp.
    else {
      ts = timestamps[this.options.timestamp as string];
    }

    /* Build Output Object
    *****************************************/

    // Construct object with all possible
    // properties, we'll use this in our
    // Tranport's action for final output
    // to it's defined target.
    const output: ILogurOutput = {

      // Level Info
      activeid: this.options.level,
      levelid: level,
      levels: this.options.levels,
      map: this.options.map,

      // Primary Fields
      timestamp: ts,
      uuid: u.uuid(),
      level: type,
      instance: this._name,
      message: msg,
      untyped: untyped,
      metadata: meta,
      error: err,
      args: params,
      transports: <string[]>transports,
      serializers: this._logur.serializers,

      // Error & Stack
      stacktrace: stack,

      // Environment Info
      env: sysinfo,
      pkg: this._logur.pkg

    };

    // Helper Method
    // This only gets output to emitted events.
    output.toMapped = <T>(options?: any): ILogurOutputMapped<T> => {
      return u.toMapped<T>(options || this.options, output);
    };

    /* EMIT EVENTS & CALLBACK
    *****************************************/

    // Emit typed log message.
    this.emit(type, output, this);

    // Emit global logged message.
    this.emit('logged', output, this);

    if (fn) fn(output);

    /* ITERATE ALL TRANSPORTS
    *****************************************/

    const run = (t: string) => {

      // Get the transport object.
      const transport = this.transports.get<ILogurTransport>(t);

      if (!transport)
        return;

      // Ensure the transport is active.
      if (!transport.active())
        return;

      // Clone the output object as we'll have some
      // unique property values.
      const clone = u.clone<ILogurOutput>(output);
      clone.map = transport.options.map;

      // Delete mapped method in clone we don't need it.
      delete clone.toMapped;

      // Call the transports action.
      transport.action(clone);

    };

    // We don't really care about order of transports
    // just run them in parallel unless user specifies otherwise..
    (transports as string[]).forEach((t) => {
      if (this.options.sync)
        run(t);
      else
        u.tickThen(this, run, t);
    });

    return output;

  }

  /**
   * Set Option
   * Sets/updates options.
   *
   * @param key the key or options object.
   * @param value the associated value to set for key.
   * @param cascade allows toggling cascade on single set.
   */
  setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any, cascade?: boolean): void {

    // Properties that should not
    // cascade and overwrite.
    const noCascade = ['map', 'pretty', 'prettystack', 'ministack'];

    // If undefined set cascade to options val.
    if (u.isUndefined(cascade))
      cascade = this.options.cascade;

    // If not object of options just set key/value.
    if (!u.isPlainObject(key) && !u.isUndefined(value)) {
      this.options[key as string] = value;
    }

    else {
      this.options = u.extend({}, this.options, key);
    }

    // If cascading is enabled cascade options
    // down to each bound transport.
    if (cascade) {

      // If 'map' is key ignore.
      if (!u.isUndefined(value) && key === 'map')
        return;

      // If Object remove map property.
      if (u.isPlainObject(key))
        delete key['map'];

      this._transports.forEach((t) => {
        const transport = this.transports.get<ILogurTransport>(t);
        transport.setOption(key, value);
      });

    }

  }

  /**
   * Active
   * Sets the active state of the instance.
   *
   * @param state the active state to set for the Logur Instance.
   */
  active(state?: boolean): boolean {
    if (u.isUndefined(state))
      return this._active;
    return this._active = state;
  }

  // EXTENDED LOG METHODS

  /**
   * Write
   * The equivalent of calling console.log without
   * any intervention from Logur.
   *
   * @param args arguments to pass to console.log.
   */
  write(...args: any[]): ILogurInstance {
    if (console && console.log)
      console.log.apply(console, args);
    return this;
  }

  /**
   * Exit
   * When env is node process.exit() is called.
   *
   * @param code optional node error code.
   */
  exit(code?: number): void {
    if (!u.isNode())
      return;
    process.exit(code);
  }

}