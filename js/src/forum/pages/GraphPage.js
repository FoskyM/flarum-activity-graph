import app from 'flarum/forum/app';
import UserPage from 'flarum/forum/components/UserPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';

export default class AuthorizedPage extends UserPage {
  loading = true;
  year = new Date().getFullYear().toString();
  graphData = null;
  graph = null;
  oninit(vnode) {
    super.oninit(vnode);
    this.loadUser(m.route.param('username'));
    this.loadGraph();
  }

  loadGraph() {
    this.loading = true;

    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/activity-graph',
      params: {user_id: this.user.id(), year: this.year},
    }).then(result => {
      this.loading = false;
      this.graphData = result;
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

    this.chart = this.chart || window.echarts.init(graph_container);
    this.chart.setOption({
      tooltip: {
        position: "top",
        formatter: function(e) {
          return "<p>" + e.marker + e.data[0].substring(5) + " <b>" + e.data[1] +
            ' ' + '次' + "</b></p>"
        }
      },
      visualMap: {
        show: !1,
        min: 0,
        max: 300,
        calculable: !0,
        orient: "horizontal",
        left: "center",
        top: "top",
        inRange: {
          color: ["#75ca67", "#23b20c", "#b99f11", "#b81111", "#6c0b0b", "#000000"]
        }
      },
      calendar: [{
        range: this.year,
        cellSize: ["auto", "auto"],
        left: 50,
        top: 30,
        splitLine: {
          lineStyle: {
            color: "#777"
          }
        },
        dayLabel: {
          nameMap: "cn",
          firstDay: 1
        },
        monthLabel: {
          nameMap: "cn"
        },
        yearLabel: {
          show: !0
        }
      }],
      series: [{
        type: "heatmap",
        coordinateSystem: "calendar",
        calendarIndex: 0,
        data: this.graphData
      }]
    })
  }
  content() {
    let options = {};
    for (let i = 0; i < 10; i++) {
      let year = (new Date().getFullYear() - i).toString();
      options[year] = year;
    }

    return <div class="activity-graph-page">
      <Select
        options={
          options
        }
        value={this.year}
        onchange={value => {
          this.year = value;
          this.loadGraph();
        }
      }>
      </Select>
      <div id="activity-graph" style="width:100%; height:150px;"></div>
    </div>;

  }

}
