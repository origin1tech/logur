/**
 * HTTP TRANSPORT
 *
 * This Transport uses ONLY native Node http(s) request.
 * Although it will work fine for simple requests it might be best
 * to create a custom Transport extending the base Transport "LogurTransport"
 * while using the "request" module for example
 * @see https://www.npmjs.com/package/request
 *
 */

import { ILogurTransport, ILogur, IHttpTransportOptions, IHttpTransport, ILogurOutput, ILogurInstanceOptions, TransportActionCallback, HttpTransportCallback, IMetadata, IQuery, QueryResult, IInstanceMethodsExtended } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';
import { RequestOptions, IncomingMessage, ClientRequest } from 'http';

import * as _qs from 'querystring';

let http, https, qs;

if (!process.env.BROWSER) {
  http = require('http');
  https = require('https');
  qs = require('querystring');
}

const defaults: IHttpTransportOptions = {
  host: '127.0.0.1',
  path: '/log',
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  ssl: false,
  encoding: 'utf8',
  strategy: 'json',
  queryable: true,
  stripcolors: true
};

export class HttpTransport extends LogurTransport implements IHttpTransport {

  private _requestOptions: RequestOptions;

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

    if (!u.isNode())
      throw new Error('Http Transport is not supported in Browser mode use "XMLHttp Transport.');

    // Ensure port.
    if (!this.options.port)
      this.options.port = this.options.ssl ? 443 : 80;

    // Ensure path prefixed with '/'.
    this.options.path = '/' + this.options.path.replace(/^\//, '');

    // Define auth.
    const auth =
      (this.options.auth && this.options.auth.username && this.options.auth.password) ? `${this.options.auth.username}:${this.options.auth.password}` :
        '';

    // Define default request options.
    this._requestOptions = {
      host: this.options.host,
      port: this.options.port,
      path: this.options.path,
      method: this.options.method,
      headers: this.options.headers,
      agent: this.options.agent,
      auth: auth
    };

  }

  private handleError(err: Error) {
    console.log(err);
  }

  private hanldeStatus(res: IncomingMessage) {
    console.log(new Error(`${res.statusCode}: ${res.statusMessage || 'Unknown error'}`));
  }

  /**
   * Request
   * Makes an Http(s) request.
   *
   * @param options the http(s) request options.
   * @param fn callback upon http response.
   */
  request(options: RequestOptions, data: string | IMetadata | HttpTransportCallback, fn?: HttpTransportCallback): void {

    // Extend default request options with user defined.
    options = u.extend({}, u.shallowClone(this._requestOptions), options);

    // Get response encoding.
    const encoding = this.options.encoding;

    if (u.isFunction(data)) {
      fn = <HttpTransportCallback>data;
      data = undefined;
    }

    // Check for data.
    if (data) {
      // check if data is already JSON.
      if (!u.isString(data))
        data = JSON.stringify(data);
      // Add content length to headers.
      options.headers['Content-Length'] = Buffer.byteLength(<string>data);
    }

    // Create the client request.
    const req: ClientRequest = (this.options.ssl ? https : http).request(options);

    req.on('response', (res: IncomingMessage) => {

      res.setEncoding(encoding);

      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      // On end callback with response and body.
      res.on('end', () => {
        fn(null, res, body);
      });

      // Resume the response.
      res.resume();

    });

    // Handle request error.
    req.on('error', fn);

    // End request sending data/buffer.
    if (data)
      req.end(new Buffer(<string>data), encoding);
    else
      req.end(encoding);

  }

  /**
   * Action
   * The transport action to be called when messages are logged.
   *
   * @param output the Logur output object for the actively logged message.
   * @param fn callback function on action completed.
   */
  action(output: ILogurOutput, fn?: TransportActionCallback) {

    // Get colorized mapped array.
    let mapped = this.toMapped(this.options, output);

    // Get result by strategy.
    let result = mapped[this.options.strategy];

    // Strip colors.
    if (this.options.stripcolors)
      result = u.stripColors(result);

    // Handles the response from server.
    const handleResponse = (err: Error, res: IncomingMessage, body: any) => {

      if (err)
        return this.handleError(err);

      if (res && res.statusCode !== 200)
        return this.hanldeStatus(res);

      fn();

    };

    if (this.options.strategy === 'json')
      this.request(null, result, handleResponse);

    else if (this.options.strategy === 'array')
      this.request(null, (result as any[]).join(' '), handleResponse);

    else
      this.request(null, result, handleResponse);

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

    // Convert date to epoch
    if (u.isDate(q.from))
      q.from = (q.from as Date).getTime();

    if (u.isDate(q.to))
      q.to = (q.to as Date).getTime();

    q.fields.push('test');

    // Stringify the query object.
    const query = qs.stringify(q);
    const queryPath = this.options.path + '?' + query;

    // Define request options for request.
    const reqOpts: RequestOptions = {
      method: 'GET',
      path: queryPath
    };

    // Handles query response from server.
    const handleResponse = (err: Error, res: IncomingMessage, body: any) => {

      if (err)
        return this.handleError(err);

      if (res && res.statusCode !== 200)
        return this.hanldeStatus(res);

      if (u.isString(body))
        try {
          body = JSON.parse(body);
        }
        catch (ex) {
          this.handleError(err);
        }

      fn(body);

    };

    this.request(reqOpts, handleResponse);

  }

}
