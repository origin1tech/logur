import { ILogurTransport, ILogur, IMemoryTransportOptions, IMemoryTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions, IQuery, QueryResult, IInstanceMethodsExtended } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

const defaults: IMemoryTransportOptions = {

  map: ['timestamp', 'level', 'message', 'metadata'],
  pretty: true,
  max: 500,
  strategy: 'array',
  queryable: true

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
   * @param fn callback function on action completed.
   */
  action(output: ILogurOutput, fn: TransportActionCallback) {

    // Get colorized ordered array.
    let mapped = this.toMapped(this.options, output);

    // Get the mapped result by strategy.
    let result = mapped[this.options.strategy];

    // Add mapped to collection.
    if ((this.logs.length < this.options.max) && result)
      this.logs.push(result);

    fn();

  }

  /**
   * Query
   * Queries the logs.
   *
   * @param q the query options.
   * @param fn the query result callback.
   */
  query(q: IQuery, fn: QueryResult) {

    // Cannot query without timestamps ensure in map.
    if (!u.contains(this.options.map, 'timestamp'))
      return this.log.warn('cannot query logs, map missing "timestamp" property.');

    q = u.normalizeQuery(q);

    let from: any = q.from ? (q.from as Date).getTime() : 0;
    let to: any = q.to ? (q.to as Date).getTime() : 0;

    // const skip = ctr < q.skip;
    // const take = !q.take ? true : found < q.take ? true : false;

    // Converts the stored item in memory to an object.
    const toObject = (item) => {

      let tmp: any = {};

      if (this.options.strategy === 'array') {
        this.options.map.forEach((prop, i) => {
          if (item[i]) {
            tmp[prop] = item[i];
          }
        });
        return tmp;
      }

      if (this.options.strategy === 'json')
        return JSON.parse(item);

      return item;

    };

    const filtered = this.logs.map((item) => {

      // Convert to an object.
      item = toObject(item);

      // Get the item's timestamp.
      let ts: any = item.timestamp;

      // If is a string convert to Date.
      if (u.isString(ts)) ts = new Date(ts);

      // Can't process if not a Date.
      if (u.isDate(ts)) {

        // Convert to epoch.
        ts = ts.getTime();

        if (ts >= from && (to === 0 || ts <= to))
          return u.mapParsed(q.fields, item);

      }

    });

    if (q.order === 'desc')
      filtered.reverse();

    fn(filtered.slice(q.skip, q.take + 1));

  }

  /**
   * Dispose
   * Use the dispose method to close streams and any clean up.
   * Dispose is called after uncaught exceptions and SIGINT.
   */
  dispose(fn: Function) {
    delete this.logs;
    fn();
  }

}
