Ext.define('Demoapp.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: [
        
    ],
    
    config: {
        refs: {
            mainView: '#mainView',
            startBtn: '#startBtn',
            processBtn: '#processBtn'
        },

        control: {
            mainView: {
                initialize: 'onMainViewInitialize'
            },
            
            startBtn: {
                tap: 'onStartBtnTap'
            }
        }
    },
    
    onMainViewInitialize: function() {
        Intervalr.add('test', {
            timeout: 1500,// Timeout in milliseconds
            times: -1,// Infinity
            listeners: {
                scope: this,
                execute: function() {
                    var processBtn = this.getProcessBtn();
                    processBtn.setText(processBtn.getText() + 1);
                },
                exception: function(err) {
                    console.log('Error', err);
                }
            }
        });
        
        Intervalr.addListeners('test', {
            scope: this,
            start: this.onIntervalStart,
            stop: this.onIntervalStop
        });
    },
    
    onStartBtnTap: function(btn) {
        Intervalr.toggle('test');         
    },
    
    onIntervalStart: function() {
        var btn = this.getStartBtn();
        btn.setText('Stop interval');
        btn.setUi('confirm');
        console.log('Start');
    },
    
    onIntervalStop: function() {
        var btn = this.getStartBtn();
        btn.setText('Start interval');
        btn.setUi('normal');
        console.log('Stop');
    }    
});
