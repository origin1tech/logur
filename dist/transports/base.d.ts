import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, PadStrategy, ILogurInstance, ILevelMethods } from '../interfaces';
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
    ministack(options: any, output: ILogurOutput): void;
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
    normalizeOutputArray(arr: any[], pretty?: boolean, colors?: boolean, map?: IMetadata): any[];
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
    normalizeOutputObject(obj: IMetadata, pretty?: boolean, colors?: boolean, map?: IMetadata): any;
    /**
     * Normalize By Type
     * Inspects the type then colorizes.
     *
     * @param obj the value to inspect for colorization.
     * @param pretty whether pretty printing should be applied when object.
     * @param colors whether to colorize the value.
     * @param map an optional map to apply colors by type.
     */
    normalizeOutput(obj: any, options: any): any;
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
    toArray(output: ILogurOutput, options: any): any[];
    /**
     * To Object
     *
     * @param output the Logur Output generated object.
     * @param pretty whether objects should be pretty printed.
     * @param colors whether to colorize the value.
     * @param map a type to value map for applying colors.
     */
    toObject(output: ILogurOutput, options: any): any;
    /**
     * To Output
     * Normalizes data for output to array or object.
     *
     * @param options the calling Transport's options.
     * @param output the generated Logur output.
     */
    toOutput(options: any, output: ILogurOutput): any[];
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
