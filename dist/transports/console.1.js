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
var defaults = {
    padding: 'right',
    pretty: true,
    colorized: true
};
var ConsoleTransport = (function (_super) {
    __extends(ConsoleTransport, _super);
    function ConsoleTransport(options, logur) {
        return _super.call(this, options, logur) || this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an optional callback on Transport done.
     */
    ConsoleTransport.prototype.action = function (output, done) {
        output.untyped.unshift(output.message);
        console.log(output);
        done(output.level, output.untyped);
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
//# sourceMappingURL=console.1.js.map