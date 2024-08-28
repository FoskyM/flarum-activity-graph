import app from 'flarum/forum/app';
import UserPage from 'flarum/forum/components/UserPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';

export default class AuthorizedPage extends UserPage {
  loading = true;
  year = new Date().getFullYear().toString();
  graphData = null;
  categories = null;
  total = 0;
  graph = null;
  resize_handler_bound = false;
  dark_mode_handler_bound = false;
  recent_mode = 'light';

  oninit(vnode) {
    super.oninit(vnode);
    this.loadUser(m.route.param('username'));
    this.loadGraph();
  }

  loadGraph() {
    this.loading = true;

    app
      .request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/activity-graph',
        params: { user_id: this.user.id(), year: this.year },
      })
      .then((result) => {
        this.loading = false;
        this.graphData = result.data;
        this.categories = result.categories;
        this.total = result.total;
        m.redraw();
        this.renderGraph();
      });
  }

  renderGraph() {
    if (!window.echarts) {
      setTimeout(() => this.renderGraph(), 200);
      return;
    }

    const graph_container = document.getElementById('activity-graph');
    if (!graph_container) return;

    setTimeout(() => {
      const root = document.documentElement;
      const colorScheme = getComputedStyle(root).getPropertyValue('--color-scheme').trim();
      const bodyBg = getComputedStyle(root).getPropertyValue('--body-bg').trim();
      console.log(colorScheme, bodyBg);
      if (colorScheme != this.recent_mode) {
        this.recent_mode = colorScheme;
        if (this.chart) {
          this.chart.dispose();
          this.chart = null;
        }
        this.chart = window.echarts.init(graph_container, colorScheme == 'dark' ? 'dark' : 'light');
      } else {
        this.chart = this.chart || window.echarts.init(graph_container);
      }
      const that = this;
      this.chart.setOption({
        backgroundColor: bodyBg,
        tooltip: {
          position: 'top',
          className: 'foskym-activity-graph-tooltip',
          formatter: function (e) {
            let date = e.data[0];
            let total = e.data[1];
            let unit = app.translator.trans('foskym-activity-graph.forum.label.unit');
            let html = '<p>' + e.marker + date.substring(5) + ' <b>' + total + ' ' + unit + '</b></p>';
            ['comments', 'discussions', 'likes', 'custom_levels_exp_logs'].forEach((category) => {
              if (app.forum.attribute('foskym-activity-graph.count_' + category) == false) return;
              if (that.categories[category][date]) {
                html +=
                  '<p><small>' +
                  app.translator.trans('foskym-activity-graph.forum.label.categories.' + category) +
                  ' <b>' +
                  that.categories[category][date] +
                  ' ' +
                  unit +
                  '</b></small></p>';
              }
            });
            return html;
          },
        },
        visualMap: {
          show: !1,
          min: 0,
          max: 300,
          calculable: !0,
          orient: 'horizontal',
          left: 'center',
          top: 'top',
          inRange: {
            color: ['#75ca67', '#23b20c', '#b99f11', '#b81111', '#6c0b0b', '#000000'],
          },
        },
        calendar: [
          {
            range: this.year,
            cellSize: ['auto', 'auto'],
            left: 50,
            top: 30,
            splitLine: {
              lineStyle: {
                color: '#777',
              },
            },
            dayLabel: {
              nameMap: app.translator.trans('foskym-activity-graph.forum.label.name_map')[0],
              firstDay: 1,
            },
            monthLabel: {
              nameMap: app.translator.trans('foskym-activity-graph.forum.label.name_map')[0],
            },
            yearLabel: {
              show: !0,
            },
          },
        ],
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 0,
            data: this.graphData,
          },
        ],
      });

      if (!this.resize_handler_bound) {
        window.addEventListener('resize', () => {
          this.chart.resize();
        });
        this.resize_handler_bound = true;
      }

      if (!this.dark_mode_handler_bound) {
        if (flarum.extensions['fof-nightmode']) {
          document.addEventListener('fofnightmodechange', (event) => {
            console.log(event.detail);
            this.renderGraph();
          });
        }
        this.dark_mode_handler_bound = true;
      }
    }, 50);
  }

  content() {
    let options = {};
    for (let i = 0; i < 10; i++) {
      let year = (new Date().getFullYear() - i).toString();
      options[year] = year;
    }

    return (
      <div class="activity-graph-page">
        <h2>{app.translator.trans('foskym-activity-graph.forum.label.activity_graph')}</h2>
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <span>{app.translator.trans('foskym-activity-graph.forum.label.total_times', { total: this.total })}</span>
          <Select
            options={options}
            value={this.year}
            onchange={(value) => {
              this.year = value;
              this.loadGraph();
            }}
          ></Select>
        </div>

        <div id="activity-graph" style="width:100%; height:150px;"></div>
      </div>
    );
  }
}
