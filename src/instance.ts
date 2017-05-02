
import { ILogurInstance, ILogur, ILogurInstanceOptions, ILogurTransportOptions, ILogurTransport, ITransportMethods, ILogurTransports, ILogurInstances, IMetadata, ILevel, TimestampCallback, ILogurOutput, ILoad, MemoryUsage, IProcess, IOS, IEnvBrowser, IEnvNode, IEnv, IProfiles, IProfileMethods, IProfileResult, IProfileOptions, IProfile, IStacktrace, TransportConstructor, ILogurOptionsTransport, ILevels } from './interfaces';
import { LogurTransport, ConsoleTransport, FileTransport, HttpTransport } from './transports';
import { Notify } from './notify';

import * as env from './env';
import * as u from './utils';
import * as sprintf from 'sprintf-js';
import { UAParser } from 'ua-parser-js';

const defaults: ILogurInstanceOptions = {

  level: 2,
  active: true,
  cascade: true,
  sync: false,

  levels: {
    error: { level: 0, color: 'red' },
    warn: { level: 1, color: 'yellow' },
    info: { level: 2, color: 'blue' },
    verbose: { level: 3, color: 'green' },
    debug: { level: 4, color: 'magenta' },
  },

  map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],
  timestamp: 'utc',
  transports: []

};

const profileDefaults: IProfileOptions = {
  transports: [],
  max: 25
};

/**
 * Logur Instance
 */
export class LogurInstance extends Notify implements ILogurInstance {

