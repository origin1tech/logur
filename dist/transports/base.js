"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("../interfaces");
var u = require("../utils");
var util;
if (!process.env.BROWSER) {
    util = require('util');
}
var defaults = {
    active: true,
    map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],
    pretty: false,
    ministack: false,
    prettystack: false,
    profiler: true,
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
     * shorthand string ex: 'underline.bold.red'.
     *
     * @see https://github.com/chalk/chalk
     *
     * @param obj the value to colorize.
     * @param color the color to apply to the value.
     * @param modifiers additional modifiers to be applied.
     */
    LogurTransport.prototype.colorize = function (obj, color, modifiers) {
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
        levels = u.isArray(levels) ? levels : u.keys(this.options.levels);
        var idx = levels.indexOf(level);
        if (idx === -1)
            return level;
        var padded = u.padValues(levels, strategy);
        return padded[idx];
    };
    /**
     * Ministack
     * Generates a mini stacktrace of the calling
     * line, col etc.
     *
     * @param options the Logur Transport options.
     * @param output the generated Logur Output object.
     */
    LogurTransport.prototype.ministack = function (options, output) {
        var colorize = options.colorize && u.isNode() ? true : false;
        // Check if ministack should be applied.
        if (output.stacktrace && output.stacktrace.length) {
            var stack = output.stacktrace[0];
            var parsed = u.parsePath(stack.path);
            // Handle ministack but don't display if
            // msg is an error as it would be redundant.
            if (options.ministack && stack && parsed && parsed.base) {
                // Compile the mini stacktrace string.
                var mini = "(" + parsed.base + ":" + stack.line + ":" + stack.column + ")";
                if (colorize)
                    mini = this.colorize(mini, (options.colorTypeMap && options.colorTypeMap.ministack) || 'gray');
                return mini;
                // Just add to object when JSON is required.
                // if (options.json) {
                //   return mini;
                // }
                // else {
                //   // If metadata and metadata is set to display pretty
                //   // then we have to inject the ministack before it
                //   // or it will look funny.
                //   if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {
                //     // Get the metadata index.
                //     const metaIndex = options.map.indexOf('metadata') - 1;
                //     if (metaIndex >= 0) {
                //       const suffixMeta = ordered.slice(metaIndex);
                //       ordered = [...ordered.splice(0, metaIndex), mini, ...suffixMeta];
                //     }
                //   }
                //   else {
                //     ordered.push(mini);
                //   }
                // }
            }
        }
        return '';
    };
    /**
     * Normalize By Type
     * Inspects the type then colorizes.
     *
     * @param obj the value to inspect for colorization.
     * @param pretty whether pretty printing should be applied when object.
     * @param colors whether to colorize the value.
     * @param map an optional map to apply colors by type.
     */
    LogurTransport.prototype.format = function (obj, options, output) {
        var pretty = options.pretty;
        var colors = options.colorize;
        var colorMap = options.colorTypeMap || interfaces_1.COLOR_TYPE_MAP;
        var EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';
        function plainPrint(o) {
            var result = '';
            if (u.isArray(o)) {
                o.forEach(function (item, i) {
                    var t = u.getType(item, true, 'special');
                    if (t === 'object' || t === 'array') {
                        result += plainPrint(item);
                    }
                    else {
                        if (t === 'function') {
                            var name_1 = item.name || 'fn';
                            item = "[Function: " + name_1 + "]";
                        }
                        else {
                            if (!colors)
                                result += (i + "=" + item + ", ");
                            else
                                result += (i + "=" + u.colorize(item, colorMap[t]) + ", ");
                        }
                    }
                });
            }
            else {
                for (var prop in o) {
                    var item = o[prop];
                    var t = u.getType(item, true, 'special');
                    if (t === 'array' || t === 'object') {
                        result += plainPrint(item);
                    }
                    else {
                        if (t === 'function') {
                            var name_2 = item.name || 'fn';
                            item = "[Function: " + name_2 + "]";
                        }
                        else {
                            if (!colors)
                                result += (prop + "=" + item + ", ");
                            else
                                result += (prop + "=" + u.colorize(item, colorMap[t]) + ", ");
                        }
                    }
                }
            }
            if (result.length)
                return result.replace(/, $/, '');
            return result;
        }
        // Get the value's type.
        var type = u.getType(obj, true, 'special');
        // Handle error normalization.
        if (type === 'error') {
            // Otherwise normalize the error for output.
            // Create the error message.
            var tmp = (obj.name || 'Error') + ': ' + (obj.message || 'unknown error.');
            // colorize if enabled.
            if (colorMap[type] && colors)
                tmp = u.colorize(tmp, colorMap[type]);
            // If pretty stacktrace use util.inspect.
            if (options.prettyStack && output.error) {
                return { normalized: tmp, append: util.inspect(output.error, true, null, colors) };
            }
            // Check if fullstack should be shown.
            if (obj.stack) {
                var stack = obj.stack.split(EOL).slice(1);
                return { normalized: tmp, append: stack.join(EOL) };
            }
        }
        else if (type === 'object' || type === 'array') {
            if (options.pretty) {
                return {
                    append: util.inspect(obj, true, null, colors)
                };
            }
            return { normalized: plainPrint(obj) };
        }
        else {
            if (!colorMap[type] || !colors)
                return { normalized: obj };
            return { normalized: u.colorize(obj, colorMap[type]) };
        }
    };
    /**
     * To Output
     * Normalizes data for output to array or object.
     *
     * @param options the calling Transport's options.
     * @param output the generated Logur output.
     */
    LogurTransport.prototype.toMapped = function (as, options, output) {
        var _this = this;
        if (!options || !output)
            throw new Error('Cannot format "toOdered" using options or output of undefined.');
        // Get list of levels we'll use this for padding.
        var levels = u.keys(options.levels);
        var EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';
        var ignored = ['callback'];
        var metaIndex = options.map.indexOf('metadata');
        var metaLast = options.map.length - 1 === metaIndex;
        // Metadata must be last index in map.
        if (metaIndex !== -1 && !metaLast) {
            options.map.splice(metaIndex, 1);
            options.map.push('metadta');
        }
        // Var for resulting output array, object or json.
        var ordered;
        // An array of values to append to output.
        var appended = [];
        // Reference the logged level.
        var level = output.level;
        // Get the level's config object.
        var levelObj = options.levels[level];
        // Flag if we should colorize.
        var colorize = options.colorize && u.isNode() ? true : false;
        if (options.strategy !== 'array') {
            // ordered = this.toObject(output, options);
            ordered = {};
            // Iterate the map and build the object.
            output.map.forEach(function (k) {
                // ignored prop.
                if (ignored.indexOf(k) !== -1)
                    return;
                var value = u.get(output, k);
                // When outputting to object/json
                // when don't normalize with pretty
                // printing or colors as they would not
                // be relevant in that context.
                if (!u.isUndefined(value)) {
                    var serializer = _this._logur.serializers[k];
                    // If a serializer exists call it.
                    if (serializer)
                        value = serializer(value, output, options);
                    ordered[k] = value;
                }
            });
            if (options.ministack)
                ordered['ministack'] = this.ministack(options, output);
            if (options.strategy === 'json')
                ordered = JSON.stringify(ordered);
        }
        else {
            // Get output as array.
            // ordered = this.toArray(output, options);
            ordered = [];
            // Iterate layout map and build output.
            output.map.forEach(function (k, i) {
                var value = u.get(output, k);
                var serializer = _this._logur.serializers[k];
                if (serializer && !u.isUndefined(value))
                    value = serializer(value, output, options);
                if (k === 'untyped' && output.untyped) {
                    value.forEach(function (u) {
                        var result = _this.format(u, options, output);
                        if (result) {
                            if (!u.isUndefined(result.normalized))
                                ordered.push(result.normalized);
                            if (!u.isUndefined(result.append))
                                appended.push(result.append);
                        }
                    });
                }
                else if (value) {
                    var result = _this.format(value, options, output);
                    if (result) {
                        if (!u.isUndefined(result.normalized))
                            ordered.push(result.normalized);
                        if (!u.isUndefined(result.append))
                            appended.push(result.append);
                    }
                }
            });
            // Check if should add ministack.
            if (options.ministack)
                ordered.push(this.ministack(options, output));
            // Check appended values that should be appended
            // after primary elements.
            if (appended.length) {
                if (!ordered.length)
                    ordered = appended;
                else
                    ordered = ordered.concat(appended.map(function (a) { return '\n' + a; }));
            }
            // Get the index of the level in map, we do
            // this
            var idx = options.map.indexOf('level');
            if (idx !== -1) {
                var tmpLevel = level.trim();
                // If padding pad the level.
                if (options.padding)
                    tmpLevel = this.padLevel(tmpLevel, options.levels, options.padding);
                if (colorize)
                    tmpLevel = this.colorize(tmpLevel, levelObj.color);
                tmpLevel += ':';
                ordered[idx] = tmpLevel;
            }
        }
        return ordered;
    };
    LogurTransport.prototype.toMappedArray = function (options, output) {
        return this.toMapped('array', options, output);
    };
    LogurTransport.prototype.toMappedObject = function (options, output) {
        return this.toMapped('object', options, output);
    };
    // MUST & OPTIONAL OVERRIDE METHODS
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
    /**
     * Close
     * When Transport is of type stream this method is called
     * on close of Logur to flush streams.
     */
    LogurTransport.prototype.close = function () {
        return;
    };
    return LogurTransport;
}());
exports.LogurTransport = LogurTransport;
//# sourceMappingURL=base.js.map