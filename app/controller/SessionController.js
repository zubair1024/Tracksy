Ext.define('Rms.controller.SessionController', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.Ajax',
        'Ext.data.Model',
        'Rms.store.ApplicationsStore',
        'Rms.view.common.IntegrateApp',
        'Rms.view.common.LoginPanel',
        'Rms.view.common.UserProfile'
    ],
    config: {
        refs: {
            applicationId: 'loginPage selectfield',
            userName: 'loginPage textfield[name=username]',
            password: 'loginPage passwordfield',
            logoutTab: 'launchapp #logout',
            integrateApp: 'integrate_app',
            launchApp: 'launchapp',
            //For user Settings
            userSettings: 'user_profile',
            userSettingsFieldset: 'user_profile fieldset',
            userSettingsSubmit: 'user_profile button[id=btnChange]'
        },
        control: {
            '#btnLogin': {
                tap: 'login'
            },
            logoutTab: {
                activate: 'logout'
            },
            'loginPage textfield': {
                keyup: 'onKeyUp'
            },
            userSettings: {
                initialize: function () {
                    var me = this;
                    Ext.Ajax.request({
                        url: App.config.serviceUrl + 'userSettings/current',
                        method: App.config.ajaxType,
                        success: function (response) {
                            var data = Ext.decode(response.responseText);
                            /*
                             0 - First Name
                             1 - Last Name
                             2 - Mobile Number
                             3 - Username
                             4 - Email
                             5 - DateTimeFormat
                             */
                            var timezoneOption = [];
                            for (var i = 0; i < data.parameters.timeZone.options.length; i++) {
                                timezoneOption[i] = {
                                    text: data.parameters.timeZone.options[i].name,
                                    value: data.parameters.timeZone.options[i].id
                                }
                            }
                            var dateTimeOption = [];
                            for (i = 0; i < data.parameters.dateTimeFormat.options.length; i++) {
                                dateTimeOption[i] = {
                                    text: data.parameters.dateTimeFormat.options[i],
                                    value: data.parameters.dateTimeFormat.options[i]
                                }
                            }
                            me.getUserSettingsFieldset().getAt(0).setValue(data.parameters.firstName.value);
                            me.getUserSettingsFieldset().getAt(1).setValue(data.parameters.lastName.value);
                            me.getUserSettingsFieldset().getAt(3).setValue(data.parameters.loginName.value);
                            me.getUserSettingsFieldset().getAt(4).setValue(data.parameters.eMail.value);
                            me.getUserSettingsFieldset().getAt(2).setValue(data.parameters.mobileTelephoneNumber.value);
                            me.getUserSettingsFieldset().getAt(5).setOptions(dateTimeOption);
                            me.getUserSettingsFieldset().getAt(5).setValue(data.parameters.dateTimeFormat.value);
                            me.getUserSettingsFieldset().getAt(6).setOptions(timezoneOption);
                            me.getUserSettingsFieldset().getAt(6).setValue(data.parameters.timeZone.value);
                        }
                    });
                }
            },
            userSettingsSubmit: {
                tap: function () {
                    var me = this;
                    var firstName = me.getUserSettingsFieldset().getAt(0).getValue();
                    var lastName = me.getUserSettingsFieldset().getAt(1).getValue();
                    var eMail = me.getUserSettingsFieldset().getAt(4).getValue();
                    var mobileTelephoneNumber = me.getUserSettingsFieldset().getAt(2).getValue();
                    var dateTimeFormat = me.getUserSettingsFieldset().getAt(5).getValue();
                    var timeZone = me.getUserSettingsFieldset().getAt(6).getValue();
                    var flag = true;
                    var phoneRegex = /^\+([0-9]{2})\)?([0-9]{4})?([0-9]{4})$/;
                    var eMailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (!phoneRegex.test(mobileTelephoneNumber)) {
                        Ext.Msg.alert('Error','The mobile number specified should be in the format: +XXXXXXXXXX');
                        flag = false;
                    }
                    if (firstName==''||lastName==''||eMail==''||mobileTelephoneNumber=='') {
                        Ext.Msg.alert('Error','One or more fields are blank');
                        flag=false;
                    }
                    if(!eMailRegex.test(eMail)){
                        Ext.Msg.alert('Error','Email is invalid');
                        flag=false;
                    }
                    if (flag) {
                        Ext.Msg.confirm(
                            "Apply",
                            "Are you sure you want to apply these changes?<br>You will be logged out",
                            function (btn) {
                                if (btn === 'yes') {
                                    Ext.Ajax.request({
                                        async: false,
                                        url: App.config.serviceUrl + 'userSettings/updateUser',
                                        method: App.config.ajaxType,
                                        params: {
                                            firstName: firstName,
                                            lastName: lastName,
                                            eMail: eMail,
                                            mobileTelephoneNumber: mobileTelephoneNumber,
                                            dateTimeFormat: dateTimeFormat,
                                            timeZone: timeZone
                                        },
                                        success: function () {
                                            me.logout();
                                        },
                                        error: function (e) {
                                            Ext.Msg.alert('Error', 'Reason:' + e);
                                        }
                                    });
                                }
                            },
                            this
                        );
                    }
                }
            }
        }
    },
    launch: function () {
        var appSelector = this.getApplicationId();

        // No fixed appId has been defined before, so we need to display the appSelector SelectField and load the store for that.
        if (App.config.appId === null) {
            var appStore = Ext.create('Rms.store.ApplicationsStore');

            appStore.on('load', function () {
                var localStore = Ext.getStore('localStore');
                var record = localStore.findRecord('key', 1);

                if (localStore.getCount() > 0 && record.get('applicationId') != '') {
                    appSelector.setValue(record.get('applicationId'));
                }
            }, this);

            appSelector.setStore(appStore);
            appStore.load();
        } else {
            appSelector.hide();
        }
    },
    /**
     * Do a login also after hitting on enter.
     * @param fld
     * @param e
     */
    onKeyUp: function (fld, e) {
        // 13 = user tapped 'return/enter' button on keyboard
        if (e.browserEvent.keyCode == 13) {
            this.login();
        }
    },
    login: function () {
        var me = this,
            username = this.getUserName().getValue(),
            password = this.getPassword().getValue();

        if (username == '' || password == '') {

            Ext.Msg.alert('', 'Please enter username and password');

        } else {
            var localStore = Ext.getStore('localStore');
            var record = localStore.findRecord('key', 1);
            var applicationId = App.config.appId || this.getApplicationId().getValue() || record.get('applicationId');

            Ext.Viewport.setMasked({
                xtype: 'loadmask',
                message: 'Logging In...'
            });

            Ext.util.Cookies.clear(App.config.sessionName);

            Ext.Ajax.request({
                url: App.config.serviceUrl + 'caesarAuthentication/logon',
                method: App.config.ajaxType,
                params: {
                    username: username,
                    password: password,
                    applicationProviderId: applicationId
                },
                success: function (response) {
                    var data = Ext.decode(response.responseText),
                        localStore = Ext.getStore('localStore');

                    //noinspection JSUnresolvedVariable
                    if (data.loggedOn) {

                        // Save SessionId.
                        App.config.sessionId = data[App.config.sessionName];
                        Ext.util.Cookies.set(App.config.sessionName, App.config.sessionId);

                        var record = localStore.findRecord('key', 1);
                        record.set('username', username);
                        record.set('password', password);
                        record.set('applicationId', applicationId);

                        me.getSettings();
                    }

                    // Save changes to local store.
                    localStore.sync();

                    Ext.Viewport.unmask();

                },
                /**
                 * Any other response than a 200
                 * @param response
                 */
                failure: function (response) {
                    var msg = '';
                    if (response.status == 500) {
                        msg = 'Internal server error.';
                    } else {
                        var data = Ext.decode(response.responseText);
                        for (var i = 0; i < data.messages.length; i++) {
                            msg += data.messages[i] + '<br>';
                        }
                    }
                    Ext.Msg.alert('Login Error', msg);
                    Ext.Viewport.unmask();
                }
            });
        }
    },
    logout: function (ths, newActive, oldActive, option) {

        var me = this;
        Ext.Msg.confirm(
            "Logout",
            "Are you use you want to logout?",
            function (btn) {
                if (btn === 'yes') {
                    Ext.Viewport.setMasked({
                        xtype: 'loadmask',
                        message: 'Logging out...'
                    });
                    Ext.Ajax.request({
                        url: App.config.serviceUrl + 'caesarAuthentication/logoff',
                        method: App.config.ajaxType,
                        success: function () {

                            App.config.sessionId = null;
                            Ext.util.Cookies.clear(App.config.sessionName);

                            me.getLaunchApp().destroy();
                            var localStore = Ext.getStore('localStore');
                            var cache = localStore.findRecord('key', 1);
                            var integrate_app = me.getIntegrateApp();
                            var launchApp = Ext.create('Rms.view.LaunchApp');

                            // TODO what does this do?
                            integrate_app.insert(1, launchApp);


                            if (cache.get('username') != '' && cache.get('password') != '') {
                                var loginPanel = integrate_app.getActiveItem().getItems().getAt(1);
                                loginPanel.getComponent('username').setValue(cache.get('username'));
                                loginPanel.getComponent('password').setValue(cache.get('password'));
                            }

                            integrate_app.setActiveItem(0);
                            Ext.Viewport.unmask();
                        }
                    });
                }else{
                    this.getLaunchApp().setActiveItem(0);
                }
            },
            this
        );
    },
    /**
     * Fetch user settings for timezone, dateformatting and so on.
     */
    getSettings: function () {
        "use strict";

        var me = this;

        Ext.Ajax.request({
            url: App.config.serviceUrl + 'userSettings/current',
            method: App.config.ajaxType,
            success: function (response) {
                var data = Ext.decode(response.responseText);

                App.config.user.id = data.userid;

                Ext.Object.each(data.parameters, function (name, options) {

                    // Save to App.config.user
                    switch (name) {
                        case 'password':
                        case 'confirmPassword':
                            // do nothing.
                            break;
                        case 'dateTimeFormat':
                            /**
                             * Set additional dateTime formats.
                             * @see http://docs.sencha.com/extjs/5.0/apidocs/#!/api/Ext.Date
                             */
                            switch (options.value) {
                                case 'dd/mm/yyyy hh:mm:ss':
                                    App.config.user.dateFormat = 'd/m/Y';
                                    App.config.user.timeFormat = 'H:i:s';
                                    App.config.user.timeFormatShort = 'H:i';
                                    App.config.user.dateTimeFormat = 'd/m/Y H:i:s';
                                    break;
                                case 'dd/mm/yyyy hh:mm:ss am/pm':
                                    App.config.user.dateFormat = 'd/m/Y';
                                    App.config.user.timeFormat = 'h:i:s a';
                                    App.config.user.timeFormatShort = 'h:i a';
                                    App.config.user.dateTimeFormat = 'd/m/Y h:i:s a';
                                    break;
                                case 'dddd,dd mmmm,yyyy hh:mm:ss':
                                    App.config.user.dateFormat = 'l,d F,Y';
                                    App.config.user.timeFormat = 'H:i:s';
                                    App.config.user.timeFormatShort = 'H:i';
                                    App.config.user.dateTimeFormat = 'l,d F,Y H:i:s';
                                    break;
                                case 'dddd,mmmm dd,yyyy hh:mm:ss':
                                    App.config.user.dateFormat = 'l,F d,Y';
                                    App.config.user.timeFormat = 'H:i:s';
                                    App.config.user.timeFormatShort = 'H:i';
                                    App.config.user.dateTimeFormat = 'l,F d,Y H:i:s';
                                    break;
                                case 'mm/dd/yyyy hh:mm:ss':
                                    App.config.user.dateFormat = 'm/d/Y';
                                    App.config.user.timeFormat = 'H:i:s';
                                    App.config.user.timeFormatShort = 'H:i';
                                    App.config.user.dateTimeFormat = 'm/d/Y H:i:s';
                                    break;
                                case 'mm/dd/yyyy hh:mm:ss am/pm':
                                    App.config.user.dateFormat = 'm/d/Y';
                                    App.config.user.timeFormat = 'h:i:s a';
                                    App.config.user.timeFormatShort = 'h:i a';
                                    App.config.user.dateTimeFormat = 'm/d/Y h:i:s a';
                                    break;
                            }
                            break;
                        case 'timeZone':
                            App.config.user.timeZoneOffset = null;
                            Ext.Object.each(options.options, function (idx, item) {
                                if (item.id == options.value) {
                                    App.config.user.timeZoneOffset = parseInt(item.offset);
                                }
                            });
                            App.config.user[name] = options.value;
                            break;
                        default:
                            App.config.user[name] = options.value;
                    }
                });

                /**
                 * Now call the "structure" service to get the root objects for the asset list.
                 */

                Ext.Ajax.request({
                    url: App.config.serviceUrl + 'caesarOrganizationStructure/structure3',
                    method: App.config.ajaxType,
                    success: function (response) {
                        var data = Ext.decode(response.responseText);

                        for (var i = 0; i < data.length; i++) {
                            var obj = data[i];
                            App.config.rootDomainObjectType = obj.domainObjectType;
                            App.config.rootDomainObjectId = obj.id;
                        }

                        // Create stores...
                        me.getIntegrateApp().getAt(1).createStores();
                        // ...and display them.
                        me.getIntegrateApp().setActiveItem(1);
                    }
                });
            },
            /**
             * Any other response than a 200
             * @param response
             */
            failure: function (response) {
                var msg = '';
                if (response.status == 500) {
                    msg = 'Internal server error.';
                } else {
                    var data = Ext.decode(response.responseText);
                    for (var i = 0; i < data.messages.length; i++) {
                        msg += data.messages[i] + '<br>';
                    }
                }
                Ext.Msg.alert('Error', msg);
            }
        });
    }
});