"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var instance_1 = require("./instance");
var transports_1 = require("./transports");
var pkg;
// If NodeJS get package info.
if (u.isNode()) {
    var resolve = require('path').resolve;
    pkg = require(resolve(process.cwd(), 'package.json'));
}
var defaults = {
    // Keys to grab from package.json when using Node.
    package: ['name', 'description', 'version', 'main', 'repository', 'author', 'license'],
    // Array of transports to load.
    transports: []
};
var Logur = (function () {
    /**
     * Constructs Logur
     * @param options the Logur options.
     */
    function Logur(options) {
        var _this = this;
        this.pkg = {};
        this.instances = {};
        this.transports = {};
        this.serializers = {};
        if (Logur.instance)
            return Logur.instance;
        // Init options with defaults.
        this.options = u.extend({}, defaults, options);
        // Options for default Console transport.
        var consoleOpts = {};
        var hasConsole = this.options.transports.filter(function (t) {
            return t.name === 'console' || u.isInstance(t.transport, transports_1.ConsoleTransport);
        })[0];
        // Add console transport if doesn't exist.
        if (!hasConsole)
            this.options.transports.push({
                name: 'console',
                options: consoleOpts,
                transport: transports_1.ConsoleTransport
            });
        if (pkg && this.options.package && this.options.package.length) {
            this.options.package.forEach(function (k) {
                var found = u.get(pkg, k);
                if (found)
                    _this.pkg[k] = found;
            });
        }
        Logur.instance = this;
    }
    /**
     * Set Option
     * Sets/updates options.
     *
     * @param key the key or options object.
     * @param value the associated value to set for key.
     */
    Logur.prototype.setOption = function (key, value) {
        // If not object of options just set key/value.
        if (!u.isPlainObject(key)) {
            // If not value log error.
            if (!value)
                throw new Error("Cannot set option for key " + key + " using value of undefined.");
            else
                this.options[key] = value;
        }
        else {
            this.options = u.extend({}, this.options, key);
        }
    };
    /**
     * Get
     * Gets a loaded Logur instance or all instances
     * when no name is provided.
     *
     * @param name the name of the Logur Instance to get.
     */
    Logur.prototype.get = function (name) {
        return this.instances[name];
    };
    /**
     * Create
     * Creates and loads a Logur Instance in Logur.
     *
     * @param name the name of the Logur Instance to create.
     * @param options Logur Instance options.
     */
    Logur.prototype.create = function (name, options) {
        if (!name)
            throw new Error('Failed to create Logur Instance using name of undefined.');
        this.instances[name] = new instance_1.LogurInstance(name, options, this);
        return this.instances[name];
    };
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    Logur.prototype.remove = function (name) {
        if (name === 'default')
            throw Error('cannot remove default Logur Instance.');
        delete this.instances[name];
    };
    /**
     * Dispose
     * Iterates all instances disposing of transports.
     *
     * @param exit when NOT false exit after disposing.
     */
    Logur.prototype.dispose = function (exit, fn) {
        var _this = this;
        var funcs = [];
        if (u.isFunction(exit)) {
            fn = exit;
            exit = undefined;
        }
        fn = fn || u.noop;
        u.keys(this.instances).forEach(function (k) {
            var instance = _this.instances[k];
            funcs.push(instance.dispose);
        });
        u.asyncEach(funcs, function () {
            // Exit if true and is Node.
            if (exit && u.isNode())
                process.exit(0);
            else
                fn();
        });
    };
    return Logur;
}());
exports.Logur = Logur;
/**
 * Init
 * Initializes Logur.
 *
 * @param options Logur options to initialize with.
 */
function init(options) {
    var logur = Logur.instance;
    // If not Logur initialize and create
    // default instance.
    if (!logur) {
        logur = new Logur(options);
        var instance = logur.create('default', { transports: logur.options.transports });
        // save the default logger.
        logur.log = instance;
    }
    return logur;
}
exports.init = init;
/**
 * Get Instance
 * Gets an existing Logur Instance by name.
 *
 * @param name the name of the Logur Instance to get.
 */
function get(name, options) {
    // Ensure Logur instance.
    var logur = init();
    var transport = logur.get(name);
    if (options)
        transport.setOption(options);
    return transport;
}
exports.get = get;
/**
 * Get
 * Gets the default Logur Instance.
 */
function getDefault(options) {
    var transport = get('default');
    if (options)
        transport.setOption(options);
    return transport;
}
exports.getDefault = getDefault;
//# sourceMappingURL=logur.js.map