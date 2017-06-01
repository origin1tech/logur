import { ILogurTransport, ILogur, IXMLHttpTransportOptions, IXMLHttpTransport, ILogurOutput, TransportActionCallback, ILogurInstanceOptions, IQuery, QueryResult, IInstanceMethodsExtended } from '../interfaces';
import { LogurTransport } from './base';
import * as u from '../utils';

declare const ActiveXObject;

const defaults: IXMLHttpTransportOptions = {

  map: ['timestamp', 'level', 'message', 'metadata'],
  strategy: 'json',
  headers: { 'Content-Type': 'application/json' },
  queryable: true

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

  request(options: IXMLHttpTransportOptions) {

    // Extend options with defaults.
    options = u.extend({}, u.shallowClone(this.options), options);

    // Get the XMLHttp Request Client.
    let xhr: XMLHttpRequest = this.getXMLHttpRequest();

    let data = null;

    // Checking for data.
    if (options.data) {
    }

    const onready = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText);
      }
    };

    const onprogress = (e) => {
      // Placeholder.
    };

    const onerror = (e) => {
      // Log only to the console.
      this.log.using('console').error(e);
    };

    // Setup listeners.
    xhr.onreadystatechange = onready;
    xhr.onprogress = onprogress;
    xhr.onerror = onerror;

    // Set request headers.
    u.keys(options.headers).forEach((k) => {
      xhr.setRequestHeader(k, options.headers[k]);
    });

    // Check for basic auth.
    if (options.auth && options.auth.username && options.auth.password) {
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${options.auth.username}:${options.auth.password}`));
      xhr.withCredentials = true;
    }

    // Check if sending data.
    if (options.data) {
      if (u.isPlainObject(options.data))
        data = JSON.stringify(data);
      else if (u.isString(options.data))
        data = options.data;
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Content-Length', data.length);
    }

    // Open the connection and send.
    xhr.open(options.method, options.url, options.async);
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
