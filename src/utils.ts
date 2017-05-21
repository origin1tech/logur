
import { ITimestamps, IError, IMetadata, ILogur, Constructor, PadStrategy, IParsedPath, ILogurOutput, ILevel, Serializer, ISerializers, ILogurOutputMapped } from './interfaces';
import * as _clone from 'lodash.clonedeep';
import * as env from './env';
import * as colors from './colorize';

let util, statSync, parse, EOL;

if (!process.env.BROWSER) {
  // chalk = require('chalk');
  util = require('util');
  parse = require('path').parse;
  statSync = require('fs').statSync;
  EOL = require('os').EOL;
}
else {
  EOL = '\n';
}

declare var v8debug;
declare var InstallTrigger;
declare var safari;
declare var opr;
declare var performance;

///////////////////////////////
// COMMON UTILS
///////////////////////////////

const toString = Object.prototype.toString;

/**
 * Noop
 */
export const noop = () => { };

/**
 * Is Function
 * Check if object provided is function.
 *
 * @param obj - test object provided is function.
 */
export function isFunction(obj: any): boolean {
  if (isUndefined(obj))
    return false;
  return typeof obj === 'function';
}

/**
 * Is String
 * Inspect value provided testing if is string.
 * @param obj the value to be tested.
 */
export function isString(obj: any): boolean {
  if (isUndefined(obj))
    return false;
  return typeof obj === 'string' || obj instanceof String;
}

/**
 * Is Empty
 * Test if value provided is empty.
 *
 * @param obj value to be inspected.
 */
export function isEmpty(obj: any): boolean {
  return obj === undefined ||
    obj === null ||
    obj === {} ||
    keys(obj).length > 0 ||
    obj === '';
}

/**
 * Is Array
 * Check if value is an array.
 *
 * @param obj the object to test as array.
 */
export function isArray(obj: any): boolean {
  if (Array.isArray)
    return Array.isArray(obj);
  return toString.call(obj) === '[object Array]';
}

/**
 * Is Boolean
 *
 * @param obj
 */
export function isBoolean(obj: any): boolean {
  if (isUndefined(obj))
    return false;
  return typeof obj === 'boolean';
}

/**
 * Is Null
 * Checks if value is null.
 *
 * @param obj the object to inspect for null.
 */
export function isNull(obj: any): boolean {
  return obj === null;
}

/**
 * Check if is not a number.
 * @param obj value to tests if not is a number.
 */
export function isNan(obj: any): boolean {
  if (isUndefined(obj))
    return true;
  return isNaN(obj);
}

/**
 * Is Object
 * Checks if value is an object.
 *
 * @param obj the object to inspect.
 */
export function isObject(obj: any): boolean {
  if (isUndefined(obj) || isNull(obj))
    return false;
  return typeof obj === 'object' || typeof obj === 'function';
}

/**
 * Is Error
 * Checks if value is an error.
 *
 * @param obj the value/object to be inspected.
 */
export function isError(obj: any): boolean {
  if (isUndefined(obj) || isNull(obj))
    return false;
  const type = toString.call(obj).toLowerCase();
  // NOTE __exception__ is a custom property
  // used to denoted an object literal as
  // an error.
  return type === '[object error]' || type === '[object domexception]' || obj.__exception__;
}

/**
 * Is Reg Expression
 * Tests if object is regular expression.
 */
export function isRegExp(obj: any): boolean {
  return (obj instanceof RegExp);
}

/**
 * Is Date
 * Parses value inspecting if is Date.
 *
 * @param obj the value to inspect/test if is Date.
 * @param parse when True parsing is allowed to parse/check if string is Date.
 */
