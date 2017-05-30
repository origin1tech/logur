
import { ILogurInstance, ILogur, ILogurInstanceOptions, ILogurTransportOptions, ILogurTransport, ITransportMethods, ILogurTransports, ILogurInstances, IMetadata, ILevel, TimestampCallback, ILogurOutput, ILoad, MemoryUsage, IProcess, IOS, IEnvBrowser, IEnvNode, IEnv, IStacktrace, TransportConstructor, ILogurOptionsTransport, ILevels, ILevelMethodsDefault, ISerializers, ISerializerMethods, Serializer, IError, ILogurOutputMapped, IQuery, QueryResult, IInstanceMethodsExtended, ExecCallback, IInstanceMethodsExit, IInstanceMethodsWrap, IInstanceMethodsWrite, IMiddlewareOptions, IMiddleware, IFilterMethods, Filter, IFilter, IFilters } from './interfaces';
import { Notify } from './notify';
import * as middleware from './middleware';

import * as env from './env';
import * as u from './utils';
import * as sprintf from 'sprintf-js';
import { UAParser } from 'ua-parser-js';
import { Request, Response, NextFunction } from 'express';

let onHeaders, onFinished, pkg;

if (!process.env.BROWSER) {
  onHeaders = require('on-headers');
  onFinished = require('on-finished');
  const resolve = require('path').resolve;
  pkg = require(resolve(process.cwd(), 'package.json'));
}

