import { ILogurTransport, ILogur, IMemoryTransportOptions, IMemoryTransport, ILogurOutput, TransportActionCallback } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IMemoryTransportOptions = {

  padding: 'right',
  pretty: true,
  colorized: true

};

export class MemoryTransport extends LogurTransport implements IMemoryTransport {

  logs: ILogurOutput[];
  options: IMemoryTransportOptions;

  constructor(options: IMemoryTransportOptions, logur: ILogur) {
    super(options, logur);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback) {
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
