import { ILogurTransport, ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput, ILogurInstanceOptions, TransportActionCallback, IInstanceMethodsExtended } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IConsoleTransportOptions = {

  map: ['level', 'timestamp', 'message', 'metadata'],
  padding: 'right',
  colorize: true,
  ministack: true,
  pretty: false,
  prettystack: false,
  queryable: false

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
      this.options.padding = 'none';
    }

  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param fn callback function on action completed.
   */
  action(output: ILogurOutput, fn: TransportActionCallback): void {

    // If the log level matches a console type use it.
    const _console = console[output.level] ? console[output.level] : console.log;

    // Get mapped array.
    let mapped = this.toMapped(this.options, output);

    // If console method matches level
    // name use it for good measure.
    // Really only makes difference in Browser.
    _console.apply(console, mapped.array);

    fn();

  }

}
