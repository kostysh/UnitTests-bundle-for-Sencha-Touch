phantom.injectJs('../resources/phantomlint/PhantomLint.js');
PhantomLint.init({
            
    // List here paths to all your apps 
    filepaths: [
        '../apps/demo/',
//        '../[your-second-app]/',
//        '../[your-another-app]/'
    ],
    
    exclusions: [
        '../apps/demo/sdk/'
    ],

    jsLint: '../resources/phantomlint/assets/jslint.js',
            
    // Path where will be stored all errors logs
    logPath: '../logs/',
    logFile: '-lint-errors.txt'// Before each file will be added app folder name
});