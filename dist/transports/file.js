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
var streamroller_1 = require("streamroller");
var defaults = {
    filename: './logs/app.log',
    max: '100000',
    json: true
};
var FileTransport = (function (_super) {
    __extends(FileTransport, _super);
    /**
     * File Transport Constructor
     *
     * @param base the base options/defaults instantiated by Logur Instance.
     * @param options the Transport options.
     * @param logur the common Logur instance.
     */
    function FileTransport(base, options, logur) {
        var _this = _super.call(this, base, u.extend({}, defaults, options), logur) || this;
        _this.streamroller = new streamroller_1.RollingFileStream(_this.options.filename, _this.options.max, _this.options.backups);
        return _this;
    }
    /**
     * Action
     * The transport action to be called when messages are logged.
     *
     * @param output the Logur output object for the actively logged message.
     * @param done an callback on Transport done.
     */
    FileTransport.prototype.action = function (output, done) {
        // Get colorized mapped array.
        var mapped = this.toMappedObject(this.options, output);
        done(mapped);
    };
    /**
     * Query
     * The transport query method for finding/searching previous logs.
     */
    FileTransport.prototype.query = function () {
        throw new Error('Logur Transport query method must be overriden.');
    };
    return FileTransport;
}(base_1.LogurTransport));
exports.FileTransport = FileTransport;
//# sourceMappingURL=file.js.map