Ext.define('Rms.store.AssetPositionsStore', {
    extend  : 'Ext.data.Store',
    requires: ['Rms.model.AssetPositionsModel'],
    config  : {
        model   : 'Rms.model.AssetPositionsModel',
        storeId : 'assetPositionsStore',
        pageSize: 3000,
        autoLoad: false,
        proxy   : {
            type  : 'ajax',
            crossDomain: true,
            url   : App.config.serviceUrl + 'mobile/assetPositions/',
            reader: {
                type        : 'json',
                rootProperty: 'data'
            }

        }
    }
});