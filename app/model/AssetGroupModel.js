Ext.define('Rms.model.AssetGroupModel', {
    extend: 'Ext.data.Model',
    config: {
        idProperty: 'oid',
        fields    : [
            'name',
            'oid'
        ]
    }
});