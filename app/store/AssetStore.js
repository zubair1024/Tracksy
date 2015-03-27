Ext.define('Rms.store.AssetStore', {
    extend  : 'Ext.data.Store',
    requires: ['Rms.model.AssetModel'],
    config  : {
        model          : 'Rms.model.AssetModel',
        storeId        : 'assetStore',
        pageSize       : 5000,
        buffered       : true,
        clearOnPageLoad: false,
        remoteSort : false,
        params         : {
            domainDataView: 'allAssets',
            //sortValue     : 'lastReportTime',
            //sortOrder     : 1,
            filters       : JSON.stringify([])
        },
        grouper: {
            groupFn: function (item) {
                return;
            } // groupFn
        }, // grouper
        sorters: [{
        }],
        proxy          : {
            type       : 'ajax',
            crossDomain: true,
            url        : App.config.serviceUrl + 'caesarObject/objectDataProvider3',
            reader     : {
                type         : 'json',
                rootProperty : 'ui.items',
                totalProperty: 'originalSize'
            },
            extraParams: {
                domainObjectValues: JSON.stringify([
                    'name',
                    'lastReportTime',
                    'assetStatus',
                    'location',
                    'internalNumber',
                     'group',
                     'driver',
                    'alarmStatusForAsset',
                    'lastReportType',
                    'configuration',
                    'active'
                ])
            },
            limitParam : 'take',
            pageParam  : 'page',
            startParam : 'skip',

        }
    }
});