export function isDate(obj: any, parse?: boolean): boolean {

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

/**
 * Is Undefined
 * Tests if value is undefined.
 *
 * @param val the value to inspect
 */
export function isUndefined(val: any) {
  return (typeof val === 'undefined');
}

/**
 * Is Plain Object
 * Inspects value checking if is object literal.
 *
 * @param val the value to inspect
 */
export function isPlainObject(val: any) {
  if (isUndefined(val))
    return false;
  return val ? val.constructor === {}.constructor : false;
}

/**
 * Check if value provided is number.
 * @param obj the value to be tested.
 */
export function isNumber(obj: any): boolean {
  return !isNaN(parseFloat(obj)) && isFinite(obj);
}

/**
 * Is Instance
 * Tests if object is instanceof provided Type.
 *
 * @param obj the object to check.
 * @param Type the instance type to match.
 */
export function isInstance(obj: any, Type: any): boolean {
  return obj instanceof Type;
}

/**
 * Is Unique
 * Tests if the value is unique in the collection.
 *
 * @param obj the object to be inspected.
 * @param value the value to be matched.
 */
export function isUnique(arr: any[], value: any): boolean {

  return duplicates(arr, value, true) === 0;

}

/**
 * Is Node
 * Tests if is NodeJS.
 */
export function isNode() {
  if (typeof module !== 'undefined' && module.exports)
    return true;
  return false;
}

/**
 * Is Browser
 * Tests if running in browser.
 */
export function isBrowser() {
  return (typeof window !== 'undefined' && window.document);
}

/**
 * Indicates if app is in debug mode.
 * @param debugging a manual flag to denote debugging.
 */
export function isDebug(debugging?: boolean) {

  // If manually passed just return.
  if (debugging)
    return true;

  const eargv = process && process.execArgv;

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

/**
 * Is Equal
 * Tests if two values are equal.
 * Does not support "deep equal".
 *
 * @param value the value to be compared.
 * @param compare the comparer value.
 * @param loose when true == is used instead of ===.
 */
export function isEqual(value: any, compare: any, loose?: boolean): boolean {
  if (!loose)
    return value === compare;
  return value == compare;
}

/**
 * Duplicates
 * Counts the number of duplicates in an array.
 *
 * @param arr the array to check for duplicates.
 * @param value the value to match.
 * @param breakable when true allows breaking at first duplicate.
 */
export function duplicates(arr: any[], value: any, breakable?: boolean): number {

  let i = arr.length;
  let dupes = 0;

  while (i--) {
    if (breakable && dupes > 1)
      break;
    if (isEqual(arr[i], value))
      dupes += 1;
  }

  dupes -= 1;

  return dupes < 0 ? 0 : dupes;

}

/**
 * Contains
 * Tests if array contains value.
 *
 * @param arr the array to be inspected.
 * @param value the value to check if is contained in array.
 */
export function contains(arr: any[], value: any): boolean {
  arr = arr || [];
  return arr.filter((v) => {
    return isEqual(v, value);
  }).length > 0;
}

/**
 * Contains Any
 * Tests array check if contains value.
 *
 * @param arr the array to be inspected.
 * @param compare - array of values to compare.
 */
export function containsAny(arr: any[], compare: any[]): boolean {
  if (!isArray(arr) || !isArray(compare))
    return false;
  return compare.filter(c => {
    return contains(arr, c);
  }).length > 0;
}

/**
 * Keys
 * Takes an object then returns keys in array.
 *
 * @param obj the object to parse keys.
 */
export function keys(obj: any): string[] {
  if (!isPlainObject(obj))
    return [];
  return Object.keys(obj);
}

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
export function extend<T>(obj: any, ...args: any[]): T {

  let deep = false;
  let target: any;

  // If deep is first set
  // deep property and grab
  // first element in args.
  if (isBoolean(obj)) {
    deep = obj;
    if (!args.length)
      return {} as T;
    obj = args.shift();
  }

  // if no result set to obj.
  !target ? target = obj : args.unshift(obj);

  // Rather than return the orig value
  // if not an object just return empty
  // object to prevent errors etc.
  if (!isObject(target))
    return {} as T;

  for (let i = 0, source: any; source = args[i]; i++) {

    // If not an object return.
    if (!isObject(source))
      return;

    for (let name in source) {
      if (source.hasOwnProperty(name)) {

        let to = target[name];
        let from = source[name];
        let _isPlainObject = isPlainObject(from);
        let _isArray = isArray(from);

        if (deep && (_isPlainObject || _isArray)) {
          let _clone: any;
          if (_isArray)
            _clone = to && isArray(to) ? to : [];
          else
            _clone = to && isPlainObject(to) ? to : {};
          target[name] = extend(deep, _clone, from);
        }
        else if (!isUndefined(from)) {
          target[name] = from;
        }

      }
    }

  }

  return target;
}

/**
 * Flatten
 * Takes multiple arrays and flattens to single array.
 * NOTE: this will NOT work for empty nested arrays
 * but will work for 90 plus % of cases.
 *
 * @param args rest param containing multiple arrays to flatten.
 */
export function flatten(args: any[]): any[] {
  return [].concat.apply([], args);
}

/**
 * Clone
 * Performs deep cloning of objects, arrays
 * numbers, strings, maps, promises etc..
 *
 * @param obj object to be cloned.
 */
export function clone<T>(obj: any): T {
  return _clone(obj);
}

/**
 * First
 * Simple method to get first element just
 * a little less typing.
 *
 * @param arr the array to get first element from.
 */
export function first(arr: any[]): any {
  return arr[0];
}

/**
 * Last
 * Simple method to get last element.
 *
 * @param arr the array to get last element.
 */
export function last(arr: any[]): any {
  return arr[arr.length - 1];
}

/**
 * Tick Then
 * Wraps function with process.nextTick or setTimeout
 * then immediately calls function after tick.
 */
export function tickThen(ctx: Object | Function, fn: Function, ...args: any[]): void {

  const ticker = isNode() ? process.nextTick : setTimeout;

  if (isFunction(ctx)) {
    fn = <Function>ctx;
    ctx = null;
  }

  ticker(() => {
    fn.apply(ctx, args);
  });

}

export function tickUntil(ctx: Object | Function, until: Function, done: Function, progress: Function): void {

  const ticker = isNode() ? process.nextTick : setTimeout;

  if (isFunction(ctx)) {
    progress = done;
    done = until;
    until = <Function>ctx;
    ctx = null;
  }

  const tick = () => {
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

/**
 * Match Index
 *
 * @param prop the property to match.
 */
export function matchIndex(prop) {
  const match = new RegExp('(.+)\\[([0-9]*)\\]', 'i').exec(prop);
  if (match && match.length === 3)
    return { name: match[1], index: match[2] };
  return false;
}

/**
 * Split
 * Splits a string at character.
 * Default possible chars to match: ['/', '.', ',', '|']
 *
 * @param str the string to be split.
 * @param char the character to split at.
 */
export function split(str: string | string[], char?: string): string[] {

  if (isArray(str))
    return str as string[];

  // default characters.
  let defChars = ['/', '.', ',', '|'];
  let arr;

  // if no char iterate defaults.
  if (!char) {
    while (!char && defChars.length) {
      const tmpChar = defChars.shift();
      const exp = new RegExp(tmpChar, 'g');
      if (exp.test(str as string))
        char = tmpChar;
    }
  }

  // Set the default arr.
  let tmp = str as string;
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

/**
 * Del
 * Deletes keys in an object.
 *
 * @param obj the object whose keys should be deleted.
 * @param props the property keys that should be deleted.
 */
export function del(obj: any, key: string | string[]): any {

  if (arguments.length !== 2 || (!isArray(key) && !isString(key)))
    return obj;

  const props: string[] = split(key);
  const prop = props.shift();
  const match = matchIndex(prop);

  let next = obj[prop];

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

/**
 * Get
 * Gets a property within the supplied object.
 *
 * @param obj the object to inspect.
 * @param prop
 */
export function get(obj: any, key: string | string[]) {

  if (arguments.length !== 2 || (!isArray(key) && !isString(key)))
    return obj;

  let _clone = clone(obj);
  let props: string[] = split(key);

  while (props.length && _clone) {

    let prop = props.shift(),
      match;

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

/**
 * Set
 * Sets a value on an object using dot notation or url path.
 *
 * @param obj the object to set the value on.
 * @param key the property used for setting the value.
 * @param value the value used for updating the property.
 * @param dynamic when NOT false objects are dynamically created if required.
 */
export function set(obj: any, key: string | string[], value: any, dynamic?: boolean) {

  if (arguments.length !== 3 || (!isArray(key) && !isString(key)))
    return obj;

  let props: string[] = split(key);

  if (isUndefined(value) && dynamic !== false)
    value = {};

  const prop = props.shift();
  const match = matchIndex(prop);
  let next = obj[prop];

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

/**
 * UUID
 * Generates a UUID.
 */
export function uuid() {

  let d = Date.now();

  // Use high perf timer if avail.
  if (typeof performance !== 'undefined' && isFunction(performance.now))
    d += performance.now();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

}

/**
 * Pad Left
 * Pads a string on the left.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export function padLeft(str: string, len: number, char?: string | number, offset?: number): string {

  if (isNumber(char)) {
    offset = char as number;
    char = undefined;
  }

  char = char || ' ';
  let pad = '';
  while (len--) {
    pad += char;
  }
  if (offset)
    return padLeft('', offset, char) + pad + str;
  return pad + str;
}

/**
 * Pad Right
 * Pads a string to the right.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export function padRight(str: string, len: number, char?: string | number, offset?: number): string {

  if (isNumber(char)) {
    offset = char as number;
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

/**
 * Pad Values
 *
 * @param values the values to be padded.
 * @param dir the direction to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export function padValues(values: string[], strategy?: PadStrategy, char?: string | number, offset?: number): string[] {

  if (isNumber(char)) {
    offset = char as number;
    char = undefined;
  }

  // do nothing.
  if (strategy === 'none')
    return values;

  let len = 0;
  strategy = strategy || 'right';
  char = char || ' ';

  const func = strategy === 'right' ? padRight : padLeft;

  values.forEach((item) => {
    if (item.length > len)
      len = item.length;
  });

  if (offset) len += offset;

  values.forEach((item, i) => {
    if (item.length < len)
      values[i] = func(item, len - item.length, char);
  });

  return values;

}

/**
 * Get Type
 * Gets the type of an object.
 *
 * @param obj the object to get type from.
 * @param stringToDate when true parses strings to see if they are dates.
 * @param unknown the string name for unknown types.
 */
export function getType(obj: any, stringToDate?: boolean | string, unknown?: string): any {

  const type = typeof obj;

  if (isString(stringToDate)) {
    unknown = <string>stringToDate;
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

/**
 * Try Parse Date
 * Attempts to parse a date from a string.
 *
 * @param str the string to attempt parsing on.
 */
export function tryParseDate(str: string): string | number {
  try {
    const d = Date.parse(str);
    if ((d + '') !== 'Invalid Date' && !isNaN(d))
      return d;
    return str;
  } catch (ex) {
    return str;
  }
}

///////////////////////////////
// LIBRARY UTILS
///////////////////////////////

/**
 * Parse Path
 * Universal method to parse a file path or url.
 *
 * @param path the file path or url to parse.
 */
export function parsePath(path: string): IParsedPath {
  if (parse) {
    return parse(path);
  }
  else {
    const exp = /\.[0-9a-z]{2,5}$/i;
    const ext = exp.exec(path);
    // Can't parse not a file.
    if (!ext)
      return <IParsedPath>{};
    let idx = path.lastIndexOf('/');
    idx = idx >= 0 ? idx += 1 : 0;
    const basename = path.slice(idx);
    const split = basename.split('.');
    return {
      base: basename,
      ext: '.' + split[1],
      name: split[0]
    };
  }
}

/**
 * Timestamp
 * Generates multiple timestamp formats.
 */
export function timestamp(date?: string | number): ITimestamps {

  let epoch: number = isNumber(date) ? <number>date : Date.now();

  if (isString(date)) {
    const d: number = <number>tryParseDate(<string>date);
    if (isNumber(date))
      epoch = <number>date;
  }

  function pad(val) {
    val += '';
    if (val.length < 2)
      val = 0 + val;
    return val;
  }

  function genDate(yr?, mo?, dt?, delim?) {
    delim = delim || '-';
    const arr = [];
    if (yr) arr.push(yr);
    if (mo) arr.push(pad(mo));
    if (dt) arr.push(pad(dt));
    return arr.join(delim);
  }

  function genTime(hr?, min?, sec?, ms?, delim?) {
    delim = delim || ':';
    const arr = [];
    if (hr) arr.push(pad(hr));
    if (min) arr.push(pad(min));
    if (sec) arr.push(pad(sec));
    if (ms) arr.push(pad(ms));
    return arr.join(delim);
  }

  const dt = new Date(epoch);
  const iso = dt.toISOString();

  // local date.
  const lyr = dt.getFullYear();
  const lmo = dt.getMonth() + 1;
  const ldt = dt.getDate();

  // utc date
  const uyr = dt.getUTCFullYear();
  const umo = dt.getUTCMonth(); + 1;
  const udt = dt.getUTCDate();

  // local time
  const lhr = dt.getHours();
  const lmin = dt.getMinutes();
  const lsec = dt.getSeconds();
  const lms = dt.getMilliseconds();

  // utc time
  const uhr = dt.getUTCHours();
  const umin = dt.getUTCMinutes();
  const usec = dt.getUTCSeconds();
  const ums = dt.getUTCMilliseconds();

  const localDate = genDate(lyr, lmo, ldt, '-');
  const localTime = genTime(lhr, lmin, lsec, lms, ':');

  const utcDate = genDate(uyr, umo, udt, '-');
  const utcTime = genTime(uhr, umin, usec, ums, ':');
  const local = localDate + ' ' + localTime;
  const utc = utcDate + ' ' + utcTime;

  const obj: ITimestamps = {
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

/**
 * Bytes To Size
 * Converts bytes to normalized size.
 *
 * @param bytes the bytes to normalize
 * @param decimals the number of decimal places.
 */
export function bytesToSize(bytes: number, decimals?: number): { size: number, fixedzero: number, raw: number, type: string, text: string, index: number } {

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

  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const floated = parseFloat(bytes / Math.pow(k, i) + '');
  const fixedzero = parseFloat(floated.toFixed(0));
  const placed = parseFloat(floated.toFixed(decimals));

  return {
    size: placed,
    fixedzero: fixedzero,
    raw: floated,
    type: sizes[i],
    text: `${placed} ${sizes[i]}`,
    index: i
  };

}

/**
 * Check Stat
 * Using stat check if file too large.
 *
 * @param filename the file name to stat.
 */
export function checkStat(filename) {

  const stats = statSync(filename);
  const normalized = bytesToSize(stats.size, 0);

  if (normalized.index > 2)
    return false;

  if (normalized.index === 2 && normalized.fixedzero >= 2)
    return false;

  return true;

}

/**
 * Intersect
 * Intersects two types.
 *
 * @param first first type.
 * @param second second type.
 */
export function intersect<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in first) {
    (<any>result)[id] = (<any>first)[id];
  }
  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      (<any>result)[id] = (<any>second)[id];
    }
  }
  return result;
}

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
export function activate<T>(Type: Constructor<T>, ...args: any[]): T {
  let ctor: T = Object.create(Type.prototype);
  Type.apply(ctor, args);
  return ctor;
}

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
export function ministack(options: any, output: ILogurOutput): string {

  const _colorize = options.colorize && isNode() ? true : false;

  // Check if ministack should be applied.
  if (output.stacktrace && output.stacktrace.length) {

    const stack = output.stacktrace[0];
    const parsed = parsePath(stack.path);

    // Handle ministack but don't display if
    // msg is an error as it would be redundant.
    if (options.ministack && stack && parsed && parsed.base) {

      // Compile the mini stacktrace string.
      let mini = `(${parsed.base}:${stack.line}:${stack.column})`;

      if (_colorize) {
        const clr: string = options.colormap && options.colormap.ministack ? options.colormap.ministack : 'gray';
        mini = colorize(mini, clr);
      }

      return mini;

    }

  }

  return '';

}

/**
 * Format By Type
 * Inspects the type then colorizes.
 *
 * @param obj the value to inspect for colorization.
 * @param options the Transport options object.
 * @param output the Logur Output object.
 */
export function formatByType(key: string, obj: any, options: any, output: ILogurOutput): any {

  let pretty = options.pretty && isNode();
  let canColorize = options.colorize && isNode();
  let colorMap = options.colormap;
  const EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';

  // If util extend with styles
  // from node util.inspect.styles.
  if (util)
    colorMap = extend({}, util.inspect.styles, colorMap);


  // Get the value's type.
  const type = getType(obj, true, 'special');

  function getStyle(t) {
    if (!canColorize) return false;
    return colorMap[key] || colorMap[t];
  }

  function plainPrint(o) {

    let result = '';

    if (isArray(o)) {

      o.forEach((item, i) => {

        const t = getType(item, true, 'special');

        if (t === 'object' || t === 'array') {

          result += plainPrint(item);

        }

        else {

          if (t === 'function') {
            const name = item.name || 'fn';
            item = `[Function: ${name}]`;
          }

          const style = getStyle(t);

          if (style)
            result += (`${i}=${colorize(item, style)}, `);
          else
            result += (`${i}=${item}, `);

        }

      });

    }

    else {

      for (let prop in o) {

        let item = o[prop];

        const t = getType(item, true, 'special');

        if (t === 'array' || t === 'object') {

          result += plainPrint(item);

        }
        else {

          if (t === 'function') {
            const name = item.name || 'fn';
            item = `[Function: ${name}]`;
          }

          const style = getStyle(t);

          if (canColorize)
            result += (`${prop}=${colorize(item, style)}, `);
          else
            result += (`${prop}=${item}, `);

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
    let tmp = obj.message || 'unknown error.';

    const style = getStyle(type);

    // colorize if enabled.
    if (style)
      tmp = colorize(tmp, style);

    if (!obj.stack)
      return { normalized: tmp };

    const stack = obj.stack.split(EOL).slice(1);

    // If pretty stacktrace use util.inspect.
    if (options.prettystack) {
      return { normalized: tmp, append: EOL + util.inspect({ name: obj.name || 'Error', message: obj.message || 'Unknown error', stack: env.stacktrace(obj, 1) }, true, null, canColorize) };
    }

    // Check if fullstack should be shown.
    else {
      return { normalized: tmp, append: EOL + stack.join(EOL) };
    }

  }

  // Handle and objects/array.
  else if (type === 'object' || type === 'array') {
    if (options.pretty) {
      return {
        append: EOL + util.inspect(obj, true, null, canColorize)
      };
    }
    return { normalized: plainPrint(obj) };
  }

  // Handle simple value.
  else {
    const style = getStyle(type);

    if (!style)
      return { normalized: obj };
    return { normalized: colorize(obj, style) };
  }

}

/**
 * To Mapped
 * Normalizes data for output to array or object.
 *
 * @param options the calling Transport's options.
 * @param output the generated Logur output.
 */
export function toMapped<T>(options: any, output: ILogurOutput): ILogurOutputMapped<T> {

  // Get list of levels we'll use this for padding.
  const levels = keys(options.levels);
  const EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';
  const ignored = ['callback'];
  const metaIndex = options.map.indexOf('metadata');
  const metaLast = options.map.length - 1 === metaIndex;

  // Metadata must be last index in map.
  if (metaIndex !== -1 && !metaLast) {
    options.map.splice(metaIndex, 1);
    options.map.push('metadta');
  }

  // Var for resulting output array, object or json.
  let arr = [], obj = {}, appended = [];

  // Reference the logged level.
  let level = output.level;

  // Get the level's config object.
  const levelObj: ILevel = options.levels[level];

  // Flag if we should colorize.
  const colors = options.colorize && isNode() ? true : false;

  // Iterate the map and build the object.
  output.map.forEach((k) => {

    // ignored prop.
    if (ignored.indexOf(k) !== -1)
      return;

    let value = get(output, k);

    if (isUndefined(value))
      return;

    const serializer: Serializer = output.serializers[k];

    // If a serializer exists call and get value.
    if (serializer)
      value = serializer(value, output, options);

    // Add value to object.
    obj[k] = value;

    // Handled untyped array.
    if (k === 'untyped' && output.untyped) {

      value.forEach((u) => {
        const result = formatByType(k, u, options, output);
        if (result) {
          if (!isUndefined(result.normalized))
            arr.push(result.normalized);
          if (!isUndefined(result.append))
            appended.push(result.append);
        }
      });

    }

    // Handle named properties.
    else {
      const result = formatByType(k, value, options, output);
      if (result) {
        arr.push(result.normalized);
        if (!isUndefined(result.append))
          appended.push(result.append);
      }
    }


  });

  // Get level index in map.
  const lvlIdx = options.map.indexOf('level');

  // If index is valid check if should pad and colorize.
  if (lvlIdx !== -1) {

    let tmpLevel = level.trim();

    // If padding pad the level.
    if (options.padding) {
      const idx = levels.indexOf(level);
      if (idx !== -1) {
        const padded = padValues(<string[]>levels, options.padding);
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
    const mini = ministack(options, output);
    obj['ministack'] = mini;
    arr.push(mini);
  }

  arr = arr.concat(appended);

  return {
    array: arr,
    object: obj as T,
    json: JSON.stringify(obj)
  };

}

///////////////////////////////
// COLORIZATION
///////////////////////////////

/**
 * Colorize
 * Applies color styles to value.
 *
 * @param str the value to be colorized.
 * @param style the ansi style or styles to be applied.
 */
export function colorize(str: any, style: string | string[]) {
  return colors.style(str, style);
}

/**
 * Strip Colors
 * Strips ansi colors from value.
 *
 * @param str the value to be stripped of color.
 */
export function stripColors(str: any) {
  return colors.strip(str);
}
