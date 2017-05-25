import { ILogurTransport, ILogur, IMemoryTransportOptions, IMemoryTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions, IQuery, QueryResult } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IMemoryTransportOptions = {

  pretty: true,
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
  constructor(base: ILogurInstanceOptions, options: IMemoryTransportOptions, logur: ILogur) {
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
    let mapped = this.toMapped(this.options, output);

    // Add mapped to collection.
    if (this.options.max < this.logs.length)
      this.logs.push(mapped.array);

  }

  /**
   * Query
   * Queries the logs.
   *
   * @param q the query options.
   * @param fn the query result callback.
   */
  query(q: IQuery, fn: QueryResult) {

    q = u.normalizeQuery(q);



  }

  /**
   * Dispose
   * Use the dispose method to close streams and any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose() {
    delete this.logs;
  }

}
