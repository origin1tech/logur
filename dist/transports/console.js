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
    map: ['level', 'timestamp', 'message', 'metadata'],
    padding: 'right',
    colorize: true,
    ministack: true,
    pretty: false,
    prettystack: false,
    queryable: false
};
var ConsoleTransport = (function (_super) {
    __extends(ConsoleTransport, _super);
    /**
      * Console Transport Constructor
      *
      * @param base the base options/defaults instantiated by Logur Instance.
      * @param options the Logur Transport options.
      * @param logur the common Logur instance.
      */
    function ConsoleTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        // If not NodeJS can't prettystack or colorize.
        if (!u.isNode()) {
            _this.options.colorize = false;
            _this.options.prettystack = false;
            _this.options.padding = 'none';
        }
        return _this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    ConsoleTransport.prototype.action = function (output, fn) {
        // If the log level matches a console type use it.
        var _console = console[output.level] ? console[output.level] : console.log;
        // Get mapped array.
        var mapped = this.toMapped(this.options, output);
        // If console method matches level
        // name use it for good measure.
        // Really only makes difference in Browser.
        _console.apply(console, mapped.array);
        fn();
    };
    return ConsoleTransport;
}(base_1.LogurTransport));
exports.ConsoleTransport = ConsoleTransport;
//# sourceMappingURL=console.js.map