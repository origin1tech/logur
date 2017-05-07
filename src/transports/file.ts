import { ILogurTransport, ILogur, IFileTransportOptions, IFileTransport, TransportActionCallback, ILogurOutput, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';
import { RollingFileStream } from 'streamroller';

const defaults = {
  filename: './logs/app.log',
  max: '100000',
  json: true
};

export class FileTransport extends LogurTransport implements IFileTransport {

  streamroller: NodeJS.WritableStream;
  options: IFileTransportOptions;

  /**
   * File Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: ILogurInstanceOptions, options: IFileTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);
    this.streamroller = new RollingFileStream(this.options.filename, this.options.max, this.options.backups);
  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param done an callback on Transport done.
   */
  action(output: ILogurOutput, done: TransportActionCallback) {

    // Get colorized mapped array.
    let mapped = this.toMappedObject(this.options, output);

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

