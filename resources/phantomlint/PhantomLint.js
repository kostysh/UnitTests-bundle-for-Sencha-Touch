/**
 * This is extended version of PhantomLint 
 * based on Arthur Kay GitHub Project: https://github.com/arthurakay/PhantomLint
 * 
 * Key feature of this version is: multiple error logging
 */

var filesystem = require('fs'),
    JSLINT;

/**
 * @class PhantomLint
 * @author Constantine V. Smirnov kostysh(at)gmail.com
 * @author Arthur Kay (http://www.akawebdesign.com)
 * @singleton
 */
PhantomLint = {
    systemSlash: '/',
    
    /**
     * @property
     */
    verbose  : true,

    /**
     * @property
     */
    stopOnFirstError  : false,

    /**
     * @property
     */
    files    : {},

    /**
     * @property
     */
    exclusions : null,

    /**
     * @property
     */
    jsLint   : 'assets/jslint.js',
    
    /**
     * @property
     */
    logPath   : '../logs/',
    
    /**
     * @property
     */
    logFile   : 'error_log.txt',

    /**
     * @property
     */
    lintOptions : {
        nomen    : true, //if names may have dangling _
        plusplus : true, //if increment/decrement should be allowed
        sloppy   : true, //if the 'use strict'; pragma is optional
        vars     : true, //if multiple var statements per function should be allowed
        white    : true, //if sloppy whitespace is tolerated
        undef    : true  //if variables can be declared out of order
    },

    /**
     * @method
     * @param {object} config
     */
    applyLintOptions : function(config) {
        var i;

        if (!config) { return false; }

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                this.lintOptions[i] = config[i];
            }
        }
    },

    /**
     * @method
     * @param {object} config
     * @cfg {array} filepaths An array of relative filepaths to the folders containing JS files
     * @cfg {array} exclusions An array of relative filepaths to the folders containing JS files that should NOT be linted
     * @cfg {object} lintOptions A configuration object to add/override the default options for JS Lint
     * @cfg {boolean} verbose false to hide verbose output in your terminal (defaults to true)
     * @cfg {string} jsLint A relative filepath to the local JSLint file to use (defaults to ./assets/jslint.js)
     * @cfg {string} logFile A relative filepath to where the output error log should go.
     * @cfg {boolean} stopOnFirstError false to gather all errors in the file tree (defaults to true)
     */
    init : function(config) {
        //APPLY CONFIG OPTIONS
        this.applyLintOptions(config.lintOptions);

        if (config.verbose !== undefined) { this.verbose = config.verbose; }
        if (config.stopOnFirstError !== undefined) { this.stopOnFirstError = config.stopOnFirstError; }
        if (config.jsLint !== undefined) { this.jsLint = config.jsLint; }
        if (config.logFile !== undefined) { this.logFile = config.logFile; }
        if (config.exclusions !== undefined) { this.exclusions = config.exclusions; }

        this.log('JSLint? ' + phantom.injectJs(this.jsLint), true);
        if (!JSLINT) { phantom.exit(1); }

        this.parseTree(config.filepaths);
        this.log('Filesystem has been parsed. Looping through available files...');

        this.lintFiles();

        this.announceSuccess();
    },

    /**
     * @method
     */
    announceErrors: function(errorList, appName) {
        if (typeof this.logPath === 'string' && typeof this.logFile === 'string') {
            this.logToFile(errorList, appName);
        }

        this.log('\nFix Your Errors! Check the log file for more information.\n\n', true);
        phantom.exit(1);
    },

    /**
     * @method
     */
    announceSuccess: function() {
        this.log('\nSuccessfully linted yo shit.\n\n', true);
        phantom.exit(0);
    },

    /**
     * @method
     * @param {string} path
     */
    getFiles : function(path) {
        var tree = filesystem.list(path);

        this.log('\nFILES FOUND AT PATH:' + path);
        this.log(tree);

        return tree;
    },
    
    getAppName: function(path) {
        var subPath;
        
        if (path[path.length - 1] == this.systemSlash) {
            subPath = path.substring(0, path.length - 1);
        } else {
            subPath = path;
        }
        
        return subPath.substring(subPath.lastIndexOf(this.systemSlash) + 1);
    },

    /**
     * @method
     * @param {array} list
     * @param {string} path
     */
    parseTree : function(pathConfig, appName) {
        var i     = 0,
            regex = /.*\.js$/i,
            path  = [];

        if (typeof pathConfig === 'string') {
            path[0] = pathConfig;
        }
        else {
            path = pathConfig; //should be an array of strings
        }

        for (i; i < path.length; i++) {
            var currPath = path[i];
            var currAppName = appName || this.getAppName(currPath);
            this.log('*** currPath: ' + currPath);
            this.log('*** currApp: ' + currAppName);

            if (this.exclusions) {
                this.log('Checking exclusion paths...');

                var j = 0;
                var exclude = false;

                for (j; j < this.exclusions.length; j++) {
                    if (currPath === this.exclusions[j]) { exclude = true; }
                }

                if (exclude) {
                    this.log('Excluding path: ' + currPath);
                    continue;
                }
            }

            var list = this.getFiles(currPath);
            var x = 0;

            for (x; x < list.length; x++) {
                var childPath, childTree;
                
                if (typeof this.files[currAppName] === 'undefined') {
                    this.files[currAppName] = [];
                }

                if (filesystem.isFile(currPath + list[x])) {
                    this.log(list[x] + ' IS A FILE');
                    /**
                     * We only want JS files
                     */
                    if (regex.test(list[x])) {
                        this.files[currAppName].push(currPath + list[x]);
                        this.log(list[x] + ' IS A JS FILE. Added to the list.');
                    }
                    else {
                        this.log(list[x] + ' IS NOT A JS FILE');
                    }
                }
                else {
                    this.log(list[x] + ' IS NOT A FILE');

                    /**
                     * If not a file
                     *   - check against parent paths
                     *   - recurse into child paths
                     */
                    if (list[x] === '.' || list[x] === '..') {
                        this.log(list[x] + ' IS A RELATIVE DIRECTORY PATH');
                    }
                    else {
                        childPath = currPath + list[x] + '/';
                        this.parseTree(childPath, currAppName);
                    }
                }
            }
        }
    },

    /**
     * @method
     */
    lintFiles : function() {
        var errorList = [],
            file, js;

        /**
         * Loop through all files
         */
        for (var app in this.files) {
            for (var j in this.files[app]) {

                file = this.files[app][j];
                js   = filesystem.read(file);
                
                var i           = 0,
                    result      = JSLINT(js, this.lintOptions),
                    totalErrors = JSLINT.errors.length,
                    error;

                if (!result) {
                    for  (i; i < totalErrors; i++)  {
                        error = JSLINT.errors[i];

                        if (error) {
                            errorList.push(
                                file,
                                '    Line #: ' + error.line,
                                '    Char #: ' + error.character,
                                '    Reason: ' + error.reason,
                                '',
                                ''
                            );

                            if (this.stopOnFirstError) { break; }
                        }
                    }

                    if (this.stopOnFirstError && errorList.length > 0) {
                        this.announceErrors(errorList, app);
                    }
                }
            }

            if (errorList.length > 0) {
                this.announceErrors(errorList, app);
            }
        }
    },

    /**
     *
     */
    logToFile : function(errorList, filePrefix) {
        if (!filePrefix) {filePrefix = '';}
        this.log('\nWriting ' + (errorList.length / 6) + ' errors to log file.', true);
        
        var logFileName = this.logPath + filePrefix + this.logFile;
        
        filesystem.touch(logFileName);

        var stream = filesystem.open(logFileName, 'w');

        var i = 0;
        for (i; i < errorList.length; i++) {
            stream.writeLine(errorList[i]);
        }

        stream.close();
    },

    /**
     * @method
     * @param {string} msg
     * @param {boolean} override
     */
    log : function(msg, override) {
        if (this.verbose || override) {
            console.log(msg);
        }
    }
};