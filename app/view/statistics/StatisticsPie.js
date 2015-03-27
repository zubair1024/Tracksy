Ext.define('Rms.view.statistics.StatisticsPie', {
    extend: 'Ext.Panel',
    alias: 'widget.statistics_pie',
    requires: [
        'Ext.chart.PolarChart',
        'Ext.chart.series.Pie',
        'Ext.chart.interactions.Rotate',
        'Ext.carousel.Carousel',
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Bar',
        'Ext.chart.series.Line',
        'Ext.chart.interactions.PanZoom',
        'Ext.chart.interactions.ItemInfo'
    ],
    config: {
        store: null,
        assetsInGroupStore: null,
        layout: 'card',
        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: 'Back',
                        ui: 'back',
                        id: 'statisticsPieBckBtn'
                    }
                ]
            }
        ]
    },
    updateData: function (record) {
        console.log(record);
        if(record.get('id')=='liveAssetStatus'){

        }
        var normal = 0;
        var idling = 0;
        var notMoving = 0;
        var notOperational = 0;
        store = Ext.getStore('assetStore');
        store.each(function(record){
                state = record.get('assetStatus');
                switch (state){
                    case'normal':++normal;break;
                    case 'idling':++idling;break;
                    case 'notOperational':++notOperational;break;
                    case 'notMoving':++notMoving;break;
                }}

        );
        this.setItems({
            xtype: 'polar',
            shadow: true,
            theme: 'Base:gradients',
            showInLegend: true,
            animate: true,
            interactions: ['rotate'],
            colors: ["#00CC00", "#FFFF00", "#CC0000", "#3300CC"],
            store: {
                fields: ['name', 'data1'],
                data: [{
                    'name': 'Normal ('+normal+')',
                    'data1': normal
                },
                    {
                        'name': 'Idle ('+idling+')',
                        'data1': idling
                    },
                    {
                        'name': 'Not Operational ('+notOperational+')',
                        'data1': notOperational
                    }]
            },
            legend: {
                docked: 'top',
                verticalWidth: 100
            },
            series: [{
                type: 'pie',
                showInLegend: true,
                labelField: 'name',
                xField: 'data1',
                tips: {
                    trackMouse: true,
                    width: 140,
                    height: 28,
                    renderer: function (storeItem, item) {
                        //calculate percentage.
                        var total = 0;
                        store1.each(function (rec) {
                            total += rec.get('data1');
                        });
                        this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('data1') / total * 100) + '%');
                    }
                },
                interactions: [{
                    type: 'panzoom',
                    zoomOnPanGesture: true
                }, {
                    type: 'iteminfo',
                    listeners: {
                        show: function (me, item, panel) {
                            panel.getDockedItems()[0].setTitle("Info");
                            panel.setHtml('<h3>' + title + '</h3><hr><span><b>' + item.field.toUpperCase() + '</b> : ' + item.record.get(item.field) + '</span><br><span><b>TIME : </b>' + item.record.get('Time') + '</span>');
                        }
                    }
                }],
                //donut: 30,
                highlight: {
                    segment: {
                        margin: 20
                    }
                },
                label: {
                    field: 'name',
                    display: 'rotate',
                    contrast: true,
                    font: '18px Arial'
                }
            }]
        });
    }
});