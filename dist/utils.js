"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _clone = require("lodash.clonedeep");
var chalk, util, statSync, parse, EOL;
if (!process.env.BROWSER) {
    chalk = require('chalk');
    util = require('util');
    parse = require('path').parse;
    statSync = require('fs').statSync;
    EOL = require('os').EOL;
}
else {
    EOL = '\n';
}
///////////////////////////////
// COMMON UTILS
///////////////////////////////
var toString = Object.prototype.toString;
/**
 * Noop
 */
exports.noop = function () { };
/**
 * Is Function
 * Check if object provided is function.
 *
 * @param obj - test object provided is function.
 */
function isFunction(obj) {
    if (isUndefined(obj))
        return false;
    return typeof obj === 'function';
}
exports.isFunction = isFunction;
/**
 * Is String
 * Inspect value provided testing if is string.
 * @param obj the value to be tested.
 */
function isString(obj) {
    if (isUndefined(obj))
        return false;
    return typeof obj === 'string' || obj instanceof String;
}
exports.isString = isString;
/**
 * Is Empty
 * Test if value provided is empty.
 *
 * @param obj value to be inspected.
 */
function isEmpty(obj) {
    return obj === undefined ||
        obj === null ||
        obj === {} ||
        keys(obj).length > 0 ||
        obj === '';
}
exports.isEmpty = isEmpty;
/**
 * Is Array
 * Check if value is an array.
 *
 * @param obj the object to test as array.
 */
function isArray(obj) {
    if (Array.isArray)
        return Array.isArray(obj);
    return toString.call(obj) === '[object Array]';
}
exports.isArray = isArray;
/**
 * Is Boolean
 *
 * @param obj
 */
function isBoolean(obj) {
    if (isUndefined(obj))
        return false;
    return typeof obj === 'boolean';
}
exports.isBoolean = isBoolean;
/**
 * Is Null
 * Checks if value is null.
 *
 * @param obj the object to inspect for null.
 */
function isNull(obj) {
    return obj === null;
}
exports.isNull = isNull;
/**
 * Check if is not a number.
 * @param obj value to tests if not is a number.
 */
function isNan(obj) {
    if (isUndefined(obj))
        return true;
    return isNaN(obj);
}
exports.isNan = isNan;
/**
 * Is Object
 * Checks if value is an object.
 *
 * @param obj the object to inspect.
 */
function isObject(obj) {
    if (isUndefined(obj) || isNull(obj))
        return false;
    return typeof obj === 'object' || typeof obj === 'function';
}
exports.isObject = isObject;
/**
 * Is Error
 * Checks if value is an error.
 *
 * @param obj the value/object to be inspected.
 */
function isError(obj) {
    if (isUndefined(obj) || isNull(obj))
        return false;
    var type = toString.call(obj).toLowerCase();
    // NOTE __exception__ is a custom property
    // used to denoted an object literall as
    // an error.
    return type === '[object error]' || type === '[object domexception]' || isBoolean(obj.__exception__);
}
exports.isError = isError;
/**
 * Is Reg Expression
 * Tests if object is regular expression.
 */
function isRegExp(obj) {
    return (obj instanceof RegExp);
}
exports.isRegExp = isRegExp;
/**
 * Is Date
 * Parses value inspecting if is Date.
 *
 * @param obj the value to inspect/test if is Date.
 * @param parse when True parsing is allowed to parse/check if string is Date.
 */
function isDate(obj, parse) {
    if (!parse)
        return obj instanceof Date;
    // If is string try to parse date.
    if (isString(obj) && parse) {
        // Ignore if only numbers string.
        if (/^[0-9]+$/.test(obj))
            return false;
        if (!/[0-9]/g)
            return false;
        // Ignore if no date or time delims.
        if (!/(\.|\/|-|:)/g.test(obj))
            return false;
        // Parse and ensure is number/epoch.
        return isNumber(tryParseDate(obj));
    }
    return false;
}
exports.isDate = isDate;
/**
 * Is Undefined
 * Tests if value is undefined.
 *
 * @param val the value to inspect
 */
function isUndefined(val) {
    return (typeof val === 'undefined');
}
exports.isUndefined = isUndefined;
/**
 * Is Plain Object
 * Inspects value checking if is object literal.
 *
 * @param val the value to inspect
 */
