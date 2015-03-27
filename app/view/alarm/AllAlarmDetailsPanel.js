Ext.define('Rms.view.alarm.AllAlarmDetailsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.all_alarm_details',
    requires: ['Ext.TitleBar'],
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
                }, {
                    xtype: 'spacer'
                }, {
                    xtype: 'button',
                    text: 'Options'
                }
            ]
        }
    },
    setRecords: function (record) {

        var lastUpdatedTime;
        if (record.get('lastUpdatedTime')) {
            var iso = record.get('lastUpdatedTime');
            var isoArray = iso.split(" ");
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
            lastUpdatedTime = Ext.Date.format(date, App.config.user.dateTimeFormat);
        } else {
            lastUpdatedTime = App.config.blankSign;
        }
        var defaults = {
            xtype: 'field',
            labelWrap: true,
            cls: 'label-field'
        };

        this.getAt(0).setTitle(Ext.util.Format.ellipsis(record.get('name'), 10));

        var position = App.config.blankSign;
        if (typeof record.get('position') != 'undefined') {
            position = record.get('position');
        }
        console.log(position);
        this.setItems({
            xtype: 'fieldset',
            title: 'Alarm Details',
            defaults: defaults,
            items: [
                {
                    label: 'Asset Name',
                    html: record.get('asset')
                }, {
                    label: 'Description',
                    html: record.get('description')
                }, {

                    label: 'Position',
                    html: position
                }, {
                    label: 'Last Update Time',
                    html: lastUpdatedTime
                }
            ]
        });
    }
});
