/**
 * Initialize bundle configuration
 */
phantom.injectJs('Config.js');

/**
 * Apply lint tests on registered apps
 */
phantom.injectJs(UTBConfig.baseFolders.resources + 'phantomlint/PhantomLint.js');
PhantomLint.init({
    filepaths: UTBConfig.getAppsPaths(),
    exclusions: UTBConfig.getExclusions(),
    getLogFileName: UTBConfig.getLogFileName,
    getAppNameByPath: UTBConfig.getAppNameByPath,
    jsLint: UTBConfig.baseFolders.resources + 'phantomlint/assets/jslint.js'
});

/**
 * Apply Jasmine UnitTests on registered apps
 */
phantom.injectJs(UTBConfig.baseFolders.resources + 'jasminer/Jasmine-Runner.js');
JasmineRunner.parse(function() {
    phantom.exit();
});

