/**
 * @filename Interval.js
 * @name Interval object
 * @fileOverview Interval object class
 *
 * @author Constantine V. Smirnov kostysh(at)gmail.com
 * @date 20120727
 * @version 1.0
 * @license GNU GPL v3.0
 *
 * @requires Sencha Touch 2.0
 * @requires Ext.mixin.Observable
 * @rewuires Ext.Base
 * 
 */

/**
 * @event beforeexecute
 * Fired before when interval executed
 * @param {Object} Interval object
 */

/**
 * @event execute
 * Fired each time interval executed
 * @param {Object} Interval object
 */

/**
 * @event exception
 * Fired when exception occured
 * @param {Object} Interval object
 */

/**
 * @event start
 * Fired when interval is started or resumed
 * @param {Object} Interval object
 */

/**
 * @event stop
 * Fired when interval is stopped
 * @param {Object} Interval object
 */

/**
 * @event resume
 * Fired when interval is resummed
 * @param {Object} Interval object
 */

/**
 * @event statuschange
 * Fired when interval paused status is changed
 * @param {Object} Interval object
 */

/**
 * @event remove
 * Fired when interval is removed
 * @param {Object} Interval object
 */

/**
 * @event finish
 * Fired when interval is finished
 * @param {Object} Interval object
 */

Ext.define('Ext.ux.util.Interval', {
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
    
    interval: null,
    
    config: {
        name: '',
        started: false,
        paused: true,
        removed: false,
        times: -1,
        timeout: 1000
    },
    
    /**
     * @private
     */
    constructor: function(config) {
        var me = this;
        me.initConfig(config);
        return me;
    },
    
    create: function(timeout) {
        var me = this;
        me.interval = window.setInterval(function() {
            me.doExecute.call(me);
        }, timeout);
    },
    
    remove: function() {
        var me = this;
        
        me.stop();
        window.clearInterval(me.interval);
        me.interval = null;
        me.setRemoved(true);
        me.fireEvent('remove', me);
    },
    
    start: function() {
        this.setPaused(false);
    },
    
    stop: function() {
        this.setPaused(true);
    },
    
    pause: function() {
        this.stop();
    },
    
    /**
     * Restore times value and start interval
     */
    resume: function() {
        var me = this;
        var config = me.getInitialConfig();
        me.setTimes(config.times);
        me.fireAction('resume', [me], me.start);
    },
    
    toggle: function() {
        var me = this;
        var paused = me.getPaused();
        
        if (paused) {
            me.start();
        } else {
            me.pause();
        }
    },
    
    updateTimeout: function(newTimeout, oldTimeout) {
        var me = this;
        
        if (oldTimeout) {
            me.remove();
        }
        
        if (newTimeout) {
            me.create(newTimeout);
        }
    },
    
    updateStarted: function(started) {
        var me = this;
        
        if (started) {
            me.fireEvent('start', me);
        } else {
            me.fireEvent('stop', me);
        }
    },
    
    updatePaused: function(paused) {
        var me = this;
        
        me.fireEvent('statuschange', paused, me);
        
        if (paused) {
            me.fireEvent('pause', me);
            me.setStarted(false);
        } else {
            me.setStarted(true);
        }
    },
    
    doExecute: function() {
        var me = this;
        
        if (me.getPaused() || me.getRemoved()) {
            return;
        }
        
        if (me.fireEvent('beforeexecute', me) !== false) {
            me.fireAction('execute', [me], me.changeTimes);
        } else {
            me.setStarted(false);
            me.setPaused(true);
            me.fireEvent('exception', {
                message: 'Before execution listener filed',
                time: new Date()
            }, me);
        }
    },
    
    changeTimes: function() {
        var me = this;
        var times = me.getTimes();
        
        if (times !== -1) {
            if (times > 0) {
                me.setTimes(times - 1);
            } else {
                me.fireAction('finish', [me], me.stop);
            }
        } 
    }
});