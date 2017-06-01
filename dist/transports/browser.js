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
    strategy: 'array',
    queryable: true
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
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    XMLHttpTransport.prototype.action = function (output, fn) {
        // Get colorized ordered array.
        var mapped = this.toMapped(this.options, output);
        // Get the mapped result by strategy.
        var result = mapped[this.options.strategy];
        fn();
    };
    /**
     * Query
     * Queries the logs.
     *
     * @param q the query options.
     * @param fn the query result callback.
     */
    XMLHttpTransport.prototype.query = function (q, fn) {
        // Cannot query without timestamps ensure in map.
        if (!u.contains(this.options.map, 'timestamp'))
            return this.log.warn('cannot query logs, map missing "timestamp" property.');
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
//# sourceMappingURL=browser.js.map