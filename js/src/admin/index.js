import app from 'flarum/admin/app';
import extractText from 'flarum/common/utils/extractText';
import { categories } from '../common/utils/categories';

app.initializers.add('foskym/flarum-activity-graph', () => {
  let options = {};
  ['top', 'right', 'bottom', 'left'].map((position) => {
    options[position] = app.translator.trans('foskym-activity-graph.admin.settings.tooltip_position_options.' + position);
  });

  app.extensionData
    .for('foskym-activity-graph')
    .registerSetting({
      setting: 'foskym-activity-graph.tooltip_position',
      label: app.translator.trans('foskym-activity-graph.admin.settings.tooltip_position'),
      type: 'select',
      options: options,
      default: 'top',
    })
    .registerSetting({
      setting: 'foskym-activity-graph.times_display_format',
      label: app.translator.trans('foskym-activity-graph.admin.settings.times_display_format'),
      help: app.translator.trans('foskym-activity-graph.admin.settings.times_display_format_help'),
      type: 'text',
      default: extractText(app.translator.trans('foskym-activity-graph.lib.defaults.times_display_format')),
    })
    .registerSetting({
      setting: 'foskym-activity-graph.from_year',
      label: app.translator.trans('foskym-activity-graph.admin.settings.from_year'),
      help: app.translator.trans('foskym-activity-graph.admin.settings.from_year_help'),
      type: 'number',
      default: '2020',
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

  categories.forEach((category) => {
    app.extensionData.for('foskym-activity-graph').registerSetting({
      setting: 'foskym-activity-graph.count_' + category,
      label: app.translator.trans('foskym-activity-graph.admin.settings.count_' + category),
      type: 'boolean',
      default: true,
    });
  });
});
