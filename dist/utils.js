"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _clone = require("lodash.clonedeep");
var env = require("./env");
var colors = require("./colorize");
var util, parse, eol;
if (!process.env.BROWSER) {
    util = require('util');
    parse = require('path').parse;
    eol = require('os').EOL;
}
else {
    eol = '\n';
}
///////////////////////////////
// COMMON UTILS
///////////////////////////////
var toString = Object.prototype.toString;
/**
 * EOL
 * Line ending constant.
 */
exports.EOL = eol;
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
    // used to denoted an object literal as
    // an error.
    return type === '[object error]' || type === '[object domexception]' || obj.__exception__;
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
                    var _clone_1 = void 0;
                    if (_isArray)
                        _clone_1 = to && isArray(to) ? to : [];
                    else
                        _clone_1 = to && isPlainObject(to) ? to : {};
                    target[name_1] = extend(deep, _clone_1, from);
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
 */
function clone(obj) {
    return _clone(obj);
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
 * Tick Then
 * Wraps function with process.nextTick or setTimeout
 * then immediately calls function after tick.
 */
function tickThen(ctx, fn) {
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
}
exports.tickThen = tickThen;
function tickUntil(ctx, until, done, progress) {
    var ticker = isNode() ? process.nextTick : setTimeout;
    if (isFunction(ctx)) {
        progress = done;
        done = until;
        until = ctx;
        ctx = null;
    }
    var tick = function () {
        if (progress)
            progress();
        if (!until())
            done();
        else
            ticker(tick);
    };
    // Bind the context.
    tick.bind(ctx);
    // Start the ticker.
    tick();
}
exports.tickUntil = tickUntil;
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
    function pad(val) {
        val += '';
        if (val.length < 2)
            val = 0 + val;
        return val;
    }
    function genDate(yr, mo, dt, delim) {
        delim = delim || '-';
        var arr = [];
        if (yr)
            arr.push(yr);
        if (mo)
            arr.push(pad(mo));
        if (dt)
            arr.push(pad(dt));
        return arr.join(delim);
    }
    function genTime(hr, min, sec, ms, delim) {
        delim = delim || ':';
        var arr = [];
        if (hr)
            arr.push(pad(hr));
        if (min)
            arr.push(pad(min));
        if (sec)
            arr.push(pad(sec));
        if (ms)
            arr.push(pad(ms));
        return arr.join(delim);
    }
    var dt = new Date(epoch);
    var iso = dt.toISOString();
    // local date.
    var lyr = dt.getFullYear();
    var lmo = dt.getMonth() + 1;
    var ldt = dt.getDate();
    // utc date
    var uyr = dt.getUTCFullYear();
    var umo = dt.getUTCMonth();
    +1;
    var udt = dt.getUTCDate();
    // local time
    var lhr = dt.getHours();
    var lmin = dt.getMinutes();
    var lsec = dt.getSeconds();
    var lms = dt.getMilliseconds();
    // utc time
    var uhr = dt.getUTCHours();
    var umin = dt.getUTCMinutes();
    var usec = dt.getUTCSeconds();
    var ums = dt.getUTCMilliseconds();
    var localDate = genDate(lyr, lmo, ldt, '-');
    var localTime = genTime(lhr, lmin, lsec, lms, ':');
    var utcDate = genDate(uyr, umo, udt, '-');
    var utcTime = genTime(uhr, umin, usec, ums, ':');
    var local = localDate + ' ' + localTime;
    var utc = utcDate + ' ' + utcTime;
    var obj = {
        epoch: epoch,
        date: dt,
        iso: iso,
        local: local,
        utc: utc,
        localdate: localDate,
        localtime: localTime,
        utcdate: utcDate,
        utctime: utcTime
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
/**
 * Mixin
 * Mixin implemented objects.
 *
 * @param derivedCtor the derived ctor.
 * @param baseCtors the base ctor.
 */
function mixin(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}
exports.mixin = mixin;
/**
 * Async Each
 * Itearate functions with callbacks asynchronously.
 *
 * @param funcs the functions to call whose signature contains a callback.
 * @param fn
 */
function asyncEach(funcs, fn) {
    var ctr = 0;
    function exit() {
        ctr++;
        if (ctr === funcs.length)
            fn();
    }
    funcs.forEach(function (el, i) {
        el(exit);
    });
}
exports.asyncEach = asyncEach;
/**
 * Normalize Query
 * Ensures default values witing IQuery object.
 *
 * @param q the query object to normalize.
 */
function normalizeQuery(q) {
    q.fields = q.fields || [];
    q.skip = q.skip || 0;
    q.take = q.take || 0;
    q.order = q.order || 'asc';
    if (isString(q.from))
        q.from = new Date(q.from);
    if (isString(q.to))
        q.to = new Date(q.to);
    return q;
}
exports.normalizeQuery = normalizeQuery;
/**
 * Parse Line
 * Parses a queried log line from string or JSON.
 *
 * @param line the log line to be parsed.
 * @param options the transport options object.
 */
function parseLine(line, options) {
    options = options || {};
    // If JSON just parse and return.
    if (options.json)
        return JSON.parse(line);
    // If delimiter split string and map
    // back using options.map.
    if (options.delimiter) {
        var obj_1 = {};
        var split_2 = line.split(options.delimiter);
        // map line to object.
        options.map.forEach(function (prop, i) {
            obj_1[prop] = split_2[i];
        });
        return obj_1;
    }
    else {
        return line;
    }
}
exports.parseLine = parseLine;
/**
 * Map Parsed
 * Generates object using parsed line result
 * mapping using requested fields in query.
 *
 * @param fields the fields to be returned.
 * @param obj the object from par
 */
function mapParsed(fields, obj) {
    if (!fields.length)
        return obj;
    var tmp = {};
    fields.forEach(function (f) {
        var val = get(obj, f);
        if (!isUndefined(val))
            set(obj, f, val);
    });
    return tmp;
}
exports.mapParsed = mapParsed;
///////////////////////////////
// OUTPUT MAPPING
///////////////////////////////
/**
 * Ministack
 * Generates a mini stacktrace of the calling
 * line, col etc.
 *
 * @param options the Logur Transport options.
 * @param output the generated Logur Output object.
 */
function ministack(options, output) {
    var _colorize = options.colorize && isNode() ? true : false;
    // Check if ministack should be applied.
    if (output.stacktrace && output.stacktrace.length) {
        var stack = output.stacktrace[0];
        var parsed = parsePath(stack.path);
        // Handle ministack but don't display if
        // msg is an error as it would be redundant.
        if (options.ministack && stack && parsed && parsed.base) {
            // Compile the mini stacktrace string.
            var mini = "(" + parsed.base + ":" + stack.line + ":" + stack.column + ")";
            if (_colorize) {
                var clr = options.colormap && options.colormap.ministack ? options.colormap.ministack : 'gray';
                mini = colorize(mini, clr);
            }
            return mini;
        }
    }
    return '';
}
exports.ministack = ministack;
/**
 * Format By Type
 * Inspects the type then colorizes.
 *
 * @param obj the value to inspect for colorization.
 * @param options the Transport options object.
 * @param output the Logur Output object.
 */
function formatByType(key, obj, options, output) {
    var pretty = options.pretty && isNode();
    var canColorize = options.colorize && isNode();
    var colorMap = options.colormap;
    // If util extend with styles
    // from node util.inspect.styles.
    if (util)
        colorMap = extend({}, util.inspect.styles, colorMap);
    // Get the value's type.
    var type = getType(obj, true, 'special');
    function getStyle(t) {
        if (!canColorize)
            return false;
        return colorMap[key] || colorMap[t];
    }
    function plainPrint(o) {
        var result = '';
        if (isArray(o)) {
            o.forEach(function (item, i) {
                var t = getType(item, true, 'special');
                if (t === 'object' || t === 'array') {
                    result += plainPrint(item);
                }
                else {
                    if (t === 'function') {
                        var name_2 = item.name || 'fn';
                        item = "[Function: " + name_2 + "]";
                    }
                    var style = getStyle(t);
                    if (style)
                        result += (i + "=" + colorize(item, style) + ", ");
                    else
                        result += (i + "=" + item + ", ");
                }
            });
        }
        else {
            for (var prop in o) {
                var item = o[prop];
                var t = getType(item, true, 'special');
                if (t === 'array' || t === 'object') {
                    result += plainPrint(item);
                }
                else {
                    if (t === 'function') {
                        var name_3 = item.name || 'fn';
                        item = "[Function: " + name_3 + "]";
                    }
                    var style = getStyle(t);
                    if (canColorize)
                        result += (prop + "=" + colorize(item, style) + ", ");
                    else
                        result += (prop + "=" + item + ", ");
                }
            }
        }
        result = result.replace(/, $/, '');
        return result;
    }
    // Handle error normalization.
    if (type === 'error') {
        // Otherwise normalize the error for output.
        // Create the error message.
        var tmp = obj.message || 'unknown error.';
        var style = getStyle(type);
        // colorize if enabled.
        if (style)
            tmp = colorize(tmp, style);
        if (!obj.stack)
            return { normalized: tmp };
        var stack = obj.stack.split(exports.EOL).slice(1);
        // If pretty stacktrace use util.inspect.
        if (options.prettystack) {
            if (options.pretty)
                return { normalized: tmp, append: exports.EOL + util.inspect({ name: obj.name || 'Error', message: obj.message || 'Unknown error', stack: env.stacktrace(obj, 1) }, true, null, canColorize) };
            return { normalized: tmp + exports.EOL + util.inspect({ name: obj.name || 'Error', message: obj.message || 'Unknown error', stack: env.stacktrace(obj, 1) }, true, null, canColorize) };
        }
        else {
            if (options.pretty)
                return { normalized: tmp, append: exports.EOL + stack.join(exports.EOL) };
            return { normalized: tmp + exports.EOL + stack.join(exports.EOL) };
        }
    }
    else if (type === 'object' || type === 'array') {
        if (options.pretty) {
            return {
                append: exports.EOL + util.inspect(obj, true, null, canColorize)
            };
        }
        return { normalized: plainPrint(obj) };
    }
    else {
        var style = getStyle(type);
        if (!style)
            return { normalized: obj };
        return { normalized: colorize(obj, style) };
    }
}
exports.formatByType = formatByType;
/**
 * To Mapped
 * Normalizes data for output to array or object.
 *
 * @param options the calling Transport's options.
 * @param output the generated Logur output.
 */
function toMapped(options, output) {
    // Get list of levels we'll use this for padding.
    var levels = keys(options.levels);
    var ignored = ['callback'];
    var map = options.map.slice(0);
    var metaIndex = map.indexOf('metadata');
    var metaLast = map.length - 1 === metaIndex;
    // Metadata must be last index in map.
    if (metaIndex !== -1 && !metaLast) {
        map.splice(metaIndex, 1);
        map.push('metadta');
    }
    // Var for resulting output array, object or json.
    var arr = [], obj = {}, appended = [], untyped = [];
    // Reference the logged level.
    var level = output.level;
    // Get the level's config object.
    var levelObj = options.levels[level];
    // Flag if we should colorize.
    var colors = options.colorize && isNode() ? true : false;
    // add untyped to mapped.
    map.push('untyped');
    // Iterate the map and build the object.
    // TODO: too repetitive need to clean this up.
    map.forEach(function (k) {
        // ignored prop.
        if (ignored.indexOf(k) !== -1)
            return;
        var value = get(output, k);
        if (isUndefined(value))
            return;
        var serializer = output.serializers[k];
        // If a serializer exists call and get value.
        if (serializer)
            value = serializer(value, output, options);
        if (isUndefined(value))
            return;
        if (k === 'untyped') {
            if (isArray(value)) {
                value.forEach(function (u) {
                    var result = formatByType(k, u, options, output);
                    if (result) {
                        if (!isUndefined(result.normalized))
                            untyped.push(result.normalized);
                        if (!isUndefined(result.append))
                            appended.push(result.append);
                    }
                });
            }
            else {
                var result = formatByType(k, value, options, output);
                if (result) {
                    if (!isUndefined(result.normalized))
                        untyped.push(result.normalized);
                    if (!isUndefined(result.append))
                        appended.push(result.append);
                }
            }
        }
        else {
            var result = formatByType(k, value, options, output);
            if (result) {
                if (!isUndefined(result.normalized))
                    arr.push(result.normalized);
                if (!isUndefined(result.append))
                    appended.push(result.append);
            }
            obj[k] = value;
        }
    });
    // Get level index in map.
    var lvlIdx = map.indexOf('level');
    // If index is valid check if should pad and colorize.
    if (lvlIdx !== -1) {
        var tmpLevel = level.trim();
        // If padding pad the level.
        if (options.padding) {
            var idx = levels.indexOf(level);
            if (idx !== -1) {
                var padded = padValues(levels, options.padding);
                tmpLevel = padded[idx];
            }
        }
        if (colors)
            tmpLevel = colorize(tmpLevel, levelObj.color);
        if (options.padding)
            tmpLevel += ':';
        arr[lvlIdx] = tmpLevel;
    }
    // Check if should append with ministack.
    if (options.ministack) {
        var mini = ministack(options, output);
        obj['ministack'] = mini;
        arr.push(mini);
    }
    // Add untyped to message now
    // that it has been formatted.
    var msgIdx = options.map.indexOf('message');
    if (untyped && untyped.length)
        arr[msgIdx] += ' ' + untyped.join(' ');
    arr = arr.concat(appended);
    return {
        array: arr,
        object: obj,
        json: JSON.stringify(obj),
        raw: output
    };
}
exports.toMapped = toMapped;
///////////////////////////////
// COLORIZATION
///////////////////////////////
/**
 * Colorize
 * Applies color styles to value.
 *
 * @param obj the value to be colorized.
 * @param style the ansi style or styles to be applied.
 */
function colorize(obj, style) {
    try {
        return colors.style(obj, style);
    }
    catch (ex) {
        console.log(ex);
        return obj;
    }
}
exports.colorize = colorize;
/**
 * Strip Colors
 * Strips ansi colors from value.
 *
 * @param obj the value to be stripped of color.
 */
function stripColors(obj) {
    try {
        return colors.strip(obj);
    }
    catch (ex) {
        console.log(ex);
        return obj;
    }
}
exports.stripColors = stripColors;
//# sourceMappingURL=utils.js.map