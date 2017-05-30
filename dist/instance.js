"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var notify_1 = require("./notify");
var middleware = require("./middleware");
var env = require("./env");
var u = require("./utils");
var sprintf = require("sprintf-js");
var ua_parser_js_1 = require("ua-parser-js");
var onHeaders, onFinished;
if (!process.env.BROWSER) {
    onHeaders = require('on-headers');
    onFinished = require('on-finished');
}
var defaults = {
    level: 5,
    cascade: true,
    map: ['timestamp', 'level', 'message', 'metadata'],
    // We don't define defaults here as user
    // may overwrite them we'll ensure levels
    // in the constructor below.
    levels: undefined,
    // iso or epoch if you plan to query utc,
    // local, utctime, localtime may be more
    // friendly in console transports.
    timestamp: 'iso',
    uuid: undefined,
    transports: [],
    catcherr: false,
    exiterr: false,
    emiterr: false,
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
var LogurInstance = (function (_super) {
    __extends(LogurInstance, _super);
    /**
     * Logur Instance Contructor
     *
     * @param options the Logur Instance options.
     * @param logur the common instance of Logur.
     */
    function LogurInstance(name, options, logur) {
        var _this = _super.call(this) || this;
        // Exceptions
        _this._exceptionsInit = false;
        _this._transports = [];
        _this._exceptions = [];
        _this._filters = {};
        _this._serializers = {};
        _this._buffer = {};
        // Filter cache.
        _this._transportFilters = {};
        _this._filtersCount = 0;
        _this._active = true;
        _this._name = name;
        _this._logur = logur;
        _this.options = u.extend({}, defaults, options);
        // Ensure levels config. If user did not pass levels
        // use the default configuration.
        _this.options.levels = _this.options.levels || {
            error: { level: 0, color: 'red' },
            warn: { level: 1, color: 'yellow' },
            info: { level: 2, color: 'blue' },
            verbose: { level: 3, color: 'green' },
            debug: { level: 4, color: 'magenta' }
        };
        // Initialize the instance log methods.
        _this.initLevels(_this.options.levels);
        // Iterate Transports in options
        // and bind to the Instance.
        _this.options.transports.forEach(function (t) {
            _this.transports.add(t.name, t.options, t.transport);
        });
        // Init UAParser, expose it publicly
        // in case user wants to parse headers
        // in http requests.
        _this.ua = new ua_parser_js_1.UAParser();
        if (u.isNode())
            _this._nodeEnv = env.node();
        else
            _this._browserEnv = env.browser(_this.ua);
        return _this;
    }
    // PRIVATE METHODS
    LogurInstance.prototype.initLevels = function (levels) {
        var _this = this;
        // Extend class with log method handlers.
        u.keys(levels).forEach(function (k) {
            _this[k] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.exec.apply(_this, [null, '*', k].concat(args));
                return {
                    exit: _this.exit.bind(_this),
                    write: _this.write.bind(_this)
                };
            };
        });
    };
    /**
     * Bind Levels
     * Creates a bound object of instance levels for chaining.
     *
     * @param extended the string or string array of extended methods.
     * @param suppressLevels when true no levels are bound to object.
     * @param fn a callback to be injected on logged via .exec().
     */
    LogurInstance.prototype.bindLevels = function (extended, suppressLevels, fn) {
        var _this = this;
        var obj = {
            wrap: false,
            write: false,
            exit: false,
            using: false
        };
        var keys = u.keys(obj);
        if (u.isFunction(extended)) {
            fn = extended;
            extended = undefined;
        }
        if (u.isFunction(suppressLevels)) {
            fn = suppressLevels;
            suppressLevels = undefined;
        }
        var genMethod = function (k) {
            if (!fn)
                return _this[k].bind(_this);
            else if (fn && u.contains(keys, k))
                return _this[k].bind(_this, fn);
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.exec.apply(_this, [fn, '*', k].concat(args));
                return _this.bindLevels(['exit', 'write'], true);
            };
        };
        if (u.isString(extended))
            extended = [extended];
        // Iterate extended props set to true if match.
        keys.forEach(function (k) {
            // If no ext passed or matching prop set method.
            if (!extended || !extended.length || u.contains(extended, k)) {
                obj[k] = genMethod(k);
            }
            else {
                delete obj[k];
            }
        });
        if (suppressLevels !== true)
            u.keys(this.options.levels).forEach(function (k) {
                obj[k] = genMethod(k);
            });
        return obj;
    };
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    LogurInstance.prototype.handleExceptions = function () {
        var _this = this;
        this._exceptionsInit = true;
        var EOL = this.env.node && this.env.node.os ? this.env.node.os.EOL : '\n';
        var isNode = u.isNode();
        // Handle uncaught exceptions in NodeJS.
        if (isNode) {
            var gracefulExit_1 = function () {
                if (_this.hasBuffer())
                    return setTimeout(function () { gracefulExit_1(); }, 10);
                if (_this.options.exiterr) {
                    _this.dispose(function () {
                        process.exit(1);
                    }, true);
                }
                else {
                    // re-register exception handler.
                    process.on('uncaughtException', _this._exceptionHandler);
                }
            };
            this._exceptionHandler = function (err) {
                // Remove the listener to prevent loops.
                process.removeListener('uncaughtException', _this._exceptionHandler);
                // Execute the log message then exit if required.
                _this.exec(_this._exceptions, 'error', err, function () {
                    if (_this.options.emiterr)
                        _this.emit('error', err, _this._exceptions);
                    u.tickThen(_this, gracefulExit_1);
                });
            };
            process.on('uncaughtException', this._exceptionHandler);
        }
        else if (u.isBrowser()) {
            var browser_1 = this.ua.getBrowser().name.toLowerCase();
            this._exceptionHandler = function (message, url, line, column, err) {
                // If not exceptions just return.
                if (!_this._exceptions.length)
                    return;
                // Ahh the good browsers
                if (err) {
                    _this.exec(_this._exceptions, 'error', err);
                }
                else {
                    var stack = "Error: " + message + "\ngetStack@" + url + ":" + line + ":" + column;
                    if (browser_1 === 'chrome' || browser_1 === 'opera')
                        stack = "Error: " + message + "\nat getStack (" + url + ":" + line + ":" + column + ")";
                    // We'll parse this in log method.
                    _this.exec(_this._exceptions, 'error', {
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
    };
    /**
     * Find Level
     * Finds the level value index in log params array.
     *
     * @param params the exec params to be logged.
     */
    LogurInstance.prototype.findLevel = function (params) {
        var keys = u.keys(this.options.levels);
        var i = params.length;
        var idx = -1;
        while (i--) {
            if (u.contains(keys, params[i])) {
                idx = i;
                break;
            }
        }
        return idx;
    };
    /**
     * Has Buffer
     * Tests if buffer contains any LogurOutput objects.
     */
    LogurInstance.prototype.hasBuffer = function () {
        return u.keys(this._buffer).length > 0;
    };
    Object.defineProperty(LogurInstance.prototype, "log", {
        // GETTERS
        /**
         * Log
         * Gets the internal logger.
         */
        get: function () {
            return this._logur.log;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogurInstance.prototype, "transports", {
        /**
         * Transport
         * Exposes methods for adding, removing and getting transports.
         */
        get: function () {
            var _this = this;
            var methods;
            /**
             * Has
             * Check if instance has the specified Transport.
             *
             * @param name the name of the Transport to lookup.
             */
            var has = function (name) {
                name = name.toLowerCase();
                return u.contains(_this._transports, name);
            };
            /**
             * Get
             * Gets a loaded transport.
             * @param name the Transport name.
             */
            var get = function (name) {
                name = name.toLowerCase();
                var transport = _this._logur.transports[name];
                if (!transport || !transport.instance)
                    return;
                return transport.instance;
            };
            /**
             * Get All
             * Gets all Logur Instance Transports.
             */
            var getAll = function () {
                var transports = {};
                _this._transports.forEach(function (k) {
                    if (!u.isUndefined(k))
                        transports[k] = _this._logur.transports[k];
                });
                return transports;
            };
            /**
             * Get List
             * Simply returns the list of loaded Transports.
             */
            var getList = function () {
                return _this._transports;
            };
            /**
             * Create
             * Creates and adds Transport to instance.
             *
             * @param name the name of the Transport to add.
             * @param options the options for the Transport.
             * @param Transport a Transport that extends LogurTransport.
             */
            var add = function (name, options, Transport) {
                // Ensure name is lowered.
                name = name.toLowerCase();
                // Allow Type as second arg.
                if (options && !u.isPlainObject(options)) {
                    Transport = options;
                    options = undefined;
                }
                if (!Transport)
                    throw new Error("Cannot create Transport " + name + " using Type of undefined.");
                // Create the Transport.
                var transport = new Transport(_this.options, options, _this._logur);
                // Set the Transport's name.
                transport.name = name;
                // If transport handles exception add
                // to list of transport exceptions.
                if (transport.options.exceptions && _this.options.catcherr) {
                    _this._exceptions.push(name);
                    // Add uncaught/window exception handler listeners.
                    if (!_this._exceptionsInit)
                        _this.handleExceptions();
                }
                // Add the transport to local collection.
                _this._transports.push(name);
                // If Transport create and save instance.
                _this._logur.transports[name] = {
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
            var extend = function (name) {
                // Ensure name is lowered.
                name = name.toLowerCase();
                // Check if Transport exists.
                var exists = _this._logur.transports[name];
                if (!exists)
                    throw new Error("Cannot extend instance with undefined Transport " + name + ".");
                // Push the transport name to the collection.
                _this._transports.push(name);
                return methods;
            };
            /**
             * Remove
             * Removes the specified Transport.
             *
             * @param name the name of the Transport to be removed.
             */
            var remove = function (name) {
                name = name.toLowerCase();
                delete _this._transports[name];
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
            var active = function (name, state) {
                name = name.toLowerCase();
                var trans = _this.transports.get(name);
                var curState = trans.active();
                var nextState = !curState;
                // If state passed just set.
                if (state)
                    trans.active(true);
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
            var setOption = function (name, key, value) {
                name = name.toLowerCase();
                var trans = _this.transports.get(name);
                trans.setOption(key, value);
                return methods;
            };
            methods = {
                has: has,
                get: get,
                add: add,
                extend: extend,
                remove: remove,
                active: active,
                setOption: setOption
            };
            return methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogurInstance.prototype, "serializers", {
        /**
         * Serializers
         * Gets, creates and removes serializers.
         * NOTE: Serializers are called before pretty
         * print formatting and colorization.
         */
        get: function () {
            var _this = this;
            var methods;
            /**
             * Get
             * Gets a serializer by name.
             *
             * @param name the name of the serializer
             */
            var get = function (name) {
                return _this._serializers[name];
            };
            /**
             * Get All
             * Gets all loaded serializers.
             */
            var getAll = function () {
                return _this._serializers;
            };
            /**
             * Add
             * Adds a serializer.
             * @param name the name of the serializer to add.
             * @param serializer the serializer function.
             */
            var add = function (name, serializer) {
                _this._serializers[name] = serializer;
                return methods;
            };
            /**
             * Remove
             * Removes a serializer.
             *
             * @param name the name of the serializer.
             */
            var remove = function (name) {
                delete _this._serializers[name];
                return methods;
            };
            methods = {
                get: get,
                getAll: getAll,
                add: add,
                remove: remove
            };
            return methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogurInstance.prototype, "filters", {
        /**
         * Filters
         * Allows filter of log events preventing
         * transport actions from firing.
         */
        get: function () {
            var _this = this;
            var methods;
            /**
             * Get
             * Gets an existing filter.
             *
             * @param name the name of the filter to get.
             */
            var get = function (name) {
                return _this._filters[name];
            };
            /**
             * Get By Transport
             * Gets all filters for a given transport.
             *
             * @param transport the transport name to filter by.
             * @param nocache when true do NOT use cached values.
             */
            var getByTransport = function (transport, nocache) {
                var filterKeys = u.keys(_this._filters);
                var changed = filterKeys.length !== _this._filtersCount;
                if (changed || nocache || !_this._transportFilters) {
                    // Iterate transports and build cache.
                    _this._transports.forEach(function (t) {
                        // Ensure is array.
                        _this._transportFilters[t] = _this._transportFilters[t] || [];
                        filterKeys.forEach(function (k) {
                            var obj = _this._filters[k];
                            // If contains '*' or transport name add to cache.
                            if (u.contains(obj.transports, t) || u.contains(obj.transports, '*')) {
                                _this._transportFilters[t].push(obj.filter);
                            }
                        });
                    });
                    // Update the filter count. We'll use this
                    // later to inspect if we need to update our
                    // cache or not.
                    _this._filtersCount = filterKeys.length;
                }
                return _this._transportFilters[transport] || [];
            };
            /**
             * Get All
             * Returns all filters.
             */
            var getAll = function () {
                return _this._filters;
            };
            /**
             * Add
             * Adds a filter for filtering out log events.
             *
             * @param name the name of the filter to add.
             * @param transports the applicable transports or '*' for all.
             * @param filter the filter that will be applied.
             */
            var add = function (name, transports, filter) {
                if (u.isFunction(transports)) {
                    filter = transports;
                    transports = '*';
                }
                transports = transports || '*';
                if (!u.isArray(transports))
                    transports = [transports];
                _this._filters[name] = {
                    transports: transports,
                    filter: filter
                };
                return methods;
            };
            /**
             * Remove
             * Removes a filter.
             * @param name the name of the filter to be removed.
             */
            var remove = function (name) {
                delete _this._filters[name];
                return methods;
            };
            methods = {
                get: get,
                getByTransport: getByTransport,
                getAll: getAll,
                add: add,
                remove: remove
            };
            return methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogurInstance.prototype, "env", {
        /**
         * Env
         * Returns the current environment information.
         */
        get: function () {
            return {
                node: this._nodeEnv,
                browser: this._browserEnv
            };
        },
        enumerable: true,
        configurable: true
    });
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
    LogurInstance.prototype.exec = function (done, transports, level) {
        var _this = this;
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        // If Logur Instance isn't active return.
        if (!this._active)
            return;
        // Get and flatten params.
        var params = [].slice.call(arguments, 0);
        // Find the log type index in params.
        var levelIdx = this.findLevel(params);
        // Warn and return if can't find level/type.
        if (levelIdx === -1) {
            var warn = console.warn ? console.warn : console.log;
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
        else if (levelIdx === 1) {
            level = params[1];
            if (!u.isFunction(done)) {
                transports = done;
                done = undefined;
            }
        }
        // Ensure transports
        transports = transports || this._transports;
        if (u.isString(transports)) {
            // if '*' set to all transports.
            if (transports === '*')
                transports = this._transports;
            else
                transports = [transports];
        }
        // Ensure callback
        done = done || u.noop;
        // Slice the params at level.
        params = params.slice(levelIdx + 1);
        // Clone the args.
        var untyped = params.slice(0);
        // Get level info.
        var levelObj = this.options.levels[level];
        // If no level object throw error.
        if (!levelObj)
            throw new Error("Cannot log using level " + level + " no available method was found.");
        // Get the level index.
        var levelId = levelObj.level;
        // If is NodeJS debug mode set an override flag to always log.
        var debugOverride = u.isNode() && u.isDebug() && level === 'debug' ? true : false;
        /* Define Variables
        ****************************************/
        var msg = untyped[0];
        var meta;
        var usrFn, stack, uuid;
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
        else if (u.isString(msg)) {
            // If is a string shift the first arg.
            untyped.shift();
            // Get the number of sprintf tokens in message.
            // Note this RegExp isn't complete it just looks
            // for matches that are token like, won't match entire
            // sprintf expression but we don't really need that
            // just need to know how many there are.
            var tokens = msg.match(/%(\.|\(|[0-9])?\$?[0-9bcdieufgosxXj]/g);
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
        var i = untyped.length;
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
        var sysinfo;
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
        var timestamps = u.timestamp();
        var ts;
        // If is function call to get timestamp
        // and format from user.
        if (u.isFunction(this.options.timestamp)) {
            var func = this.options.timestamp;
            ts = func(timestamps);
        }
        else {
            ts = timestamps[this.options.timestamp];
        }
        /* Build Output Object
        *****************************************/
        // Construct object with all possible
        // properties, we'll use this in our
        // Tranport's action for final output
        // to it's defined target.
        var output = {
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
            transports: transports,
            serializers: this._serializers,
            // Error & Stack
            stacktrace: stack,
            // Environment Info
            env: sysinfo,
            pkg: this._logur.pkg
        };
        // Helper Method
        // This only gets output to emitted events.
        output.toMapped = function (options) {
            return u.toMapped(options || _this.options, output);
        };
        /* ITERATE ALL TRANSPORTS
        *****************************************/
        var ctr = 0;
        var activeCtr = transports.length;
        // Handles done when all transports have finished.
        var handleDone = function (clone) {
            // Emit typed log message.
            _this.emit(level, output, _this);
            // Emit global logged message.
            _this.emit('logged', output, _this);
            // Remove the object from the buffer.
            delete _this._buffer[clone.uuid];
            // Call user callback if defined.
            if (usrFn)
                usrFn(output);
            // Call the Exec callback.
            done(output);
        };
        // Executes Transport's action method.
        var execTrans = function (t) {
            // Get the transport object.
            var transport = _this.transports.get(t);
            if (!transport || !transport.active()) {
                activeCtr -= 1;
                return;
            }
            // Clone the output object as we'll have some
            // unique property values.
            var clone = u.clone(output);
            clone.map = transport.options.map;
            // Delete mapped method in clone we don't need it.
            delete clone.toMapped;
            // Add clone to active output buffer.
            _this._buffer[clone.uuid] = clone;
            // Call the transports action.
            transport.action(clone, function () {
                ctr++;
                if (ctr === activeCtr) {
                    handleDone(clone);
                }
            });
        };
        // Call each Transport's "action" method.
        transports.forEach(function (t) {
            // Before calling transports check filters.
            var filters = _this.filters.getByTransport(t);
            var shouldFilter = filters.some(function (fn, i) {
                return fn(output);
            });
            // Exit if should filter.
            if (shouldFilter)
                return;
            execTrans(t);
        });
    };
    /**
     * Set Option
     * Sets/updates options.
     *
     * @param key the key or options object.
     * @param value the associated value to set for key.
     * @param cascade allows toggling cascade on single set.
     */
    LogurInstance.prototype.setOption = function (key, value, cascade) {
        var _this = this;
        // Properties that should not
        // cascade and overwrite.
        var noCascade = ['map', 'pretty', 'prettystack', 'ministack'];
        // If undefined set cascade to options val.
        if (u.isUndefined(cascade))
            cascade = this.options.cascade;
        // If not object of options just set key/value.
        if (!u.isPlainObject(key) && !u.isUndefined(value)) {
            this.options[key] = value;
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
            this._transports.forEach(function (t) {
                var transport = _this.transports.get(t);
                transport.setOption(key, value);
            });
        }
    };
    /**
     * Active
     * Sets the active state of the instance.
     *
     * @param state the active state to set for the Logur Instance.
     */
    LogurInstance.prototype.active = function (state) {
        if (u.isUndefined(state))
            return this._active;
        return this._active = state;
    };
    // EXTENDED LOG METHODS
    /**
     * With
     * Logs using a specific transport.
     *
     * @param transport the transport to log with.
     * @param exclude when true fire all transports except those provided.
     */
    LogurInstance.prototype.using = function (transports, exclude) {
        var _this = this;
        var fn = function (trans, type) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.exec(trans, type, args);
                return _this.bindLevels(['exit', 'write'], true);
            };
        };
        if (u.isString(transports))
            transports = [transports];
        // Build transports excluding those provided.
        if (exclude) {
            var excluded_1 = transports.slice(0);
            transports = this._transports.filter(function (t) {
                return !u.contains(excluded_1, t);
            });
        }
        var obj = {};
        u.keys(this.options.levels).forEach(function (k) {
            obj[k] = fn(transports, k).bind(_this);
        });
        return obj;
    };
    /**
     * Write
     * The equivalent of calling console.log without
     * any intervention from Logur.
     *
     * @param args arguments to pass to console.log.
     */
    LogurInstance.prototype.write = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var wait, fn;
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
            setTimeout(function () { _this.write.apply(_this, args); }, 10);
        }
        else {
            console.log.apply(console, args);
            // Call done callback if exists.
            if (fn)
                fn();
        }
        return this.bindLevels(['exit', 'using', 'wrap', 'write']);
    };
    /**
     * Wrap
     * Wraps a log before and after with the provided value.
     * Valid only for console transport.
     *
     * @param value the value to wrap logged line with.
     * @param args any additional values to pass to console.log.
     */
    LogurInstance.prototype.wrap = function (value) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var done = function () {
            _this.write(value);
        };
        value = value || '';
        // add the value to the args.
        args.unshift(value);
        // Write the value.
        this.write.apply(this, args);
        return this.bindLevels(['write'], done);
    };
    /**
     * Exit
     * When env is node process.exit() is called.
     *
     * @param code optional node error code.
     * @param panic when true exit immediately don't wait on buffer.
     */
    LogurInstance.prototype.exit = function (code, panic) {
        var _this = this;
        if (!u.isNode())
            return;
        if (u.isBoolean(code)) {
            panic = code;
            code = undefined;
        }
        code = code || 0;
        // if buffer clear before exit.
        if (!panic && this.hasBuffer()) {
            setTimeout(function () { _this.exit(code); }, 10);
        }
        else {
            process.exit(code);
        }
    };
    /**
     * Query
     * Queries a transport.
     *
     * @param transport the transport to be queried.
     * @param q the query object to execute.
     * @param fn the callback function on done.
     */
    LogurInstance.prototype.query = function (transport, q, fn) {
        // Loop until no buffer.
        // if (this._buffer.length)
        //   return u.tickThen(this, this.query, transport, q, fn);
        // Get the transport to query.
        var _transport = this.transports.get(transport);
        // Warn if not queryable.
        if (!_transport.query || !_transport.options.queryable) {
            this.log.warn("attempted to query non-queryable transport " + transport + ".");
            return;
        }
        // Query the transport.
        _transport.query(q, fn);
    };
    /**
     * Middleware
     * Returns both request and error handlers for
     * Express/Connect middleware.
     *
     * @param options the middleware options.
     */
    LogurInstance.prototype.middleware = function (options) {
        return middleware.init.call(this, options);
    };
    /**
     * Dispose
     * Calls dispose on transports on
     * teardown of instance.
     *
     * @param fn callback on done disposing transports.
     */
    LogurInstance.prototype.dispose = function (fn, isErr) {
        var _this = this;
        var funcs = [];
        this._transports.forEach(function (t) {
            var transport = _this.transports.get(t);
            if (transport && u.isFunction(transport.dispose))
                funcs.push(transport.dispose.bind(transport));
        });
        u.asyncEach(funcs, function () {
            var msg = '\n Logur disposed exiting....';
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
    };
    return LogurInstance;
}(notify_1.Notify));
exports.LogurInstance = LogurInstance;
//# sourceMappingURL=instance.js.map