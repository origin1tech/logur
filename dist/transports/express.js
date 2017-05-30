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
    queryable: false
};
var ExpressTransport = (function (_super) {
    __extends(ExpressTransport, _super);
    /**
     * Express Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function ExpressTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        _this.logs = [];
        return _this;
    }
    ExpressTransport.prototype.middleware = function () {
        return function () {
        };
    };
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    ExpressTransport.prototype.action = function (output, fn) {
        // Get colorized ordered array.
        var mapped = this.toMapped(this.options, output);
        fn();
    };
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    ExpressTransport.prototype.dispose = function () {
        //
    };
    return ExpressTransport;
}(base_1.LogurTransport));
exports.ExpressTransport = ExpressTransport;
//# sourceMappingURL=express.js.map