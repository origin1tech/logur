import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, ColorizationStrategy, PadStrategy, ILevel, ILogurInstance, ILevelMethods, Serializer, ILogurOutputMapped } from '../interfaces';
import * as u from '../utils';

let util;

if (!process.env.BROWSER) {
  util = require('util');
}

const defaults: ILogurTransportOptions = {
  active: true,
  exceptions: true
};

/**
 * Logur Base Transport
 */
export class LogurTransport implements ILogurTransport {

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
  constructor(base: any, options: any, logur: ILogur) {
    this._logur = logur;
    this.options = u.extend({}, base, defaults, options);
    this._active = this.options.active;
    // ensure map contains 'message' property which is required.
    if (!u.contains(this.options.map, 'message'))
      throw new Error('Invalid Transport map, must included property "message".');
  }

  /**
   * Log
   * Expose the default logger.
   */
  get log(): ILogurInstance<ILevelMethods> & ILevelMethods {
    return this._logur.log;
  }

  // BASE METHODS

  /**
   * Set Option(s)
   * Sets options for the Transport.
   *
   * @param key the key or options object.
   * @param value the corresponding value for the specified key.
   */
  setOption<T extends ILogurTransportOptions>(key: string | T, value?: any): void {

    // If not object of options just set key/value.
    if (!u.isPlainObject(key)) {

      // If not value log error.
      if (u.isUndefined(value))
        throw new Error(`Cannot set option for key ${key} using value of undefined.`);

      else
        this.options[key] = value;

    }

    else {

      this.options = u.extend({}, this.options, key);

    }

  }

  /**
    * Active
    * Toggles the active state of the transport.
    * If not new state is passed the current state is returned.
    */
  active(state?: boolean): boolean {
    if (u.isUndefined(state))
      return this._active;
    return this._active = state;
  }

  // HELPER METHODS
  // Most of below are just wrappers to
  // utils but more convenient for user
  // when extending base Transport.

  /**
   * Colorize
   * Convenience wrapper to utils.colorize.
   * @param str the value to colorize.
   * @param style the style or array of styles to be applied.
   */
  colorize(str: any, style: string | string[]): any {
    return u.colorize.apply(null, arguments);
  }

  /**
   * Strip Color
   * Strips ansi colors from strings.
   *
   * @param str a string or array of strings to strip color from.
   */
  stripColors(str: any): any {
    return u.stripColors.apply(null, arguments);
  }

  /**
   * Pad Level
   * Pads the level after calculating pad from possible levels.
   *
   * @param level the level to be padded.
   * @param strategy the strategy to pad with left, right or none.
   * @param levels array of levels for calculating padding.
   */
  padLevel(level: string, strategy: PadStrategy, levels?: string[]): string {
    levels = u.isArray(levels) ? levels : u.keys(this.options.levels);
    const idx = levels.indexOf(level);
    if (idx === -1)
      return level;
    const padded = u.padValues(<string[]>levels, strategy);
    return padded[idx];
  }

  /**
   * To Mapped
   * Takes the generated Logur Output converting
   * to mapped values in array, object or json.
   *
   * @param options the Logur Tranport Options or Logur Output object.
   * @param output the generated Logur Output object.
   */
  toMapped<T>(options: ILogurTransportOptions | ILogurOutput, output?: ILogurOutput): ILogurOutputMapped<T> {

    // Allow output as first argument.
    if (!u.isUndefined(options['activeid'])) {
      output = <ILogurOutput>options;
      options = undefined;
    }

    options = options || this.options;
    return u.toMapped<T>(options, output);

  }

  // MUST & OPTIONAL OVERRIDE METHODS

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param fn callback function on action completed.
   */
  action(output: ILogurOutput, fn: TransportActionCallback): void {
    throw new Error('Logur Transport action method must be overriden.');
  }

  /**
   * Dispose
   * Use the dispose method to close streams any any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose(fn: Function) {
    throw new Error('Logur Transport dispose method must be overriden.');
  }

}

