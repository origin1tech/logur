/**
 * HTTP TRANSPORT
 *
 * This Transport uses ONLY native Node http(s) request.
 * Although it will work fine for simple requests it might be best
 * to create a custom Transport extending the base Transport "LogurTransport"
 * while using the "request" module for example. Additionally this
 * module makes some assumption in that the path for logging and querying
 * is the same. ONLY the method is changed. If you have specific needs you
 * do as described above or extend this class and override as needed.
 * @see https://www.npmjs.com/package/request
 *
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var u = require("../utils");
var http, https, qs;
if (!process.env.BROWSER) {
    http = require('http');
    https = require('https');
    qs = require('querystring');
}
var defaults = {
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
var HttpTransport = (function (_super) {
    __extends(HttpTransport, _super);
    /**
     * Http Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function HttpTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        if (!u.isNode())
            throw new Error('Http Transport is not supported in Browser mode use "XMLHttp Transport.');
        // Ensure port.
        if (!_this.options.port)
            _this.options.port = _this.options.ssl ? 443 : 80;
        // Ensure path prefixed with '/'.
        _this.options.path = '/' + _this.options.path.replace(/^\//, '');
        // Define auth.
        var auth = (_this.options.auth && _this.options.auth.username && _this.options.auth.password) ? _this.options.auth.username + ":" + _this.options.auth.password :
            '';
        // Define default request options.
        _this._requestOptions = {
            host: _this.options.host,
            port: _this.options.port,
            path: _this.options.path,
            method: _this.options.method,
            headers: _this.options.headers,
            agent: _this.options.agent,
            auth: auth
        };
        return _this;
    }
    HttpTransport.prototype.handleError = function (err) {
        console.log(err);
    };
    HttpTransport.prototype.hanldeStatus = function (res) {
        console.log(new Error(res.statusCode + ": " + (res.statusMessage || 'Unknown error')));
    };
    /**
     * Request
     * Makes an Http(s) request.
     *
     * @param options the http(s) request options.
     * @param fn callback upon http response.
     */
    HttpTransport.prototype.request = function (options, data, fn) {
        // Extend default request options with user defined.
        options = u.extend({}, u.shallowClone(this._requestOptions), options);
        // Get response encoding.
        var encoding = this.options.encoding;
        if (u.isFunction(data)) {
            fn = data;
            data = undefined;
        }
        // Check for data.
        if (data) {
            // check if data is already JSON.
            if (!u.isString(data))
                data = JSON.stringify(data);
            // Add content length to headers.
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }
        // Create the client request.
        var req = (this.options.ssl ? https : http).request(options);
        req.on('response', function (res) {
            res.setEncoding(encoding);
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            // On end callback with response and body.
            res.on('end', function () {
                fn(null, res, body);
            });
            // Resume the response.
            res.resume();
        });
        // Handle request error.
        req.on('error', fn);
        // End request sending data/buffer.
        if (data)
            req.end(new Buffer(data), encoding);
        else
            req.end(encoding);
    };
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    HttpTransport.prototype.action = function (output, fn) {
        var _this = this;
        // Get colorized mapped array.
        var mapped = this.toMapped(this.options, output);
        // Get result by strategy.
        var result = mapped[this.options.strategy];
        // Strip colors.
        if (this.options.stripcolors)
            result = u.stripColors(result);
        // Handles the response from server.
        var handleResponse = function (err, res, body) {
            if (err)
                return _this.handleError(err);
            if (res && res.statusCode !== 200)
                return _this.hanldeStatus(res);
            fn();
        };
        if (this.options.strategy === 'json')
            this.request(null, result, handleResponse);
        else if (this.options.strategy === 'array')
            this.request(null, result.join(' '), handleResponse);
        else
            this.request(null, result, handleResponse);
    };
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    HttpTransport.prototype.query = function (q, fn) {
        var _this = this;
        // Cannot query without timestamps ensure in map.
        if (!u.contains(this.options.map, 'timestamp'))
            return this.log.warn('cannot query logs, map missing "timestamp" property.');
        // Convert date to epoch
        if (u.isDate(q.from))
            q.from = q.from.getTime();
        if (u.isDate(q.to))
            q.to = q.to.getTime();
        q.fields.push('test');
        // Stringify the query object.
        var query = qs.stringify(q);
        var queryPath = this.options.path + '?' + query;
        // Define request options for request.
        var reqOpts = {
            method: 'GET',
            path: queryPath
        };
        // Handles query response from server.
        var handleResponse = function (err, res, body) {
            if (err)
                return _this.handleError(err);
            if (res && res.statusCode !== 200)
                return _this.hanldeStatus(res);
            if (u.isString(body))
                try {
                    body = JSON.parse(body);
                }
                catch (ex) {
                    _this.handleError(err);
                }
            fn(body);
        };
        this.request(reqOpts, handleResponse);
    };
    return HttpTransport;
}(base_1.LogurTransport));
exports.HttpTransport = HttpTransport;
//# sourceMappingURL=http.js.map