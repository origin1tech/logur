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
var env = require("./env");
var u = require("./utils");
var sprintf = require("sprintf-js");
var ua_parser_js_1 = require("ua-parser-js");
var defaults = {
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
        _this._active = true;
        _this._name = name;
        _this._logur = logur;
        _this.options = u.extend({}, defaults, options);
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
            var level = levels[k];
            _this[k] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.logger(k, args);
            };
        });
    };
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    LogurInstance.prototype.handleExceptions = function () {
        var _this = this;
        var EOL = this.env.node && this.env.node.os ? this.env.node.os.EOL : '\n';
        var isNode = u.isNode();
        // Handle uncaught exceptions in NodeJS.
        if (isNode) {
            this._exceptionHandler = function (err) {
                // Remove the listener to prevent loops.
                process.removeListener('uncaughtException', _this._exceptionHandler);
                _this.logger(_this._exceptions, 'error', err, function () {
                    // Call dispose method on transports.
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
                    _this.logger(_this._exceptions, 'error', err);
                }
                else {
                    var stack = "Error: " + message + "\ngetStack@" + url + ":" + line + ":" + column;
                    if (browser_1 === 'chrome' || browser_1 === 'opera')
                        stack = "Error: " + message + "\nat getStack (" + url + ":" + line + ":" + column + ")";
                    // We'll parse this in log method.
                    _this.logger(_this._exceptions, 'error', {
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
    Object.defineProperty(LogurInstance.prototype, "log", {
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
        // GETTERS
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
                return u.contains(_this._transports, name);
            };
            /**
             * Get
             * Gets a loaded transport.
             * @param name the Transport name.
             */
            var get = function (name) {
                return _this._logur.transports[name].instance;
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
                var transport = new Transport(_this.options, options, _this._logur);
                // If transport handles exception add
                // to list of transport exceptions.
                if (transport.options.catcherr) {
                    _this._exceptions.push(name);
                    // Add uncaught/window exception handler listeners.
                    if (!_this._exceptionsInit) {
                        _this.handleExceptions();
                        _this._exceptionsInit = true;
                    }
                }
                // Add the transport to local collection.
                _this._transports.push(name);
                // If Transport create and save instance.
                _this._logur.transports[name] = {
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
                return _this._logur.serializers[name];
            };
            /**
             * Get All
             * Gets all loaded serializers.
             */
            var getAll = function () {
                return _this._logur.serializers;
            };
            /**
             * Add
             * Adds a serializer.
             * @param name the name of the serializer to add.
             * @param serializer the serializer function.
             */
            var add = function (name, serializer) {
                _this._logur.serializers[name] = serializer;
                return methods;
            };
            /**
             * Remove
             * Removes a serializer.
             *
             * @param name the name of the serializer.
             */
            var remove = function (name) {
                delete _this._logur.serializers[name];
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
     * @param type the type of log message.
     * @param args array of arguments.
     */
    LogurInstance.prototype.logger = function (transports, type) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        // If Logur Instance isn't active return.
        if (!this._active)
            return;
        // Get and flatten params.
        var params = u.flatten([].slice.call(arguments, 1));
        var isException;
        // If transports is string
        if (u.isString(transports)) {
            type = transports;
            transports = undefined;
        }
        else if (u.isArray(transports)) {
            params.shift();
        }
        // If we have transports this is an unhandled
        // exception. If not clear exception loop.
        if (transports && transports.length)
            isException = true;
        // Clone the args.
        var untyped = params.slice(0);
        // Get level info.
        var levelObj = this.options.levels[type];
        // If no level object throw error.
        if (!levelObj)
            throw new Error("Cannot log using level " + type + " no available method was found.");
        // Get the level index.
        var level = levelObj.level;
        // If is NodeJS debug mode set an override flag to always log.
        var debugOverride = u.isNode() && u.isDebug() && type === 'debug' ? true : false;
        // Transports either passed from unhandled
        // exceptions or get the Instance's Transports.
        transports = transports || this._transports;
        var msg = untyped[0];
        var meta;
        var fn, stack, err;
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
        if (!debugOverride && level > this.options.level)
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
            transports: transports,
            serializers: this._logur.serializers,
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
        /* EMIT EVENTS & CALLBACK
        *****************************************/
        // Emit typed log message.
        this.emit(type, output, this);
        // Emit global logged message.
        this.emit('logged', output, this);
        if (fn)
            fn(output);
        /* ITERATE ALL TRANSPORTS
        *****************************************/
        var run = function (t) {
            // Get the transport object.
            var transport = _this.transports.get(t);
            if (!transport || !transport.active())
                return;
            // Clone the output object as we'll have some
            // unique property values.
            var clone = u.clone(output);
            clone.map = transport.options.map;
            // Delete mapped method in clone we don't need it.
            delete clone.toMapped;
            // Call the transports action.
            transport.action(clone);
        };
        // We don't really care about order of transports
        // just run them in parallel unless user specifies otherwise..
        transports.forEach(function (t) {
            if (_this.options.sync)
                run(t);
            else
                u.tickThen(_this, run, t);
        });
        return output;
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
     * Write
     * The equivalent of calling console.log without
     * any intervention from Logur.
     *
     * @param args arguments to pass to console.log.
     */
    LogurInstance.prototype.write = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (console && console.log)
            console.log.apply(console, args);
    };
    /**
     * Exit
     * When env is node process.exit() is called.
     *
     * @param code optional node error code.
     */
    LogurInstance.prototype.exit = function (code) {
        if (!u.isNode())
            return;
        process.exit(code);
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
        // Get the transport to query.
        var _transport = this.transports.get(transport);
        // Warn if not queryable.
        if (!_transport.query)
            return this.log.warn("attempted to query non-queryable transport " + transport + ".");
        // Query the transport.
        _transport.query(q, fn);
    };
    /**
     * Dispose
     * Calls dispose on transports on
     * teardown of instance.
     *
     * @param fn callback on done disposing transports.
     */
    LogurInstance.prototype.dispose = function (fn) {
        var _this = this;
        var funcs = this._transports.map(function (t) {
            var transport = _this.transports.get(t);
            if (transport.dispose)
                return transport.dispose;
        });
        u.asyncEach(funcs, fn);
    };
    return LogurInstance;
}(notify_1.Notify));
exports.LogurInstance = LogurInstance;
//# sourceMappingURL=instance.js.map