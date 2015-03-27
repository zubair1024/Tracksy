Ext.define('Rms.view.statistics.StatisticsView', {
    extend    : 'Ext.Panel',
    alias     : 'widget.statistics_view',
    requires  : [
    ],
    config    : {
        store             : null,
        assetsInGroupStore: null,
        layout            : {
            type: 'card' ,
            animation: {type: 'fade', direction: 'left'}
        },
        items:[
            {
                xtype: 'statistics_list'
            },
            {
                xtype: 'statistics_bar'
            },
            {
                xtype: 'statistics_line'
            },
            {
                xtype: 'statistics_pie'
            }
        ]
    }
});