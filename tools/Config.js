/**
 * @filename Config.js
 * @name Configuration file
 * @fileOverview Configuration file for UnitTests bootstrap bundle for Sencha Touch
 * 
 * @author Constantine V. Smirnov kostysh(at)gmail.com
 * @date 20120808
 * @version 1.0
 * @license MIT
 * 
 */

(function(config) {
    
    /**
     * Paths from 'tools' folder to base bundle folders
     * @property {Object} baseFolders Object with paths
     */
    config.baseFolders = {
        resources: '../resources/',
        apps: '../apps/',
        logs: '../logs/'
    };
    
    /**
     * Template names for errors logs
     * @property {Object} logFilesTpl Object with templates
     * date will be replaced with ISO formated date string
     */
    config.logFilesTpls = {
        lint: '{app}-lint-errors-{date}.txt',// Demoapp-lint-errors-2012-08-09T17:46:21.txt
        jasmine: '{app}-jasmine-output-{date}.html'
    };
    
    /**
     * Default tests runner script name
     * @property testsRunner
     */
    config.testsRunner = 'index.html';
    
    
    /**
     * Applications config
     * @property {Object} apps Object with apps config
     */
    config.apps = [
        {
            /**
             * Flag indicating that app should be tested (if false - not)
             * @param {Boolean} active true||false
             */
            active: true,
            
            /**
             * Application name (should be unique)
             * @param {String} name
             */
            name: 'Demoapp',
            
            /**
             * Application folder name (path under base apps folder)
             */
            path: 'demoapp/',
            
            /**
             * Excluded paths under app folder
             */
            exclusions: [
                'sdk/'
            ],
            
            /**
             * UnitTests folder path under app folder
             */
            tests: 'tests/'
        },
        
//        {
//            active: false,
//            name: 'NextApp',
//            path: '../apps/nextapp/',
//            exclusions: [
//                'sdk/',
//                'oldversion/',
//                'tests/'
//            ]
//        },
    ];
    
    /**
     * Get paths to all apps folders
     * @method getAppsPaths
     * @return {Array}
     */
    config.getAppsPaths = function() {
        var paths = [];
        
        for (var i in config.apps) {
            if (config.apps[i].active) {
                paths.push(config.baseFolders.apps + config.apps[i].path);
            }
        }
        
        return paths;
    };
    
    /**
     * Get paths to tests runners for registered apps
     * @method getAppsTestsPaths
     * @return {Array}
     */
    config.getAppsTestsPaths = function() {
        var paths = [];
        
        for (var i in config.apps) {
            if (config.apps[i].active) {
                paths.push(config.baseFolders.apps + 
                           config.apps[i].path +
                           config.apps[i].tests + 
                           config.testsRunner);
            }
        }
        
        return paths;
    };
    
    /**
     * Get path to all excluded filders
     * @method getExclusions
     * @return {Array}
     */
    config.getExclusions = function() {
        var exclusions = [];
        
        for (var i in config.apps) {
            if (config.apps[i].active) {
                for (var y in config.apps[i].exclusions) {
                    exclusions.push(config.baseFolders.apps + 
                                    config.apps[i].path + 
                                    config.apps[i].exclusions[y]);
                }
            }
        }
        
        return exclusions;
    };
    
    /**
     * Checking for app config existence
     * @method isAppConfigured
     * @return {Boolean}
     */
    config.isAppConfigured = function(appName) {
        for (var i in config.apps) {
            if (config.apps[i].name) {
                return true;
            }
        }
        
        return false;
    };
    
    /**
     * Get log file name for selected tool and app
     * @method getLogFileName
     * @return {String/null}
     */
    config.getLogFileName = function(toolName, appName) {
        if (typeof config.logFilesTpls[toolName] !== 'undefined' && 
            config.isAppConfigured(appName)) {
            
            var fileName = config.logFilesTpls[toolName];
            var date = new Date();
            fileName = fileName.replace('{date}', date.toISOString());
            fileName = fileName.replace('{app}', appName);            
            return config.baseFolders.logs + fileName;
        } else {
            return null;
        }
    };
    
    /**
     * Get application name by path
     * @method getAppNameByPath
     * @param {String} path
     * @return {String/null} App name
     */
    config.getAppNameByPath = function(path) {
        path = path.replace(config.baseFolders.apps, '');
        var pathParts = path.split('/');
        var appFolder = pathParts[0] + '/';
        
        for (var i in config.apps) {
            if (config.apps[i].path === appFolder) {
                return config.apps[i].name;
            }
        }
        
        return null;
    };
    
    window.UTBConfig = config;
})({});