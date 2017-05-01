import { ILogurTransport, ILogur, IConsoleTransportOptions, IConsoleTransport, ILogurOutput, ILevel, IMetadata, TransportActionCallback } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IConsoleTransportOptions = {

  padding: 'right',
  pretty: true,
  colorized: true,
  ministack: true,
  fullstack: false

};

export class ConsoleTransport extends LogurTransport implements IConsoleTransport {

  options: IConsoleTransportOptions;

  constructor(options: IConsoleTransportOptions, logur: ILogur) {
    super(options, logur);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an optional callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback): void {

    const levelObj: ILevel = this.options.levels[output.level];
    const level = this.colorize<string>(output.level, levelObj.color);

    if (output.metadata)
      output.metadata = this.colorize<IMetadata>(output.metadata);

    output.untyped.forEach((item) => {

    });

    done(this.toOrdered(output));

  }

  /**
   * Query
   * The transport query method for finding/searching previous logs.
   */
  query() {
    throw new Error('Logur Transport query method must be overriden.');
  }

}