const defaults: ILogurInstanceOptions = {

  level: 5,
  cascade: true,  // Dont' disable unless you're certain you need to.
  map: ['timestamp', 'level', 'message', 'metadata'],

  // We don't define defaults here as user
  // may overwrite them we'll ensure levels
  // in the constructor below.
  levels: undefined,

  // iso or epoch if you plan to query utc,
  // local, utctime, localtime may be more
  // friendly in console transports.
  timestamp: 'iso',

  uuid: undefined,    // if function will be used to gen. uuid.
  transports: [],
  catcherr: false,    // when true Logur will handle unhandled errors.
  exiterr: false,     // when true Logur will exit in Node on unhandled error.
  emiterr: false,     // when true errors will be emitted.

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
export class LogurInstance<T> extends Notify implements ILogurInstance<T> {

  // Env
  private _browserEnv: IEnvBrowser;
  private _nodeEnv: IEnvNode;

  // Exceptions
  private _exceptionsInit: boolean = false;
  private _exceptionHandler;

  protected _name: string;
  protected _logur: ILogur;
  protected _pkg: IMetadata;
  protected _transports: string[] = [];
  protected _exceptions: string[] = [];
  protected _filters: IFilters = {};
  protected _serializers: ISerializers = {};
  private _buffer: { [key: string]: ILogurOutput } = {};

  // Filter cache.
  private _transportFilters: { [transport: string]: Filter[] } = {};
  private _filtersCount: number = 0;

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

    // Ensure levels config. If user did not pass levels
    // use the default configuration.
    this.options.levels = this.options.levels || {
      error: { level: 0, color: 'red' },
      warn: { level: 1, color: 'yellow' },
      info: { level: 2, color: 'blue' },
      verbose: { level: 3, color: 'green' },
      debug: { level: 4, color: 'magenta' }
    };

    // Initialize the instance log methods.
    this.initLevels(this.options.levels);

    // Lookup package.json props.
    if (pkg && this.options.package && this.options.package.length) {
      this.options.package.forEach((k) => {
        const found = u.get(pkg, k);
        if (found)
          this._pkg[k] = found;
      });
    }

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

  private initLevels(levels: ILevels) {

    // Extend class with log method handlers.
    u.keys(levels).forEach((k) => {
      this[k] = (...args: any[]) => {
        this.exec(null, '*', k, ...args);
        return {
          exit: this.exit.bind(this),
          write: this.write.bind(this)
        };
      };
    });

  }

  /**
   * Bind Levels
   * Creates a bound object of instance levels for chaining.
   *
   * @param extended the string or string array of extended methods.
   * @param suppressLevels when true no levels are bound to object.
   * @param fn a callback to be injected on logged via .exec().
   */
  private bindLevels(extended?: string | string[] | ExecCallback, suppressLevels?: boolean | ExecCallback, fn?: ExecCallback): any {

    let obj: any = {
      wrap: false,
      write: false,
      exit: false,
      using: false
    };

    let keys = u.keys(obj);

    if (u.isFunction(extended)) {
      fn = <ExecCallback>extended;
      extended = undefined;
    }

    if (u.isFunction(suppressLevels)) {
      fn = <ExecCallback>suppressLevels;
      suppressLevels = undefined;
    }

    const genMethod = (k) => {
      if (!fn)
        return this[k].bind(this);
      else if (fn && u.contains(keys, k))
        return this[k].bind(this, fn);
      return (...args: any[]) => {
        this.exec(fn, '*', k, ...args);
        return this.bindLevels(['exit', 'write'], true);
      };
    };

    if (u.isString(extended))
      extended = <string[]>[extended];

    // Iterate extended props set to true if match.
    keys.forEach((k) => {
      // If no ext passed or matching prop set method.
      if (!extended || !extended.length || u.contains(<string[]>extended, k)) {
        obj[k] = genMethod(k);
      }
      // Otherwise delete method/prop.
      else {
        delete obj[k];
      }
    });

    if (suppressLevels !== true)
      u.keys(this.options.levels).forEach((k) => {
        obj[k] = genMethod(k);
      });

    return obj;

  }

  /**
   * Handle Exceptions
   * Enables handling uncaught NodeJS exceptions.
   */
  private handleExceptions(): void {

    this._exceptionsInit = true;

    const EOL = this.env.node && this.env.node.os ? this.env.node.os.EOL : '\n';
    const isNode = u.isNode();

    // Handle uncaught exceptions in NodeJS.
    if (isNode) {

      const gracefulExit = () => {
        if (this.hasBuffer())
          return setTimeout(() => { gracefulExit(); }, 10);
        if (this.options.exiterr) {
          this.dispose(() => {
            process.exit(1);
          }, true);
        }
        else {
          // re-register exception handler.
          process.on('uncaughtException', this._exceptionHandler);
        }
      };

      this._exceptionHandler = (err: IError) => {

        // Remove the listener to prevent loops.
        process.removeListener('uncaughtException', this._exceptionHandler);

        // Execute the log message then exit if required.
        this.exec(this._exceptions, 'error', err, () => {
          if (this.options.emiterr)
            this.emit('error', err, this._exceptions);
          u.tickThen(this, gracefulExit);
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

          this.exec(this._exceptions, 'error', err);

        }

        // And these are the shitty ones...
        else {

          let stack = `Error: ${message}\ngetStack@${url}:${line}:${column}`;

          if (browser === 'chrome' || browser === 'opera')
            stack = `Error: ${message}\nat getStack (${url}:${line}:${column})`;

          // We'll parse this in log method.
          this.exec(this._exceptions, 'error', {

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
   * Find Level
   * Finds the level value index in log params array.
   *
   * @param params the exec params to be logged.
   */
  private findLevel(params: any[]): number {
    const keys = u.keys(this.options.levels);
    let i = params.length;
    let idx: number = -1;
    while (i--) {
      if (u.contains(keys, params[i])) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  /**
   * Has Buffer
   * Tests if buffer contains any LogurOutput objects.
   */
  private hasBuffer(): boolean {
    return u.keys(this._buffer).length > 0;
  }

  // GETTERS

  /**
   * Log
   * Gets the internal logger.
   */
  private get log(): ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault {
    return this._logur.log;
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
      name = name.toLowerCase();
      return u.contains(this._transports, name);
    };

    /**
     * Get
     * Gets a loaded transport.
     * @param name the Transport name.
     */
    const get = <T>(name?: string): T => {
      name = name.toLowerCase();
      const transport = this._logur.transports[name];
      if (!transport || !transport.instance)
        return;
      return transport.instance;
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
    const add = <T extends ILogurTransport>(name: string, options?: IMetadata | TransportConstructor<T>, Transport?: TransportConstructor<T>): T => {

      // Ensure name is lowered.
      name = (name as string).toLowerCase();

      // Allow Type as second arg.
      if (options && !u.isPlainObject(options)) {
        Transport = <TransportConstructor<T>>options;
        options = undefined;
      }

      if (!Transport)
        throw new Error(`Cannot create Transport ${name} using Type of undefined.`);

      // Create the Transport.
      const transport = new Transport(this.options, options, this._logur);

      // Set the Transport's name.
      transport.name = name;

      // If transport handles exception add
      // to list of transport exceptions.
      if (transport.options.exceptions && this.options.catcherr) {

        this._exceptions.push(name);

        // Add uncaught/window exception handler listeners.
        if (!this._exceptionsInit)
          this.handleExceptions();
      }

      // Add the transport to local collection.
      this._transports.push(name);

      // If Transport create and save instance.
      this._logur.transports[name] = {
        Transport: Transport,
        instance: transport
      };

      return transport;

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

      if (!exists) {
        this.log.warn(`Cannot extend instance with undefined Transport ${name}.`);
        return;
      }

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

      name = name.toLowerCase();

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

      name = name.toLowerCase();

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

      name = name.toLowerCase();

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
      return this._serializers[name];
    };

    /**
     * Get All
     * Gets all loaded serializers.
     */
    const getAll = (): ISerializers => {
      return this._serializers;
    };

    /**
     * Add
     * Adds a serializer.
     * @param name the name of the serializer to add.
     * @param serializer the serializer function.
     */
    const add = (name: string, serializer: Serializer): ISerializerMethods => {
      this._serializers[name] = serializer;
      return methods;
    };

    /**
     * Remove
     * Removes a serializer.
     *
     * @param name the name of the serializer.
     */
    const remove = (name: string): ISerializerMethods => {
      delete this._serializers[name];
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
   * Filters
   * Allows filter of log events preventing
   * transport actions from firing.
   */
  get filters(): IFilterMethods {

    let methods: IFilterMethods;

    /**
     * Get
     * Gets an existing filter.
     *
     * @param name the name of the filter to get.
     */
    const get = (name: string): IFilter => {
      return this._filters[name];
    };

    /**
     * Get By Transport
     * Gets all filters for a given transport.
     *
     * @param transport the transport name to filter by.
     * @param nocache when true do NOT use cached values.
     */
    const getByTransport = (transport: string, nocache?: boolean): Filter[] => {

      const filterKeys = u.keys(this._filters);
      const changed = filterKeys.length !== this._filtersCount;

      if (changed || nocache || !this._transportFilters) {

        // Iterate transports and build cache.
        this._transports.forEach((t) => {

          // Ensure is array.
          this._transportFilters[t] = this._transportFilters[t] || [];

          filterKeys.forEach((k) => {

            const obj = this._filters[k];

            // If contains '*' or transport name add to cache.
            if (u.contains(<string[]>obj.transports, t) || u.contains(<string[]>obj.transports, '*')) {
              this._transportFilters[t].push(obj.filter);
            }

          });

        });

        // Update the filter count. We'll use this
        // later to inspect if we need to update our
        // cache or not.
        this._filtersCount = filterKeys.length;

      }

      return this._transportFilters[transport] || [];

    };

    /**
     * Get All
     * Returns all filters.
     */
    const getAll = (): IFilters => {
      return this._filters;
    };

    /**
     * Add
     * Adds a filter for filtering out log events.
     *
     * @param name the name of the filter to add.
     * @param transports the applicable transports or '*' for all.
     * @param filter the filter that will be applied.
     */
    const add = (name: string, transports: string | string[] | Filter, filter?: Filter): IFilterMethods => {

      if (u.isFunction(transports)) {
        filter = <Filter>transports;
        transports = '*';
      }

      transports = transports || '*';

      if (!u.isArray(transports))
        transports = <string[]>[transports];

      this._filters[name] = {
        transports: <string[]>transports,
        filter: filter
      };

      return methods;

    };

    /**
     * Remove
     * Removes a filter.
     * @param name the name of the filter to be removed.
     */
    const remove = (name: string): IFilterMethods => {

      delete this._filters[name];

      return methods;

    };

    methods = {
      get,
      getByTransport,
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
   * @param done callback when all transports logged.
   * @param transports list of transports to be called '*' for all.
   * @param type the type of log message.
   * @param args array of arguments.
   */
  exec(done: ExecCallback | string | string[], transports: string | string[], level?: any, ...args: any[]): void {

    // If Logur Instance isn't active return.
    if (!this._active)
      return;

    // Get and flatten params.
    let params = [].slice.call(arguments, 0);

    // Find the log type index in params.
    const levelIdx = this.findLevel(params);

    // Warn and return if can't find level/type.
    if (levelIdx === -1) {
      let warn = console.warn ? console.warn : console.log;
      warn('Cannot log message using level of undefined.');
      return;
    }

    /* Find Level and Normalize
    ******************************************/

    if (levelIdx === 0) {
      level = params[0];
      transports = undefined;
      done = undefined;
    }

    // No transports specified.
    else if (levelIdx === 1) {
      level = params[1];
      if (!u.isFunction(done)) {
        transports = done as string | string[];
        done = undefined;
      }
    }

    // Ensure transports
    transports = transports || this._transports;

    if (u.isString(transports)) {
      // if '*' set to all transports.
      if (transports === '*')
        transports = this._transports;
      // convert single transport to array.
      else
        transports = <string[]>[transports];
    }

    // Ensure callback
    done = done || u.noop;

    // Slice the params at level.
    params = params.slice(levelIdx + 1);

    // Clone the args.
    let untyped = params.slice(0);

    // Get level info.
    let levelObj: ILevel = this.options.levels[level];

    // If no level object throw error.
    if (!levelObj)
      throw new Error(`Cannot log using level ${level} no available method was found.`);

    // Get the level index.
    const levelId = levelObj.level;

    // If is NodeJS debug mode set an override flag to always log.
    let debugOverride = u.isNode() && u.isDebug() && level === 'debug' ? true : false;

    /* Define Variables
    ****************************************/

    let msg = untyped[0];
    let meta: any;
    let usrFn, stack, uuid;

    /* Generate Unique Identifier
    ****************************************/

    uuid = u.isFunction(this.options.uuid) ? this.options.uuid() : u.uuid();

    /* Check Last is Callback
    ****************************************/

    if (u.isFunction(u.last(untyped)))
      usrFn = untyped.pop();

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
    if (!debugOverride && levelId > this.options.level)
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
      levelid: levelId,
      levels: this.options.levels,
      map: this.options.map,

      // Primary Fields
      timestamp: ts,
      uuid: uuid,
      level: level,
      instance: this._name,
      message: msg || '',
      untyped: untyped,
      metadata: meta,
      args: params,
      transports: <string[]>transports,
      serializers: this._serializers,

      // Error & Stack
      stacktrace: stack,

      // Environment Info
      env: sysinfo,
      pkg: this._pkg

    };

    // Helper Method
    // This only gets output to emitted events.
    output.toMapped = <T>(options?: any): ILogurOutputMapped<T> => {
      return u.toMapped<T>(options || this.options, output);
    };

    /* ITERATE ALL TRANSPORTS
    *****************************************/

    let ctr = 0;
    let activeCtr = transports.length;

    // Handles done when all transports have finished.
    const handleDone = (clone) => {

      // Emit typed log message.
      this.emit(level, output, this);

      // Emit global logged message.
      this.emit('logged', output, this);

      // Remove the object from the buffer.
      delete this._buffer[clone.uuid];

      // Call user callback if defined.
      if (usrFn) usrFn(output);

      // Call the Exec callback.
      (done as ExecCallback)(output);

    };

    // Executes Transport's action method.
    const execTrans = (t: string) => {

      // Get the transport object.
      const transport = this.transports.get<ILogurTransport>(t);

      if (!transport || !transport.active()) {
        activeCtr -= 1;
        return;
      }

      // Clone the output object as we'll have some
      // unique property values.
      const clone = u.clone<ILogurOutput>(output);
      clone.map = transport.options.map;

      // Delete mapped method in clone we don't need it.
      delete clone.toMapped;

      // Add clone to active output buffer.
      this._buffer[clone.uuid] = clone;

      // Call the transports action.
      transport.action(clone, () => {
        ctr++;
        if (ctr === activeCtr) {
          handleDone(clone);
        }
      });

    };

    // Call each Transport's "action" method.
    (transports as string[]).forEach((t) => {

      // Before calling transports check filters.
      const filters = this.filters.getByTransport(t);
      const shouldFilter = filters.some((fn, i) => {
        return fn(output);
      });

      // Exit if should filter.
      if (shouldFilter)
        return;

      execTrans(t);

    });

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
   * With
   * Logs using a specific transport.
   *
   * @param transport the transport to log with.
   * @param exclude when true fire all transports except those provided.
   */
  using(transports: string | string[], exclude?: boolean): T {

    const fn = (trans: string | string[], type: string) => {
      return (...args: any[]) => {
        this.exec(trans, type, args);
        return this.bindLevels(['exit', 'write'], true);
      };
    };

    if (u.isString(transports))
      transports = <string[]>[transports];

    // Build transports excluding those provided.
    if (exclude) {
      const excluded: string[] = <string[]>transports.slice(0);
      transports = this._transports.filter((t) => {
        return !u.contains(excluded, t);
      });
    }

    let obj: any = {};

    u.keys(this.options.levels).forEach((k) => {
      obj[k] = fn(transports, k).bind(this);
    });

    return obj as T;

  }

  /**
   * Write
   * The equivalent of calling console.log without
   * any intervention from Logur.
   *
   * @param args arguments to pass to console.log.
   */
  write(...args: any[]): IInstanceMethodsWrite<T> & T {

    let wait, fn;

    // Last arg enforces wait until buffer
    // is clear before writing.
    if (u.last(args) === true)
      wait = args.pop();

    // First arg is callback function to
    // be called after writing.
    if (u.isFunction(u.first(args)))
      fn = args.shift();

    // if buffer clear before exit.
    if (wait && this.hasBuffer()) {
      setTimeout(() => { this.write(...args); }, 10);
    }
    else {
      console.log.apply(console, args);
      // Call done callback if exists.
      if (fn) fn();
    }

    return this.bindLevels(['exit', 'using', 'wrap', 'write']);

  }

  /**
   * Wrap
   * Wraps a log before and after with the provided value.
   * Valid only for console transport.
   *
   * @param value the value to wrap logged line with.
   * @param args any additional values to pass to console.log.
   */
  wrap(value: any, ...args: any[]): IInstanceMethodsWrap<T> & T {

    const done = () => {
      this.write(value);
    };

    value = value || '';

    // add the value to the args.
    args.unshift(value);

    // Write the value.
    this.write(...args);

    return this.bindLevels(['write'], done);

  }

  /**
   * Exit
   * When env is node process.exit() is called.
   *
   * @param code optional node error code.
   * @param panic when true exit immediately don't wait on buffer.
   */
  exit(code?: number | boolean, panic?: boolean): void {

    if (!u.isNode())
      return;

    if (u.isBoolean(code)) {
      panic = <boolean>code;
      code = undefined;
    }

    code = code || 0;

    // if buffer clear before exit.
    if (!panic && this.hasBuffer()) {
      setTimeout(() => { this.exit(code); }, 10);
    }
    else {
      process.exit(<number>code);
    }

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

    // Loop until no buffer.
    // if (this._buffer.length)
    //   return u.tickThen(this, this.query, transport, q, fn);

    // Get the transport to query.
    const _transport = this.transports.get<ILogurTransport>(transport as string);

    // Warn if not queryable.
    if (!_transport.query || !_transport.options.queryable) {
      this.log.warn(`attempted to query non-queryable transport ${transport}.`);
      return;
    }

    // Query the transport.
    _transport.query(q, fn);

  }

  /**
   * Middleware
   * Returns both request and error handlers for
   * Express/Connect middleware.
   *
   * @param options the middleware options.
   */
  middleware(options?: IMiddlewareOptions): IMiddleware {
    return middleware.init.call(this, options);
  }

  /**
   * Dispose
   * Calls dispose on transports on
   * teardown of instance.
   *
   * @param fn callback on done disposing transports.
   */
  dispose(fn: Function, isErr?: boolean) {

    const funcs = [];
    this._transports.forEach((t) => {
      const transport = this.transports.get<ILogurTransport>(t);
      if (transport && u.isFunction(transport.dispose))
        funcs.push(transport.dispose.bind(transport));
    });

    u.asyncEach(funcs, () => {
      let msg = '\n Logur disposed exiting....';
      msg = isErr ? msg + 'with exception. \n' : 'normally. \n';
      if (u.isNode()) {
        if (isErr)
          msg = u.colorize(msg, 'bgRedBright.white');
        else
          msg = u.colorize(msg, 'bgBlueBright.white');
      }
      console.log(msg);
      fn();
    });

  }

}
