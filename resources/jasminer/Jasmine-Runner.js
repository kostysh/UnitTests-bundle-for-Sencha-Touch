/**
 * @filename Jasmine-Runner.js
 * @name Jasmine UnitTester
 * @fileOverview UnitTest runner with support for multiple pages
 * 
 * @author Constantine V. Smirnov kostysh(at)gmail.com
 * @date 20120808
 * @version 1.0
 * @license MIT
 * 
 */

if (!UTBConfig) {
    console.log('Configuration object not found!');
    phantom.exit();
}

(function(run) {
    
    /**
     * Bundle configuration
     * @property config
     * @private
     */
    run.config = UTBConfig;
    
    /**
     * Path to Jasmine css file (for logs)
     */
    run.cssPath = UTBConfig.baseFolders.resources + 'jasmine/lib/jasmine-1.2.0/jasmine.css';
    
    /**
     * PhantomJs filesystem link
     * @property fs
     * @private
     */
    run.fs = require('fs');
    
    /**
     * Intervals (for wailFor..)
     * @property interval
     * @private
     */
    run.interval = {};
    
    /**
     * Count of pages what will be parsed
     * @property willBeParsed
     * @private
     */
    run.willBeParsed = 0;
    
    /**
     * Count of already parsed pages
     * @property alreadyParsed
     * @private
     */
    run.alreadyParsed = 0;
    
    /**
     * Check parse process is done
     * @method isParsedAll
     * @private
     */
    run.isParsedAll = function() {
        if (run.alreadyParsed !== run.willBeParsed) {
            return false;
        } else {
            return true;
        }
    };
    
    /**
     * Increase parsed count
     * @method setAlreadyParsed
     * @private
     */
    run.setAlreadyParsed = function() {
        run.alreadyParsed++;
    };
    
    /**
     * Parse all projects tests
     * @method parse
     */
    run.parse = function(doneCallback) {
        
        if (typeof doneCallback !== 'function') {
            doneCallback = function() {};
        }
        
        var testsPaths = run.config.getAppsTestsPaths();
        run.willBeParsed = testsPaths.length;
        
        for (var i in testsPaths) {
            var appName = run.config.getAppNameByPath(testsPaths[i]);
            var logFileName = run.config.getLogFileName('jasmine', appName); 
            var page = new WebPage();
            
            // Translate all console messages from page to Phantomjs log
            page.onConsoleMessage = function(msg) {
                console.log(appName + ' has errors: ' + msg);
            };
            
            page.open(testsPaths[i], function(status) {
                if (status !== 'success') {
                    console.log('Loading filed: ' + testsPaths[i]);
                    return false;
                } else {
                    run.waitForPage(
                        appName,
                        
                        doneCallback,

                        function() {
                            return page.evaluate(function(){
                                
                                // Check if testing process is done
                                if (document.body.querySelector('span.duration')) {
                                    return true;
                                }
                                
                                return false;
                            });
                        }, 

                        function() {
                            
                            // This code runs in tests page context
                            var jasmineOutput = page.evaluate(function(cssPath) {
                                        
                                // Remove head from page
                                var head = document.getElementsByTagName('head');
                                head[0].parentNode.removeChild(head[0]);
                                
                                // Create new head and new style link
                                var newHead = document.createElement('head');
                                var css = document.createElement('link');
                                css.setAttribute("type", "text/css");
                                css.setAttribute("rel", "stylesheet");
                                css.setAttribute("href", cssPath);
                                newHead.appendChild(css);
                                
                                // Add new head with style link to page
                                document.getElementsByTagName('html')[0].appendChild(newHead);
                                
                                // Check for failed tests
                                var failings = document.body.querySelector('span.failingAlert');
                                if (failings) {
                                    console.log(failings.innerHTML);
                                }
                                
                                return document.documentElement.innerHTML;
                            }, run.cssPath);
                            
                            // Write page content to log file
                            run.fs.touch(logFileName);
                            var stream = run.fs.open(logFileName, 'w');
                            stream.writeLine(jasmineOutput);
                            stream.close();
                        }, 

                        3001);
                }
            });
        }
    };
    
    /**
     * Wait for page is loaded
     * @method waitForPage
     * @private
     */
    run.waitForPage = function (appName, callback, testFx, onReady, timeOutMillis) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001; //< Default Max Timeout is 3s
        var start = new Date().getTime();
        var condition = false;
        
        run.interval[appName] = setInterval(function() {
            if ((new Date().getTime() - start < maxtimeOutMillis) && 
                !condition) {

                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {

                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("Timeout");
                    return false;
                } else {

                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("Loading finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(run.interval[appName]); //< Stop this interval
                    delete run.interval[appName];
                    
                    run.setAlreadyParsed();
                    
                    if (run.isParsedAll()) {
                        callback();
                    }
                }
            }
        }, 75); //< repeat check every 75ms
    };
    
    window.JasmineRunner = run;
})({});