UnitTests-bundle-for-Sencha-Touch
=================================

Create environment for UnitTest driven development for Sencha Touch applications in minutes    

Versions:
=========
- 1.0 Beta: Initial release. Seems to works but...  
(in next release: code refactoring, more tests examples, etc...)  

Thanks:
=======
- Arthur Kay for good article http://www.sencha.com/blog/automating-unit-tests/  
and code: https://github.com/SenchaProSvcs/UnitTestDemo

Features:
=========
- Run JSLint tests  
- Run Jasmin UnitTests  
- Support for multiple projects  
- Ease to install  
- Demo project with tests

Requirements:
=============
- Ubuntu Linux 12.04 x64  
You can rewrite this guide for your system.  

Folders structure:
==================
- Projects folder: /home/[your-user-folder]/work  
- Applications folder: /home/[your-user-folder]/work/apps  
- Application folder: /home/[your-user-folder]/work/apps/[your-project-name]  
- Resources folder: /home/[your-user-folder]/work/resources  
- Tools folder: /home/[your-user-folder]/work/tools  
- Tests folder: /home/[your-user-folder]/work/apps/[your-project-name]/tests  
- Demo project name: demo  
- Tests index file name: index.html

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

- Place 'resources' and 'tools' folders into your projects folder  
- Make testall.sh executable. Run chmod command inside 'tools' folder:  
        
        sudo chmod +x testall.sh

- Create 'tests' folder inside your application folder and create there index.html  
- Create UnitTests files inside 'tests folder'  
- Configure your texts index file. Insert links to classes and tests into index.html  
        
        <!-- include source files here... -->
        <script type="text/javascript" src="../src/ux/util/Interval.js"></script>
        <script type="text/javascript" src="../src/ux/util/Intervalr.js"></script>


        <!-- include spec files here... -->
        <script type="text/javascript" src="Interval.js"></script>

- Configure enviroment (Config.js file in 'tools' folder):  
        
        <!-- language: lang-js -->
        
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
        
Usage:  
======
- Run testall.sh in 'tools' folder from console
- Lint errors will be stored in logs folder
- Jasmine output will be store in logs folder

Useful links:  
=============
- https://github.com/arthurakay/PhantomLint  
- https://github.com/douglascrockford/JSLint  
- http://pivotal.github.com/jasmine/  