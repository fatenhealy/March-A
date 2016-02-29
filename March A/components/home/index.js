'use strict';

app.home = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home
(function(parent) {
    var dataProvider = app.data.progressDataProvider,
        jsdoOptions = {
            name: 'Customer',
            autoFill: false
        },
        dataSourceOptions = {
            type: 'jsdo',
            transport: {},

            error: function(e) {
                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Name': {
                            field: 'Name',
                            defaultValue: ''
                        },
                    }
                }
            },
        },
        dataSource = new kendo.data.DataSource({
            pageSize: 50
        }),
        homeModel = kendo.observable({
            dataSource: dataSource,
            _dataSourceOptions: dataSourceOptions,
            _jsdoOptions: jsdoOptions,
            itemClick: function(e) {
                window.plugins.EqatecAnalytics.Monitor.TrackFeature("Adding Items");
                
                
                app.mobileApp.navigate('#components/home/details.html?uid=' + e.dataItem.uid);
            },
            addClick: function() {
                app.mobileApp.navigate('#components/home/add.html');
            },
            editClick: function() {
                var uid = this.currentItem.uid;
                app.mobileApp.navigate('#components/home/edit.html?uid=' + uid);
            },
            deleteClick: function() {
                var dataSource = homeModel.get('dataSource');

                dataSource.remove(this.currentItem);

                dataSource.one('sync', function(e) {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges();
                });

                dataSource.sync();
            },
            detailsShow: function(e) {
                var item = e.view.params.uid,
                    dataSource = homeModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.Name) {
                    itemModel.Name = String.fromCharCode(160);
                }

                homeModel.set('currentItem', null);
                homeModel.set('currentItem', itemModel);
            },
            currentItem: null
        });

    parent.set('addItemViewModel', kendo.observable({
        onShow: function(e) {
            // Reset the form data.
            this.set('addFormData', {});
        },
        onSaveClick: function(e) {
            var addFormData = this.get('addFormData'),
                dataSource = homeModel.get('dataSource');

            dataSource.add({});

            dataSource.one('change', function(e) {
                app.mobileApp.navigate('#:back');
            });

            dataSource.sync();
        }
    }));

    parent.set('editItemViewModel', kendo.observable({
        onShow: function(e) {
            var itemUid = e.view.params.uid,
                dataSource = homeModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid);

            this.set('itemData', itemData);
            this.set('editFormData', {});
        },
        onSaveClick: function(e) {
            var editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = homeModel.get('dataSource');

            // prepare edit

            dataSource.one('sync', function(e) {
                app.mobileApp.navigate('#:back');
            });

            dataSource.one('error', function() {
                dataSource.cancelChanges(itemData);
            });

            dataSource.sync();
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('homeModel', homeModel);
        });
    } else {
        parent.set('homeModel', homeModel);
    }
    parent.set('onShow', function() {
        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = homeModel.get('_jsdoOptions'),
                jsdo = new progress.data.JSDO(jsdoOptions),
                dataSourceOptions = homeModel.get('_dataSourceOptions'),
                dataSource;

            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions);
            homeModel.set('dataSource', dataSource);
        });
    });
})(app.home);

// START_CUSTOM_CODE_homeModel
// you can handle the beforeFill / afterFill events here. For example:

/*
app.home.homeModel.get('_jsdoOptions').events = {
    'beforeFill' : [ {
        scope : app.home.homeModel,
        fn : function (jsdo, success, request) {
            // beforeFill event handler statements ...
        }
    } ]
};
*/
// END_CUSTOM_CODE_homeModel