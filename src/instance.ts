
import { ILogurInstance, ILogur, ILogurInstanceOptions, ILogurTransportOptions, ILogurTransport, ITransportMethods, ILogurTransports, ILogurInstances, IMetadata, ILevel, TimestampCallback, ILogurOutput, ILoad, MemoryUsage, IProcess, IOS, IEnvBrowser, IEnvNode, IEnv, IStacktrace, TransportConstructor, ILogurOptionsTransport, ILevels, ILevelMethods, ISerializers, ISerializerMethods, Serializer, IError, ILogurOutputMapped, IQuery, QueryResult } from './interfaces';
import { Notify } from './notify';

import * as env from './env';
import * as u from './utils';
import * as sprintf from 'sprintf-js';
import { UAParser } from 'ua-parser-js';

const defaults: ILogurInstanceOptions = {

  level: 5,
  cascade: true,
  map: ['level', 'timestamp', 'message', 'metadata'],

  levels: {
    error: { level: 0, color: 'red' },
    warn: { level: 1, color: 'yellow' },
    info: { level: 2, color: 'blue' },
    verbose: { level: 3, color: 'green' },
    debug: { level: 4, color: 'magenta' },
  },

  // iso or epoch if you plan to query utc,
  // local, utctime, localtime may be more
  // friendly in console transports.
  timestamp: 'iso',

  uuid: undefined,    // if function will be used to gen. uuid.
  transports: [],
  catcherr: false,    // when true Logur will handle unhandled errors.
  exiterr: false,     // when true Logur will exit in Node on unhandled error.

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

    // Initialize the instance log methods.
    this.initLevels(this.options.levels);

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

  private initLevels(levels) {

    // Extend class with log method handlers.
    u.keys(levels).forEach((k) => {

      const level = levels[k];

      this[k] = (...args: any[]) => {
        this.logger(k, args);
      };

    });
  }

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
   * Serializers
   * Gets, creates and removes serializers.
   * NOTE: Serializers are called before pretty
   * print formatting and colorization.
   */
  get serializers(): ISerializerMethods {

    let methods;

    /**
     * Get
     * Gets a serializer by name.
     *
     * @param name the name of the serializer
     */
    const get = (name: string): Serializer => {
      return this._logur.serializers[name];
    };

    /**
     * Get All
     * Gets all loaded serializers.
     */
    const getAll = (): ISerializers => {
      return this._logur.serializers;
    };

    /**
     * Add
     * Adds a serializer.
     * @param name the name of the serializer to add.
     * @param serializer the serializer function.
     */
    const add = (name: string, serializer: Serializer): ISerializerMethods => {
      this._logur.serializers[name] = serializer;
      return methods;
    };

    /**
     * Remove
     * Removes a serializer.
     *
     * @param name the name of the serializer.
     */
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
      msg.trace = env.stacktrace(msg);
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
      message: msg || '',
      untyped: untyped,
      metadata: meta,
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

      if (!transport || !transport.active())
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
  write(...args: any[]): void {
    if (console && console.log)
      console.log.apply(console, args);
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

  /**
   * Query
   * Queries a transport.
   *
   * @param transport the transport to be queried.
   * @param q the query object to execute.
   * @param fn the callback function on done.
   */
  query(transport: string, q: IQuery, fn: QueryResult) {

    // Get the transport to query.
    const _transport = this.transports.get<ILogurTransport>(transport as string);

    // Warn if not queryable.
    if (!_transport.query)
      return this.log.warn(`attempted to query non-queryable transport ${transport}.`);

    // Query the transport.
    _transport.query(q, fn);

  }

  /**
   * Dispose
   * Calls dispose on transports on
   * teardown of instance.
   *
   * @param fn callback on done disposing transports.
   */
  dispose(fn: Function) {

    const funcs = this._transports.map((t) => {
      const transport = this.transports.get<ILogurTransport>(t);
      if (transport.dispose) return transport.dispose;
    });

    u.asyncEach(funcs, fn);

  }

}