function isPlainObject(val) {
    if (isUndefined(val))
        return false;
    return val ? val.constructor === {}.constructor : false;
}
exports.isPlainObject = isPlainObject;
/**
 * Check if value provided is number.
 * @param obj the value to be tested.
 */
function isNumber(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
}
exports.isNumber = isNumber;
/**
 * Is Instance
 * Tests if object is instanceof provided Type.
 *
 * @param obj the object to check.
 * @param Type the instance type to match.
 */
function isInstance(obj, Type) {
    return obj instanceof Type;
}
exports.isInstance = isInstance;
/**
 * Is Unique
 * Tests if the value is unique in the collection.
 *
 * @param obj the object to be inspected.
 * @param value the value to be matched.
 */
function isUnique(arr, value) {
    return duplicates(arr, value, true) === 0;
}
exports.isUnique = isUnique;
/**
 * Is Node
 * Tests if is NodeJS.
 */
function isNode() {
    if (typeof module !== 'undefined' && module.exports)
        return true;
    return false;
}
exports.isNode = isNode;
/**
 * Is Browser
 * Tests if running in browser.
 */
function isBrowser() {
    return (typeof window !== 'undefined' && window.document);
}
exports.isBrowser = isBrowser;
/**
 * Indicates if app is in debug mode.
 * @param debugging a manual flag to denote debugging.
 */
function isDebug(debugging) {
    // If manually passed just return.
    if (debugging)
        return true;
    var eargv = process && process.execArgv;
    try {
        // Check if v8debug variable is set.
        if (typeof v8debug !== undefined && v8debug !== null)
            return true;
        // Check if exec'd with flag.
        if (eargv.indexOf('--debug') !== -1 || eargv.indexOf('--debug-brk') !== -1)
            return true;
    }
    catch (ex) {
        return false;
    }
}
exports.isDebug = isDebug;
/**
 * Is Equal
 * Tests if two values are equal.
 * Does not support "deep equal".
 *
 * @param value the value to be compared.
 * @param compare the comparer value.
 * @param loose when true == is used instead of ===.
 */
function isEqual(value, compare, loose) {
    if (!loose)
        return value === compare;
    return value == compare;
}
exports.isEqual = isEqual;
/**
 * Duplicates
 * Counts the number of duplicates in an array.
 *
 * @param arr the array to check for duplicates.
 * @param value the value to match.
 * @param breakable when true allows breaking at first duplicate.
 */
function duplicates(arr, value, breakable) {
    var i = arr.length;
    var dupes = 0;
    while (i--) {
        if (breakable && dupes > 1)
            break;
        if (isEqual(arr[i], value))
            dupes += 1;
    }
    dupes -= 1;
    return dupes < 0 ? 0 : dupes;
}
exports.duplicates = duplicates;
/**
 * Contains
 * Tests if array contains value.
 *
 * @param arr the array to be inspected.
 * @param value the value to check if is contained in array.
 */
function contains(arr, value) {
    arr = arr || [];
    return arr.filter(function (v) {
        return isEqual(v, value);
    }).length > 0;
}
exports.contains = contains;
/**
 * Contains Any
 * Tests array check if contains value.
 *
 * @param arr the array to be inspected.
 * @param compare - array of values to compare.
 */
function containsAny(arr, compare) {
    if (!isArray(arr) || !isArray(compare))
        return false;
    return compare.filter(function (c) {
        return contains(arr, c);
    }).length > 0;
}
exports.containsAny = containsAny;
/**
 * Keys
 * Takes an object then returns keys in array.
 *
 * @param obj the object to parse keys.
 */
function keys(obj) {
    if (!isPlainObject(obj))
        return [];
    return Object.keys(obj);
}
exports.keys = keys;
/**
 * Extend
 * Extends objects similar to Object.assign
 * with the exception that undefined values are ignored.
 *
 * @example
 * extend({ name: 'Bob', active: true }, { active: undefined })
 * results in:
 * { name: 'Bob', active: true }
 *
 * @param obj primary object.
 * @param args unlimited number of objects to extend from.
 */
