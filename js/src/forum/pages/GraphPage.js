import app from 'flarum/forum/app';
import UserPage from 'flarum/forum/components/UserPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';
import extractText from 'flarum/common/utils/extractText';
import { categories } from '../../common/utils/categories';

export default class GraphPage extends UserPage {
  loading = true;
  year = new Date().getFullYear().toString();
  graphData = null;
  categories = null;
  total = 0;
  chart = null;
  resizeHandlerBound = false;
  darkModeHandlerBound = false;
  recentMode = 'light';

  oninit(vnode) {
    super.oninit(vnode);
    this.loadUser(m.route.param('username'));
    this.loadGraph();
  }

  loadGraph() {
    this.loading = true;

    app.request({
      method: 'GET',
      url: `${app.forum.attribute('apiUrl')}/activity-graph`,
      params: { user_id: this.user.id(), year: this.year },
    }).then((result) => {
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

      if (colorScheme !== this.recentMode) {
        this.recentMode = colorScheme;
        this.chart?.dispose();
        this.chart = window.echarts.init(graph_container, colorScheme === 'dark' ? 'dark' : 'light');
      } else {
        this.chart = this.chart || window.echarts.init(graph_container);
      }

      this.chart.setOption(this.getChartOptions(bodyBg));

      if (!this.resizeHandlerBound) {
        window.addEventListener('resize', () => this.chart.resize());
        this.resizeHandlerBound = true;
      }

      if (!this.darkModeHandlerBound && flarum.extensions['fof-nightmode']) {
        document.addEventListener('fofnightmodechange', () => this.renderGraph());
        this.darkModeHandlerBound = true;
      }
    }, 50);
  }

  getChartOptions(bodyBg) {
    return {
      backgroundColor: bodyBg,
      tooltip: {
        position: app.forum.attribute('foskym-activity-graph.tooltip_position') || 'top',
        className: 'foskym-activity-graph-tooltip',
        formatter: (e) => this.formatTooltip(e),
      },
      visualMap: {
        show: false,
        min: 0,
        max: 300,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: 'top',
        inRange: {
          color: ['#75ca67', '#23b20c', '#b99f11', '#b81111', '#6c0b0b', '#000000'],
        },
      },
      calendar: [{
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
          show: true,
        },
      }],
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        calendarIndex: 0,
        data: this.graphData,
      }],
    };
  }

  formatTooltip(e) {
    let date = e.data[0];
    let total = e.data[1];
    let format = app.forum.attribute('foskym-activity-graph.times_display_format') ||
      extractText(app.translator.trans('foskym-activity-graph.lib.defaults.times_display_format'));
    let html = `<p>${e.marker}${date.substring(5)} <b>${format.includes('[count]') ? format.replace('[count]', total) : `${total} ${format}`}</b></p>`;
    categories.forEach((category) => {
      if (app.forum.attribute(`foskym-activity-graph.count_${category}`) === false) return;
      if (this.categories[category] && this.categories[category][date]) {
        html += `<p><small>${app.translator.trans(`foskym-activity-graph.forum.label.categories.${category}`)} <b>${format.includes('[count]') ? format.replace('[count]', this.categories[category][date]) : `${this.categories[category][date]} ${format}`}</b></small></p>`;
      }
    });
    return html;
  }

  content() {
    const currentYear = new Date().getFullYear().toString();
    let fromYear = app.forum.attribute('foskym-activity-graph.from_year') || currentYear;
    fromYear = fromYear > currentYear ? currentYear : fromYear;

    const options = Array.from({ length: currentYear - fromYear + 1 }, (_, i) => (parseInt(fromYear) + i).toString())
      .reduce((acc, year) => ({ ...acc, [year]: year }), {});

    const format = app.forum.attribute('foskym-activity-graph.times_display_format') ||
      extractText(app.translator.trans('foskym-activity-graph.lib.defaults.times_display_format'));

    const totalTimes = format.includes('[count]') ? format.replace('[count]', this.total) : `${this.total} ${format}`;

    return (
      <div class="activity-graph-page">
        <h2>{app.translator.trans('foskym-activity-graph.forum.label.activity_graph')}</h2>
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <span>{app.translator.trans('foskym-activity-graph.forum.label.total_times', { total: totalTimes })}</span>
          <Select
            options={options}
            value={this.year}
            onchange={(value) => {
              this.year = value;
              this.loadGraph();
            }}
          />
        </div>
        {this.loading && <LoadingIndicator />}
        <div id="activity-graph" style="width:100%; height:150px;"></div>
      </div>
    );
  }
}