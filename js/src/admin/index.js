import app from 'flarum/admin/app';

app.initializers.add('foskym/flarum-activity-graph', () => {
  let options = {};
  ['top', 'right', 'bottom', 'left'].map((position) => {
    options[position] = app.translator.trans('foskym-activity-graph.admin.settings.tooltip_position_options.' + position);
  })

  app.extensionData
    .for('foskym-activity-graph')
    .registerSetting({
      setting: 'foskym-activity-graph.tooltip_position',
      label: app.translator.trans('foskym-activity-graph.admin.settings.tooltip_position'),
      type: 'select',
      options: options,
      default: 'top',
    })
    .registerPermission(
      {
        icon: 'fas fa-id-card',
        label: app.translator.trans('foskym-activity-graph.admin.permissons.query-others-activity-graph'),
        permission: 'foskym-activity-graph.queryOthersActivityGraph',
        allowGuest: true,
      },
      'view'
    );

  [
    'comments',
    'discussions',
    'likes',
    'custom_levels_exp_logs',
    'invite_user_invites',
    'store_purchases',
    'polls_create_polls',
    'polls_votes',
    'username_requests_username',
    'username_requests_nickname',
  ].forEach((category) => {
    app.extensionData.for('foskym-activity-graph').registerSetting({
      setting: 'foskym-activity-graph.count_' + category,
      label: app.translator.trans('foskym-activity-graph.admin.settings.count_' + category),
      type: 'boolean',
      default: true,
    });
  });
});