function extend(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var deep = false;
    var target;
    // If deep is first set
    // deep property and grab
    // first element in args.
    if (isBoolean(obj)) {
        deep = obj;
        if (!args.length)
            return {};
        obj = args.shift();
    }
    // if no result set to obj.
    !target ? target = obj : args.unshift(obj);
    // Rather than return the orig value
    // if not an object just return empty
    // object to prevent errors etc.
    if (!isObject(target))
        return {};
    for (var i = 0, source = void 0; source = args[i]; i++) {
        // If not an object return.
        if (!isObject(source))
            return;
        for (var name_1 in source) {
            if (source.hasOwnProperty(name_1)) {
                var to = target[name_1];
                var from = source[name_1];
                var _isPlainObject = isPlainObject(from);
                var _isArray = isArray(from);
                if (deep && (_isPlainObject || _isArray)) {
                    var clone_1 = void 0;
                    if (_isArray)
                        clone_1 = to && isArray(to) ? to : [];
                    else
                        clone_1 = to && isPlainObject(to) ? to : {};
                    target[name_1] = extend(deep, clone_1, from);
                }
                else if (!isUndefined(from)) {
                    target[name_1] = from;
                }
            }
        }
    }
    return target;
}
exports.extend = extend;
/**
 * Flatten
 * Takes multiple arrays and flattens to single array.
 * NOTE: this will NOT work for empty nested arrays
 * but will work for 90 plus % of cases.
 *
 * @param args rest param containing multiple arrays to flatten.
 */
function flatten(args) {
    return [].concat.apply([], args);
}
exports.flatten = flatten;
/**
 * Clone
 * Performs deep cloning of objects, arrays
 * numbers, strings, maps, promises etc..
 *
 * @param obj object to be cloned.
 * @param circular whether or not to clone circular set false if certain no circular refs.
 * @param depth the depth to clone defaults to infinity.
 */
function clone(obj, circular, depth) {
    return _clone(obj, circular, depth);
}
exports.clone = clone;
/**
 * First
 * Simple method to get first element just
 * a little less typing.
 *
 * @param arr the array to get first element from.
 */
function first(arr) {
    return arr[0];
}
exports.first = first;
/**
 * Last
 * Simple method to get last element.
 *
 * @param arr the array to get last element.
 */
function last(arr) {
    return arr[arr.length - 1];
}
exports.last = last;
/**
 * Tick
 * Wraps function with process.nextTick or setTimeout.
 */
function tick(ctx, fn) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var ticker = isNode() ? process.nextTick : setTimeout;
    if (isFunction(ctx)) {
        fn = ctx;
        ctx = null;
    }
    ticker(function () {
        fn.apply(ctx, args);
    });
    return ticker;
}
exports.tick = tick;
/**
 * Match Index
 *
 * @param prop the property to match.
 */
function matchIndex(prop) {
    var match = new RegExp('(.+)\\[([0-9]*)\\]', 'i').exec(prop);
    if (match && match.length === 3)
        return { name: match[1], index: match[2] };
    return false;
}
exports.matchIndex = matchIndex;
/**
 * Split
 * Splits a string at character.
 * Default possible chars to match: ['/', '.', ',', '|']
 *
 * @param str the string to be split.
 * @param char the character to split at.
 */
function split(str, char) {
    if (isArray(str))
        return str;
    // default characters.
    var defChars = ['/', '.', ',', '|'];
    var arr;
    // if no char iterate defaults.
    if (!char) {
        while (!char && defChars.length) {
            var tmpChar = defChars.shift();
            var exp = new RegExp(tmpChar, 'g');
            if (exp.test(str))
                char = tmpChar;
        }
    }
    // Set the default arr.
    var tmp = str;
    arr = [str];
    // If char split.
    if (char)
        arr = tmp.split(char);
    // If empty remove first element.
    // this happens when splitting on
    // char and is first char in string.
    if (isEmpty(arr[0]))
        arr.shift();
    return arr;
}
exports.split = split;
/**
 * Del
 * Deletes keys in an object.
 *
 * @param obj the object whose keys should be deleted.
 * @param props the property keys that should be deleted.
 */
function del(obj, key) {
    if (arguments.length !== 2 || (!isArray(key) && !isString(key)))
        return obj;
    var props = split(key);
    var prop = props.shift();
    var match = matchIndex(prop);
    var next = obj[prop];
    if (match)
        next = obj[match.name][match.index];
    if (props.length > 0) {
        del(next, props);
    }
    else {
        if (match) {
            obj[match.name].splice(match.index, 1);
        }
        else {
            delete obj[prop];
        }
    }
    return obj;
}
exports.del = del;
/**
 * Get
 * Gets a property within the supplied object.
 *
 * @param obj the object to inspect.
 * @param prop
 */
