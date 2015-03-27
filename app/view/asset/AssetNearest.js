Ext.define('Rms.view.asset.AssetNearest', {
    extend: 'Ext.Panel',
    alias: 'widget.asset_nearest_list',
    requires: [
        'Rms.model.AssetModel',
        'Ext.plugin.ListPaging',
        'Ext.dataview.List',
        'Ext.field.Search'
    ],
    config: {
        layout: 'fit',
        store: null,
        items: {
            xtype: 'toolbar',
            docked: 'top',
            items: [
                {
                    xtype: 'button',
                    id: 'nearest_AssetBckBtn',
                    text: 'back',
                    ui: 'back'
                },
                {
                    xtype: 'spacer'
                },
                {
                    xtype: 'segmentedbutton',
                    pack: 'center',
                    allowMultiple: false,
                    id:'distance',
                    items: [
                        {
                            text: 'Distance &#x25B2;',
                            pressed: true,
                            handler: function () {
                                var sorters3 = [{
                                    property: 'distance',
                                    direction: 'DESC',
                                    sorterFn: function (o1, o2) {
                                        var v1 = Number(o1.data.distance);
                                        var v2 = Number(o2.data.distance);
                                        return v1 > v2 ? -1 : (v1 < v2 ? 1 : 0);
                                    }
                                }];
                                var assetPositionsStore = Ext.getStore('assetPositionsStore');
                                //Reset
                                assetPositionsStore.setSorters([]);
                                //Add
                                assetPositionsStore.sort(sorters3);
                            }
                        },
                        {
                            text: 'Distance &#x25BC;',
                            handler: function () {
                                var sorters4 = [{
                                    property: 'distance',
                                    direction: 'ASC',
                                    sorterFn: function (o1, o2) {
                                        var v1 = Number(o1.data.distance);
                                        var v2 = Number(o2.data.distance);
                                        return v1 < v2 ? 1 : (v1 > v2 ? -1 : 0);
                                    }
                                }];
                                var assetPositionsStore = Ext.getStore('assetPositionsStore');
                                //Reset
                                assetPositionsStore.setSorters([]);
                                //Add
                                assetPositionsStore.sort(sorters4);
                            }
                        }
                    ]

                }
            ]
        }
    },
    updateData: function () {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Calculating the distance...'
        });
        var distanceSegmentedButton = Ext.getCmp('distance');
        distanceSegmentedButton.setPressedButtons([0]);
        var totalToolbar = Ext.getCmp('nearAssetsTotal');
        if (totalToolbar) {
            totalToolbar.destroy();
        }
        var me = this;
        if (App.currentPosition) {
            var assetPositionsStore = Ext.getStore('assetPositionsStore');
            assetPositionsStore.on('load', function (store) {
                store.each(function (item) {
                    var myLatitude = App.currentPosition.latitude;
                    var myLongitude = App.currentPosition.longitude;
                    var assetLatitude = item.get('latitude');
                    var assetLongitude = item.get('longitude');
                    //Using HARVESIAN formula to calculate the distance
                    var R = 6371; // use 3959 for miles or 6371 for km
                    var latitudeDifference = (assetLatitude - myLatitude) * Math.PI / 180;
                    var longitudeDifference = (assetLongitude - myLongitude) * Math.PI / 180;
                    myLatitude = myLatitude * Math.PI / 180;
                    assetLatitude = assetLatitude * Math.PI / 180;
                    var a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) + Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2) * Math.cos(myLatitude) * Math.cos(assetLatitude);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var distance = R * c;
                    item.data.distance = distance.toFixed(2);
                });
                var sorters3 = [{
                    property: 'distance',
                    direction: 'DESC',
                    sorterFn: function (o1, o2) {
                        var v1 = Number(o1.data.distance);
                        var v2 = Number(o2.data.distance);
                        return v1 > v2 ? -1 : (v1 < v2 ? 1 : 0);
                    }
                }];
                me.getAt(2).setTitle('<div style="font-size: 0.7em">' + store.getCount() + ' Assets</div>');
                //me.getAt(2).removeAll();
                //me.getAt(2).add([
                //    {
                //        xtype: 'spacer'
                //    },
                //    {
                //        xtype: 'title',
                //        title: '<div style="font-size: 0.7em">'+(Ext.getStore('assetStore')).getCount()+' Assets</div>'
                //    }
                //]);
                assetPositionsStore.sort(sorters3);
            }, this);
            assetPositionsStore.load({
                params: {
                    ids: 'all',
                    historySpec: 'CURRENT',
                    view: 'assetID,longitude,latitude,eventTime,assetName'
                }
            });
            me.setItems(
                [{
                    xtype: 'list',
                    store: 'assetPositionsStore',
                    emptyText: 'No Assets...',
                    infinite: true,
                    onItemDisclosure: true,
                    variableHeights: true,
                    //scrollToTopOnRefresh: false,
                    itemTpl: Ext.create('Ext.XTemplate',
                        '<span><b>{assetName}</b><br><span>{[this.formatDateTime(values.eventTime)]}</span> | <b>{distance} KM</b></span>', {
                            formatDateTime: function (isodate) {
                                // FIXME Backend needs to return a ISO dateformat =(
                                var isoArray = isodate.split(" ");
                                //Month
                                var monthsArray = [/January/i, /February/i, /March/i, /April/i, /May/i, /June/i, /July/i, /August/i, /September/i, /October/i, /November/i, /December/i];
                                for (var i = 0; i < (monthsArray.length); i++) {
                                    if (monthsArray[i].test(isoArray[0])) {
                                        var month = i;
                                    }
                                }
                                //Day
                                var day = isoArray[1].slice(0, 2);
                                //Year
                                var year = isoArray[2];
                                //Time
                                var time = isoArray[3].slice(0, 8);
                                time = time.replace(".", "");
                                //The date formatted in the ISO standard
                                var isoDate = year + "-" + (month + 1) + "-" + day + "T" + time;
                                var tempDate = isoDate.replace('T', ' ');
                                var date = tempDate.replace(/-/g, '/');
                                date = new Date(Date.parse(date));
                                date.setMinutes(date.getMinutes() + App.config.user.timeZoneOffset);
                                return Ext.Date.format(date, App.config.user.dateTimeFormat);
                            }
                        }
                    )
                }, {
                    xtype: 'toolbar',
                    id: 'nearAssetsTotal',
                    docked: 'bottom'
                }]);
            Ext.Viewport.setMasked(false);
        } else {
            if (navigator.geolocation) {
                var geo = Ext.create('Ext.util.Geolocation', {
                    autoUpdate: false,
                    listeners: {
                        locationupdate: function (geo) {
                            var assetPositionsStore = Ext.getStore('assetPositionsStore');
                            assetPositionsStore.on('load', function (store) {
                                store.each(function (item) {
                                    var myLatitude = geo.getLatitude();
                                    var myLongitude = geo.getLongitude();
                                    var assetLatitude = item.get('latitude');
                                    var assetLongitude = item.get('longitude');
                                    App.currentPosition = {
                                        latitude: geo.getLatitude(),
                                        longitude: geo.getLongitude()
                                    };
                                    //Using HARVESIAN formula to calculate the distance
                                    var R = 6371; // use 3959 for miles or 6371 for km
                                    var latitudeDifference = (assetLatitude - myLatitude) * Math.PI / 180;
                                    var longitudeDifference = (assetLongitude - myLongitude) * Math.PI / 180;
                                    myLatitude = myLatitude * Math.PI / 180;
                                    assetLatitude = assetLatitude * Math.PI / 180;
                                    var a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) + Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2) * Math.cos(myLatitude) * Math.cos(assetLatitude);
                                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                    var distance = R * c;
                                    item.data.distance = distance.toFixed(2);
                                });
                                var sorters3 = [{
                                    property: 'distance',
                                    direction: 'DESC',
                                    sorterFn: function (o1, o2) {
                                        var v1 = Number(o1.data.distance);
                                        var v2 = Number(o2.data.distance);
                                        return v1 > v2 ? -1 : (v1 < v2 ? 1 : 0);
                                    }
                                }];
                                me.getAt(2).setTitle('<div style="font-size: 0.7em">' + store.getCount() + ' Assets</div>');
                                //me.getAt(2).removeAll();
                                //me.getAt(2).add([
                                //    {
                                //        xtype: 'spacer'
                                //    },
                                //    {
                                //        xtype: 'title',
                                //        title: '<div style="font-size: 0.7em">'+(Ext.getStore('assetStore')).getCount()+' Assets</div>'
                                //    }
                                //]);
                                assetPositionsStore.sort(sorters3);
                            }, this);
                            assetPositionsStore.load({
                                params: {
                                    ids: 'all',
                                    historySpec: 'CURRENT',
                                    view: 'assetID,longitude,latitude,eventTime,assetName'
                                }
                            });
                            me.setItems(
                                [{
                                    xtype: 'list',
                                    store: 'assetPositionsStore',
                                    emptyText: 'No Assets...',
                                    infinite: true,
                                    onItemDisclosure: true,
                                    variableHeights: true,
                                    //scrollToTopOnRefresh: false,
                                    itemTpl: Ext.create('Ext.XTemplate',
                                        '<span><b>{assetName}</b><br><span>{[this.formatDateTime(values.eventTime)]}</span> | <b>{distance} KM</b></span>', {
                                            formatDateTime: function (isodate) {
                                                // FIXME Backend needs to return a ISO dateformat =(
                                                var isoArray = isodate.split(" ");
                                                //Month
                                                var monthsArray = [/January/i, /February/i, /March/i, /April/i, /May/i, /June/i, /July/i, /August/i, /September/i, /October/i, /November/i, /December/i];
                                                for (var i = 0; i < (monthsArray.length); i++) {
                                                    if (monthsArray[i].test(isoArray[0])) {
                                                        var month = i;
                                                    }
                                                }
                                                //Day
                                                var day = isoArray[1].slice(0, 2);
                                                //Year
                                                var year = isoArray[2];
                                                //Time
                                                var time = isoArray[3].slice(0, 8);
                                                time = time.replace(".", "");
                                                //The date formatted in the ISO standard
                                                var isoDate = year + "-" + (month + 1) + "-" + day + "T" + time;
                                                var tempDate = isoDate.replace('T', ' ');
                                                var date = tempDate.replace(/-/g, '/');
                                                date = new Date(Date.parse(date));
                                                date.setMinutes(date.getMinutes() + App.config.user.timeZoneOffset);
                                                return Ext.Date.format(date, App.config.user.dateTimeFormat);
                                            }
                                        }
                                    )
                                }, {
                                    xtype: 'toolbar',
                                    id: 'nearAssetsTotal',
                                    docked: 'bottom'
                                }]);
                            Ext.Viewport.setMasked(false);
                        },
                        locationerror: function (geo,
                                                 bTimeout,
                                                 bPermissionDenied,
                                                 bLocationUnavailable,
                                                 message) {
                            Ext.Viewport.setMasked(false);
                            if (bTimeout) {
                                Ext.Msg.alert('Aw, Snap!', 'Timeout occurred');
                            } else {
                                Ext.Msg.alert('Aw, Snap!', 'An Error occurred<br>' + message);
                            }
                        }
                    }
                });
                geo.updateLocation();
            }

        }
    }
});