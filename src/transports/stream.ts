/**
 * STREAM TRANSPORT
 *
 * By default this Transport is not much different than the
 * Console Transport. This is because the default writable
 * stream used is simply process.stdout which console.log
 * uses. That said if you pass your own stream in options
 * log events will be handed off to the stream you supply
 * as expected which can be handy.
 *
 */

import { ILogurTransport, ILogur, IStreamTransportOptions, IStreamTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IStreamTransportOptions = {

  map: ['level', 'timestamp', 'message', 'metadata'],
  stream: undefined,
  strategy: 'array',
  options: {
    encoding: 'utf8'
  },
  padding: 'none',
  colorize: false,
  queryable: false

};

export class StreamTransport extends LogurTransport implements IStreamTransport {

  stream: NodeJS.WritableStream;
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

    if (!u.isNode())
      throw new Error('Stream Transport is not supported in Browser mode.');

    if (!this.options.stream)
      this.stream = process.stdout;

  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param fn callback function on action completed.
   */
  action(output: ILogurOutput, fn: TransportActionCallback) {

    const options = this.options;
    const strategy = options.strategy;

    // Get colorized ordered array.
    let mapped = this.toMapped(options, output);

    const term = '\n';

    const result = mapped[strategy];

    if (strategy === 'array')
      this.stream.write((result as any[]).join(' ') + term);
    else
      this.stream.write(result + term);

    fn();

  }

  /**
   * Dispose
   * Use the dispose method to close streams and any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose() {
    // Nothing to dispose.
  }

}
