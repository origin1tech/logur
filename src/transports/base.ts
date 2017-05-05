import { ILogurTransport, ILogur, ILogurTransportOptions, ILogurOutput, IMetadata, TransportActionCallback, COLOR_TYPE_MAP, ColorizationStrategy, PadStrategy, CacheMap, ILevel, ILogurInstance, ILevelMethods } from '../interfaces';
import * as u from '../utils';

const defaults: ILogurTransportOptions = {
  active: true,
  map: ['level', 'timestamp', 'message', 'untyped', 'metadata'],
  pretty: false,
  ministack: false,
  exceptions: 'exit',
  profiler: true
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

  ministack(options: any, output: ILogurOutput) {

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

        // Just add to object when JSON is required.
        if (options.json) {
          ordered.ministack = mini;
        }

        else {

          // If metadata and metadata is set to display pretty
          // then we have to inject the ministack before it
          // or it will look funny.
          if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {

            // Get the metadata index.
            const metaIndex = options.map.indexOf('metadata') - 1;

            if (metaIndex >= 0) {
              const suffixMeta = ordered.slice(metaIndex);
              ordered = [...ordered.splice(0, metaIndex), mini, ...suffixMeta];
            }

          }

          else {

            ordered.push(mini);

          }

        }

      }

    }


  }

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
  normalizeOutputArray(arr: any[], pretty?: boolean, colors?: boolean, map?: IMetadata): any[] {

    // Default color map, mimics Node's
    // util.inspect
    let stylesMap = COLOR_TYPE_MAP;

    map = map || stylesMap;

    // Iterate the array and colorize by type.
    return arr.map((item) => {

      let type = u.getType(item, true, 'special');

      // If is object colorize with metadata method.
      if (u.isPlainObject(item)) {
        return this.normalizeOutputObject(item, pretty, colors, map);
      }
      else {

        if (!map[type] || !colors)
          return item;

        return u.colorize(item, map[type]);

      }

    });

  }

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
  normalizeOutputObject(obj: IMetadata, pretty?: boolean, colors?: boolean, map?: IMetadata): any {

    // Default color map, mimics Node's
    // util.inspect
    let stylesMap = COLOR_TYPE_MAP;

    map = map || stylesMap;

    let result = '';

    // Adds color mapped from type.
    function addColor(type, val) {
      if (!colors)
        return val;
      if (!map[type])
        return val;
      return u.colorize(val, map[type]);
    }

    // Iterate the metadata.
    function colorizer(o, depth?) {

      const len = u.keys(o).length;
      let ctr = 0;
      depth = depth || 1;

      let base = 2;
      let pad = depth * base;

      for (let prop in o) {

        ctr += 1;
        const sep = ctr < len ? ', ' : '';

        if (o.hasOwnProperty(prop)) {

          const val = o[prop];

          // Handle value is an object.
          if (u.isPlainObject(val)) {
            const keyPad = depth > 1 ? u.padLeft('', (pad * 2) - 2) : u.padLeft('', pad);

            if (pretty) {
              result += '\n' + keyPad + prop + ': ';
              result += ('\n' + u.padLeft('', pad * 2) + `{ `);
            }

            colorizer(val, depth + 1);

            if (pretty)
              result += ' }';

          }

          // Handle non object literal.
          else {

            if (pretty) {

              const offset = ctr > 1 && depth > 1 ? 2 : 0;

              if (ctr > 1) {
                result += ('\n' + u.padLeft('', pad, offset));
              }

            }

            // Iterate array and colorize
            // by type.
            if (u.isArray(val)) {

              const arrLen = val.length;

              result += `${prop}: [ `;

              val.forEach((v, i) => {

                const arrSep = i + 1 < arrLen ? ', ' : '';

                // Get the type to match in color map.
                const type = u.getType(v, 'special');

                result += (`${addColor(type, v)}${arrSep}`);

              });

              result += ' ]';

            }

            // Colorize value.
            else {

              // Get the type to match in color map.
              const type = u.getType(val, true, 'special');

              if (pretty)
                result += (`${prop}: ${addColor(type, val)}${sep}`);
              else
                result += (`${prop}=${addColor(type, val)}${sep}`);

            }

          }

        }

      }

      return o;

    }

    colorizer(obj);

    if (pretty)
      return `{ ${result} }`;
    return result;

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
  normalizeOutput(obj: any, options: any): any {

    let pretty = options.pretty;
    let colors = options.colorize;
    let colorMap = options.colorTypeMap || COLOR_TYPE_MAP;

    // Get the value's type.
    const type = u.getType(obj, true, 'special');

    // Handle error normalization.
    if (type === 'error') {
      let tmp = obj.message;
      if (colorMap[type] && colors)
        tmp = u.colorize(tmp, colorMap[type]);
      // Check if fullstack should be shown.

    }

    // Handle an array of values to be normalized.
    else if (type === 'array') {
      return this.normalizeOutputArray(obj, pretty, colors, colorMap);
    }

    // Handle and object to be normalized.
    else if (type === 'object') {
      return this.normalizeOutputObject(obj, pretty, colors, colorMap);
    }

    // Handle simple value.
    else {
      if (!colorMap[type] || !colors)
        return obj;
      return u.colorize(obj, colorMap[type]);
    }

  }

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
  toArray(output: ILogurOutput, options: any): any[] {

    let ordered = [];
    let suffix = [];
    const ignored = ['callback'];
    const metaIndex = output.map.indexOf('metadata');
    const metaLast = output.map.length - 1 === metaIndex;

    // Iterate the output format array
    // adding each element to our ordered
    // result array.
    output.map.forEach((k, i) => {

      const value = u.get(output, k);

      if (k === 'untyped' && output.untyped) {
        output.untyped.forEach((u) => {
          // No pretty print for inner objects.
          ordered.push(this.normalizeOutput(u, options));
        });
      }

      else if (value) {
        // Don't pretty print metadata when NOT
        // the last argument.
        let isPretty = metaIndex === i && !metaLast ? false : options.pretty;
        let processed = this.normalizeOutput(value, options);
        if (isPretty && i === metaIndex && metaLast)
          processed = '\n' + processed;
        ordered.push(processed);
      }

    });

    return ordered;

  }

  /**
   * To Object
   *
   * @param output the Logur Output generated object.
   * @param pretty whether objects should be pretty printed.
   * @param colors whether to colorize the value.
   * @param map a type to value map for applying colors.
   */
  toObject(output: ILogurOutput, options: any): any {

    let obj = {};
    const ignored = ['callback'];

    // Iterate the output and build object.
    output.map.forEach((k) => {

      // ignored prop.
      if (ignored.indexOf(k) !== -1)
        return;

      let value = u.get(output, k);

      if (value)
        obj[k] = this.normalizeOutput(value, options);

    });

    return obj;

  }

  /**
   * To Output
   * Normalizes data for output to array or object.
   *
   * @param options the calling Transport's options.
   * @param output the generated Logur output.
   */
  toOutput(options: any, output: ILogurOutput): any[] {

    if (!options || !output)
      throw new Error('Cannot format "toOdered" using options or output of undefined.');

    // Get list of levels we'll use this for padding.
    const levels = u.keys(options.levels);
    const EOL = output.env && output.env.os ? output.env.os['EOL'] : '\n';

    let ordered;

    // Reference the logged level.
    let level = output.level;

    // Check if message is error.
    const isMsgError = u.isError(output.message);

    // Get the level's config object.
    const levelObj: ILevel = options.levels[level];

    // Flag if we should colorize.
    const colorize = options.colorize && u.isNode() ? true : false;

    if (options.strategy !== 'array') {

      ordered = this.toObject(output, options);

      if (options.strategy === 'json')
        ordered = JSON.stringify(ordered);

    }

    else {

      // Get output as array.
      ordered = this.toArray(output, options);

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

    // Check if ministack should be applied.
    // if (output.stacktrace && output.stacktrace.length) {

    //   const stack = output.stacktrace[0];
    //   const parsed = u.parsePath(stack.path);

    //   // Handle ministack but don't display if
    //   // msg is an error as it would be redundant.
    //   if (options.ministack && stack && parsed && parsed.base) {

    //     // Compile the mini stacktrace string.
    //     let mini = `(${parsed.base}:${stack.line}:${stack.column})`;

    //     if (colorize)
    //       mini = this.colorize(mini, (options.colorTypeMap && options.colorTypeMap.ministack) || 'gray');

    //     // Just add to object when JSON is required.
    //     if (options.json) {
    //       ordered.ministack = mini;
    //     }

    //     else {

    //       // If metadata and metadata is set to display pretty
    //       // then we have to inject the ministack before it
    //       // or it will look funny.
    //       if (output.metadata && u.contains(options.map, 'metadata') && options.pretty) {

    //         // Get the metadata index.
    //         const metaIndex = options.map.indexOf('metadata') - 1;

    //         if (metaIndex >= 0) {
    //           const suffixMeta = ordered.slice(metaIndex);
    //           ordered = [...ordered.splice(0, metaIndex), mini, ...suffixMeta];
    //         }

    //       }

    //       else {

    //         ordered.push(mini);

    //       }

    //     }

    //   }

    // }

    return ordered;

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
