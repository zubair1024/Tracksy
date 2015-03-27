Ext.define('Rms.store.AssetGroupStore', {
    extend  : 'Ext.data.Store',
    requires: ['Rms.model.AssetGroupModel'],
    config  : {
        model   : 'Rms.model.AssetGroupModel',
        storeId : 'assetGroupStore',
        autoLoad: false,
        pageSize: 800,
        grouper: {
            groupFn: function (item) {
                return item.get('name')[0].toUpperCase();
            } // groupFn
        }, // grouper
        sorter:{
            property: 'name',
            direction: 'ASC'
        },
        params  : {
            view: 'oid,name,timeSinceLastMessage,domainObjectType'
//            domainObjectValues: ['name', 'internalNumber', 'group', 'driver', 'alarmStatusForAsset', 'lastReportTime', 'lastReportType', 'assetStatus', 'location', 'configuration', 'active']
        },
        proxy   : {
            type  : 'ajax',
            url   : App.config.serviceUrl + 'mobile/visibleAssetGroups/',
            reader: {
                type        : 'json',
                rootProperty: 'data'
            }
        }
    }
});