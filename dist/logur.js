"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var instance_1 = require("./instance");
var transports_1 = require("./transports");
var defaults = {
    transports: []
};
var Logur = (function () {
    function Logur(options) {
        this.instances = {};
        this.transports = {};
        if (Logur.instance)
            return Logur.instance;
        // Init options with defaults.
        this.options = u.extend({}, defaults, options);
        var instance;
        // Create the default Logur Instance.
        if (!this.instances['default'])
            instance = this.create('default', instance_1.LogurInstance);
        // Create the default Console Transport.
        instance.transports.create('console', transports_1.ConsoleTransport);
        // Iterate Transports and add
        // to default instance.
        this.options.transports.forEach(function (conf) {
            instance.transports.create(conf.name, conf.options, conf.transport);
        });
        // Save the default Logur Instance
        // for internal logging.
        this.log = instance;
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
    Logur.prototype.create = function (name, options) {
        if (!name)
            throw new Error('Failed to create Logur Instance using name of undefined.');
        return this.instances[name] = new instance_1.LogurInstance(name, options || {}, this);
    };
    /**
     * Remove
     * Destroys the specified Logur Instance.
     *
     * @param name
     */
    Logur.prototype.remove = function (name) {
        if (name === 'default')
            this.log.error('cannot remove default Logur Instance.').exit();
        delete this.instances[name];
    };
    return Logur;
}());
exports.Logur = Logur;
/**
 * Get Instance
 * Gets an existing Logur Instance by name.
 *
 * @param name the name of the Logur Instance to get.
 */
function get(name) {
    var logur = new Logur();
    return logur.get(name);
}
exports.get = get;
/**
 * Get
 * Gets the default Logur Instance.
 *
 */
function getDefault() {
    return get('default');
}
exports.getDefault = getDefault;
//# sourceMappingURL=logur.js.map