function get(obj, key) {
    if (arguments.length !== 2 || (!isArray(key) && !isString(key)))
        return obj;
    var _clone = clone(obj);
    var props = split(key);
    while (props.length && _clone) {
        var prop = props.shift(), match = void 0;
        match = matchIndex(prop);
        if (match) {
            if (_clone[match.name] !== undefined)
                _clone = _clone[match.name][match.index];
        }
        else {
            _clone = _clone[prop];
        }
    }
    return _clone;
}
exports.get = get;
/**
 * Set
 * Sets a value on an object using dot notation or url path.
 *
 * @param obj the object to set the value on.
 * @param key the property used for setting the value.
 * @param value the value used for updating the property.
 * @param dynamic when NOT false objects are dynamically created if required.
 */
function set(obj, key, value, dynamic) {
    if (arguments.length !== 3 || (!isArray(key) && !isString(key)))
        return obj;
    var props = split(key);
    if (isUndefined(value) && dynamic !== false)
        value = {};
    var prop = props.shift();
    var match = matchIndex(prop);
    var next = obj[prop];
    if (isUndefined(next) && dynamic !== false)
        next = obj[prop] = {};
    if (match)
        next = obj[match.name][match.index];
    if (props.length > 0) {
        set(next, props, value);
    }
    else {
        if (match)
            obj[match.name][match.index] = value;
        else
            obj[prop] = value;
    }
    return obj;
}
exports.set = set;
/**
 * UUID
 * Generates a UUID.
 */
