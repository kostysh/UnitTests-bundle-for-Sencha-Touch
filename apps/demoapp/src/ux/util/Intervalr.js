/**
 * @filename Intervalr.js
 * @name Intervals manager
 * @fileOverview Util to manage javascript intervals
 *
 * @author Constantine V. Smirnov kostysh(at)gmail.com
 * @date 20120727
 * @version 1.0
 * @license  GNU GPL v3.0
 *
 * @requires Sencha Touch 2.0
 * @requires Ext.mixin.Observable
 * @requires Ext.util.AbstractMixedCollection
 * 
 * Usage:
    
    // Setup path for custom components in app.js
    Ext.Loader.setPath({
        'Ext.ux': 'src/ux'
    });

    // Require Intervalr class in app.js
    requires: ['Ext.ux.util.Intervalr']
    
    // Create new interval
    Intervalr.add('yourinervalname', {
        timeout: 10000,// Timeout in milliseconds
        times: -1,     // Infinity
        listeners: {
            execute: function() {
                console.log('He dude!');
            },
            exception: function(err) {
                console.log('Error', err);
            }
        }
    });

    // Setup some extra listeners
    Intervalr.addListeners('yourinervalname', {
        scope: this,
        statuschange: this.onStatusChangeListener,
        finish: this.onFinishListener
    });

    // Start interval
    Intervalr.start('yourinervalname');
    
    // Set paused
    Intervalr.pause('yourinervalname');

    // Inverse paused value
    Intervalr.toggle('yourinervalname');
    
    // Remove interval
    Intervalr.remove('yourinervalname');
 
 *
 */

/**
 * @event beforeadd
 * Fired before when interval added to collection
 * @param {Object} Intervalr object
 */

/**
 * @event add
 * Fired when new interval added to collection
 * @param {Object} Interval object
 */

/**
 * @event remove
 * Fired when interval removed from collection
 * @param {Object} Interval object
 */

Ext.define('Ext.ux.util.Intervalr', {
    mixins: ['Ext.mixin.Observable'],
    alternateClassName: 'Intervalr',
    singleton: true,
    
    requires: [
        'Ext.ux.util.Interval',
        'Ext.util.AbstractMixedCollection'
    ],
    
    config: {
        times: -1,// Default times count [means infinity]
        timeout: 10000// Default timeout
    },
    
    collection: null,
    
    listeners: {
        add: 'onIntervalAdd',
        remove: 'onIntervalRemove'
    },
    
    /**
     * @private
     */
    constructor: function(config) {
        var me = this;
        
        me.collection = Ext.create('Ext.util.AbstractMixedCollection');
        me.collection.on(Ext.apply(me.listeners, {scope: me}));
        me.initConfig(config);
        return me;
    },
    
    /**
     * @private
     */
    onIntervalAdd: function(index, interval, name) {
        this.fireEvent('add', interval, name, index);                
    },
    
    /**
     * @private
     */
    onIntervalRemove: function(interval, key) {
        this.fireEvent('remove', interval, key);
    },
    
    /**
     * Add new interval to collection and start it
     * @param {string} name Interval name
     * @param {object} config Interval configuration object
     */
    add: function(name, config) {
        var me = this;
        
        if (me.fireEvent('beforeadd') !== false) {
            var interval = me.collection.add(name, 
                Ext.create('Ext.ux.util.Interval', {
                    name: name,
                    times: config.times || me.getTimes(),
                    timeout: config.timeout || me.getTimeout()
            }));
            
            if (Ext.isObject(config.listeners)) {
                interval.on(config.listeners);
            }            
        } else {
            me.fireEvent('exception', {
                message: 'Before add listener filed',
                time: new Date()
            }, me);
        }
    },
    
    /**
     * Start interval by name
     * @method
     * @param {String} name Interval name
     */
    start: function(name) {
        this.collection.get(name).start();
    },
    
    /**
     * Stop interval by name
     * @method
     * @param {String} name Interval name
     */
    stop: function(name) {
        this.collection.get(name).stop();
    },
    
    /**
     * Pause interval by name
     * @method
     * @param {String} name Interval name
     */
    pause: function(name) {
        this.collection.get(name).pause();
    },
    
    /**
     * Resume interval by name
     * @method
     * @param {String} name Interval name
     */
    resume: function(name) {
        this.collection.get(name).resume();
    },
    
    /**
     * Inverse paused property value for interval
     * @method
     * @param {string} name Interval name
     */
    toggle: function(name) {
        this.collection.get(name).toggle();
    },
    
    /**
     * Remove interval by name
     * @method
     * @param {String} name Interval name
     */
    remove: function(name) {
        this.collection.get(name).remove();
        this.collection.removeAtKey(name);
    },
    
    /**
     * Add listeners to interval
     * @method
     * @param {String} name Interval name
     * @param {Object} config Listeners config
     */
    addListeners: function(name, config) {
        var me = this;
        
        if (Ext.isObject(config)) {
            me.collection.get(name).on(config);
        } else {
            me.fireEvent('exception', {
                message: 'Wrong interval listener',
                time: new Date()
            }, me);
        }
    },
    
    /**
     * Start all intervals
     * @method
     * @param {String} name Interval name
     */
    startAll: function() {
        var me = this;
        
        me.collection.each(function(interval, index) {
            interval.start();
        });
    },
    
    /**
     * Stop all intervals
     * @method
     */
    stopAll: function() {
        var me = this;
        
        me.collection.each(function(interval, index) {
            interval.stop();
        });
    },
    
    /**
     * Clear all intervals
     * @method
     */
    removeAll: function() {
        var me = this;
        
        me.collection.each(function(interval, index) {
            interval.remove();
            me.collection.removeAt(index);
        });
    }
});