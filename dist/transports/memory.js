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
    pretty: true,
    colorize: true,
    max: 100
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
     */
    MemoryTransport.prototype.action = function (output) {
        // Get colorized ordered array.
        var mapped = this.toMapped(output);
        // Add mapped to collection.
        if (this.options.max < this.logs.length)
            this.logs.push(mapped.array);
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    MemoryTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    /**
     * Dispose
     * Use the dispose method to close streams any any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    MemoryTransport.prototype.dispose = function () {
        throw new Error('Logur Transport dispose method must be overriden.');
    };
    return MemoryTransport;
}(base_1.LogurTransport));
exports.MemoryTransport = MemoryTransport;
//# sourceMappingURL=memory.js.map