function uuid() {
    var d = Date.now();
    // Use high perf timer if avail.
    if (typeof performance !== 'undefined' && isFunction(performance.now))
        d += performance.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
exports.uuid = uuid;
/**
 * Pad Left
 * Pads a string on the left.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
function padLeft(str, len, char, offset) {
    if (isNumber(char)) {
        offset = char;
        char = undefined;
    }
    char = char || ' ';
    var pad = '';
    while (len--) {
        pad += char;
    }
    if (offset)
        return padLeft('', offset, char) + pad + str;
    return pad + str;
}
exports.padLeft = padLeft;
/**
 * Pad Right
 * Pads a string to the right.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
function padRight(str, len, char, offset) {
    if (isNumber(char)) {
        offset = char;
        char = undefined;
    }
    char = char || ' ';
    while (len--) {
        str += char;
    }
    if (offset)
        str += padRight('', offset, char);
    return str;
}
exports.padRight = padRight;
/**
 * Pad Values
 *
 * @param values the values to be padded.
 * @param dir the direction to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
function padValues(values, strategy, char, offset) {
    if (isNumber(char)) {
        offset = char;
        char = undefined;
    }
    // do nothing.
    if (strategy === 'none')
        return values;
    var len = 0;
    strategy = strategy || 'right';
    char = char || ' ';
    var func = strategy === 'right' ? padRight : padLeft;
    values.forEach(function (item) {
        if (item.length > len)
            len = item.length;
    });
    if (offset)
        len += offset;
    values.forEach(function (item, i) {
        if (item.length < len)
            values[i] = func(item, len - item.length, char);
    });
    return values;
}
exports.padValues = padValues;
/**
 * Get Type
 * Gets the type of an object.
 *
 * @param obj the object to get type from.
 * @param stringToDate when true parses strings to see if they are dates.
 * @param unknown the string name for unknown types.
 */
function getType(obj, stringToDate, unknown) {
    var type = typeof obj;
    if (isString(stringToDate)) {
        unknown = stringToDate;
        stringToDate = undefined;
    }
    if (type !== 'object' && type !== 'string')
        return type;
    else if (type === 'string' && stringToDate) {
        if (isDate(obj, true))
            return 'date';
        return type;
    }
    else if (isDate(obj))
        return 'date';
    else if (isRegExp(obj))
        return 'regexp';
    else if (isArray(obj))
        return 'array';
    else if (isPlainObject(obj))
        return 'object';
    else if (isError(obj))
        return 'error';
    else if (obj === null)
        return 'null';
    return unknown || 'unknown';
}
exports.getType = getType;
/**
 * Try Parse Date
 * Attempts to parse a date from a string.
 *
 * @param str the string to attempt parsing on.
 */
function tryParseDate(str) {
    try {
        var d = Date.parse(str);
        if ((d + '') !== 'Invalid Date' && !isNaN(d))
            return d;
        return str;
    }
    catch (ex) {
        return str;
    }
}
exports.tryParseDate = tryParseDate;
///////////////////////////////
// LIBRARY UTILS
///////////////////////////////
/**
 * Parse Path
 * Universal method to parse a file path or url.
 *
 * @param path the file path or url to parse.
 */
function parsePath(path) {
    if (parse) {
        return parse(path);
    }
    else {
        var exp = /\.[0-9a-z]{2,5}$/i;
        var ext = exp.exec(path);
        // Can't parse not a file.
        if (!ext)
            return {};
        var idx = path.lastIndexOf('/');
        idx = idx >= 0 ? idx += 1 : 0;
        var basename = path.slice(idx);
        var split_1 = basename.split('.');
        return {
            base: basename,
            ext: '.' + split_1[1],
            name: split_1[0]
        };
    }
}
exports.parsePath = parsePath;
/**
 * Timestamp
 * Generates multiple timestamp formats.
 */
function timestamp(date) {
    var epoch = isNumber(date) ? date : Date.now();
    if (isString(date)) {
        var d = tryParseDate(date);
        if (isNumber(date))
            epoch = date;
    }
    var dt = new Date(epoch);
    var localDate = dt.toLocaleDateString();
    var localTime = dt.toTimeString().split(' ')[0];
    var iso = dt.toISOString();
    var splitUtc = iso.split('T');
    var utcDate = splitUtc[0];
    var utcTime = splitUtc[1].split('.')[0];
    // split local date and format in reverse.
    var splitLocal = localDate.split('/');
    if (splitLocal[0].length < 2)
        splitLocal[0] = '0' + splitLocal[0];
    if (splitLocal[1].length < 2)
        splitLocal[1] = '0' + splitLocal[1];
    localDate = splitLocal[2] + "-" + splitLocal[1] + "-" + splitLocal[0];
    var obj = {
        epoch: epoch,
        date: dt,
        iso: iso,
        localDate: localDate,
        localTime: localTime,
        local: localDate + ' ' + localTime,
        utcDate: utcDate,
        utcTime: utcTime,
        utc: utcDate + ' ' + utcTime
    };
    return obj;
}
exports.timestamp = timestamp;
/**
 * Bytes To Size
 * Converts bytes to normalized size.
 *
 * @param bytes the bytes to normalize
 * @param decimals the number of decimal places.
 */
function bytesToSize(bytes, decimals) {
    if (bytes === 0)
        return {
            size: 0,
            fixedzero: 0,
            raw: 0,
            type: 'Bytes',
            text: '0 Bytes',
            index: 0
        };
    decimals = typeof decimals !== 'undefined' ? decimals : 2;
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    var floated = parseFloat(bytes / Math.pow(k, i) + '');
    var fixedzero = parseFloat(floated.toFixed(0));
    var placed = parseFloat(floated.toFixed(decimals));
    return {
        size: placed,
        fixedzero: fixedzero,
        raw: floated,
        type: sizes[i],
        text: placed + " " + sizes[i],
        index: i
    };
}
exports.bytesToSize = bytesToSize;
/**
 * Check Stat
 * Using stat check if file too large.
 *
 * @param filename the file name to stat.
 */
function checkStat(filename) {
    var stats = statSync(filename);
    var normalized = bytesToSize(stats.size, 0);
    if (normalized.index > 2)
        return false;
    if (normalized.index === 2 && normalized.fixedzero >= 2)
        return false;
    return true;
}
exports.checkStat = checkStat;
/**
 * Intersect
 * Intersects two types.
 *
 * @param first first type.
 * @param second second type.
 */
function intersect(first, second) {
    var result = {};
    for (var id in first) {
        result[id] = first[id];
    }
    for (var id in second) {
        if (!result.hasOwnProperty(id)) {
            result[id] = second[id];
        }
    }
    return result;
}
exports.intersect = intersect;
/**
 * Activate
 * Activates/instantiates a class using generics
 * while passing arguments.
 *
 * Example:
 *
 * class MyClass {
 *  name: string;
 *  age: number
 * }
 *
 * let myClass = activate<MyClass>(MyClass, args here)
 *
 * @param Type the type to be activated.
 * @param args the arguments to pass on init.
 */
function activate(Type) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var ctor = Object.create(Type.prototype);
    Type.apply(ctor, args);
    return ctor;
}
exports.activate = activate;
///////////////////////////////
// COLORIZATION
///////////////////////////////
/**
 * Colorize
 * Convenience wrapper for chalk. Color can be
 * shorthand string ex: 'underline.bold.red'.
 *
 * @see https://github.com/chalk/chalk
 *
 * @param obj the value to be colorized.
 * @param color the color to apply, modifiers, shorthand.
 * @param modifiers the optional modifier or modifiers.
 */
