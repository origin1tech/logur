"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var u = require("./utils");
var instance_1 = require("./instance");
var transports_1 = require("./transports");
var Logur = (function () {
    // log: ILogurInstance<ILevelMethodsDefault> & ILevelMethodsDefault;
    /**
     * Constructs Logur
     */
    function Logur() {
        this.instances = {};
        this.transports = {};
        if (Logur.instance)
            return Logur.instance;
        Logur.instance = this;
    }
    Object.defineProperty(Logur.prototype, "log", {
        /**
         * Log
         * Gets the default internal logger.
         */
        get: function () {
            // If log exists just return it.
            //if (this._log)
            return this.instance;
            // // Create the instance.
            // let instance = this.create<ILevelMethodsDefault>('default');
            // return this._log = instance;
        },
        enumerable: true,
        configurable: true
    });
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
 * Get
 * Gets the default Logur Instance.
 *
 * @param options the Logur Instance options.
 */
function get(options) {
    // Get Logur.
    var logur = new Logur();
    // Get the default instance if exists.
    var instance = logur.get('default');
    // If no instance create it.
    if (!instance) {
        var consoleTransport = {
            name: 'console',
            transport: transports_1.ConsoleTransport
        };
        // Ensure options.
        options = options || {
            transports: [consoleTransport]
        };
        options.transports = options.transports || [];
        // Check if Console Transport exists.
        var hasConsole = options.transports.filter(function (t) {
            return t.name === 'console' || u.isInstance(t.transport, transports_1.ConsoleTransport);
        })[0];
        // If no Console Transport push config and create instance.
        if (!hasConsole)
            options.transports.push(consoleTransport);
        // Create the instance.
        instance = logur.create('default', options);
        logur.instance = instance;
    }
    return instance;
}
exports.get = get;
//# sourceMappingURL=logur.js.map