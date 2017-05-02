import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, COLOR_TYPE_MAP, ColorizationStrategy, PadStrategy } from '../interfaces';
import * as u from '../utils';


const defaults: ILogurTransportOptions = {
  exceptions: 'exit'
};

/**
 * Logur Base Transport
 */
export class LogurTransport implements ILogurTransport {

  protected _active: boolean = true;
  protected _logur: ILogur;

  options: any;

  /**
   * Logur Transport Constructor
   *
   * @param options the Logur Transport options.
   * @param logur the common Logur instance.
   */
  constructor(options: any, logur: ILogur) {
    this._logur = logur;
    this.options = u.extend({}, defaults, options);
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
      if (!value)
        console.log('error', `cannot set option for key ${key} using value of undefined.`);

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
   * To Array
   * Takes a Logour Output object using map
   * orders in array.
   *
   * @param output the compiled Logour Output object.
   * @param stripColors when true colors are stripped from values.
   */
  toArray(output: ILogurOutput, colorization?: ColorizationStrategy): any[] {

    let ordered = [];
    const ignored = ['callback'];

    const colorize = (val) => {
      if (colorization === 'no')
        return val;
      else if (colorization === 'yes')
        return this.colorize(val);
      else
        return this.stripColors(val);
    };

    // Iterate the output format array
    // adding each element to our ordered
    // result array.
    output.map.forEach((k) => {

      const value = u.get(output, k);

      if (k === 'untyped' && output.untyped && output.untyped.length)
        output.untyped.forEach((u) => {
          ordered.push(colorize(u));
        });

      else if (value)
        ordered.push(colorize(value));

    });

    return ordered;

  }

  /**
   * To Object
   *
   * @param output the Logur Output generated object.
   * @param stripColors when true colors are stripped from values.
   */
  toObject<T>(output: ILogurOutput, colorization?: ColorizationStrategy): T {

    let obj: any = {};
    const ignored = ['callback'];

    // Iterate the output and build object.
    output.map.forEach((k) => {

      let value = u.get(output, k);

      if (value) {
        if (colorization !== 'no') {
          if (colorization === 'strip') {
            value = this.stripColors(value);
          }
          else {
            value = this.colorize(value);
          }
        }
        obj[k] = value;
      }


    });

    return obj;

  }

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
  colorize(str: string | IMetadata | any[], color?: string | string[], modifiers?: string | string[]): any {

    // Iterate array and colorize.
    if (u.isArray(str))
      return u.colorizeArray(<any[]>str);

    // Iterate an object and colorize.
    else if (u.isPlainObject(str))
      return u.colorizeObject(<IMetadata>str);

    // Try to colorize value by its type when no color is specified.
    else if (!color)
      return u.colorizeByType(str);

    // Otherwise colorize by the color supplied.
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
   * @param levels array of levels for calculating padding.
   * @param strategy the strategy to pad with left, right or none.
   */
  padLevel(level: string, levels: string[], strategy?: PadStrategy): string {
    const idx = levels.indexOf(level);
    if (idx === -1)
      return level;
    const padded = u.padValues(levels, strategy, 1);
    return padded[idx];
  }

  // MUST OVERRIDE METHODS

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an optional callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback): void {
    throw new Error('Logur Transport action method must be overriden.');
  }

  /**
   * Query
   * The transport query method for finding/searching previous logs.
   */
  query() {
    throw new Error('Logur Transport query method must be overriden.');
  }


}
