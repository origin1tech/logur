import { ILogurTransport, ILogur, IXMLHttpTransportOptions, IXMLHttpTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions, IQuery, QueryResult, IInstanceMethodsExtended, IMetadata, XMLHttpRequestCallback } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

declare const ActiveXObject;

const defaults: IXMLHttpTransportOptions = {

  map: ['timestamp', 'level', 'message', 'metadata'],
  strategy: 'json',
  url: '/log',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  queryable: true,
  stripcolors: true

};

export class XMLHttpTransport extends LogurTransport implements IXMLHttpTransport {

  options: IXMLHttpTransportOptions;

  /**
   * Memory Transport Constructor
   *
   * @param base the base options/defaults instantiated by Logur Instance.
   * @param options the Transport options.
   * @param logur the common Logur instance.
   */
  constructor(base: ILogurInstanceOptions, options: IXMLHttpTransportOptions, logur: ILogur) {
    super(base, u.extend({}, defaults, options), logur);
  }

  /**
   * Try ActiveXObject
   * Tries to get XMLHttp via ActiveXObject.
   */
  private tryActiveXObject() {

    let xmlhttp;

    let XMLHTTP_PROTOCOLS = new Array('MSXML2.XMLHTTP.5.0',
      'MSXML2.XMLHTTP.4.0',
      'MSXML2.XMLHTTP.3.0',
      'MSXML2.XMLHTTP',
      'Microsoft.XMLHTTP');

    let i = XMLHTTP_PROTOCOLS.length;

    while (i--) {

      try {
        xmlhttp = new ActiveXObject(XMLHTTP_PROTOCOLS[i]);
        break;
      }
      catch (e) {
        console.log(e);
      }

    }

    return xmlhttp;

  }

  /**
   * Get XMLHttp Client
   * Tries to get browser compatible XMLHttp Request.
   */
  private getXMLHttpRequest(): XMLHttpRequest {

    let xmlhttp;

    // Mozilla / Safari / IE7
    try {
      xmlhttp = new XMLHttpRequest();
    }

    // IE
    catch (e) {
      xmlhttp = this.tryActiveXObject();
    }

    // If we hit here the browser doesn't
    // support ajax requests.
    if (!xmlhttp)
      throw new Error('Failed to create XMHHttpRequest client, not supported.');

    return xmlhttp;

  }

  /**
   * Handle Error
   * Handles error throw by request.
   *
   * @param err the XMLHttp Error.
   */
  private handleError(err: ErrorEvent) {
    if (err)
      this.log.using(this.name, true).error(err);
  }

  /**
   * Handle Status
   * Handles status warnings when 200 and 201 are not returned.
   *
   * @param xhr the XMLHttpRequest object.
   */
  private handleStatus(xhr) {

    if (xhr.status === 0 || xhr.readyState !== 4)
      return;

    if (!u.contains([200, 201], xhr.status))
      this.log.using(this.name, true).warn(`${xhr.status}: ${xhr.responseText || 'Unknown error .'}`);
  }

  /**
   * Request
   * Makes XMLHttpRequest.
   *
   * @param options the options for the xmlhttp request.
   * @param data data object for posts.
   */
  request(options: IXMLHttpTransportOptions, data?: string | IMetadata, fn?: XMLHttpRequestCallback) {

    if (u.isFunction(data)) {
      fn = <XMLHttpRequestCallback>data;
      data = undefined;
    }

    // Extend options with defaults.
    options = u.extend({}, u.shallowClone(this.options), options);

    // Get the XMLHttp Request Client.
    let xhr: XMLHttpRequest = this.getXMLHttpRequest();

    let params: string, url: string;

    // Checking for params for gets.
    // Build query string for params to
    // be added to url.
    if (options.params)
      params = u.toQueryString(options.params);

    // Setup listeners.
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4)
        return;
      fn(null, xhr);
    };
    xhr.onerror = fn;

    url = options.url;

    if (params)
      url += '?' + params;

    // Open the connection and send.
    xhr.open(options.method, url, true);

    // Check for basic auth.
    if (options.auth && options.auth.username && options.auth.password) {
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${options.auth.username}:${options.auth.password}`));
      xhr.withCredentials = true;
    }

    // Set request headers.
    u.keys(options.headers).forEach((k) => {
      xhr.setRequestHeader(k, options.headers[k]);
    });

    // Check if sending data.
    if (data && u.isPlainObject(data))
      data = JSON.stringify(data);

    // Send the request.
    xhr.send(data);

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

    const handleRequest = (err: ErrorEvent, xhr: XMLHttpRequest) => {

      this.handleError(err);

      this.handleStatus(xhr);

      // don't block callback just log above
      // events to inform user.
      fn();

    };

    if (this.options.stripcolors)
      result = u.stripColors(result);

    // Make the request.
    this.request(null, result, handleRequest);

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

    // Stringify the query object.
    const query = u.toQueryString(q);
    const queryPath = this.options.url + '?' + query;

    // Define request options for request.
    const reqOpts: IXMLHttpTransportOptions = {
      method: 'GET',
      url: queryPath
    };

    // Handles query response from server.
    const handleResponse = (err: ErrorEvent, xhr: XMLHttpRequest) => {

      this.handleError(err);
      this.handleStatus(xhr);

      let result: any = xhr.responseText;

      if (u.isString(result))
        try {
          result = JSON.parse(result);
        }
        catch (ex) {
          this.handleError(err);
        }

      // don't block callback just log above
      // events to inform user.
      fn(result || []);

    };

    this.request(reqOpts, handleResponse);

  }

  /**
   * Dispose
   * Use the dispose method to close streams and any clean up.
   * Dispose is called after uncaught exceptions.
   */
  dispose(fn: Function) {
    fn();
  }

}
