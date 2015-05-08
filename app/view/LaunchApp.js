Ext.define('Rms.view.LaunchApp', {
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.launchapp',
    config      : {
        tabBarPosition: 'bottom',
        tabBar: {
            scrollable: 'horizontal'
        },
        activeItem    : 0,
        layout            : {
            type: 'card' ,
            animation: {type: 'fade'}
        }
    },
    requires    : [
        'Rms.view.map.AssetMapPanel',
        'Rms.view.map.MapControlLocationsList',
        'Rms.view.map.MapControlGeofenceList'
    ],
    initialize  : function () {
        this.callParent(arguments);
    },
    createStores: function () {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Fetching all data...'
        });
        Ext.create('Rms.store.AssetPositionsStore');
        Ext.create('Rms.store.GeofencesStore');
        Ext.create('Rms.store.VisibleLocationsStore');
        Ext.create('Rms.store.ActiveAlarmsStore');
        Ext.create('Rms.store.AssetGroupStore');
        var assetStore = Ext.create('Rms.store.AssetStore');
        var assetsInGroupStore = Ext.create('Rms.store.AssetsInGroupStore');
        assetStore.on('load', function (store) {
            this.setItems([
                {
                    title             : 'Assets',
                    xtype             : 'assetview',
                    store             : store,
                    assetsInGroupStore: assetsInGroupStore,
                    iconCls           : 'bookmarks'
                }, {
                    title  : 'Map',
                    xtype  : 'mapview',
                    iconCls: 'map'
                }, {
                    title  : 'Alarms',
                    xtype  : 'alarmview',
                    iconCls: 'alarm'
                },
                {
                    title:'Stats',
                    xtype: 'statistics_view',
                    iconCls: 'stats'
                },
                //{
                //    title:'Profile',
                //    xtype: 'user_profile',
                //    iconCls: 'settings'
                //},
                {
                    title  : 'Logout',
                    iconCls: 'logout',
                    itemId : 'logout'
                }
            ]);
            Ext.Viewport.setMasked(false);
        }, this);

        /**
         * Set additional parameters for the asset store.
         */
        assetStore.setParams(Ext.apply({}, {
            domainObjectType: App.config.rootDomainObjectType,
            domainObjectId  : App.config.rootDomainObjectId
        }, assetStore.getParams()));
        assetStore.load();
    }
});