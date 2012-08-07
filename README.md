UnitTests-bootstrap-for-Sencha-Touch
====================================

Learn how to quickly create an environment for UnitTest driven development for Sencha Touch applications  

Environment:
============
- System: Ubuntu Linux 12.04 x64  
- Projects folder: /home/[your-user-folder]/work  
- Applications folder: /home/[your-user-folder]/work/apps  
- Application folder: /home/[your-user-folder]/work/apps/[your-project-name]  
- Resources folder: /home/[your-user-folder]/work/resources  
- Tools folder: /home/[your-user-folder]/work/tools  
- Demo project name: demo  

Installing:
===========
- Install Sencha SDK Tools  
Download link: http://www.sencha.com/products/sdk-tools/  
Basics of using Sencha Command: http://docs.sencha.com/touch/2-0/#!/guide/command  

- Install Phantomjs
Download link: http://phantomjs.org/download.html  
1) Unzip phantomjs to your home folder (/home/[your-user-folder]/phantomjs).  
2) Make global link to phantomjs executable:  
        sudo ln -s /home/[your-user-folder]/phantomjs/bin/phantomjs /usr/local/bin/phantomjs  

- Install PhantomLint (extended or original version)  
Original version (by Arthur Kay) support single errors log file.  
Original download link: https://github.com/arthurakay/PhantomLint  
For multiple log files (one per app) you should use extended version from this repository 
1) Place PhantomLint to your projects resources folder 
Actual version of jslint.js (by Douglas Crockford) you can get here: https://github.com/douglascrockford/JSLint/  
2) Place PhantomLint runner scripts (run_lint.sh, JSLint-Runner.js) to 'tools' folder  
You can get these files from https://github.com/SenchaProSvcs/UnitTestDemo/tree/master/tests  
3) Make run_lint.sh executable. Run this command inside 'tools' folder:  
        sudo chmod +x run_lint.sh

- Install Jasmine framework  
Download link: https://github.com/pivotal/jasmine/downloads  
1) Place jasmine to your projects resources folder  

- Create 'tests' folder inside your application folder   

- Configure testing environment  
1) Configure PhantomLint script (JSLint-Runner.js file):
<!-- language: lang-js -->
        
        phantom.injectJs('../resources/phantomlint/PhantomLint.js');
        PhantomLint.init({
            
            // List here paths to all your apps 
            filepaths : [
                '../apps/demo/',
                '../apps/[your-second-app]/',
                '../apps/[your-another-app]/'
            ],
            
            // Excluded paths
            exclusions: [
                '../apps/demo/sdk/'
            ],

            jsLint: '../resources/phantomlint/assets/jslint.js',
            
            // Path where will be stored all errors logs
            logPath: '../logs/',
            logFile: '-lint-errors.txt'// Before each file will be added app name
        });

To be continued...