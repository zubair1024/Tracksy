Ext.define('Rms.view.asset.AssetsInGroup', {
    extend: 'Ext.Panel',
    alias: 'widget.assets_in_group',
    requires: [
        'Rms.model.AssetModel',
        'Rms.store.AssetStore',
        'Rms.store.AssetsInGroupStore',
        'Ext.Panel',
        'Ext.dataview.List',
        'Ext.field.Search'

    ],
    config: {
        layout: 'fit',
        store: null,
        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                cls: 'big-text',
                items: [
                    {
                        text: 'Back',
                        ui: 'back',
                        itemId: 'back'
                    },
                    {
                        xtype: 'button',
                        text:'On Map',
                        iconCls:'map',
                        id:'groupOnMap'
                    },
                    {
                        xtype: 'searchfield',
                        width: 130,
                        placeHolder:'Search',
                        docked: 'right',
                        listeners: {
                            scope: this,
                            keyup: function (field) {
                                var assetsInGroupList = Ext.getCmp('assetsInGroupList');
                                var value = field.getValue();
                                var sto = Ext.getStore('assetsInGroupStore');
                                sto.clearFilter();
                                //sto.filter('name', value);
                                if (value) {
                                    var thisRegEx = new RegExp(value, "i");
                                    sto.filterBy(function (record) {
                                        return (thisRegEx.test(record.get('name')))
                                    });
                                }
                                assetsInGroupList.refresh();
                            },
                            clearicontap: function () {
                                var assetsInGroupList = Ext.getCmp('assetsInGroupList');
                                var sto = Ext.getStore('assetsInGroupStore');
                                sto.clearFilter();
                                sto.load();
                                assetsInGroupList.refresh();
                            }
                        }
                    }
                ]
            },
            {
                xtype:'toolbar',
                docked: 'bottom',
                id:'totalToolbarInGroup',
                minHeight: '1.8em',
                title: ''
            }
        ]
    },
    initialize: function () {
        this.setItems(
            {
                xtype: 'list',
                id: 'assetsInGroupList',
                store: 'assetsInGroupStore',
                plugins: [
                    {
                        xclass: 'Ext.ux.touch.PullRefreshFn',
                        pullText: 'Pull down to refresh the Asset list!',
                        refreshFn: function () {
                            var store = this.getList().getStore();
                            store.currentPage = 1;
                            store.load();
                        }
                    }
                ],
                infinite: true,
                onItemDisclosure: true,
                variableHeights: true,
                itemTpl: Ext.create('Ext.XTemplate',
                    '<span class="iconlist ao-{domainObjectType}"><b>{name}</b><br><span>{[this.formatDateTime(values.lastReportTime)]}<br>&nbsp;<b>{[this.engineState(values.assetStatus, values.domainObjectType)]}</b></span></span>', {
                        formatDateTime: function (isodate) {
                            //Fixing for iOS
                            var tempDate = isodate.replace('T', ' ');
                            var date = new Date(tempDate.replace(/-/g, '/'));
                            date.setMinutes(date.getMinutes() + App.config.user.timeZoneOffset);
                            return Ext.Date.format(date, App.config.user.dateTimeFormat);
                        },
                        engineState: function (assetStatus, config) {
                            if (config == 'canbusfleetvehicle') {
                                if (assetStatus == 'normal') {
                                    return "Engine ON"
                                } else if (assetStatus == 'idling') {
                                    return 'Idle'
                                }
                                else {
                                    return "Engine OFF"
                                }
                            } else {
                                if (assetStatus == 'normal' || assetStatus == 'idling') {
                                    return "Operating"
                                } else {
                                    return "Not Operating"
                                }

                            }

                        }
                    }
                )
            });
        var assetStore = Ext.getStore('assetsInGroupStore');
        assetStore.sort(new Ext.util.Sorter({
            property: 'lastReportTime',
            direction: 'DESC',
            sorterFn: function (o1, o2) {
                var date1 = o1.data.lastReportTime.replace('T', ' ');
                var first = new Date(date1.replace(/-/g, '/'));
                var date2 = o2.data.lastReportTime.replace('T', ' ');
                var second = new Date(date2.replace(/-/g, '/'));
                var v1 = new Date(first);
                var v2 = new Date(second);
                return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
            }
        }));
    },
    show: function() {
        this.callParent(arguments);

        this.down('list').show({
            type: 'slide',
            direction: 'down',
            duration: 300
        });
    }
});