function colorize(obj, color, modifiers) {
    // If not chalk can't colorize
    // as we are in browser.
    if (!chalk)
        return obj;
    if (!color && !modifiers)
        return obj;
    if (isArray(color)) {
        modifiers = color;
        color = undefined;
    }
    if (isString(modifiers))
        modifiers = [modifiers];
    // Just a loose exp we don't
    // need much more for this.
    var exp = /\./g;
    // Array containing all styles.
    var styles = [];
    // Decorate from shorthand color
    // when color is shorting format:
    // bold.underline.red
    if (exp.test(color))
        styles = color.split('.');
    else
        styles = styles.concat([color]).concat(modifiers || []);
    // Iterate defined styles and apply.
    var i = styles.length;
    while (i--) {
        var style = styles[i];
        obj = chalk[style](obj);
    }
    return obj;
}
exports.colorize = colorize;
/**
 * Strip Colors
 * Strips ansi colors from string, object, arrays etc.
 *
 * @param str the object to strip color from.
 */
function stripColors(obj) {
    var exp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    if (isString(obj))
        return obj.replace(exp, '');
    // Strip object.
    if (isPlainObject(obj)) {
        for (var prop in obj) {
            var val = obj[prop];
            if (isString(val))
                obj[prop] = val.replace(exp, '');
            else
                obj[prop] = stripColors(val);
        }
    }
    else {
        var arr = obj;
        var i = arr.length;
        while (i--)
            // If string replace
            if (isString(arr[i]))
                arr[i] = arr[i].replace(exp, '');
            else
                arr[i] = stripColors(arr[i]);
        return arr;
    }
}
exports.stripColors = stripColors;
///////////////////////////////
// PLACEHOLDER
///////////////////////////////
/**
 * Fetch
 * Trivial method to fetch url using xmlhttp.
 *
 * @param url the url to be fetched.
 */
// export function fetch(url: string) {
//   try {
//     const xmlHttp = function () {
//       try {
//         return new (<any>window).XMLHttpRequest();
//       }
//       catch (e) {
//         return new (<any>window).ActiveXObject('Microsoft.XMLHTTP');
//       }
//     };
//     const req = xmlHttp();
//     req.open('GET', url, false);
//     req.send('');
//     return req.responseText;
//   }
//   catch (e) {
//     return '';
//   }
// }
/**
 * Lookup Function
 * Attempts to lookup function for error handling via
 * xmlhttp request. Not perfect.
 *
 * @param url the url to be looked up.
 * @param line the line of the function.
 */
// export function lookupFunction(url: string, line: number) {
//   const FUNC_ARG_NAMES = /function ([^(]*)\(([^)]*)\)/;
//   const GUESS_FUNC = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
//   const MATCH_EXP = /(.*)\:\/\/([^:\/]+)([:\d]*)\/{0,1}([\s\S]*)/;
//   const UNKNOWN_FUNC = 'Unknown Function';
//   const SOURCE_CACHE = {};
//   function getSource(url: string) {
//     if (typeof url !== 'string') {
//       return [];
//     }
//     if (!SOURCE_CACHE[url]) {
//       // URL needs to be able to fetched within the acceptable domain.  Otherwise,
//       // cross-domain errors will be triggered.
//       /*
//           Regex matches:
//           0 - Full Url
//           1 - Protocol
//           2 - Domain
//           3 - Port (Useful for internal applications)
//           4 - Path
//       */
//       let source = '';
//       let domain = '';
//       try { domain = window.document.domain; } catch (e) { }
//       const match = MATCH_EXP.exec(url);
//       if (match && match[2] === domain) {
//         source = fetch(url);
//       }
//       SOURCE_CACHE[url] = source ? source.split('\n') : [];
//     }
//     return SOURCE_CACHE[url];
//   }
//   let _line = '',
//     maxLines = 10,
//     source = getSource(url),
//     m;
//   if (!source.length)
//     return UNKNOWN_FUNC;
//   // Walk backwards from the first line in the function until we find the line which
//   // matches the pattern above, which is the function definition
//   for (let i = 0; i < maxLines; ++i) {
//     _line = source[line - i] + _line;
//     if (!isUndefined(_line)) {
//       if ((m = GUESS_FUNC.exec(_line)))
//         return m[1];
//       else if ((m = FUNC_ARG_NAMES.exec(_line)))
//         return m[1];
//     }
//   }
//   return UNKNOWN_FUNC;
// }
/* Non-Mutating Array Modifications
* TODO: consider using non mutating methods.
***********************************************/
/**
 * N-Pop
 * Pops/removes last element in array.
 *
 * @param arr the array to pop value from.
 * @param popped when false the array is returned instead of value.
 */
