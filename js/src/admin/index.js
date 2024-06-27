import app from 'flarum/admin/app';

app.initializers.add('foskym/flarum-activity-graph', () => {
  app.extensionData.for('foskym-activity-graph')
    .registerPermission({
        icon: 'fas fa-id-card',
        label: app.translator.trans('foskym-activity-graph.admin.settings.query-others-activity-graph'),
        permission: 'foskym-activity-graph.queryOthersActivityGraph',
        allowGuest: true
      }, 'view')
});
