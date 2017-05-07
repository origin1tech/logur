import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, COLOR_TYPE_MAP, ColorizationStrategy, PadStrategy, ILevel, ILogurInstance, ILevelMethods, Serializer } from '../interfaces';
import * as u from '../utils';

let util;

if (!process.env.BROWSER) {
  util = require('util');
}

const defaults: ILogurTransportOptions = {
  active: true,
  map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],
  pretty: false,
  ministack: false,
  prettystack: false,
  profiler: true,
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
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Logur Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: any, options: any, logur: ILogur) {
    this._logur = logur;
    this.options = u.extend({}, base, defaults, options);
  }

  /**
   * Log
   * Expose the default logger.
   */
  get log(): ILogurInstance & ILevelMethods {
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
  colorize(obj: any, color?: string | string[], modifiers?: string | string[]): any {
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
  padLevel(level: string, levels?: string[] | PadStrategy, strategy?: PadStrategy): string {
    levels = u.isArray(levels) ? levels : u.keys(this.options.levels);
    const idx = levels.indexOf(level);
    if (idx === -1)
      return level;
    const padded = u.padValues(<string[]>levels, strategy);
    return padded[idx];
  }

  /**
   * Ministack
   * Generates a mini stacktrace of the calling
   * line, col etc.
   *
   * @param options the Logur Transport options.
   * @param output the generated Logur Output object.
   */
  ministack(options: any, output: ILogurOutput): string {

    const colorize = options.colorize && u.isNode() ? true : false;

    // Check if ministack should be applied.
    if (output.stacktrace && output.stacktrace.length) {

      const stack = output.stacktrace[0];
      const parsed = u.parsePath(stack.path);

      // Handle ministack but don't display if
      // msg is an error as it would be redundant.
      if (options.ministack && stack && parsed && parsed.base) {

        // Compile the mini stacktrace string.
        let mini = `(${parsed.base}:${stack.line}:${stack.column})`;

        if (colorize)
          mini = this.colorize(mini, (options.colorTypeMap && options.colorTypeMap.ministack) || 'gray');

        return mini;

        // Just add to object when JSON is required.
        // if (options.json) {
        //   return mini;
        // }

        // else {

        //   // If metadata and metadata is set to display pretty
        //   // then we have to inject the ministack before it
        //   // or it will look funny.
        //   if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {

        //     // Get the metadata index.
        //     const metaIndex = options.map.indexOf('metadata') - 1;

        //     if (metaIndex >= 0) {
        //       const suffixMeta = ordered.slice(metaIndex);
        //       ordered = [...ordered.splice(0, metaIndex), mini, ...suffixMeta];
        //     }

        //   }

        //   else {

        //     ordered.push(mini);

        //   }

        // }

      }

    }

    return '';


  }

  /**
   * Normalize By Type
   * Inspects the type then colorizes.
   *
   * @param obj the value to inspect for colorization.
   * @param pretty whether pretty printing should be applied when object.
   * @param colors whether to colorize the value.
   * @param map an optional map to apply colors by type.
   */
  format(obj: any, options: any, output: ILogurOutput): any {

    let pretty = options.pretty;
    let colors = options.colorize;
    let colorMap = options.colorTypeMap || COLOR_TYPE_MAP;
    const EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';

    function plainPrint(o) {

      let result = '';

      if (u.isArray(o)) {

        o.forEach((item, i) => {

          const t = u.getType(item, true, 'special');

          if (t === 'object' || t === 'array') {

            result += plainPrint(item);

          }

          else {

            if (t === 'function') {
              const name = item.name || 'fn';
              item = `[Function: ${name}]`;
            }

            else {
              if (!colors)
                result += (`${i}=${item}, `);
              else
                result += (`${i}=${u.colorize(item, colorMap[t])}, `);
            }

          }

        });

      }

      else {

        for (let prop in o) {

          let item = o[prop];

          const t = u.getType(item, true, 'special');

          if (t === 'array' || t === 'object') {

            result += plainPrint(item);

          }
          else {

            if (t === 'function') {
              const name = item.name || 'fn';
              item = `[Function: ${name}]`;
            }

            else {
              if (!colors)
                result += (`${prop}=${item}, `);
              else
                result += (`${prop}=${u.colorize(item, colorMap[t])}, `);
            }

          }

        }

      }

      if (result.length)
        return result.replace(/, $/, '');
      return result;

    }

    // Get the value's type.
    const type = u.getType(obj, true, 'special');

    // Handle error normalization.
    if (type === 'error') {

      // Otherwise normalize the error for output.
      // Create the error message.
      let tmp = (obj.name || 'Error') + ': ' + (obj.message || 'unknown error.');

      // colorize if enabled.
      if (colorMap[type] && colors)
        tmp = u.colorize(tmp, colorMap[type]);

      // If pretty stacktrace use util.inspect.
      if (options.prettyStack && output.error) {
        return { normalized: tmp, append: util.inspect(output.error, true, null, colors) };
      }

      // Check if fullstack should be shown.
      if (obj.stack) {
        const stack = obj.stack.split(EOL).slice(1);
        return { normalized: tmp, append: stack.join(EOL) };
      }

    }

    // Handle and objects/array.
    else if (type === 'object' || type === 'array') {
      if (options.pretty) {
        return {
          append: util.inspect(obj, true, null, colors)
        };
      }
      return { normalized: plainPrint(obj) };
    }

    // Handle simple value.
    else {
      if (!colorMap[type] || !colors)
        return { normalized: obj };
      return { normalized: u.colorize(obj, colorMap[type]) };
    }

  }

  /**
   * To Output
   * Normalizes data for output to array or object.
   *
   * @param options the calling Transport's options.
   * @param output the generated Logur output.
   */
  toMapped(as: 'array' | 'object', options: any, output: ILogurOutput): any {

    if (!options || !output)
      throw new Error('Cannot format "toOdered" using options or output of undefined.');

    // Get list of levels we'll use this for padding.
    const levels = u.keys(options.levels);
    const EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';
    const ignored = ['callback'];
    const metaIndex = options.map.indexOf('metadata');
    const metaLast = options.map.length - 1 === metaIndex;

    // Metadata must be last index in map.
    if (metaIndex !== -1 && !metaLast) {
      options.map.splice(metaIndex, 1);
      options.map.push('metadta');
    }

    // Var for resulting output array, object or json.
    let ordered;

    // An array of values to append to output.
    let appended = [];

    // Reference the logged level.
    let level = output.level;

    // Get the level's config object.
    const levelObj: ILevel = options.levels[level];

    // Flag if we should colorize.
    const colorize = options.colorize && u.isNode() ? true : false;

    if (options.strategy !== 'array') {

      // ordered = this.toObject(output, options);
      ordered = {};

      // Iterate the map and build the object.
      output.map.forEach((k) => {

        // ignored prop.
        if (ignored.indexOf(k) !== -1)
          return;

        let value = u.get(output, k);

        // When outputting to object/json
        // when don't normalize with pretty
        // printing or colors as they would not
        // be relevant in that context.
        if (!u.isUndefined(value)) {
          const serializer: Serializer = this._logur.serializers[k];
          // If a serializer exists call it.
          if (serializer)
            value = serializer(value, output, options);
          ordered[k] = value;
        }

      });

      if (options.ministack)
        ordered['ministack'] = this.ministack(options, output);

      if (options.strategy === 'json')
        ordered = JSON.stringify(ordered);

    }

    else {

      // Get output as array.
      // ordered = this.toArray(output, options);

      ordered = [];

      // Iterate layout map and build output.
      output.map.forEach((k, i) => {

        let value = u.get(output, k);

        const serializer: Serializer = this._logur.serializers[k];

        if (serializer && !u.isUndefined(value))
          value = serializer(value, output, options);

        if (k === 'untyped' && output.untyped) {

          value.forEach((u) => {
            const result = this.format(u, options, output);
            if (result) {
              if (!u.isUndefined(result.normalized))
                ordered.push(result.normalized);
              if (!u.isUndefined(result.append))
                appended.push(result.append);
            }
          });

        }

        else if (value) {
          const result = this.format(value, options, output);
          if (result) {
            if (!u.isUndefined(result.normalized))
              ordered.push(result.normalized);
            if (!u.isUndefined(result.append))
              appended.push(result.append);
          }
        }

      });

      // Check if should add ministack.
      if (options.ministack)
        ordered.push(this.ministack(options, output));

      // Check appended values that should be appended
      // after primary elements.
      if (appended.length) {
        if (!ordered.length)
          ordered = appended;
        else
          ordered = ordered.concat(appended.map(a => { return '\n' + a; }));
      }

      // Get the index of the level in map, we do
      // this
      const idx = options.map.indexOf('level');

      if (idx !== -1) {

        let tmpLevel = level.trim();

        // If padding pad the level.
        if (options.padding)
          tmpLevel = this.padLevel(tmpLevel, options.levels, options.padding);

        if (colorize)
          tmpLevel = this.colorize(tmpLevel, levelObj.color);

        tmpLevel += ':';

        ordered[idx] = tmpLevel;

      }

    }

    return ordered;

  }

  toMappedArray(options: any, output: ILogurOutput): any[] {
    return this.toMapped('array', options, output);
  }

  toMappedObject<T>(options: any, output: ILogurOutput): T {
    return this.toMapped('object', options, output);
  }

  // MUST & OPTIONAL OVERRIDE METHODS

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

  /**
   * Close
   * When Transport is of type stream this method is called
   * on close of Logur to flush streams.
   */
  close(): void {
    return;
  }

}

