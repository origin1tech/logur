/**
 * STREAM TRANSPORT
 *
 * By default this Transport is not much different than the
 * Console Transport. This is because the default writable
 * stream used is simply process.stdout which console.log
 * uses. That said if you pass your own stream in options
 * log events will be handed off to the stream you supply
 * as expected which can be handy.
 *
 */
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
    stream: undefined,
    strategy: 'array',
    options: {
        encoding: 'utf8'
    },
    padding: 'none',
    colorize: false,
    queryable: false
};
var StreamTransport = (function (_super) {
    __extends(StreamTransport, _super);
    /**
     * Memory Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function StreamTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        if (!u.isNode())
            throw new Error('Stream Transport is not supported in Browser mode.');
        if (!_this.options.stream)
            _this.stream = process.stdout;
        return _this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param fn callback function on action completed.
     */
    StreamTransport.prototype.action = function (output, fn) {
        var options = this.options;
        var strategy = options.strategy;
        // Get colorized ordered array.
        var mapped = this.toMapped(options, output);
        var term = '\n';
        var result = mapped[strategy];
        if (strategy === 'array')
            this.stream.write(result.join(' ') + term);
        else
            this.stream.write(result + term);
        fn();
    };
    /**
     * Dispose
     * Use the dispose method to close streams and any clean up.
     * Dispose is called after uncaught exceptions and SIGINT.
     */
    StreamTransport.prototype.dispose = function () {
        // Nothing to dispose.
    };
    return StreamTransport;
}(base_1.LogurTransport));
exports.StreamTransport = StreamTransport;
//# sourceMappingURL=stream.js.map