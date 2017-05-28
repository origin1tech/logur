import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, TransportActionCallback, PadStrategy, ILogurInstance, ILevelMethods, ILogurOutputMapped } from '../interfaces';
/**
 * Logur Base Transport
 */
export declare class LogurTransport implements ILogurTransport {
    protected _active: boolean;
    protected _logur: ILogur;
    name: string;
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
    readonly log: ILogurInstance<ILevelMethods> & ILevelMethods;
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
     * @param str the value to colorize.
     * @param style the style or array of styles to be applied.
     */
    colorize(str: any, style: string | string[]): any;
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
     * @param strategy the strategy to pad with left, right or none.
     * @param levels array of levels for calculating padding.
     */
    padLevel(level: string, strategy: PadStrategy, levels?: string[]): string;
    /**
     * To Mapped
     * Takes the generated Logur Output converting
     * to mapped values in array, object or json.
     *
     * @param options the Logur Tranport Options or Logur Output object.
     * @param output the generated Logur Output object.
     */
    toMapped<T>(options: ILogurTransportOptions | ILogurOutput, output?: ILogurOutput): ILogurOutputMapped<T>;
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    action(output: ILogurOutput, fn: TransportActionCallback): void;
    /**
     * Dispose
     * Use the dispose method to close streams any any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    dispose(fn: Function): void;
}
