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
var MemoryTransport = (function (_super) {
    __extends(MemoryTransport, _super);
    function MemoryTransport(options, logur) {
        return _super.call(this, options, logur) || this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an callback on Transport done.
     */
    MemoryTransport.prototype.action = function (output, done) {
        var ordered = this.toArray(output);
        done(ordered);
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    MemoryTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    return MemoryTransport;
}(base_1.LogurTransport));
exports.MemoryTransport = MemoryTransport;
//# sourceMappingURL=memory.js.map