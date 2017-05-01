"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("../utils");
var defaults = {
    exceptions: 'exit'
};
/**
 * Logur Base Transport
 */
var LogurTransport = (function () {
    /**
     * Logur Transport Constructor
     *
     * @param options the Logur Transport options.
     * @param logur the common Logur instance.
     */
    function LogurTransport(options, logur) {
        this._active = true;
        this._logur = logur;
        this.options = u.extend({}, defaults, options);
    }
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
     * To Ordered
     * Takes a Logour Output object using map
     * set in options orders arguments for output
     * in Transport.
     *
     * @param output the compiled Logour Output object.
     */
    LogurTransport.prototype.toOrdered = function (output) {
        var ordered = [];
        // Iterate the output format array
        // adding each element to our ordered
        // result array.
        output.map.forEach(function (k) {
            switch (k) {
                case 'uuid':
                    ordered.push(output.uuid);
                    break;
                case 'timestamp':
                    ordered.push(output.timestamp);
                    break;
                case 'level':
                    ordered.push(output.level);
                    break;
                case 'instance':
                    ordered.push(output.instance);
                    break;
                case 'transport':
                    ordered.push(output.transport);
                    break;
                case 'message':
                    if (output.message)
                        ordered.push(output.message);
                    break;
                case 'untyped':
                    if (output.untyped && output.untyped.length) {
                        output.untyped.forEach(function (u) { return ordered.push(u); });
                    }
                    break;
                case 'metadata':
                    if (output.metadata)
                        ordered.push(output.metadata);
                    break;
            }
        });
        return ordered;
    };
    /**
     * Colorize
     * Convenience wrapper for chalk. Color can be
     * shorthand string ex: 'underline.bold.red'.
     *
     * Colorizing Metadata
     * colorize({ name: 'Jim' });
     *
     * @see https://github.com/chalk/chalk
     *
     * @param str the string or metadata to be colorized.
     * @param color the color to apply, modifiers, shorthand or true for metadata
     * @param modifiers the optional modifier or modifiers.
     */
    LogurTransport.prototype.colorize = function (str, color, modifiers) {
        return u.colorize.apply(null, arguments);
    };
    /**
     * Strip Color
     * Strips ansi colors from strings.
     *
     * @param str a string or array of strings to strip color from.
     */
    LogurTransport.prototype.stripColor = function (str) {
        return u.stripColor.apply(null, arguments);
    };
    /**
     * Pad Left
     * Pads a string on the left.
     *
     * @param str the string to be padded.
     * @param len the length to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    LogurTransport.prototype.padLeft = function (str, len, char, offset) {
        return u.padLeft.apply(null, arguments);
    };
    /**
     * Pad Right
     * Pads a string to the right.
     *
     * @param str the string to be padded.
     * @param len the length to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    LogurTransport.prototype.padRight = function (str, len, char, offset) {
        return u.padRight.apply(null, arguments);
    };
    /**
     * Pad Values
     *
     * @param values the values to be padded.
     * @param dir the direction to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    LogurTransport.prototype.padValues = function (values, dir, char, offset) {
        return u.padValues.apply(null, arguments);
    };
    // MUST OVERRIDE METHODS
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    LogurTransport.prototype.action = function (output, done) {
        throw new Error('Logur Transport action method must be overriden.');
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    LogurTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    return LogurTransport;
}());
exports.LogurTransport = LogurTransport;
//# sourceMappingURL=base.js.map