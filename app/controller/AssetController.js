Ext.define('Rms.controller.AssetController', {
    extend: 'Ext.app.Controller',
    requires: [
        'Rms.view.asset.AssetView',
        'Rms.view.asset.AssetDetails',
        'Rms.view.common.AssetListPanel',
        'Rms.store.AssetGroupStore',
        'Rms.view.statistics.StatisticsView',
        'Rms.view.statistics.StatisticsList'
    ],

    config: {
        refs: {
            launchApp: 'launchapp',
            assetView: 'assetview',
            assetList: 'assetview asset_list list',
            assetGrouping: 'assetview asset_list toolbar button[text=Group List]',
            assetGroupList: 'asset_groups_list',
            assetGroupListtotalToolbar: 'asset_groups_list toolbar[id=totalToolbarGroups]',
            assetGroupListBackBtn: 'asset_groups_list toolbar #back',
            assetDetails: 'asset_details',
            assetDetailView: 'assetview asset_details',
            assetDetailsToolbar: 'assetview asset_details toolbar',
            assetDtlBackBtn: 'assetview asset_details toolbar #back',
            assetOptionsBtn: 'assetview asset_details toolbar button[text=Options]',
            assetDtlNavBtn: 'assetview asset_details toolbar button[text=Navigate To Asset]',
            assetDtlSMSBtn: 'assetview asset_details toolbar button[text=Navigate To Me]',
            assetGroupListTap: 'assetview asset_groups_list list',
            assetsInGroupListBackBtn: 'assetview assets_in_group toolbar #back',
            assetsInGroupList: 'assets_in_group list',
            assetsInGrouptotalToolbar: 'assets_in_group toolbar[id=totalToolbarInGroup]',
            assetListSearch: 'assetview asset_list searchfield',
            groupListSearch: 'assetview asset_groups_list searchfield',
            assetInGroupListSearch: 'assetview assets_in_group searchfield',
            nearestAsset: 'assetview asset_nearest_list',
            nearestAssetList: 'assetview asset_nearest_list list',
            nearestAssetBtn: 'assetview asset_list toolbar button[id=nearest_Asset]',
            nearestAssetBckBtn: 'assetview asset_nearest_list toolbar button[id=nearest_AssetBckBtn]',
            nearestAssetDtlBckBtn: 'assetview asset_details toolbar #near',
            groupOnMapBtn: 'assetview assets_in_group toolbar button[id=groupOnMap]',
            //Statistics
            statisticsView: 'statistics_view',
            statisticsList: 'statistics_view statistics_list list',
            statisticsBarView: 'statistics_view statistics_bar',
            statisticsPieView: 'statistics_view statistics_pie',
            statisticsBarViewBackBtn: 'statistics_view statistics_bar button[id=statisticsBarBckBtn]',
            statisticsPieViewBackBtn: 'statistics_view statistics_pie button[id=statisticsPieBckBtn]',
            statisticsLineViewBackBtn: 'statistics_view statistics_line button[id=statisticsLineBckBtn]'
        },
        control: {
            statisticsList: {
                itemtap: function (list, index, target, record, e, opts) {
                    this.getStatisticsList().deselectAll();
                    if (record.raw.supportedViewTypes[0] == 'bar') {
                        this.getStatisticsView().setActiveItem(1);
                        this.getStatisticsBarView().updateData(record);
                    }
                    else if (record.raw.supportedViewTypes[0] == 'pie') {
                        this.getStatisticsView().setActiveItem(3);
                        this.getStatisticsPieView().updateData(record);
                    }
                    else if (record.raw.supportedViewTypes[0] == 'line') {
                        this.getStatisticsView().setActiveItem(2);
                        this.getStatisticsPieView().updateData(App.config.rootDomainObjectId, record.get('id'));
                    }
                    else {
                        Ext.Msg.alert('Alert', 'Sorry, we do not support the graph type right now.');
                    }
                }
            },
            statisticsBarViewBackBtn: {
                tap: function () {
                    this.getStatisticsView().setActiveItem(0);
                }
            },
            statisticsPieViewBackBtn: {
                tap: function () {
                    this.getStatisticsView().setActiveItem(0);
                }
            },
            statisticsLineViewBackBtn: {
                tap: function () {
                    this.getLaunchApp().setActiveItem(0);
                    this.getStatisticsView().setActiveItem(0);
                }
            },
            //temp stop
            groupOnMapBtn: {
                tap: function () {
                    var domainObjectId = [];
                    var assetsInGroupStore = Ext.getStore('assetsInGroupStore');
                    assetsInGroupStore.each(function (item) {
                        domainObjectId.push(item.get('domainObjectId'));
                    });
                    var domainObjectIdString = domainObjectId.join(',');
                    Rms.app.getController('MapController').showSingleGroupOnMap(domainObjectIdString);
                }
            },
            nearestAssetDtlBckBtn: {
                tap: function () {
                    this.getAssetView().setActiveItem(9);
                    this.getNearestAsset().updateData();
                }
            },
            nearestAssetList: {
                itemtap: function (list, index, target, record, e, opts) {
                    var mee = this;
                    list.deselectAll();
                    var assetStore = Ext.getStore("assetStore");
                    assetStore.each(function (i) {
                        if (i.get('name') == record.get('assetName')) {
                            domainObjectType = i.get('domainObjectType');
                            domainObjectId = i.get('domainObjectId');
                        }
                    });
                    this.domainObjectName = record.get('assetName');
                    // This has been implemented to only display "short" names in the toolbar title.
                    domainDataView = 'details';

                    // Fetch details for this DomainObject.
                    Ext.Ajax.request({
                        url: App.config.serviceUrl + 'caesarObject/objectDataProvider3',
                        method: App.config.ajaxType,
                        params: {
                            domainObjectId: domainObjectId,
                            domainObjectType: domainObjectType,
                            domainDataView: domainDataView
                        },
                        success: function (response) {
                            var data = Ext.decode(response.responseText);
                            mee.getAssetView().getAt(1).updateData(data, domainObjectType, domainObjectId, mee.domainObjectName);
                            mee.getAssetView().setActiveItem(1);
                            mee.getAssetDetailsToolbar().setTitle(Ext.util.Format.ellipsis(mee.domainObjectName, 10));
                            mee.getAssetDtlBackBtn().setHidden(true);
                            mee.getNearestAssetDtlBckBtn().setHidden(false);
                            // mee.getLaunchApp().setActiveItem(0);
                        }
                    });
                }
            },
            nearestAssetBckBtn: {
                tap: function () {
                    this.getAssetView().setActiveItem(0);
                    this.getAssetDtlBackBtn().setHidden(false);
                    this.getNearestAssetDtlBckBtn().setHidden(true);
                }
            },
            nearestAssetBtn: {
                tap: function () {
                    this.getAssetView().setActiveItem(9);
                    this.getNearestAsset().updateData();
                }
            },
            assetList: {
                itemtap: 'assetListItemTapped'
            },
            assetDtlBackBtn: {
                tap: 'assetDetailBackBtnTapped'
            },
            assetOptionsBtn: {
                tap: 'assetDetailsOptionsBtnTapped'
            },
            assetGrouping: {
                tap: 'showAssetGroups'
            },
            assetGroupListBackBtn: {
                tap: 'showAllAssetsList'
            },
            assetGroupListTap: {
                itemtap: 'assetGroupListItemTapped'
            },
            assetsInGroupListBackBtn: {
                tap: 'assetGroupListBackBtnTapped'
            },
            assetsInGroupList: {
                itemtap: 'assetListItemTapped'
            },
            assetView: {
                activeitemchange: 'checkActiveItem'
            },
            assetDtlNavBtn: {
                tap: 'assetDtlNavBtnTapped'
            },
            assetDtlSMSBtn: {
                tap: 'assetDtlSMSBtnTapped'
            }
        }
    },
    showDriverStatisticsList: function () {
        console.log('this bugger was called');
    },
    showLineGraph: function (reportType) {
        this.getAssetDetails().assetOptions.hide();
        this.getLaunchApp().setActiveItem(3);
        this.getStatisticsView().setActiveItem(2);
        this.getStatisticsView().getAt(2).updateData(this.domainObjectId, reportType);
    },
    assetDtlSMSBtnTapped: function (btn) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Fetching your location...'
        });
        if (this.getAssetDetailView().items.items) {
            var number = '';
            for (var i = 0; i < this.getAssetDetailView().items.items.length; i++) {
                if (this.getAssetDetailView().items.items[i].getTitle() == 'Driver Attributes') {
                    for (var j = 0; j < this.getAssetDetailView().items.items[i].getItems().length; j++) {
                        if (this.getAssetDetailView().items.items[i].getItems().items[j].get('label') == 'Driver Mobile') {
                            number = this.getAssetDetailView().items.items[i].getItems().items[j].get('html');
                            break;
                        }
                    }
                    break;
                }
            }
            if (number != '&ndash;' && number != '' && number != null) {
                number = number.split("\"");
                number = number[1].split(":");
                var driverNumber = number[1];
                if (App.currentPosition) {
                    var myLat = App.currentPosition.latitude;
                    var myLng = App.currentPosition.longitude;
                    if (Ext.os.is('iOS')) {
                        Ext.Msg.show({
                            title: 'Navigate To Me',
                            message: "<span><a href='sms:" + driverNumber + "&body=Click on the following link: &nbsp; https://maps.google.ae/maps?daddr=" + myLat + "," + myLng + "' class='x-button x-button-action' style='text-decoration: none;' target='_blank'>Send Your Location</a></span>",
                            buttons: Ext.MessageBox.CANCEL,
                            fn: function (buttonId) {
                            }
                        });
                    } else {
                        Ext.Msg.show({
                            title: 'Navigate To Me',
                            message: "<span><a href='sms:" + driverNumber + "?body=Click on the following link: &nbsp; https://maps.google.ae/maps?daddr=" + myLat + "," + myLng + "' class='x-button x-button-action' style='text-decoration: none;' style='text-align:center'>Send Your Location</a></span>",
                            buttons: Ext.MessageBox.CANCEL,
                            fn: function (buttonId) {
                            }
                        });

                    }
                } else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(success, error);
                        function success(position) {
                            var myLat = position.coords.latitude;
                            var myLng = position.coords.longitude;
                            App.currentPosition = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            };
                            if (Ext.os.is('iOS')) {
                                Ext.Msg.show({
                                    title: 'Navigate To Me',
                                    message: "<span><a href='sms:" + driverNumber + "&body=Click on the following link: &nbsp; https://maps.google.ae/maps?daddr=" + myLat + "," + myLng + "' class='x-button x-button-action' style='text-decoration: none;' target='_blank'>Send Your Location</a></span>",
                                    buttons: Ext.MessageBox.CANCEL,
                                    fn: function (buttonId) {
                                    }
                                });
                            } else {
                                Ext.Msg.show({
                                    title: 'Navigate To Me',
                                    message: "<span><a href='sms:" + driverNumber + "?body=Click on the following link: &nbsp; https://maps.google.ae/maps?daddr=" + myLat + "," + myLng + "' class='x-button x-button-action' style='text-decoration: none;' style='left: 50%'>Send Your Location</a></span>",
                                    buttons: Ext.MessageBox.CANCEL,
                                    fn: function (buttonId) {
                                    }
                                });

                            }
                        }

                        function error() {
                            Ext.Msg.alert("Error", "GPS is not active. Please enable it and try again.");
                        }
                    }
                    else {
                        Ext.Msg.alert("Error", "GPS is not active. Please enable it and try again.");
                    }
                }
            } else {
                Ext.Msg.alert("Error", "The Asset has no Driver Number Specified");
            }
        }
        Ext.Viewport.setMasked(false);
    },
    assetDtlNavBtnTapped: function () {
        //Opening Google Maps on Device
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Fetching your location...'
        });
        if (this.getAssetDetailView().items.items) {
            var LatLng = '&ndash;';
            for (var i = 0; i < this.getAssetDetailView().items.items.length; i++) {
                if (this.getAssetDetailView().items.items[i].getTitle() == 'Location') {
                    for (var j = 0; j < this.getAssetDetailView().items.items[i].getItems().length; j++) {
                        if (this.getAssetDetailView().items.items[i].getItems().items[j].get('label') == 'Position') {
                            LatLng = this.getAssetDetailView().items.items[i].getItems().items[j].get('html').innerHTML;
                            break;
                        }
                    }
                    break;
                }
            }
            if (LatLng != '' && LatLng != App.config.blankSign && LatLng != '0.000000°, 0.000000°') {
                if (App.currentPosition) {
                    myLat = App.currentPosition.latitude;
                    myLng = App.currentPosition.longitude;
                    Ext.Msg.show({
                        title: 'Navigate To Asset',
                        message: "<span><a href='https://maps.google.co.in/maps?saddr=" + myLat + "," + myLng + "&daddr=" + LatLng + "' class='x-button x-button-action' style='text-decoration: none;' target='_blank'>Open Google Maps Navigation</a></span>",
                        buttons: Ext.MessageBox.CANCEL,
                        fn: function (buttonId) {
                        }
                    });
                } else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(success);
                        function success(position) {
                            myLat = position.coords.latitude;
                            myLng = position.coords.longitude;
                            App.currentPosition = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            };
                            Ext.Msg.show({
                                title: 'Navigate To Asset',
                                message: "<span><a href='https://maps.google.co.in/maps?saddr=" + myLat + "," + myLng + "&daddr=" + LatLng + "' class='x-button x-button-action' style='text-decoration: none;' target='_blank'>Open Google Maps Navigation</a></span>",
                                buttons: Ext.MessageBox.CANCEL,
                                fn: function (buttonId) {
                                }
                            });
                        }
                    }
                    else {
                        Ext.Msg.alert("Error", "GPS is not active. Please enable it and try again");

                    }
                }
            } else {
                Ext.Msg.alert("Error", "No GPS Coordinates Avaliable");
            }
        }
        Ext.Viewport.setMasked(false);
    }
    ,
    checkActiveItem: function (ths, newActive, oldActive, optn) {
        var active = oldActive.initialConfig.xtype;
        if (active == 'asset_list' || active == 'asset_groups_list') {
            this.changeToList = active;
        }
    }
    ,
    assetListItemTapped: function (list, index, target, record, e, opts) {
        var me = this;

        list.deselectAll();
        this.domainObjectType = record.get('domainObjectType');
        this.domainObjectId = record.get('domainObjectId');
        this.domainObjectName = record.get('name');

        // This has been implemented to only display "short" names in the toolbar title.
        this.getAssetDetailsToolbar().setTitle(Ext.util.Format.ellipsis(this.domainObjectName, 10));
        domainObjectType = record.get('domainObjectType');
        domainDataView = 'details';

        // Fetch details for this DomainObject.
        Ext.Ajax.request({
            url: App.config.serviceUrl + 'caesarObject/objectDataProvider3',
            method: App.config.ajaxType,
            params: {
                domainObjectId: me.domainObjectId,
                domainObjectType: domainObjectType,
                domainDataView: domainDataView
            },
            success: function (response) {
                var data = Ext.decode(response.responseText);
                me.getAssetView().getAt(1).updateData(data, domainObjectType, me.domainObjectId, me.domainObjectName);
                me.getAssetView().setActiveItem(1);
                //Resetting the previous view
                me.getAssetListSearch().setValue('');
                var assetStore = Ext.getStore('assetStore');
                assetStore.clearFilter();
            }
        });
    }
    ,
    assetDetailBackBtnTapped: function (btn) {
        if (this.changeToList == 'asset_list') {
            this.getAssetList().deselectAll();
            this.getAssetView().setActiveItem(0);
        } else {
            //Resetting the previous view
            if (this.getAssetInGroupListSearch().getValue()) {
                this.getAssetInGroupListSearch().setValue('');
                var assetsInGroupStore = Ext.getStore('assetsInGroupStore');
                assetsInGroupStore.clearFilter();
                this.getAssetsInGroupList().refresh();
            }
            this.getAssetsInGroupList().deselectAll();
            this.getAssetView().setActiveItem(8);

        }
        //Resetting the previous view
        this.getAssetListSearch().setValue('');
        var sto = Ext.getStore('assetStore');
        sto.clearFilter();

    }
    ,

    assetDetailsOptionsBtnTapped: function () {
        this.getAssetView().getActiveItem().addAssetOptions();
    }
    ,
    commandListPanelBackBtnTapped: function () {
        this.getAssetView().setActiveItem(1);
    }
    ,
    showAllAssetsList: function () {
        this.getAssetView().setActiveItem(0);
        //Resetting the previous view
        if (this.getGroupListSearch().getValue()) {
            this.getGroupListSearch().setValue('');
            var sto = Ext.getStore('assetGroupStore');
            sto.clearFilter();
        }
        //Resetting the previous view
        if (this.getAssetInGroupListSearch().getValue()) {
            this.getAssetInGroupListSearch().setValue('');
            var stor = Ext.getStore('assetsInGroupStore');
            stor.clearFilter();
            this.getAssetInGroupListSearch().refresh();
        }
    }
    ,
    showAssetGroups: function () {
        var assetGroupStore = Ext.getStore('assetGroupStore');
        assetGroupStore.on('load', function (store) {
            this.getAssetGroupListtotalToolbar().setTitle('<div style="font-size: 0.7em">' + assetGroupStore.getCount() + ' Group(s)</div>');
            this.getAssetGroupList().assetGroupList(store);
            this.getAssetView().setActiveItem(4);
        }, this);
        assetGroupStore.load({
            params: {
                view: 'oid,name'
            }
        });
        //Resetting the previous view
        this.getAssetListSearch().setValue('');
        var assetStore = Ext.getStore('assetStore');
        assetStore.clearFilter();
    }
    ,
    assetGroupListBackBtnTapped: function (btn) {
        this.getAssetGroupListTap().deselectAll();
        this.getAssetView().setActiveItem(4);
        //Resetting the previous view
        if (this.getGroupListSearch().getValue()) {
            this.getGroupListSearch().setValue('');
            var sto = Ext.getStore('assetGroupStore');
            sto.clearFilter();
        }
        //Resetting the previous view
        if (this.getAssetInGroupListSearch().getValue()) {
            this.getAssetInGroupListSearch().setValue('');
            var assetsInGroupStore = Ext.getStore('assetsInGroupStore');
            assetsInGroupStore.clearFilter();
            this.getAssetInGroupListSearch().refresh();
        }
    }
    ,
    assetGroupListItemTapped: function (list, index, target, record, e, opts) {
        this.assetGroupName = record.get('name');
        // this.getAssetView().getAt(8).getItems().getAt(0).setTitle(Ext.util.Format.ellipsis(this.assetGroupName, 7));
        var assetInGroupStore = Ext.getStore('assetsInGroupStore');
        assetInGroupStore.removeAll();
        assetInGroupStore.setParams(Ext.apply({}, {
            // FIXME use proper domainObjectType instead of "group".
            domainObjectType: 'group',
            domainObjectId: record.get('oid') // coming from AssetGroupModel.
        }, assetInGroupStore.getParams()));
        assetInGroupStore.on('load', function (store) {
            // FIXME quite overnested here...
            this.getAssetsInGrouptotalToolbar().setTitle('<div style="font-size: 0.7em">' + Ext.getStore('assetsInGroupStore').getCount() + ' Asset(s)</div>');
            this.getAssetView().getAt(8).getAt(2).refresh();
            this.getAssetView().setActiveItem(8);
            store.clearListeners();
        }, this);
        assetInGroupStore.load();
        //Resetting the previous view
        if (this.getGroupListSearch().getValue()) {
            this.getGroupListSearch().setValue('');
            var assetGroupStore = Ext.getStore('assetGroupStore');
            assetGroupStore.clearFilter();
        }
        //Resetting the previous view
        if (this.getAssetInGroupListSearch().getValue()) {
            this.getAssetInGroupListSearch().setValue('');
            var assetsInGroupStore = Ext.getStore('assetsInGroupStore');
            assetsInGroupStore.clearFilter();
            // this.getAssetInGroupListSearch().refresh();
        }
    },

    statisticsLineUnavailable: function () {
        this.getLaunchApp().setActiveItem(0);
        this.getStatisticsView().setActiveItem(0);
    }
})
;