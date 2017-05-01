import { IProcess, IOS, IStacktrace, IEnvBrowser, MemoryUsage, ILoad, IEnvNode } from './interfaces';
import { UAParser } from 'ua-parser-js';
/**
 * Memory
 * Gets current memory usage.
 */
export declare function memory(): MemoryUsage;
/**
 * Load
 * Returns system load information in NodeJs
 */
export declare function load(): ILoad;
/**
 * Proc
 * Returns process information such as execPath,
 * memory usage, version and current working directory.
 */
export declare function proc(): IProcess;
/**
 * OS
 * Gets operating system information.
 */
export declare function system(): IOS;
/**
 * Stacktrace
 * Gets/formats error stacktrace or gets from generated error.
 *
 * @param err optional error to be parsed.
 * @param offset a number of frames to trim from begining or callback.
 * @param done the callback to call when done.
 */
export declare function stacktrace(err: Error, offset: number): IStacktrace[] | void;
/**
 * Browser
 * Returns browser environment information.
 */
export declare function browser(ua: UAParser): IEnvBrowser;
/**
 * Node
 * Returns node environment information.
 */
export declare function node(): IEnvNode;
