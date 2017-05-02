import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, ColorizationStrategy, PadStrategy } from '../interfaces';
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
     * To Array
     * Takes a Logour Output object using map
     * orders in array.
     *
     * @param output the compiled Logour Output object.
     * @param stripColors when true colors are stripped from values.
     */
    toArray(output: ILogurOutput, colorization?: ColorizationStrategy): any[];
    /**
     * To Object
     *
     * @param output the Logur Output generated object.
     * @param stripColors when true colors are stripped from values.
     */
    toObject<T>(output: ILogurOutput, colorization?: ColorizationStrategy): T;
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
    colorize(str: string | IMetadata | any[], color?: string | string[], modifiers?: string | string[]): any;
    /**
     * Strip Color
     * Strips ansi colors from strings.
     *
     * @param str a string or array of strings to strip color from.
     */
    stripColors(str: any): any;
    /**
     * Pad Level
     * Pads the level after calculating pad from possible levels.
     *
     * @param level the level to be padded.
     * @param levels array of levels for calculating padding.
     * @param strategy the strategy to pad with left, right or none.
     */
    padLevel(level: string, levels: string[], strategy?: PadStrategy): string;
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
    padValues(values: string[], strategy?: PadStrategy, char?: string | number, offset?: number): string[];
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
