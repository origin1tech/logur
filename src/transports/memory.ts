import { ILogurTransport, ILogur, IMemoryTransportOptions, IMemoryTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IMemoryTransportOptions = {

  pretty: true,
  colorize: true,
  max: 100

};

export class MemoryTransport extends LogurTransport implements IMemoryTransport {

  logs: any[] = [];
  options: IMemoryTransportOptions;

  /**
   * Memory Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base, ILogurInstanceOptions, options: IMemoryTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback) {

    // Get colorized ordered array.
    let ordered = this.toOutput(this.options, output);

    // Add ordered to the collection.
    if (this.options.max < this.logs.length)
      this.logs.push(ordered);

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
