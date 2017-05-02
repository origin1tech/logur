import { ITimestamps, IMetadata, Constructor, PadStrategy } from './interfaces';
/**
 * Noop
 */
export declare const noop: () => void;
/**
 * Is Function
 * Check if object provided is function.
 *
 * @param obj - test object provided is function.
 */
export declare function isFunction(obj: any): boolean;
/**
 * Is String
 * Inspect value provided testing if is string.
 * @param obj the value to be tested.
 */
export declare function isString(obj: any): boolean;
/**
 * Is Empty
 * Test if value provided is empty.
 *
 * @param obj value to be inspected.
 */
export declare function isEmpty(obj: any): boolean;
/**
 * Is Array
 * Check if value is an array.
 *
 * @param obj the object to test as array.
 */
export declare function isArray(obj: any): boolean;
/**
 * Is Boolean
 *
 * @param obj
 */
export declare function isBoolean(obj: any): boolean;
/**
 * Is Null
 * Checks if value is null.
 *
 * @param obj the object to inspect for null.
 */
export declare function isNull(obj: any): boolean;
/**
 * Check if is not a number.
 * @param obj value to tests if not is a number.
 */
export declare function isNan(obj: any): boolean;
/**
 * Is Object
 * Checks if value is an object.
 *
 * @param obj the object to inspect.
 */
export declare function isObject(obj: any): boolean;
/**
 * Is Error
 * Checks if value is an error.
 *
 * @param obj the value/object to be inspected.
 */
export declare function isError(obj: any): boolean;
/**
 * Is Undefined
 * Tests if value is undefined.
 *
 * @param val the value to inspect
 */
export declare function isUndefined(val: any): boolean;
/**
 * Is Plain Object
 * Inspects value checking if is object literal.
 *
 * @param val the value to inspect
 */
export declare function isPlainObject(val: any): boolean;
/**
 * Check if value provided is number.
 * @param obj the value to be tested.
 */
export declare function isNumber(obj: any): boolean;
/**
 * Is Instance
 * Tests if object is instanceof provided Type.
 *
 * @param obj the object to check.
 * @param Type the instance type to match.
 */
export declare function isInstance(obj: any, Type: any): boolean;
/**
 * Duplicates
 * Counts the number of duplicates in an array.
 *
 * @param arr the array to check for duplicates.
 * @param value the value to match.
 * @param breakable when true allows breaking at first duplicate.
 */
export declare function duplicates(arr: any[], value: any, breakable?: boolean): number;
/**
 * Is Unique
 * Tests if the value is unique in the collection.
 *
 * @param obj the object to be inspected.
 * @param value the value to be matched.
 */
export declare function isUnique(arr: any[], value: any): boolean;
/**
 * Is Node
 * Tests if is NodeJS.
 */
export declare function isNode(): boolean;
/**
 * Is Browser
 * Tests if running in browser.
 */
export declare function isBrowser(): Document;
/**
 * Indicates if app is in debug mode.
 * @param debugging a manual flag to denote debugging.
 */
export declare function isDebug(debugging?: boolean): boolean;
/**
 * Is Equal
 * Tests if two values are equal.
 * Does not support "deep equal".
 *
 * @param value the value to be compared.
 * @param compare the comparer value.
 * @param loose when true == is used instead of ===.
 */
export declare function isEqual(value: any, compare: any, loose?: boolean): boolean;
/**
 * Contains
 * Tests if array contains value.
 *
 * @param arr the array to be inspected.
 * @param value the value to check if is contained in array.
 */
export declare function contains(arr: any[], value: any): boolean;
/**
 * Contains Any
 * Tests array check if contains value.
 *
 * @param arr the array to be inspected.
 * @param compare - array of values to compare.
 */
export declare function containsAny(arr: any[], compare: any[]): boolean;
/**
 * Keys
 * Takes an object then returns keys in array.
 *
 * @param obj the object to parse keys.
 */
export declare function keys(obj: any): string[];
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
export declare function extend<T>(obj: any, ...args: any[]): T;
/**
 * Flatten
 * Takes multiple arrays and flattens to single array.
 * NOTE: this will NOT work for empty nested arrays
 * but will work for 90 plus % of cases.
 *
 * @param args rest param containing multiple arrays to flatten.
 */
export declare function flatten(args: any[]): any[];
/**
 * Clone
 * Please use caution this is meant to
 * clone simple objects. It fits the
 * need. Use _.clone from lodash for
 * complete solution.
 *
 * @param obj object to be cloned.
 */
export declare function clone<T>(obj: any): T;
/**
 * First
 * Simple method to get first element just
 * a little less typing.
 *
 * @param arr the array to get first element from.
 */
export declare function first(arr: any[]): any;
/**
 * Last
 * Simple method to get last element.
 *
 * @param arr the array to get last element.
 */
export declare function last(arr: any[]): any;
/**
 * Tick
 * Wraps function with process.nextTick or setTimeout.
 */
