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
    queryable: false,
    strategy: 'array',
};
var MiddlewareTransport = (function (_super) {
    __extends(MiddlewareTransport, _super);
    /**
     * Middleware Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function MiddlewareTransport(base, options, logur) {
        return _super.call(this, base, u.extend({}, defaults, options), logur) || this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    MiddlewareTransport.prototype.action = function (output, fn) {
        // Get colorized ordered array.
        var mapped = this.toMapped(this.options, output);
        // Get the mapped result by strategy.
        var result = mapped[this.options.strategy];
        fn();
    };
    return MiddlewareTransport;
}(base_1.LogurTransport));
exports.MiddlewareTransport = MiddlewareTransport;
//# sourceMappingURL=middleware.js.map