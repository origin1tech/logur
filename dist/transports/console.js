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
    map: ['level', 'message', 'untyped', 'metadata'],
    padding: 'right',
    pretty: false,
    colorize: true,
    ministack: false
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
        }
        return _this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    ConsoleTransport.prototype.action = function (output, done) {
        // If the log level matches a console type use it.
        var _console = console[output.level] ? console[output.level] : console.log;
        // Get mapped array.
        var mapped = this.toMappedArray(this.options, output);
        // If console method matches level
        // name use it for good measure.
        // Really only makes difference in Browser.
        _console.apply(console, mapped);
        done(mapped);
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    ConsoleTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    return ConsoleTransport;
}(base_1.LogurTransport));
exports.ConsoleTransport = ConsoleTransport;
//# sourceMappingURL=console.js.map