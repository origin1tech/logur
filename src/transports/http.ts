import { ILogurTransport, ILogur, IHttpTransportOptions, IHttpTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults = {};

export class HttpTransport extends LogurTransport implements IHttpTransport {

  options: IHttpTransportOptions;

  /**
   * Http Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: ILogurInstanceOptions, options: IHttpTransportOptions, logur: ILogur) {
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
