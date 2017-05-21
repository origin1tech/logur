import { ILogurTransport, ILogur, IStreamTransportOptions, IStreamTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IStreamTransportOptions = {

  pretty: true,
  colorize: true

};

export class StreamTransport extends LogurTransport implements IStreamTransport {

  options: IStreamTransportOptions;

  /**
   * Memory Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: ILogurInstanceOptions, options: IStreamTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   */
  action(output: ILogurOutput) {

    // Get colorized ordered array.
    let mapped = this.toMapped(output);

  }

  /**
   * Dispose
   * Use the dispose method to close streams any any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose() {
    throw new Error('Logur Transport dispose method must be overriden.');
  }

  /**
   * Query
   * The transport query method for finding/searching previous logs.
   */
  query() {
    throw new Error('Logur Transport query method must be overriden.');
  }

}
