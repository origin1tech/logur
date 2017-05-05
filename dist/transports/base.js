"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("../interfaces");
var u = require("../utils");
var defaults = {
    active: true,
    map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],
    pretty: false,
    ministack: false,
    exceptions: 'exit',
    profiler: true
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
                // Just add to object when JSON is required.
                if (options.json) {
                    ordered.ministack = mini;
                }
                else {
                    // If metadata and metadata is set to display pretty
                    // then we have to inject the ministack before it
                    // or it will look funny.
                    if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {
                        // Get the metadata index.
                        var metaIndex = options.map.indexOf('metadata') - 1;
                        if (metaIndex >= 0) {
                            var suffixMeta = ordered.slice(metaIndex);
                            ordered = ordered.splice(0, metaIndex).concat([mini], suffixMeta);
                        }
                    }
                    else {
                        ordered.push(mini);
                    }
                }
            }
        }
    };
    /**
     * Normalize Array
     * Iterates and array and colorizes each
     * element by its data type.
     *
     * @param arr the array to interate and colorize.
     * @param pretty when true outputs using returns and tabs.
     * @param colors when true values are colorized.
     * @param map the color map that maps type to a color or boolean for pretty.
     */
    LogurTransport.prototype.normalizeOutputArray = function (arr, pretty, colors, map) {
        var _this = this;
        // Default color map, mimics Node's
        // util.inspect
        var stylesMap = interfaces_1.COLOR_TYPE_MAP;
        map = map || stylesMap;
        // Iterate the array and colorize by type.
        return arr.map(function (item) {
            var type = u.getType(item, true, 'special');
            // If is object colorize with metadata method.
            if (u.isPlainObject(item)) {
                return _this.normalizeOutputObject(item, pretty, colors, map);
            }
            else {
                if (!map[type] || !colors)
                    return item;
                return u.colorize(item, map[type]);
            }
        });
    };
    /**
     * Normalize Output Metadata
     * This will iterate an object colorizing values,
     * pretty printing for output when defined.
     *
     * @param obj the object to be processed.
     * @param pretty when true outputs using returns and tabs.
     * @param colors when true values are colorized.
     * @param map the color map that maps type to a color or boolean for pretty.
     */
    LogurTransport.prototype.normalizeOutputObject = function (obj, pretty, colors, map) {
        // Default color map, mimics Node's
        // util.inspect
        var stylesMap = interfaces_1.COLOR_TYPE_MAP;
        map = map || stylesMap;
        var result = '';
        // Adds color mapped from type.
        function addColor(type, val) {
            if (!colors)
                return val;
            if (!map[type])
                return val;
            return u.colorize(val, map[type]);
        }
        // Iterate the metadata.
        function colorizer(o, depth) {
            var len = u.keys(o).length;
            var ctr = 0;
            depth = depth || 1;
            var base = 2;
            var pad = depth * base;
            var _loop_1 = function (prop) {
                ctr += 1;
                var sep = ctr < len ? ', ' : '';
                if (o.hasOwnProperty(prop)) {
                    var val = o[prop];
                    // Handle value is an object.
                    if (u.isPlainObject(val)) {
                        var keyPad = depth > 1 ? u.padLeft('', (pad * 2) - 2) : u.padLeft('', pad);
                        if (pretty) {
                            result += '\n' + keyPad + prop + ': ';
                            result += ('\n' + u.padLeft('', pad * 2) + "{ ");
                        }
                        colorizer(val, depth + 1);
                        if (pretty)
                            result += ' }';
                    }
                    else {
                        if (pretty) {
                            var offset = ctr > 1 && depth > 1 ? 2 : 0;
                            if (ctr > 1) {
                                result += ('\n' + u.padLeft('', pad, offset));
                            }
                        }
                        // Iterate array and colorize
                        // by type.
                        if (u.isArray(val)) {
                            var arrLen_1 = val.length;
                            result += prop + ": [ ";
                            val.forEach(function (v, i) {
                                var arrSep = i + 1 < arrLen_1 ? ', ' : '';
                                // Get the type to match in color map.
                                var type = u.getType(v, 'special');
                                result += ("" + addColor(type, v) + arrSep);
                            });
                            result += ' ]';
                        }
                        else {
                            // Get the type to match in color map.
                            var type = u.getType(val, true, 'special');
                            if (pretty)
                                result += (prop + ": " + addColor(type, val) + sep);
                            else
                                result += (prop + "=" + addColor(type, val) + sep);
                        }
                    }
                }
            };
            for (var prop in o) {
                _loop_1(prop);
            }
            return o;
        }
        colorizer(obj);
        if (pretty)
            return "{ " + result + " }";
        return result;
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
    LogurTransport.prototype.normalizeOutput = function (obj, options) {
        var pretty = options.pretty;
        var colors = options.colorize;
        var colorMap = options.colorTypeMap || interfaces_1.COLOR_TYPE_MAP;
        // Get the value's type.
        var type = u.getType(obj, true, 'special');
        // Handle error normalization.
        if (type === 'error') {
            var tmp = obj.message;
            if (colorMap[type] && colors)
                tmp = u.colorize(tmp, colorMap[type]);
            // Check if fullstack should be shown.
        }
        else if (type === 'array') {
            return this.normalizeOutputArray(obj, pretty, colors, colorMap);
        }
        else if (type === 'object') {
            return this.normalizeOutputObject(obj, pretty, colors, colorMap);
        }
        else {
            if (!colorMap[type] || !colors)
                return obj;
            return u.colorize(obj, colorMap[type]);
        }
    };
    /**
     * To Array
     * Takes a Logour Output object using map
     * orders in array.
     *
     * @param output the compiled Logour Output object.
     * @param pretty whether objects should be pretty printed.
     * @param colors whether to colorize the value.
     * @param map a type to value map for applying colors.
     */
    LogurTransport.prototype.toArray = function (output, options) {
        var _this = this;
        var ordered = [];
        var suffix = [];
        var ignored = ['callback'];
        var metaIndex = output.map.indexOf('metadata');
        var metaLast = output.map.length - 1 === metaIndex;
        // Iterate the output format array
        // adding each element to our ordered
        // result array.
        output.map.forEach(function (k, i) {
            var value = u.get(output, k);
            if (k === 'untyped' && output.untyped) {
                output.untyped.forEach(function (u) {
                    // No pretty print for inner objects.
                    ordered.push(_this.normalizeOutput(u, options));
                });
            }
            else if (value) {
                // Don't pretty print metadata when NOT
                // the last argument.
                var isPretty = metaIndex === i && !metaLast ? false : options.pretty;
                var processed = _this.normalizeOutput(value, options);
                if (isPretty && i === metaIndex && metaLast)
                    processed = '\n' + processed;
                ordered.push(processed);
            }
        });
        return ordered;
    };
    /**
     * To Object
     *
     * @param output the Logur Output generated object.
     * @param pretty whether objects should be pretty printed.
     * @param colors whether to colorize the value.
     * @param map a type to value map for applying colors.
     */
    LogurTransport.prototype.toObject = function (output, options) {
        var _this = this;
        var obj = {};
        var ignored = ['callback'];
        // Iterate the output and build object.
        output.map.forEach(function (k) {
            // ignored prop.
            if (ignored.indexOf(k) !== -1)
                return;
            var value = u.get(output, k);
            if (value)
                obj[k] = _this.normalizeOutput(value, options);
        });
        return obj;
    };
    /**
     * To Output
     * Normalizes data for output to array or object.
     *
     * @param options the calling Transport's options.
     * @param output the generated Logur output.
     */
    LogurTransport.prototype.toOutput = function (options, output) {
        if (!options || !output)
            throw new Error('Cannot format "toOdered" using options or output of undefined.');
        // Get list of levels we'll use this for padding.
        var levels = u.keys(options.levels);
        var EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';
        var ordered;
        // Reference the logged level.
        var level = output.level;
        // Check if message is error.
        var isMsgError = u.isError(output.message);
        // Get the level's config object.
        var levelObj = options.levels[level];
        // Flag if we should colorize.
        var colorize = options.colorize && u.isNode() ? true : false;
        if (options.strategy !== 'array') {
            ordered = this.toObject(output, options);
            if (options.strategy === 'json')
                ordered = JSON.stringify(ordered);
        }
        else {
            // Get output as array.
            ordered = this.toArray(output, options);
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
        // Check if ministack should be applied.
        // if (output.stacktrace && output.stacktrace.length) {
        //   const stack = output.stacktrace[0];
        //   const parsed = u.parsePath(stack.path);
        //   // Handle ministack but don't display if
        //   // msg is an error as it would be redundant.
        //   if (options.ministack && stack && parsed && parsed.base) {
        //     // Compile the mini stacktrace string.
        //     let mini = `(${parsed.base}:${stack.line}:${stack.column})`;
        //     if (colorize)
        //       mini = this.colorize(mini, (options.colorTypeMap && options.colorTypeMap.ministack) || 'gray');
        //     // Just add to object when JSON is required.
        //     if (options.json) {
        //       ordered.ministack = mini;
        //     }
        //     else {
        //       // If metadata and metadata is set to display pretty
        //       // then we have to inject the ministack before it
        //       // or it will look funny.
        //       if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {
        //         // Get the metadata index.
        //         const metaIndex = options.map.indexOf('metadata') - 1;
        //         if (metaIndex >= 0) {
        //           const suffixMeta = ordered.slice(metaIndex);
        //           ordered = [...ordered.splice(0, metaIndex), mini, ...suffixMeta];
        //         }
        //       }
        //       else {
        //         ordered.push(mini);
        //       }
        //     }
        //   }
        // }
        return ordered;
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