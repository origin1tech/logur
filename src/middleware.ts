
import { IMiddlewareOptions, MiddlewareRequestHandler, ILevel, MiddlewareTokenCallback, ILogurInstance, IMiddlewareTokens, ILevels, IMetadata, IMiddleware, MiddlewareFilter, MiddlewareCallback } from './interfaces';
import { Request, Response, NextFunction } from 'express';
import * as u from './utils';

let onHeaders, onFinished;

if (!process.env.BROWSER) {
  onHeaders = require('on-headers');
  onFinished = require('on-finished');
}

// Maps common status codes to severity
// levels. We'll use this to try and build
// levelmap if user has not defined.
const statusToLevel = {
  504: 1,     // gateway timeout.
  503: 1,     // service unavailable.
  500: 0,     // server error.
  405: 1,     // not implemented.
  404: 1,     // file not found.
  403: 0,     // forbidden not auth.
  401: 1,     // authorization needed.
  400: 0,     // bad request.
  200: 2,     // OK.
  201: 2      // created.
};

// Default Options.
const defaults: IMiddlewareOptions = {
  map: ['method', 'url', 'code', 'address', 'elapsed'],
  transports: '*',
  tokens: {
    method: 'req.method',
    protocol: 'req.protocol',
    url: (req, res) => { return req.originalUrl || req.url; },
    code: (req, res) => { return res.statusCode; },
    message: (req, res) => { return res.statusMessage; },
    address: (req, res) => {
      return req.ip || (req.connection && req.connection.remoteAddress);
    },
    version: (req, res) => { return req.httpVersionMajor + '.' + req.httpVersionMinor; },
    agent: (req, res) => { return req.headers['user-agent']; },
    type: (req, res) => {
      const type = res.getHeader('content-type');
      const split = type.split(';');
      return split[0];
    },
    length: (req, res) => { return res.getHeader('content-length'); },
    params: (req, res) => { return req.params; },
    query: (req, res) => { return req.query; },
    elapsed: (req, res) => {
      const elapsed: any = res['_elapsedTime'] || 0;
      return elapsed.toFixed(2);
    }
  },
  metadata: false
};

export function init(options?: IMiddlewareOptions) {

  const self = this;

  // Extend options from defaults.
  options = u.extend(defaults, options);

  // Check if levelmap not provided.
  // if undefined or empty build it.
  options.levelmap = normalizeLevelMap(this.options.levels, options.levelmap);

  /**
   * Exec
   * Executes the log event for middleware handler.
   *
   * @param req the Express request.
   * @param res the Express response.
   */
  function exec(req, res) {

    const parsed = parseTokens(options.tokens, req, res);

    if (options.filters && options.filters.length) {

      const shouldFilter = options.filters.some((el, i) => {
        return el(parsed, req, res) === true;
      });

      // If should filter don't log just return.
      if (shouldFilter)
        return;

    }

    // Set level via status code.
    const level = options.levelmap[parsed.code] || options.levelmap.default;

    // Iterate the map and build out the log message.
    const mapped: any[] = options.map.map((k) => {
      if (!u.isUndefined(parsed[k]) && !u.isNull(parsed[k]))
        return parsed[k];
    });

    // Unshift level and transports.
    mapped.unshift(level);
    mapped.unshift(options.transports);

    // Check if tokens should be added as metadata.
    if (options.metadata)
      mapped.push(parsed);

    if (options.callback)
      mapped.push(options.callback);

    self.exec.apply(self, mapped);

  }

  /**
   * Normalize Level Map
   * If user levelmap not defined tries to normalize
   * using instance levels.
   *
   * @param levels the Logur Instance log levels.
   * @param levelmap the map to map levesl to severity.
   */
  function normalizeLevelMap(levels, levelmap) {

    if (u.isUndefined(levelmap) || u.isEmpty(levelmap)) {

      const tmpmap: any = {
        default: findLevelBySeverity(levels, 2)
      };

      u.keys(statusToLevel).forEach((k) => {
        const severity = findLevelBySeverity(levels, statusToLevel[k]);
        if (severity)
          tmpmap[k] = severity;
      });

      levelmap = tmpmap;

    }

    return levelmap;

  }

  /**
   * Find Level Severity
   * Finds a log level by its severity.
   *
   * @param levels the Logur Instance log levels.
   * @param severity the severity to find the level by.
   */
  function findLevelBySeverity(levels: ILevels, severity: number): string {
    return u.keys(levels).filter((k) => {
      const level: ILevel = levels[k];
      return severity === level.level;
    })[0];
  }

  /**
   * Process Tokens
   * Processes defined tokens parsing values for logging.
   *
   * @param tokens the log tokens to be processed.
   * @param req the Express request object.
   * @param res the Express response object.
   */
  function parseTokens(tokens: IMiddlewareTokens, req: Request, res: Response): IMetadata {

    const obj: any = {};

    // Get the keys for all tokens.
    const tokenKeys = u.keys(tokens);

    // Iterate each token.
    tokenKeys.forEach((k) => {

      const token = tokens[k];
      let result;

      // Generate token by callback.
      if (u.isFunction(token)) {
        result = (token as MiddlewareTokenCallback)(req, res);
      }

      // Generate token using dot notation.
      else if (u.isString(token)) {

        // Get first part of path which should be 'req', 'res', 'request', 'response'.
        const split = (token as string).split('.');

        // If not valide type return.
        if (!u.contains(['req', 'res', 'request', 'response'], split[0]))
          return;

        let type: any = split.shift();

        // Rejoin remaining values for path.
        const tokenPath = split.join('.');

        if (type === 'req' || type === 'res')
          type = req;
        else
          type = res;

        result = u.get(type, tokenPath);

      }

      // Set the result if value.
      if (!u.isUndefined(result))
        obj[k] = result;

    });

    return obj;

  }

  /**
   * Middleware
   * Middleware method for capturing properties the
   * logging request through Logur Instance.
   *
   * Defaults:
   *
   * map: ['method', 'url', 'code', 'address', 'agent', 'elapsed']
   * transports: '*' (all transports)
   * tokens:
   *
   *    method:      the Http method.
   *    protocol:    the Http protocol used.
   *    url:         the requested url.
   *    code:        the Http status code.
   *    message:     the Http status message.
   *    address:     the remote address of the request.
   *    version:     the Http version.
   *    agent:       the Agent used for the request.
   *    type:        the Content-Type for the response.
   *    length:      the Content-Length for the response.
   *    params:      the express path params if any.
   *    query:       the express querystring params if any.
   *    elapsed:     the elapsed time of the request.
   *
   */
  const handler = (req: Request, res: Response, next: NextFunction) => {

    let startTime;

    // On headers get start time.
    onHeaders(res, () => {
      res['_startTime'] = process.hrtime();
    });

    // On response finished log with elapsed time.
    onFinished(res, () => {
      const diff = process.hrtime(res['_startTime']);
      res['_elapsedTime'] = diff[0] * 1e3 + diff[1] * 1e-6;
      exec(req, res);
    });

    // Call next to continue down middleware.
    next();

  };

  return {
    findLevelBySeverity,
    parseTokens,
    handler
  };


}