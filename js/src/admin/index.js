import app from 'flarum/admin/app';

app.initializers.add('foskym/flarum-activity-graph', () => {
  app.extensionData.for('foskym-activity-graph').registerPermission(
    {
      icon: 'fas fa-id-card',
      label: app.translator.trans('foskym-activity-graph.admin.permissons.query-others-activity-graph'),
      permission: 'foskym-activity-graph.queryOthersActivityGraph',
      allowGuest: true,
    },
    'view'
  );

  ['comments', 'discussions', 'likes', 'custom_levels_exp_logs', 'invite_user_invites'].forEach((category) => {
    app.extensionData.for('foskym-activity-graph').registerSetting({
      setting: 'foskym-activity-graph.count_' + category,
      label: app.translator.trans('foskym-activity-graph.admin.settings.count_' + category),
      type: 'boolean',
      default: true,
    });
  });
});
