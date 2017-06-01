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
    pretty: true,
    max: 500,
    strategy: 'array',
    queryable: true
};
var MemoryTransport = (function (_super) {
    __extends(MemoryTransport, _super);
    /**
     * Memory Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function MemoryTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        _this.logs = [];
        return _this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    MemoryTransport.prototype.action = function (output, fn) {
        // Get colorized ordered array.
        var mapped = this.toMapped(this.options, output);
        // Get the mapped result by strategy.
        var result = mapped[this.options.strategy];
        // Add mapped to collection.
        if ((this.logs.length < this.options.max) && result)
            this.logs.push(result);
        fn();
    };
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    MemoryTransport.prototype.query = function (q, fn) {
        var _this = this;
        // Cannot query without timestamps ensure in map.
        if (!u.contains(this.options.map, 'timestamp'))
            return this.log.warn('cannot query logs, map missing "timestamp" property.');
        var from = q.from ? q.from.getTime() : 0;
        var to = q.to ? q.to.getTime() : 0;
        // const skip = ctr < q.skip;
        // const take = !q.take ? true : found < q.take ? true : false;
        // Converts the stored item in memory to an object.
        var toObject = function (item) {
            var tmp = {};
            if (_this.options.strategy === 'array') {
                _this.options.map.forEach(function (prop, i) {
                    if (item[i]) {
                        tmp[prop] = item[i];
                    }
                });
                return tmp;
            }
            if (_this.options.strategy === 'json')
                return JSON.parse(item);
            return item;
        };
        var filtered = this.logs.map(function (item) {
            // Convert to an object.
            item = toObject(item);
            // Get the item's timestamp.
            var ts = item.timestamp;
            // If is a string convert to Date.
            if (u.isString(ts))
                ts = new Date(ts);
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
    };
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    MemoryTransport.prototype.dispose = function (fn) {
        delete this.logs;
        fn();
    };
    return MemoryTransport;
}(base_1.LogurTransport));
exports.MemoryTransport = MemoryTransport;
//# sourceMappingURL=memory.1.js.map