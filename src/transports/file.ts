import { ILogurTransport, ILogur, IFileTransportOptions, IFileTransport, TransportActionCallback, ILogurOutput } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults = {};

export class FileTransport extends LogurTransport implements IFileTransport {

  options: IFileTransportOptions;

  constructor(options: IFileTransportOptions, logur: ILogur) {
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

