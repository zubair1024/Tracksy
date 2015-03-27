Ext.define('Rms.view.asset.AssetDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.asset_details',
    requires: [
        'Ext.TitleBar',
        'Ext.dataview.List',
        'Ext.ActionSheet'
    ],
    config: {
        record: null,
        scrollable: {
            direction: 'vertical'
        },
        items: {
            xtype: 'toolbar',
            cls: 'toolbar-title-font',
            docked: 'top',
            items: [
                {
                    text: 'Back',
                    ui: 'back',
                    itemId: 'back'
                },
                {
                    text: 'Map',
                    ui: 'back',
                    itemId: 'map',
                    hidden: true
                },
                {
                    text: 'Near',
                    ui: 'back',
                    itemId: 'near',
                    hidden: true
                },
                {
                    xtype: 'spacer'
                },
                {
                    xtype: 'button',
                    text: 'Options'
                },
                {
                    xtype: 'toolbar',
                    docked: 'bottom',
                    layout: {
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'button',
                            text: 'Navigate To Asset'
                        },
                        {
                            xtype: 'button',
                            text: 'Navigate To Me',
                            id: 'navBtn'
                        }
                    ]
                }
            ]
        }
    },
    initialize: function () {
        this.domainObjectId = 0;
        this.callParent(arguments);
    },
    updateData: function (data, domainObjectType, domainObjectId, domainObjectName) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Fetching asset details...'
        });
        var me = this;
        this.domainObjectType = domainObjectType;
        this.domainObjectId = domainObjectId;
        this.domainObjectName = domainObjectName;
        //Setting the 'Navigate to Me' button
        var navBtn = Ext.getCmp('navBtn');
        navBtn.setHidden(true);
        if (domainObjectType == 'canbusfleetvehicle') {
            navBtn.setHidden(false);
        }
        //Fetching the positional information of the asset (pumps and Generators)
        if (data.ui.items[0].items[0].items.length == 1) {
            Ext.Ajax.request({
                async: false,
                url: App.config.serviceUrl + 'mobile/assetPositions/',
                method: App.config.ajaxType,
                params: {
                    oid: me.domainObjectId,
                    historySpec: 'CURRENT',
                    view: 'longitude,latitude'
                },
                success: function (response) {
                    var coords = Ext.decode(response.responseText);
                    if (coords.data[0] != undefined) {
                        positions = coords.data[0].latitude.toFixed(6) + '°, ' + coords.data[0].longitude.toFixed(6) + '°';
                    } else {

                        positions = '';
                    }
                }
            });
            data.ui.items[0].items[0].items[1] = {
                id: 'position',
                description: "Position",
                displayValue: positions,
                name: "Position",
                currentValues: {
                    0: positions
                },
                objectParameterValueType: "string"
            };
        }
        /**
         * Since we are in detailed mode, we only have _one_ record. Look in this record and
         * create FieldSets accordingly.
         * Every section is a fieldset.
         */
        if (data.ui.items.length > 0) {
            var items = [];
            /**
             * Iterate over the sections.
             */
            //console.log(data.ui.items[0]);
            //Skip a section if not available
            for (var i = 0; i < data.ui.items[0].items.length; i++) {
                var section = data.ui.items[0].items[i];
                if (!mobileConfiguration.assetDetails.defaultSettings) {
                    var flagSections, canbusSections, generatorSections, pumpSections, tankSections, k;
                    if (domainObjectType == 'canbusfleetvehicle') {
                        flagSections = false;
                        canbusSections = mobileConfiguration.assetDetails.canbusfleetvehicle;
                        for (k = 0; k < canbusSections.length; k++) {
                            if (section.name == canbusSections[k].section && !canbusSections[k].flag) {
                                flagSections = true;
                            }
                        }
                        if (flagSections) {
                            continue;
                        }
                    } else if (domainObjectType == 'generator') {
                        flagSections = false;
                        generatorSections = mobileConfiguration.assetDetails.generator;
                        for (k = 0; k < generatorSections.length; k++) {
                            if (section.name == generatorSections[k].section && !generatorSections[k].flag) {
                                flagSections = true;
                            }
                        }
                        if (flagSections) {
                            continue;
                        }
                    } else if (domainObjectType == 'pump') {
                        flagSections = false;
                        pumpSections = mobileConfiguration.assetDetails.pump;
                        for (k = 0; k < pumpSections.length; k++) {
                            if (section.name == pumpSections[k].section && !pumpSections[k].flag) {
                                flagSections = true;
                            }
                        }
                        if (flagSections) {
                            continue;
                        }
                    } else if (domainObjectType == 'tank') {
                        flagSections = false;
                        tankSections = mobileConfiguration.assetDetails.tank;
                        for (k = 0; k < tankSections.length; k++) {
                            if (section.name == tankSections[k].section && !tankSections[k].flag) {
                                flagSections = true;
                            }
                        }
                        if (flagSections) {
                            continue;
                        }
                    }
                }
                var fieldset = {
                    xtype: 'fieldset',
                    title: section.name,
                    defaults: {
                        // No "textfield" xtype, since we only want to display something here.
                        xtype: 'field',
                        labelWrap: true,
                        cls: 'label-field',
                        listeners: {
                            change: function (field, newVal, oldVal) {
                                console.log('change');
                            }
                        }
                    },
                    items: []
                };
                /**
                 * Iterate over the fields.
                 */
                for (var j = 0; j < section.items.length; j++) {
                    var field = section.items[j],
                        value = App.config.blankSign;
                    var flag = false, l;
                    //Remove un-needed fields
                    if (!mobileConfiguration.assetDetails.defaultSettings) {
                        if (domainObjectType == 'canbusfleetvehicle') {
                            canbusSections = mobileConfiguration.assetDetails.canbusfleetvehicle;
                            flag = false;
                            for (k = 0; k < canbusSections.length; k++) {
                                for (l = 0; l < canbusSections[k].value.length; l++) {
                                    if (field.id == canbusSections[k].value[l].id && !canbusSections[k].value[l].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) {
                                    break;
                                }
                            }
                            if (flag) {
                                continue;
                            }
                        } else if (domainObjectType == 'generator') {
                            generatorSections = mobileConfiguration.assetDetails.generator;
                            flag = false;
                            for (k = 0; k < generatorSections.length; k++) {
                                for (l = 0; l < generatorSections[k].value.length; l++) {
                                    if (field.id == generatorSections[k].value[l].id && !generatorSections[k].value[l].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) {
                                    break;
                                }
                            }
                            if (flag) {
                                continue;
                            }
                        } else if (domainObjectType == 'pump') {
                            pumpSections = mobileConfiguration.assetDetails.pump;
                            flag = false;
                            for (k = 0; k < pumpSections.length; k++) {
                                for (l = 0; l < pumpSections[k].value.length; l++) {
                                    if (field.id == pumpSections[k].value[l].id && !pumpSections[k].value[l].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) {
                                    break;
                                }
                            }
                            if (flag) {
                                continue;
                            }
                        } else if (domainObjectType == 'tank') {
                            tankSections = mobileConfiguration.assetDetails.tank;
                            flag = false;
                            for (k = 0; k < tankSections.length; k++) {
                                for (l = 0; l < tankSections[k].value.length; l++) {
                                    if (field.id == tankSections[k].value[l].id && !tankSections[k].value[l].flag) {
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) {
                                    break;
                                }
                            }
                            if (flag) {
                                continue;
                            }
                        }
                    }
                    //Format value.
                    //console.log(field);
                    switch (field.objectParameterValueType.id) {
                        case 'domainObjectReferenceType':
                            if (typeof field.displayValue !== 'undefined') {
                                // only render the name of the reference type for now, since we do not have a mechanism to switch from here to there.
                                value = field.displayValue;
                                // domainObjectId = field.currentValues[0];
                                // domainObjectType = field.referenceType;
                            }
                            break;
                        case 'vfsImage':
                            if (typeof field.currentValues !== 'undefined' && field.currentValues[0] !== null) {
                                var params = {
                                    domainObjectId: field.domainObjectId,
                                    domainObjectType: field.domainObjectType,
                                    filename: field.currentValues[0]
                                };
                                params[App.config.sessionName] = App.config.sessionId;

                                value = '<img class="img-thumbnail" src="' +
                                App.config.serviceUrl + 'caesarVfsResource/get?' + Ext.Object.toQueryString(params) +
                                '" alt="' + field.baseValue + '" title="' + field.currentValues[0] + '"/>';
                            }
                            break;
                        case 'string':
                            if (typeof field.currentValues[0] != 'undefined') {
                                value = field.currentValues[0];
                            }
                            break;
                        default:
                            if (typeof field.currentValues[0] != 'undefined') {
                                value = field.currentValues[0];
                            }
                            break;
                    }
                    //Logger
                    //if (typeof field.currentValues != 'undefined') {
                    //    console.log(field.id + " = " + field.currentValues[0] + "(" + field.type + ")");
                    //}
                    //if (typeof field.displayValue != 'undefined') {
                    //    console.log(field.id + " = " + field.displayValue + "(" + field.type + ")");
                    //}
                    switch (field.id) {
                        case'position':
                            if (typeof field.displayValue !== 'undefined') {
                                var pos = document.createElement('span');
                                pos.className = 'x-button x-button-action';
                                pos.style.height = '3em';
                                pos.innerText = field.displayValue;
                                pos.onclick = function () {
                                    Rms.app.getController('MapController').showSingleAssetOnMap();
                                };
                                value = pos;
                            }
                            break;
                        // Special handling for phone numbers.
                        case 'driverMobile':
                        case 'mobile':
                            // Reformat Phone links in order to make them "dialable".
                            if (typeof field.displayValue !== 'undefined') {
                                value = '<a href="tel:' + field.displayValue + '" class="x-button x-button-action" style="text-decoration: none; height:3em">' + field.displayValue + '</a>';
                            }
                            break;
                        case "lastReportTime":
                            if (typeof field.currentValues[0] !== 'undefined') {
                                var tempDate = (field.currentValues[0]).replace('T', ' ');
                                var date = new Date(tempDate.replace(/-/g, '/'));
                                date.setMinutes(date.getMinutes() + App.config.user.timeZoneOffset);
                                value = Ext.Date.format(date, App.config.user.dateTimeFormat);
                            }
                            break;
                        case 'alarmStatus':
                            if (typeof field.currentValues[0] !== 'undefined') {
                                var status = field.currentValues[0].split('.');
                                value = status[1];
                            }
                            break;
                        case "faultAlert":
                            if (typeof field.currentValues[0] !== 'undefined') {
                                var bool = field.currentValues[0];
                                if (bool === true) {
                                    value = 'Yes';
                                } else {
                                    value = 'No';
                                }
                            }
                            break;
                        case "registrationExpiry":
                            if (typeof field.currentValues[0] !== 'undefined') {
                                if (field.currentValues[0]) {
                                    var myDate;
                                    if (field.currentValues[0].indexOf('/') > -1) {
                                        var from = (field.currentValues[0]).split('/');
                                        tempDate = new Date(from[2], from[1] - 1, from[0]);
                                        myDate = new Date(tempDate);
                                        value = Ext.Date.format(myDate, App.config.user.dateFormat);
                                    } else {
                                        myDate = new Date(field.currentValues[0]);
                                        value = Ext.Date.format(myDate, App.config.user.dateFormat);
                                    }
                                }
                            }
                            break;

                    }
                    // Create a simple readonly-TextField.
                    fieldset.items.push({
                        label: field.name,
                        html: value,
                        labelWidth: '40%',
                        labelWrap: true
                    });
                }

                items.push(fieldset);
            }
            // OK, items have been nicely arranged in fieldsets. Now add those to the panel.
            this.setItems(items);
        } else {
            this.setItems({
                html: '<h3>There is no data for that asset.</h3>',
                styleHtmlContent: true
            });
        }
        Ext.Viewport.setMasked(false);
    },
    addAssetOptions: function () {
        var items = [];
        if (this.domainObjectType == 'pump' || this.domainObjectType == 'generator') {
            items.push({
                text: 'Engine Coolant Temperature',
                itemId: 'engineCoolantTemperature'
            }, {text: "Engine RPM Chart", itemId: "engineRPMChart"});
        }
        items.push({text: 'View on Map', itemId: 'map'}, {text: 'View Alarms', itemId: 'alarm'});
        if (!mobileConfiguration.defaultSettings) {
            if (mobileConfiguration.map.mapControlOption || mobileConfiguration.assetDetails.actionsheet.viewGeofences) {
                items.push({text: 'View Geofences', itemId: 'geofence'});
            }
            if (mobileConfiguration.assetDetails.actionsheet.sendCommands) {
                items.push({text: 'Send Commands', itemId: 'command'});
            }
        } else {
            items.push({text: 'View Geofences', itemId: 'geofence'}, {text: 'Send Commands', itemId: 'command'});
        }
        this.assetOptions = Ext.Viewport.add({
            xtype: 'actionsheet',
            modal: true,
            hideOnMaskTap: true,
            items: items
        });
        this.assetOptions.show();
    },
    show: function () {
        this.callParent(arguments);
        this.down('title').show({
            type: 'slide',
            direction: 'up',
            duration: 300
        });
    }
});
