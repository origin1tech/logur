import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback } from '../interfaces';
/**
 * Logur Base Transport
 */
export declare class LogurTransport implements ILogurTransport {
    protected _active: boolean;
    protected _logur: ILogur;
    options: any;
    /**
     * Logur Transport Constructor
     *
     * @param options the Logur Transport options.
     * @param logur the common Logur instance.
     */
    constructor(options: any, logur: ILogur);
    /**
     * Set Option(s)
     * Sets options for the Transport.
     *
     * @param key the key or options object.
     * @param value the corresponding value for the specified key.
     */
    setOption<T extends ILogurTransportOptions>(key: string | T, value?: any): void;
    /**
      * Active
      * Toggles the active state of the transport.
      * If not new state is passed the current state is returned.
      */
    active(state?: boolean): boolean;
    /**
     * To Ordered
     * Takes a Logour Output object using map
     * set in options orders arguments for output
     * in Transport.
     *
     * @param output the compiled Logour Output object.
     */
    toOrdered(output: ILogurOutput): any[];
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
    colorize<T>(str: string | IMetadata, color?: string | string[], modifiers?: string | string[]): T;
    /**
     * Strip Color
     * Strips ansi colors from strings.
     *
     * @param str a string or array of strings to strip color from.
     */
    stripColor(str: string | string[]): string | string[];
    /**
     * Pad Left
     * Pads a string on the left.
     *
     * @param str the string to be padded.
     * @param len the length to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    padLeft(str: string, len: number, char?: string | number, offset?: number): string;
    /**
     * Pad Right
     * Pads a string to the right.
     *
     * @param str the string to be padded.
     * @param len the length to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    padRight(str: string, len: number, char?: string | number, offset?: number): string;
    /**
     * Pad Values
     *
     * @param values the values to be padded.
     * @param dir the direction to pad.
     * @param char the character to pad with or offset value to add.
     * @param offset an offset value to add.
     */
    padValues(values: string[], dir?: string, char?: string | number, offset?: number): string[];
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    action(output: ILogurOutput, done: TransportActionCallback): void;
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    query(): void;
}
