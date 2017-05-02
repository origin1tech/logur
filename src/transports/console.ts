import { ILogurTransport, ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput, ILevel, IMetadata, TransportActionCallback } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IConsoleTransportOptions = {

  padding: 'right',
  pretty: true,
  colorize: true,
  ministack: true,
  fullstack: false

};

export class ConsoleTransport extends LogurTransport implements IConsoleTransport {

  options: IConsoleTransportOptions;

  constructor(options: IConsoleTransportOptions, logur: ILogur) {
    super(u.extend({}, defaults, options), logur);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an optional callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback): void {

    // Get list of levels we'll use this for padding.
    const levels = u.keys(this.options.levels);

    // Get the level's config object.
    const levelObj: ILevel = this.options.levels[output.level];

    // If the log level matches a console type use it.
    const _console = console[output.level] ? console[output.level] : console.log;

    // Flag if we should colorize.
    const colorize = this.options.colorize ? 'yes' : 'no';

    // Get colorized ordered array.
    let ordered = this.toArray(output, 'yes');

    // Get the index of the level in map, we do
    // this
    const idx = this.options.map.indexOf('level');

    if (this.options.colorize && idx > -1)
      ordered[idx] = this.colorize(output.level, levelObj.color);

    // If console method matches level
    // name use it for good measure.
    // Really only makes difference in Browser.
    _console.apply(console, ordered);

    done(ordered);

  }

  /**
   * Query
   * The transport query method for finding/searching previous logs.
   */
  query() {
    throw new Error('Logur Transport query method must be overriden.');
  }

}