  private _browserEnv: IEnvBrowser;
  private _nodeEnv: IEnvNode;

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
      this.transports.create(t.name, t.options, t.transport);
    });

    // Init UAParser, expose it publicly
    // in case user wants to parse headers
    // in http requests.
    this.ua = new UAParser();

    if (u.isNode())
      this._nodeEnv = env.node();
    else
      this._browserEnv = env.browser(this.ua);

    // init exception handling
    // this.handleExceptions();

  }

  // PROTECTED & INSTANCE METHODS

  /**
   * Log
   * Iterates transports then calls base Logur.log method.
   *
   * @param type the type of log message.
   * @param args array of arguments.
   */
  protected logger(transports: string | string[], type: any, ...args: any[]): void {

    // If Logur Instance isn't active return.
    if (!this._active)
      return;

    // Get and flatten params.
    let params = u.flatten([].slice.call(arguments, 1));

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

    // Get all Transports for the Instance.
    transports = this._transports;

    let msg = untyped[0];
    let fn, meta, stack;

    /* Check Last is Callback
    ****************************************/

    if (u.isFunction(u.last(untyped)))
      fn = untyped.pop();

    /* Check Last is Metadata
    ****************************************/

    if (u.isObject(u.last(untyped)))
      meta = untyped.pop();

    /* Normalize Arguments
    **************************************/

    // If string inspect/format.
    if (u.isString(msg)) {

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
        untyped = params.slice(tokens.length);

      }

    }

    /* Get Environment
    *****************************************/

    // For node we get env again because
    // we need accurate load and memory usage.

    let sysinfo;

    if (u.isNode())
      sysinfo = env.node();
    else
      sysinfo = this.env.browser;

    /* Handle Error, Offset & Stacktrace
    *****************************************/

    // Get the stack info then iterate transports.
    // ignore getting stack for manually created
    // stack.
    let err = u.isError(msg) ? msg : undefined;

    // If an error was passed then set the message
    // to the error's message.
    if (err) {
      msg = err.message || 'Unknown error.';
    }

    // Check if we should offset stacktrace frames.
    const shouldOffset = u.isNode() && !err ? true : false;

    // Offsets the returned frames to trim out
    // some bloat from stack when generating frames.
    const offset = shouldOffset ? 3 : 0;

    // Get the stacktrace for error or generated stack.
    stack = env.stacktrace(err, offset);

    /* Iterate Transports
    *****************************************/

    const run = (t: string) => {

      // Get the transport object.
      const transport = this.transports.get<ILogurTransport>(t);

      // Ignore if the Transport isn't active.
      if (!transport.active())
        return;

      // Return if the level is greater
      // that the transport's level.
      if (!debugOverride && level > transport.options.level)
        return;

      /* Timestamp or User Defined Timestamp
      *****************************************/

      // Get all timestamp formats.
      const timestamps = u.timestamp();
      let ts;

      // If is function call to get timestamp
      // and format from user.
      if (u.isFunction(transport.options.timestamp)) {
        const func: TimestampCallback = <TimestampCallback>transport.options.timestamp;
        ts = func(timestamps);
      }

      // Otherwise get timestamp from Logur
      // defined timestamp.
      else {
        ts = timestamps[transport.options.timestamp as string];
      }

      // Construct object with all possible
      // properties, we'll use this in our
      // Tranport's action for final output
      // to it's defined target.
      const output: ILogurOutput = {

        // Level Info
        activeid: transport.options.level,
        levelid: level,
        levels: this.options.levels,

        // Property Map
        // Used to generate array
        // of ordered properties.
        map: this.options.map,

        // Primary Fields
        timestamp: ts,
        uuid: u.uuid(),
        level: type,
        instance: this._name,
        transport: t,
        message: msg,
        untyped: untyped || [],
        args: params,

        // StackTrace
        // Generated or existing from error.
        stacktrace: stack,

        // Environment Info
        env: sysinfo

      };

      // Some output properties may not have value.
      if (meta)
        output.metadata = meta;
      if (fn)
        output.callback = fn;
      if (err)
        output.error = err;

      // Call the Transort's action passing
      // the ordered args and the original args.
      const clone = u.clone<ILogurOutput>(output);
      transport.action(clone, (ordered, modified) => {

        // User may have mutated the output
        // object check if user passed modified.
        modified = modified || clone;

        // Emit typed log message.
        // const levelClone = ordered.slice(0);
        // levelClone.unshift(type);
        this.emit.call(this, type, ordered, modified);

        // Emit global logged message.
        // const loggedClone = ordered.slice(0);
        // loggedClone.unshift('logged');
        this.emit.call(this, 'logged', ordered, modified);

      });

    };

    // We don't really care about order of transports
    // just run them in parallel if possible.
    transports.forEach((t) => {

      if (this.options.sync)
        run(t);
      else
        u.tick(this, run, t);

    });

  }

  /**
   * Handle Exceptions
   * Enables handling uncaught NodeJS exceptions.
   */
  protected handleExceptions(): void {

    // Handle uncaught exceptions in NodeJS.
    if (u.isNode()) {

      process.on('uncaughtException', (err: Error) => {

        // If not exceptions just exit.
        if (!this._exceptions.length)
          process.exit();

        this.logger(this._exceptions, 'error', err);

      });

    }

    // Handle uncaught exceptions in brwoser.
    else if (u.isBrowser()) {

      const browser = this.ua.getBrowser().name.toLowerCase();

      window.onerror = function (message: string, url: string, line: number, column: number, err: Error) {

        // If not exceptions just return.
        if (!this._exceptions.length)
          return;

        // Ahh the good browsers
        if (err) {

          this.log(this._exceptions, 'error', err);

        }

        // And these are the shitty ones...
        else {

          let stack = `Error: ${message}\ngetStack@${url}:${line}:${column}`;

          if (browser === 'chrome' || browser === 'opera')
            stack = `Error: ${message}\nat getStack (${url}:${line}:${column})`;

          // We'll parse this in log method.
          this.log(this._exceptions, 'error', {

            message: message,
            stack: stack,
            frames: [{
              path: url,
              line: line,
              column: column
            }],
            __exception__: true

          });

        }

      };

    }

  }

  /**
   * Log
   * Gets the internal logger.
   */
  private get log() {
    return this._logur.log;
  }

  private common() {
    return {
      args: [].slice.call(arguments),

    };
  }

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
    const create = <T extends ILogurTransport>(name: string, options?: IMetadata | TransportConstructor<T>, Transport?: TransportConstructor<T>): ITransportMethods => {

      // Ensure name is lowered.
      name = (name as string).toLowerCase();

      // Allow Type as second arg.
      if (options && !u.isPlainObject(options)) {
        Transport = <TransportConstructor<T>>options;
        options = undefined;
      }

      if (!Transport)
        throw new Error(`Cannot create Transport ${name} using Type of undefined.`);

      // Merging base/global options.
      const merged = u.extend<ILogurTransportOptions>({}, this.options, options);

      // If transport handles exception add
      // to list of transport exceptions.
      if (merged.exceptions)
        this._exceptions.push(name);

      // If Transport create and save instance.
      this._logur.transports[name] = {
        Transport: Transport,
        instance: new Transport(merged, this._logur)
      };

      // Add the transport to local collection.
      this._transports.push(name);

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
      create,
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
      const profile = this._profiles[name];
      if (!profile)
        this.log.warn(`cannot get Profile ${name} of undefined.`).exit();
      return profile;
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
     * Start
     * Starts a profiler.
     *
     * @param name the name of the profile.
     * @param transports the Transports to run for this profiler or options object.
     * @param options the profile options.
     */
    const create = (name: string, transports: string[] | IProfileOptions, options?: IProfileOptions): IProfile => {

      if (u.isPlainObject(transports)) {
        options = transports as IProfileOptions;
        transports = undefined;
      }

      let profile;

      // Extend the options with defaults.
      options = u.extend({}, profileDefaults, options) as IProfileOptions;

      // Ensure transports.
      transports = transports || options.transports;

      if (!transports || !(transports as string[]).length) {
        this.log.error(`cannot start profile ${name} using transports of none.`);
        return;
      }

      const valid = [];

      // Ensure transports can be used for profiling.
      (transports as string[]).forEach((t) => {

        // Get the transport.
        const transport = this.transports.get<ILogurTransport>(t);

        if (!transport) {
          this.log.warn(`the Transport ${t} was NOT found, ensure the Transport is loaded.`);
          return;
        }

        if (!transport.options.profiler) {
          this.log.warn(`attempted to load Transport ${t} but profiling is NOT enabled..`);
          return;
        }

        valid.push(t);

      });

      // Add the profile.
      profile = {
        name: name,
        running: true,
        instance: this._name,
        transports: valid,
        started: Date.now(),
        elapsed: 0,
        count: 0,
        options: options,
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

      if (profile.active) {
        this.log.warn(`cannot start already active Profile ${name}.`);
        return;
      }

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
      if (profile.active && !force) {
        this.log.warn(`cannot remove active Profile ${name}, stop or set force to true to remove.`);
        return;
      }
      delete this._profiles[name];
    };

    methods = {
      get,
      active,
      until,
      create,
      start,
      stop,
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

  /**
   * Set Option
   * Sets/updates options.
   *
   * @param key the key or options object.
   * @param value the associated value to set for key.
   * @param cascade allows toggling cascade on single set.
   */
  setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any, cascade?: boolean): void {

    // If undefined set cascade to options val.
    if (u.isUndefined(cascade))
      cascade = this.options.cascade;

    // If not object of options just set key/value.
    if (!u.isPlainObject(key)) {

      // If not value log error.
      if (!value)
        this.logger('error', `cannot set option for key ${key} using value of undefined.`);

      else
        this.options[key as string] = value;

    }

    else {

      this.options = u.extend({}, this.options, key);

    }

    // If cascading is enabled cascade options
    // down to each bound transport.
    if (cascade) {

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