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
    padding: 'right',
    pretty: true,
    colorize: true,
    ministack: true,
    fullstack: false
};
var ConsoleTransport = (function (_super) {
    __extends(ConsoleTransport, _super);
    function ConsoleTransport(options, logur) {
        return _super.call(this, u.extend({}, defaults, options), logur) || this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    ConsoleTransport.prototype.action = function (output, done) {
        var levelObj = this.options.levels[output.level];
        var _console = console[output.level] ? console[output.level] : console.log;
        var colorize = this.options.colorize ? 'yes' : 'no';
        // Get ordered array.
        var ordered = this.toArray(output, 'yes');
        // Get the index of the level in map.
        var idx = this.options.map.indexOf('level');
        if (this.options.colorize && idx > -1) {
            ordered[idx] = this.colorize(output.level, levelObj.color);
        }
        // If console method matches level
        // name use it for good measure.
        // Really only makes difference in Browser.
        _console.apply(console, ordered);
        done(ordered);
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