import { ILogurTransport, ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IConsoleTransportOptions = {

  map: ['level', 'message', 'untyped', 'metadata'],
  padding: 'right',
  pretty: false,
  colorize: true,
  ministack: false

};

export class ConsoleTransport extends LogurTransport implements IConsoleTransport {

  options: IConsoleTransportOptions;

  /**
    * Console Transport Constructor
    *
    * @param base the base options/defaults instantiated by Logur Instance.
    * @param options the Logur Transport options.
    * @param logur the common Logur instance.
    */
  constructor(base: ILogurInstanceOptions, options: IConsoleTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);

    // If not NodeJS can't prettystack or colorize.
    if (!u.isNode()) {
      this.options.colorize = false;
      this.options.prettystack = false;
    }

  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an optional callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback): void {

    // If the log level matches a console type use it.
    const _console = console[output.level] ? console[output.level] : console.log;

    // Get mapped array.
    let mapped = this.toMappedArray(this.options, output);

    // If console method matches level
    // name use it for good measure.
    // Really only makes difference in Browser.
    _console.apply(console, mapped);

    done(mapped);

  }

  /**
   * Query
   * The transport query method for finding/searching previous logs.
   */
  query() {
    throw new Error('Logur Transport query method must be overriden.');
  }

}
