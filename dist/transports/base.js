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
     * To Array
     * Takes a Logour Output object using map
     * orders in array.
     *
     * @param output the compiled Logour Output object.
     * @param stripColors when true colors are stripped from values.
     */
    LogurTransport.prototype.toArray = function (output, colorization) {
        var _this = this;
        var ordered = [];
        var ignored = ['callback'];
        var colorize = function (val) {
            if (colorization === 'no')
                return val;
            else if (colorization === 'yes')
                return _this.colorize(val);
            else
                return _this.stripColors(val);
        };
        // Iterate the output format array
        // adding each element to our ordered
        // result array.
        output.map.forEach(function (k) {
            var value = u.get(output, k);
            if (k === 'untyped' && output.untyped && output.untyped.length)
                output.untyped.forEach(function (u) {
                    ordered.push(colorize(u));
                });
            else if (value)
                ordered.push(colorize(value));
        });
        return ordered;
    };
    /**
     * To Object
     *
     * @param output the Logur Output generated object.
     * @param stripColors when true colors are stripped from values.
     */
    LogurTransport.prototype.toObject = function (output, colorization) {
        var _this = this;
        var obj = {};
        var ignored = ['callback'];
        // Iterate the output and build object.
        output.map.forEach(function (k) {
            var value = u.get(output, k);
            if (value) {
                if (colorization !== 'no') {
                    if (colorization === 'strip') {
                        value = _this.stripColors(value);
                    }
                    else {
                        value = _this.colorize(value);
                    }
                }
                obj[k] = value;
            }
        });
        return obj;
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
        // Iterate array and colorize.
        if (u.isArray(str))
            return u.colorizeArray(str);
        else if (u.isPlainObject(str))
            return u.colorizeObject(str);
        else if (!color)
            return u.colorizeByType(str);
        // Otherwise colorize by the color supplied.
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
     * @param levels array of levels for calculating padding.
     * @param strategy the strategy to pad with left, right or none.
     */
    LogurTransport.prototype.padLevel = function (level, levels, strategy) {
        var idx = levels.indexOf(level);
        if (idx === -1)
            return level;
        var padded = u.padValues(levels, strategy, 1);
        return padded[idx];
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
    LogurTransport.prototype.padValues = function (values, strategy, char, offset) {
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