export declare function tick(ctx: any, fn: Function, ...args: any[]): (callback: Function, ...args: any[]) => void;
/**
 * Match Index
 *
 * @param prop the property to match.
 */
export declare function matchIndex(prop: any): false | {
    name: string;
    index: string;
};
/**
 * Split
 * Splits a string at character.
 * Default possible chars to match: ['/', '.', ',', '|']
 *
 * @param str the string to be split.
 * @param char the character to split at.
 */
export declare function split(str: string | string[], char?: string): string[];
/**
 * Del
 * Deletes keys in an object.
 *
 * @param obj the object whose keys should be deleted.
 * @param props the property keys that should be deleted.
 */
export declare function del(obj: any, key: string | string[]): any;
/**
 * Get
 * Gets a property within the supplied object.
 *
 * @param obj the object to inspect.
 * @param prop
 */
export declare function get(obj: any, key: string | string[]): any;
/**
 * Set
 * Sets a value on an object using dot notation or url path.
 *
 * @param obj the object to set the value on.
 * @param key the property used for setting the value.
 * @param value the value used for updating the property.
 * @param dynamic when NOT false objects are dynamically created if required.
 */
export declare function set(obj: any, key: string | string[], value: any, dynamic?: boolean): any;
/**
 * UUID
 * Generates a UUID.
 */
export declare function uuid(): string;
/**
 * Pad Left
 * Pads a string on the left.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export declare function padLeft(str: string, len: number, char?: string | number, offset?: number): string;
/**
 * Pad Right
 * Pads a string to the right.
 *
 * @param str the string to be padded.
 * @param len the length to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export declare function padRight(str: string, len: number, char?: string | number, offset?: number): string;
/**
 * Pad Values
 *
 * @param values the values to be padded.
 * @param dir the direction to pad.
 * @param char the character to pad with or offset value to add.
 * @param offset an offset value to add.
 */
export declare function padValues(values: string[], strategy?: PadStrategy, char?: string | number, offset?: number): string[];
/**
 * Get Type
 * Gets the type of an object.
 *
 * @param obj the object to get type from.
 * @param stringToDate when true parses strings to see if they are dates.
 * @param unknown the string name for unknown types.
 */
export declare function getType(obj: any, stringToDate?: boolean | string, unknown?: string): any;
/**
 * Try Parse Date
 * Attempts to parse a date from a string.
 *
 * @param str the string to attempt parsing on.
 */
export declare function tryParseDate(str: string): string | number;
/**
 * Timestamp
 * Generates multiple timestamp formats.
 */
export declare function timestamp(date?: string | number): ITimestamps;
/**
 * Bytes To Size
 * Converts bytes to normalized size.
 *
 * @param bytes the bytes to normalize
 * @param decimals the number of decimal places.
 */
export declare function bytesToSize(bytes: number, decimals?: number): {
    size: number;
    fixedzero: number;
    raw: number;
    type: string;
    text: string;
    index: number;
};
/**
 * Check Stat
 * Using stat check if file too large.
 *
 * @param filename the file name to stat.
 */
export declare function checkStat(filename: any): boolean;
/**
 * Intersect
 * Intersects two types.
 *
 * @param first first type.
 * @param second second type.
 */
export declare function intersect<T, U>(first: T, second: U): T & U;
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
export declare function activate<T>(Type: Constructor<T>, ...args: any[]): T;
/**
 * Colorize
 * Convenience wrapper for chalk. Color can be
 * shorthand string ex: 'underline.bold.red'.
 *
 * @see https://github.com/chalk/chalk
 *
 * @param str the string or metadata to be colorized.
 * @param color the color to apply, modifiers, shorthand.
 * @param modifiers the optional modifier or modifiers.
 */
export declare function colorize(str: any, color?: string | string[], modifiers?: string | string[]): any;
/**
 * Colorize Array
 * Iterates and array and colorizes each
 * element by its data type.
 *
 * @param arr the array to interate and colorize.
 * @param map an optional map of type to colors such as util.inspect.styles.
 */
export declare function colorizeArray(arr: any[], map?: IMetadata): any[];
/**
 * Colorize Metadata
 * This will iterate an object converting to strings
 * colorizing values for displaying in console.
 *
 * @param obj the object to be colorized
 * @param map the color map that maps type to a color or boolean for pretty.
 * @param pretty when true outputs using returns and tabs.
 */
export declare function colorizeObject(obj: IMetadata, map?: IMetadata | boolean, pretty?: boolean): any;
/**
 * Colorize By Type
 * Inspects the type then colorizes.
 *
 * @param obj the object to inspect for colorization.
 * @param map an optional map to map types to colors.
 */
export declare function colorizeByType(obj: any, map?: IMetadata): any;
/**
 * Strip Color
 * Strips ansi colors from strings.
 *
 * @param str a string or array of strings to strip color from.
 */
export declare function stripColors(str: any): any;
