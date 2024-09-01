import app from 'flarum/forum/app';
import {extend} from 'flarum/common/extend';
import UserPage from 'flarum/forum/components/UserPage';
import GraphPage from "./pages/GraphPage";
import LinkButton from 'flarum/common/components/LinkButton';
app.initializers.add('foskym/flarum-activity-graph', () => {
  app.routes['user.activity-graph'] = {
    path: '/u/:username/activity-graph',
    component: GraphPage
  };
  extend(UserPage.prototype, 'navItems', function (items) {
    items.add(
      'activity-graph',
      LinkButton.component(
        {
          href: app.route('user.activity-graph', { username: this.user?.username() }),
          icon: 'fas fa-chart-line',
        },
        [
          app.translator.trans('foskym-activity-graph.forum.label.activity_graph'),
        ]
      )
    );
  });
});
