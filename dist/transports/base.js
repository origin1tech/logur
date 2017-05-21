"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("../utils");
var util;
if (!process.env.BROWSER) {
    util = require('util');
}
var defaults = {
    active: true,
    profiler: true,
    exceptions: true
};
/**
 * Logur Base Transport
 */
var LogurTransport = (function () {
    /**
     * Logur Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Logur Transport options.
     * @param logur the common Logur instance.
     */
    function LogurTransport(base, options, logur) {
        this._active = true;
        this._logur = logur;
        this.options = u.extend({}, base, defaults, options);
    }
    Object.defineProperty(LogurTransport.prototype, "log", {
        /**
         * Log
         * Expose the default logger.
         */
        get: function () {
            return this._logur.log;
        },
        enumerable: true,
        configurable: true
    });
    // BASE METHODS
    /**
     * Set Option(s)
     * Sets options for the Transport.
     *
     * @param key the key or options object.
     * @param value the corresponding value for the specified key.
     */
    LogurTransport.prototype.setOption = function (key, value) {
        // If not object of options just set key/value.
        if (!u.isPlainObject(key)) {
            // If not value log error.
            if (!value)
                console.log('error', "cannot set option for key " + key + " using value of undefined.");
            else
                this.options[key] = value;
        }
        else {
            this.options = u.extend({}, this.options, key);
        }
    };
    /**
      * Active
      * Toggles the active state of the transport.
      * If not new state is passed the current state is returned.
      */
    LogurTransport.prototype.active = function (state) {
        if (u.isUndefined(state))
            return this._active;
        return this._active = state;
    };
    // HELPER METHODS
    // Most of below are just wrappers to
    // utils but more convenient for user
    // when extending base Transport.
    /**
     * Colorize
     * Convenience wrapper to utils.colorize.
     * @param str the value to colorize.
     * @param style the style or array of styles to be applied.
     */
    LogurTransport.prototype.colorize = function (str, style) {
        return u.colorize.apply(null, arguments);
    };
    /**
     * Strip Color
     * Strips ansi colors from strings.
     *
     * @param str a string or array of strings to strip color from.
     */
    LogurTransport.prototype.stripColors = function (str) {
        return u.stripColors.apply(null, arguments);
    };
    /**
     * Pad Level
     * Pads the level after calculating pad from possible levels.
     *
     * @param level the level to be padded.
     * @param strategy the strategy to pad with left, right or none.
     * @param levels array of levels for calculating padding.
     */
    LogurTransport.prototype.padLevel = function (level, strategy, levels) {
        levels = u.isArray(levels) ? levels : u.keys(this.options.levels);
        var idx = levels.indexOf(level);
        if (idx === -1)
            return level;
        var padded = u.padValues(levels, strategy);
        return padded[idx];
    };
    /**
     * To Mapped
     * Takes the generated Logur Output converting
     * to mapped values in array, object or json.
     *
     * @param options the Logur Tranport Options or Logur Output object.
     * @param output the generated Logur Output object.
     */
    LogurTransport.prototype.toMapped = function (options, output) {
        // Allow output as first argument.
        if (!u.isUndefined(options['activeid'])) {
            output = options;
            options = undefined;
        }
        options = options || this.options;
        return u.toMapped(options, output);
    };
    // MUST & OPTIONAL OVERRIDE METHODS
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    LogurTransport.prototype.action = function (output) {
        throw new Error('Logur Transport action method must be overriden.');
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    LogurTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    /**
     * Dispose
     * Use the dispose method to close streams any any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    LogurTransport.prototype.dispose = function () {
        throw new Error('Logur Transport dispose method must be overriden.');
    };
    return LogurTransport;
}());
exports.LogurTransport = LogurTransport;
//# sourceMappingURL=base.js.map