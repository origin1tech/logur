import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, TransportActionCallback, PadStrategy, ILogurInstance, ILevelMethods } from '../interfaces';
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
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Logur Transport options.
     * @param logur the common Logur instance.
     */
    constructor(base: any, options: any, logur: ILogur);
    /**
     * Log
     * Expose the default logger.
     */
    readonly log: ILogurInstance & ILevelMethods;
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
    colorize(obj: any, color?: string | string[], modifiers?: string | string[]): any;
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
    padLevel(level: string, levels?: string[] | PadStrategy, strategy?: PadStrategy): string;
    /**
     * Ministack
     * Generates a mini stacktrace of the calling
     * line, col etc.
     *
     * @param options the Logur Transport options.
     * @param output the generated Logur Output object.
     */
    ministack(options: any, output: ILogurOutput): string;
    /**
     * Normalize By Type
     * Inspects the type then colorizes.
     *
     * @param obj the value to inspect for colorization.
     * @param pretty whether pretty printing should be applied when object.
     * @param colors whether to colorize the value.
     * @param map an optional map to apply colors by type.
     */
    format(obj: any, options: any, output: ILogurOutput): any;
    /**
     * To Output
     * Normalizes data for output to array or object.
     *
     * @param options the calling Transport's options.
     * @param output the generated Logur output.
     */
    toMapped(options: any, output: ILogurOutput): any[];
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
