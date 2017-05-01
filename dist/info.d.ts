import { IProcess, IOS, IStacktrace, IUAResult } from './interfaces';
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
export declare function opsys(): IOS;
/**
 * Stacktrace
 * Gets/formats error stacktrace or gets from generated error.
 *
 * @param err optional error to be parsed.
 */
export declare function stacktrace(err?: Error, done?: {
    (stacktrace: IStacktrace[]);
}): void;
/**
 * Environment
 * Returns universal environment information.
 */
export declare function environment(): IUAResult;
