Ext.define('Unittest.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    
    requires: [
        'Ext.TitleBar',
        'Ext.Video'
    ],
    
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: 'Welcome',
                iconCls: 'home',

                styleHtmlContent: true,
                scrollable: true,

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Welcome to Sencha Touch 2'
                    }
                ]
            },

            {
                title: 'About',
                iconCls: 'info',
                layout: 'fit',
                padding: 4,
                styleHtmlContent: true,
                html: '<p><strong>UnitTests demo for Sencha Touch application</strong></p>' +
                      '<p>Author: Constantine Smirnov, <a href="http://mindsaur.com">http://mindsaur.com</a></p>' +
                      '<p>GitHub: <a href="https://github.com/kostysh/UnitTests-demo-for-Sencha-Touch-application">UnitTests-demo-for-Sencha-Touch-application</a></p>',
                scrollable: 'vertical'
            }
        ]
    }
});
