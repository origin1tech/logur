"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var onHeaders, onFinished;
if (!process.env.BROWSER) {
    onHeaders = require('on-headers');
    onFinished = require('on-finished');
}
// Maps common status codes to severity
// levels. We'll use this to try and build
// levelmap if user has not defined.
var statusToLevel = {
    504: 1,
    503: 1,
    500: 0,
    405: 1,
    404: 1,
    403: 0,
    401: 1,
    400: 0,
    200: 2,
    201: 2 // created.
};
// Default Options.
var defaults = {
    map: ['method', 'url', 'code', 'address', 'elapsed'],
    transports: '*',
    tokens: {
        method: 'req.method',
        protocol: 'req.protocol',
        url: function (req, res) { return req.originalUrl || req.url; },
        code: function (req, res) { return res.statusCode; },
        message: function (req, res) { return res.statusMessage; },
        address: function (req, res) {
            return req.ip || (req.connection && req.connection.remoteAddress);
        },
        version: function (req, res) { return req.httpVersionMajor + '.' + req.httpVersionMinor; },
        agent: function (req, res) { return req.headers['user-agent']; },
        type: function (req, res) {
            var type = res.getHeader('content-type');
            var split = type.split(';');
            return split[0];
        },
        length: function (req, res) { return res.getHeader('content-length'); },
        params: function (req, res) { return req.params; },
        query: function (req, res) { return req.query; },
        elapsed: function (req, res) {
            var elapsed = res['_elapsedTime'] || 0;
            return elapsed.toFixed(2);
        }
    },
    metadata: false
};
function init(options) {
    var self = this;
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
        var parsed = parseTokens(options.tokens, req, res);
        if (options.filters && options.filters.length) {
            var shouldFilter = options.filters.some(function (el, i) {
                return el(parsed, req, res) === true;
            });
            // If should filter don't log just return.
            if (shouldFilter)
                return;
        }
        // Set level via status code.
        var level = options.levelmap[parsed.code] || options.levelmap.default;
        // Iterate the map and build out the log message.
        var mapped = options.map.map(function (k) {
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
            var tmpmap_1 = {
                default: findLevelBySeverity(levels, 2)
            };
            u.keys(statusToLevel).forEach(function (k) {
                var severity = findLevelBySeverity(levels, statusToLevel[k]);
                if (severity)
                    tmpmap_1[k] = severity;
            });
            levelmap = tmpmap_1;
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
    function findLevelBySeverity(levels, severity) {
        return u.keys(levels).filter(function (k) {
            var level = levels[k];
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
    function parseTokens(tokens, req, res) {
        var obj = {};
        // Get the keys for all tokens.
        var tokenKeys = u.keys(tokens);
        // Iterate each token.
        tokenKeys.forEach(function (k) {
            var token = tokens[k];
            var result;
            // Generate token by callback.
            if (u.isFunction(token)) {
                result = token(req, res);
            }
            else if (u.isString(token)) {
                // Get first part of path which should be 'req', 'res', 'request', 'response'.
                var split = token.split('.');
                // If not valide type return.
                if (!u.contains(['req', 'res', 'request', 'response'], split[0]))
                    return;
                var type = split.shift();
                // Rejoin remaining values for path.
                var tokenPath = split.join('.');
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
    var handler = function (req, res, next) {
        var startTime;
        // On headers get start time.
        onHeaders(res, function () {
            res['_startTime'] = process.hrtime();
        });
        // On response finished log with elapsed time.
        onFinished(res, function () {
            var diff = process.hrtime(res['_startTime']);
            res['_elapsedTime'] = diff[0] * 1e3 + diff[1] * 1e-6;
            exec(req, res);
        });
        // Call next to continue down middleware.
        next();
    };
    return {
        findLevelBySeverity: findLevelBySeverity,
        parseTokens: parseTokens,
        handler: handler
    };
}
exports.init = init;
//# sourceMappingURL=middleware.js.map