// export function npop(arr: any[], popped: boolean = true): any {
//   const value = arr[arr.length - 1];
//   const _arr = nsplice(arr, 0, arr.length - 1);
//   // If shifted return the
//   // shifted/removed value.
//   if (popped)
//     return value;
//   return _arr;
// }
// /**
//  * N-Shift
//  * Shifts/removes first element in array.
//  *
//  * @param arr the array to shift value from.
//  * @param shifted when false the array is returned instead of value.
//  */
// export function nshift(arr: any[], shifted: boolean = true): any {
//   const value = arr[0];
//   const _arr = nsplice(arr, 0);
//   // If shifted return the
//   // shifted/removed value.
//   if (shifted)
//     return value;
//   return _arr;
// }
// /**
//  * N-Unshift
//  * Unshifts a value to an array in a non mutable way.
//  *
//  * @param arr the array to be unshifted.
//  * @param value the value to be unshifted
//  */
// export function nunshift(arr: any[], value: any): any[] {
//   return [value].concat(arr);
// }
// /**
//  * N-Push
//  * Non mutating way to push to an array.
//  *
//  * @param arr the array to push items to.
//  * @param items the items to be added.
//  */
// export function npush(arr: any[], ...items: any[]): any[] {
//   return arr.concat(items);
// }
// /**
//  * N-Splice
//  * Non mutating way of splicing an array.
//  *
//  * TODO: need to builds some tests on this
//  * not exactly [].splice behavior.
//  *
//  * @param arr the array to be spliced.
//  * @param start the starting index (default: 0)
//  * @param count the count to be spliced (default: 1)
//  * @param items additional items to be concatenated.
//  */
// export function nsplice(arr: any[], start?: number, count?: number, ...items: any[]): any[] {
//   start = start || 0;
//   count = items.length && !count ? arr.length : count;
//   let offset = start === 0 && count > 0 ? 1 : start;
//   return arr.slice(0, offset)
//     .concat(items)
//     .concat(arr.slice(start + 1, count));
// }
//////////////////////////////
// BROWSER
//////////////////////////////
/**
 * Detect Browser
 * Detects IE, Safari, Chrome, Opera, Firefox, Edge.
 */
// export function detectBrowser() {
//   // Return cached result if avalible, else get result then cache it.
//   if (detectBrowser.prototype.__cached__)
//     return detectBrowser.prototype.__cached__;
//   let _window: any = window;
//   let _document: any = document;
//   // Opera 8.0+
//   const isOpera = (!!_window.opr && !!opr.addons) || !!_window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
//   // Firefox 1.0+
//   const isFirefox = typeof InstallTrigger !== 'undefined';
//   // Safari 3.0+ "[object HTMLElementConstructor]"
//   const isSafari = /constructor/i.test(_window.HTMLElement) || (function (p) {
//     return p.toString() === '[object SafariRemoteNotification]';
//   })(!window['safari'] || safari.pushNotification);
//   // Internet Explorer 6-11
//   const isIE = /*@cc_on!@*/false || !!_document.documentMode;
//   // Edge 20+
//   const isEdge = !isIE && !!_window.StyleMedia;
//   // Chrome 1+
//   const isChrome = !!_window.chrome && !!_window.chrome.webstore;
//   // Blink engine detection
//   // var isBlink = (isChrome || isOpera) && !!window.CSS;
//   return detectBrowser.prototype.__cached__ =
//     isOpera ? 'Opera' :
//       isFirefox ? 'Firefox' :
//         isSafari ? 'Safari' :
//           isChrome ? 'Chrome' :
//             isIE ? 'IE' :
//               isEdge ? 'Edge' :
//                 'Unknown';
// }
//# sourceMappingURL=utils.js.map