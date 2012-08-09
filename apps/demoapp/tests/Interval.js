/**
 * Jasmine based test for Ext.ux.util.Interval class
 */

describe('Ext.ux.util.Interval', function() {
    var intrvl = Ext.create('Ext.ux.util.Interval', {
        name: 'Test',
        started: false,
        paused: true,
        removed: false,
        times: -1,
        timeout: 1000
    });
    
    describe('Initial object', function() {
        it('should be an object', function() {
            expect(typeof intrvl).toEqual('object');
        });
        
        it('should be named', function() {
            expect(intrvl.getName()).toBe('Test');
        });
        
        it('property interval should be initialized', function() {
            expect(typeof intrvl.interval).toEqual('number');
        });
        
        it('interval should be not started', function() {
            expect(intrvl.getPaused()).toBe(true);
        });
    });
    
    describe('start method', function() {
        var startFired = false;
        
        intrvl.on({
            start: function() {
                startFired = true;
            }
        });
        
        it('interval should be started', function() {
            intrvl.start();
            expect(intrvl.getPaused()).toBe(false);
            expect(intrvl.getStarted()).toBe(true);            
        });
        
        it('start event should fired', function() {
            expect(startFired).toBe(true);            
        });
    });
    
    describe('stop method', function() {
        var stopFired = false;
        
        intrvl.on({
            stop: function() {
                stopFired = true;
            }
        });
        
        it('interval should be paused', function() {
            intrvl.stop();
            expect(intrvl.getPaused()).toBe(true);
            expect(intrvl.getStarted()).toBe(false);
        });
        
        it('stop event should fired', function() {
            expect(stopFired).toBe(true);
        });
    });
});
