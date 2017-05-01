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
    timestamp: 'utc'
};
var profileDefaults = {
    transports: [],
    max: 25
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
        _this._transports = [];
        _this._exceptions = [];
        _this._active = true;
        _this._name = name;
        _this._logur = logur;
        _this.options = u.extend({}, defaults, options);
        // Init UAParser, expose it publicly
        // in case user wants to parse headers
        // in http requests.
        _this.ua = new ua_parser_js_1.UAParser();
        if (u.isNode())
            _this._nodeEnv = env.node();
        else
            _this._browserEnv = env.browser(_this.ua);
        return _this;
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
    LogurInstance.prototype.log = function (transports, type) {
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
        // If transports is string
        if (u.isString(transports)) {
            type = transports;
            transports = undefined;
        }
        else if (u.isArray(transports)) {
            params.shift();
        }
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
        // Get all Transports for the Instance.
        transports = this._transports;
        var msg = untyped[0];
        var fn, meta, stack;
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
            var tokens = msg.match(/%(\.|\(|[0-9])?\$?[0-9bcdieufgosxXj]/g);
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
        var sysinfo;
        if (u.isNode())
            sysinfo = env.node();
        else
            sysinfo = this.env.browser;
        /* Handle Error, Offset & Stacktrace
        *****************************************/
        // Get the stack info then iterate transports.
        // ignore getting stack for manually created
        // stack.
        var err = u.isError(msg) ? msg : undefined;
        // If an error was passed then set the message
        // to the error's message.
        if (err) {
            msg = err.message || 'Unknown error.';
        }
        // Check if we should offset stacktrace frames.
        var shouldOffset = u.isNode() && !err ? true : false;
        // Offsets the returned frames to trim out
        // some bloat from stack when generating frames.
        var offset = shouldOffset ? 3 : 0;
        // Get the stacktrace for error or generated stack.
        stack = env.stacktrace(err, offset);
        /* Iterate Transports
        *****************************************/
        var run = function (t) {
            // Get the transport object.
            var transport = _this.transports.get(t);
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
            var timestamps = u.timestamp();
            var ts;
            // If is function call to get timestamp
            // and format from user.
            if (u.isFunction(transport.options.timestamp)) {
                var func = transport.options.timestamp;
                ts = func(timestamps);
            }
            else {
                ts = timestamps[transport.options.timestamp];
            }
            // Construct object with all possible
            // properties, we'll use this in our
            // Tranport's action for final output
            // to it's defined target.
            var output = {
                activeid: transport.options.level,
                levelid: level,
                timestamp: ts,
                uuid: u.uuid(),
                level: type,
                instance: _this._name,
                transport: t,
                message: msg,
                metadata: meta,
                callback: fn,
                untyped: untyped,
                args: params,
                map: _this.options.map,
                stacktrace: stack,
                env: sysinfo,
                levels: _this.options.levels
            };
            // Call the Transort's action passing
            // the ordered args and the original args.
            var clone = u.clone(output);
            transport.action(clone, function (ordered, modified) {
                // User may have mutated the output
                // object check if user passed modified.
                modified = modified || clone;
                // Emit typed log message.
                // const levelClone = ordered.slice(0);
                // levelClone.unshift(type);
                _this.emit.call(_this, type, ordered, modified);
                // Emit global logged message.
                // const loggedClone = ordered.slice(0);
                // loggedClone.unshift('logged');
                _this.emit.call(_this, 'logged', ordered, modified);
            });
        };
        // We don't really care about order of transports
        // just run them in parallel if possible.
        transports.forEach(function (t) {
            if (_this.options.sync)
                run(t);
            else
                u.tick(_this, run, t);
        });
    };
    /**
     * Handle Exceptions
     * Enables handling uncaught NodeJS exceptions.
     */
    LogurInstance.prototype.handleExceptions = function () {
        var _this = this;
        // Handle uncaught exceptions in NodeJS.
        if (u.isNode()) {
            process.on('uncaughtException', function (err) {
                // If not exceptions just exit.
                if (!_this._exceptions.length)
                    process.exit();
                _this.log(_this._exceptions, 'error', err);
            });
        }
        else if (u.isBrowser()) {
            var browser_1 = this.ua.getBrowser().name.toLowerCase();
            window.onerror = function (message, url, line, column, err) {
                // If not exceptions just return.
                if (!this._exceptions.length)
                    return;
                // Ahh the good browsers
                if (err) {
                    this.log(this._exceptions, 'error', err);
                }
                else {
                    var stack = "Error: " + message + "\ngetStack@" + url + ":" + line + ":" + column;
                    if (browser_1 === 'chrome' || browser_1 === 'opera')
                        stack = "Error: " + message + "\nat getStack (" + url + ":" + line + ":" + column + ")";
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
    };
    LogurInstance.prototype.common = function () {
        return {
            args: [].slice.call(arguments),
        };
    };
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
            var create = function (name, options, Transport) {
                // Ensure name is lowered.
                name = name.toLowerCase();
                // Allow Type as second arg.
                if (options && !u.isPlainObject(options)) {
                    Transport = options;
                    options = undefined;
                }
                if (!Transport)
                    throw new Error("Cannot create Transport " + name + " using Type of undefined.");
                // Merging base/global options.
                var merged = u.extend({}, _this.options, options);
                // If transport handles exception add
                // to list of transport exceptions.
                if (merged.exceptions)
                    _this._exceptions.push(name);
                // If Transport create and save instance.
                _this._logur.transports[name] = {
                    Transport: Transport,
                    instance: new Transport(merged, _this._logur)
                };
                // Add the transport to local collection.
                _this._transports.push(name);
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
            var setState = function (name, state) {
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
                create: create,
                extend: extend,
                remove: remove,
                setState: setState,
                setOption: setOption
            };
            return methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogurInstance.prototype, "profiles", {
        /**
         * Profile
         * Allows for profiling logs.
         * TODO: Really needs its on class!
         */
        get: function () {
            var _this = this;
            var methods;
            /**
             * Get
             * Gets an existing Profile.
             *
             * @param name the name of the Profile to get.
             */
            var get = function (name) {
                var profile = _this._profiles[name];
                if (!profile) {
                    _this.warn("cannot get Profile " + name + " of undefined.");
                    return;
                }
                return profile;
            };
            /**
             * Active
             * Sets or gets the active state of a Profile.
             *
             * @param name the name of the Profile to get/set active state for.
             * @param state the optional state to set.
             */
            var active = function (name, state) {
                var profile = _this.profiles.get(name);
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
            var until = function (name) {
                var profile = _this.profiles.get(name);
                if (!profile)
                    return;
                if (!u.isUndefined(profile.options.until))
                    return profile.options.until();
                var max = profile.options.max;
                var count = profile.count;
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
            var create = function (name, transports, options) {
                if (u.isPlainObject(transports)) {
                    options = transports;
                    transports = undefined;
                }
                var profile;
                // Extend the options with defaults.
                options = u.extend({}, profileDefaults, options);
                // Ensure transports.
                transports = transports || options.transports;
                if (!transports || !transports.length) {
                    _this.error("cannot start profile " + name + " using transports of none.");
                    return;
                }
                var valid = [];
                // Ensure transports can be used for profiling.
                transports.forEach(function (t) {
                    // Get the transport.
                    var transport = _this.transports.get(t);
                    if (!transport) {
                        _this.warn("the Transport " + t + " was NOT found, ensure the Transport is loaded.");
                        return;
                    }
                    if (!transport.options.profiler) {
                        _this.warn("attempted to load Transport " + t + " but profiling is NOT enabled..");
                        return;
                    }
                    valid.push(t);
                });
                // Add the profile.
                profile = {
                    name: name,
                    running: true,
                    instance: _this._name,
                    transports: valid,
                    started: Date.now(),
                    elapsed: 0,
                    count: 0,
                    options: options,
                    start: methods.start.bind(_this, name),
                    stop: methods.stop.bind(_this, name),
                    remove: methods.remove.bind(_this, name)
                };
                _this._profiles[name] = profile;
                return profile;
            };
            /**
             * Start
             * Starts an existing Profile instance.
             *
             * @param profile the Profile configuration.
             */
            var start = function (name) {
                var profile = _this.profiles.get(name);
                if (!profile)
                    return;
                if (profile.active) {
                    _this.warn("cannot start already active Profile " + name + ".");
                    return;
                }
                profile.started = Date.now();
                profile.active = true;
            };
            /**
             * Stop
             * Stops and returns the specified Profile result.
             */
            var stop = function (name) {
                var profile = _this.profiles.get(name);
                if (!profile)
                    return;
                profile.active = false;
                var result = {
                    name: profile.name,
                    instance: profile.instance,
                    transports: profile.transports,
                    started: profile.started,
                    stopped: profile.stopped,
                    elapsed: profile.elapsed,
                    count: profile.count
                };
                if (profile.options.remove === 'stop')
                    delete _this._profiles[profile.name];
                return result;
            };
            /**
             *
             * @param name the name of the Profile to remove
             * @param force when true will remove an active Profile.
             */
            var remove = function (name, force) {
                var profile = _this.profiles.get(name);
                if (!profile)
                    return;
                if (profile.active && !force) {
                    _this.warn("cannot remove active Profile " + name + ", stop or set force to true to remove.");
                    return;
                }
                delete _this._profiles[name];
            };
            methods = {
                get: get,
                active: active,
                until: until,
                create: create,
                start: start,
                stop: stop,
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
        // If undefined set cascade to options val.
        if (u.isUndefined(cascade))
            cascade = this.options.cascade;
        // If not object of options just set key/value.
        if (!u.isPlainObject(key)) {
            // If not value log error.
            if (!value)
                this.log('error', "cannot set option for key " + key + " using value of undefined.");
            else
                this.options[key] = value;
        }
        else {
            this.options = u.extend({}, this.options, key);
        }
        // If cascading is enabled cascade options
        // down to each bound transport.
        if (cascade) {
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
    // LOG LEVELS
    /**
     * Error
     * Called when log level is error.
     *
     * @param args arguments to be passed to logur.log.
     */
    LogurInstance.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log('error', args);
        return this;
    };
    /**
     * Warn
     * Called when log level is warn.
     *
     * @param args arguments to be passed to logur.log.
     */
    LogurInstance.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log('warn', args);
        return this;
    };
    /**
     * Info
     * Called when log level is info.
     *
     * @param args arguments to be passed to logur.log.
     */
    LogurInstance.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log('info', args);
        return this;
    };
    /**
     * Verbose
     * Called when log level is verbose.
     *
     * @param args arguments to be passed to logur.log.
     */
    LogurInstance.prototype.verbose = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log('verbose', args);
        return this;
    };
    /**
     * Debug
     * Called when log level is debug or when env
     * is node and is debugging.
     *
     * @param args arguments to be passed to logur.log.
     */
    LogurInstance.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log('debug', args);
        return this;
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
        return this;
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
    return LogurInstance;
}(notify_1.Notify));
exports.LogurInstance = LogurInstance;
//# sourceMappingURL=instance.js.map