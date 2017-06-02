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
var defaults = {
    map: ['timestamp', 'level', 'message', 'metadata'],
    strategy: 'json',
    url: '/log',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    queryable: true,
    stripcolors: true
};
var XMLHttpTransport = (function (_super) {
    __extends(XMLHttpTransport, _super);
    /**
     * Memory Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function XMLHttpTransport(base, options, logur) {
        return _super.call(this, base, u.extend({}, defaults, options), logur) || this;
    }
    /**
     * Try ActiveXObject
     * Tries to get XMLHttp via ActiveXObject.
     */
    XMLHttpTransport.prototype.tryActiveXObject = function () {
        var xmlhttp;
        var XMLHTTP_PROTOCOLS = new Array('MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP');
        var i = XMLHTTP_PROTOCOLS.length;
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
    };
    /**
     * Get XMLHttp Client
     * Tries to get browser compatible XMLHttp Request.
     */
    XMLHttpTransport.prototype.getXMLHttpRequest = function () {
        var xmlhttp;
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
    };
    /**
     * Handle Error
     * Handles error throw by request.
     *
     * @param err the XMLHttp Error.
     */
    XMLHttpTransport.prototype.handleError = function (err) {
        if (err)
            this.log.using(this.name, true).error(err);
    };
    /**
     * Handle Status
     * Handles status warnings when 200 and 201 are not returned.
     *
     * @param xhr the XMLHttpRequest object.
     */
    XMLHttpTransport.prototype.handleStatus = function (xhr) {
        if (xhr.status === 0 || xhr.readyState !== 4)
            return;
        if (!u.contains([200, 201], xhr.status))
            this.log.using(this.name, true).warn(xhr.status + ": " + (xhr.responseText || 'Unknown error .'));
    };
    /**
     * Request
     * Makes XMLHttpRequest.
     *
     * @param options the options for the xmlhttp request.
     * @param data data object for posts.
     */
    XMLHttpTransport.prototype.request = function (options, data, fn) {
        if (u.isFunction(data)) {
            fn = data;
            data = undefined;
        }
        // Extend options with defaults.
        options = u.extend({}, u.shallowClone(this.options), options);
        // Get the XMLHttp Request Client.
        var xhr = this.getXMLHttpRequest();
        var params, url;
        // Checking for params for gets.
        // Build query string for params to
        // be added to url.
        if (options.params)
            params = u.toQueryString(options.params);
        // Setup listeners.
        xhr.onreadystatechange = function () {
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
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(options.auth.username + ":" + options.auth.password));
            xhr.withCredentials = true;
        }
        // Set request headers.
        u.keys(options.headers).forEach(function (k) {
            xhr.setRequestHeader(k, options.headers[k]);
        });
        // Check if sending data.
        if (data && u.isPlainObject(data))
            data = JSON.stringify(data);
        // Send the request.
        xhr.send(data);
    };
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    XMLHttpTransport.prototype.action = function (output, fn) {
        var _this = this;
        // Get colorized ordered array.
        var mapped = this.toMapped(this.options, output);
        // Get the mapped result by strategy.
        var result = mapped[this.options.strategy];
        var handleRequest = function (err, xhr) {
            _this.handleError(err);
            _this.handleStatus(xhr);
            // don't block callback just log above
            // events to inform user.
            fn();
        };
        if (this.options.stripcolors)
            result = u.stripColors(result);
        // Make the request.
        this.request(null, result, handleRequest);
    };
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    XMLHttpTransport.prototype.query = function (q, fn) {
        var _this = this;
        // Cannot query without timestamps ensure in map.
        if (!u.contains(this.options.map, 'timestamp'))
            return this.log.warn('cannot query logs, map missing "timestamp" property.');
        // Convert date to epoch
        if (u.isDate(q.from))
            q.from = q.from.getTime();
        if (u.isDate(q.to))
            q.to = q.to.getTime();
        // Stringify the query object.
        var query = u.toQueryString(q);
        var queryPath = this.options.url + '?' + query;
        // Define request options for request.
        var reqOpts = {
            method: 'GET',
            url: queryPath
        };
        // Handles query response from server.
        var handleResponse = function (err, xhr) {
            _this.handleError(err);
            _this.handleStatus(xhr);
            var result = xhr.responseText;
            if (u.isString(result))
                try {
                    result = JSON.parse(result);
                }
                catch (ex) {
                    _this.handleError(err);
                }
            // don't block callback just log above
            // events to inform user.
            fn(result || []);
        };
        this.request(reqOpts, handleResponse);
    };
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions.
     */
    XMLHttpTransport.prototype.dispose = function (fn) {
        fn();
    };
    return XMLHttpTransport;
}(base_1.LogurTransport));
exports.XMLHttpTransport = XMLHttpTransport;
//# sourceMappingURL=xmlhttp.js.map