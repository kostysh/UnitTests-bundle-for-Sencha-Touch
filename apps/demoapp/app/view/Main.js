Ext.define('Demoapp.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    
    requires: [
        'Ext.TitleBar'
    ],
    
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                id: 'mainView',
                title: 'Welcome',
                iconCls: 'home',

                styleHtmlContent: true,
                scrollable: true,

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Demo app'
                    },
                    
                    {
                        id: 'startBtn',
                        xtype: 'button',
                        text: 'Start interval'
                    },
                    
                    {
                        id: 'processBtn',
                        xtype: 'button',
                        padding: 20,
                        style: 'margin-top: 10px;',
                        text: 1
                    }
                ]
            },

            {
                title: 'About',
                iconCls: 'info',
                layout: 'fit',
                padding: 4,
                styleHtmlContent: true,
                html: '<p><strong>UnitTests bundle for Sencha Touch</strong></p>' +
                      '<p>Author: Constantine Smirnov, <a href="http://mindsaur.com">http://mindsaur.com</a></p>' +
                      '<p>GitHub: <a href="https://github.com/kostysh/UnitTests-bundle-for-Sencha-Touch">UnitTests-bundle-for-Sencha-Touch</a></p>',
                scrollable: 'vertical'
            }
        ]
    }
});
