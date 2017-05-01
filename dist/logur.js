"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var instance_1 = require("./instance");
var transports_1 = require("./transports");
var defaults = {};
var Logur = (function () {
    function Logur(options) {
        this.instances = {};
        this.transports = {};
        if (Logur.instance)
            return Logur.instance;
        // Init options with defaults.
        this.options = u.extend({}, defaults, options);
        // Create the default instance.
        if (!this.instances['default']) {
            // Create the default Logur Instance.
            var instance = this.create('default', instance_1.LogurInstance);
            // Create the default console transport.
            // Because we're using a public "get" in instance
            // we don't pass type arg because Typescript will
            // complain. We don't need it here in case you're
            // wondering. Will work as expected from exposed API.
            instance.transports.create('console', transports_1.ConsoleTransport);
            // Save the default Logur Instance.
            this.log = instance;
        }
        // Store instance for singleton.
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
                console.log('error', "cannot set option for key " + key + " using value of undefined.");
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
    Logur.prototype.create = function (name, options, Type) {
        if (!name)
            throw new Error('Failed to create Logur Instance using name of undefined.');
        if (!u.isPlainObject(options)) {
            Type = options;
            options = undefined;
        }
        return this.instances[name] = new Type(name, options || {}, this);
    };
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    Logur.prototype.remove = function (name) {
        if (name === 'default')
            return this.log.error('cannot remove default Logur Instance.');
        delete this.instances[name];
    };
    return Logur;
}());
exports.Logur = Logur;
/**
 * Get
 * Gets an existing Logur instance by name. If
 * no name is passed the 'default' Logur Instance
 * will be returned.
 *
 * @param name the name of the Logur instance to get.
 */
function get(name) {
    if (name === void 0) { name = 'default'; }
    var logur = new Logur();
    return logur.get(name);
}
exports.get = get;
//# sourceMappingURL=logur.js.map