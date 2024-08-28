(()=>{var t={n:a=>{var e=a&&a.__esModule?()=>a.default:()=>a;return t.d(e,{a:e}),e},d:(a,e)=>{for(var r in e)t.o(e,r)&&!t.o(a,r)&&Object.defineProperty(a,r,{enumerable:!0,get:e[r]})},o:(t,a)=>Object.prototype.hasOwnProperty.call(t,a),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},a={};(()=>{"use strict";t.r(a);const e=flarum.core.compat["common/app"];t.n(e)().initializers.add("foskym/flarum-activity-graph",(function(){console.log("[foskym/flarum-activity-graph] Hello, forum and admin!")}));const r=flarum.core.compat["forum/app"];var o=t.n(r);const n=flarum.core.compat["common/extend"],i=flarum.core.compat["forum/components/UserPage"];var s=t.n(i);function c(t,a){return c=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,a){return t.__proto__=a,t},c(t,a)}flarum.core.compat["common/components/LoadingIndicator"];const l=flarum.core.compat["common/components/Select"];var u=t.n(l);const p=flarum.core.compat["common/utils/extractText"];var d=t.n(p),f=["comments","discussions","likes","custom_levels_exp_logs","invite_user_invites","store_purchases","polls_create_polls","polls_votes","username_requests_username","username_requests_nickname","best_answer_marked","badges_assigned"],h=function(t){var a,e;function r(){for(var a,e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];return(a=t.call.apply(t,[this].concat(r))||this).loading=!0,a.year=(new Date).getFullYear().toString(),a.graphData=null,a.categories=null,a.total=0,a.graph=null,a.resize_handler_bound=!1,a.dark_mode_handler_bound=!1,a.recent_mode="light",a}e=t,(a=r).prototype=Object.create(e.prototype),a.prototype.constructor=a,c(a,e);var n=r.prototype;return n.oninit=function(a){t.prototype.oninit.call(this,a),this.loadUser(m.route.param("username")),this.loadGraph()},n.loadGraph=function(){var t=this;this.loading=!0,o().request({method:"GET",url:o().forum.attribute("apiUrl")+"/activity-graph",params:{user_id:this.user.id(),year:this.year}}).then((function(a){t.loading=!1,t.graphData=a.data,t.categories=a.categories,t.total=a.total,m.redraw(),t.renderGraph()}))},n.renderGraph=function(){var t=this;if(window.echarts){var a=document.getElementById("activity-graph");a&&setTimeout((function(){var e=document.documentElement,r=getComputedStyle(e).getPropertyValue("--color-scheme").trim(),n=getComputedStyle(e).getPropertyValue("--body-bg").trim();console.log(r,n),r!=t.recent_mode?(t.recent_mode=r,t.chart&&(t.chart.dispose(),t.chart=null),t.chart=window.echarts.init(a,"dark"==r?"dark":"light")):t.chart=t.chart||window.echarts.init(a);var i=t;t.chart.setOption({backgroundColor:n,tooltip:{position:o().forum.attribute("foskym-activity-graph.tooltip_position")||"top",className:"foskym-activity-graph-tooltip",formatter:function(t){var a=t.data[0],e=t.data[1],r=o().forum.attribute("foskym-activity-graph.times_display_format")||d()(o().translator.trans("foskym-activity-graph.lib.defaults.times_display_format")),n="<p>"+t.marker+a.substring(5)+" <b>"+(-1!=r.indexOf("[count]")?r.replace("[count]",e):e+" "+r)+"</b></p>";return f.forEach((function(t){0!=o().forum.attribute("foskym-activity-graph.count_"+t)&&i.categories[t]&&i.categories[t][a]&&(n+="<p><small>"+o().translator.trans("foskym-activity-graph.forum.label.categories."+t)+" <b>"+(-1!=r.indexOf("[count]")?r.replace("[count]",i.categories[t][a]):i.categories[t][a]+" "+r)+"</b></small></p>")})),n}},visualMap:{show:!1,min:0,max:300,calculable:!0,orient:"horizontal",left:"center",top:"top",inRange:{color:["#75ca67","#23b20c","#b99f11","#b81111","#6c0b0b","#000000"]}},calendar:[{range:t.year,cellSize:["auto","auto"],left:50,top:30,splitLine:{lineStyle:{color:"#777"}},dayLabel:{nameMap:o().translator.trans("foskym-activity-graph.forum.label.name_map")[0],firstDay:1},monthLabel:{nameMap:o().translator.trans("foskym-activity-graph.forum.label.name_map")[0]},yearLabel:{show:!0}}],series:[{type:"heatmap",coordinateSystem:"calendar",calendarIndex:0,data:t.graphData}]}),t.resize_handler_bound||(window.addEventListener("resize",(function(){t.chart.resize()})),t.resize_handler_bound=!0),t.dark_mode_handler_bound||(flarum.extensions["fof-nightmode"]&&document.addEventListener("fofnightmodechange",(function(a){t.renderGraph()})),t.dark_mode_handler_bound=!0)}),50)}else setTimeout((function(){return t.renderGraph()}),200)},n.content=function(){var t=this,a={},e=(new Date).getFullYear().toString(),r=o().forum.attribute("foskym-activity-graph.from_year")||e;r>e&&(r=e);for(var n=parseInt(r);n<=parseInt(e);n++)a[n.toString()]=n.toString();var i=o().forum.attribute("foskym-activity-graph.times_display_format")||d()(o().translator.trans("foskym-activity-graph.lib.defaults.times_display_format"));return m("div",{class:"activity-graph-page"},m("h2",null,o().translator.trans("foskym-activity-graph.forum.label.activity_graph")),m("div",{style:"display: flex; justify-content: space-between; align-items: end;"},m("span",null,o().translator.trans("foskym-activity-graph.forum.label.total_times",{total:-1!=i.indexOf("[count]")?i.replace("[count]",this.total):this.total+" "+i})),m(u(),{options:a,value:this.year,onchange:function(a){t.year=a,t.loadGraph()}})),m("div",{id:"activity-graph",style:"width:100%; height:150px;"}))},r}(s());const y=flarum.core.compat["common/components/LinkButton"];var g=t.n(y);o().initializers.add("foskym/flarum-activity-graph",(function(){o().routes["user.activity-graph"]={path:"/u/:username/activity-graph",component:h},(0,n.extend)(s().prototype,"navItems",(function(t){t.add("activity-graph",g().component({href:o().route("user.activity-graph",{username:this.user.username()}),icon:"fas fa-chart-line"},[o().translator.trans("foskym-activity-graph.forum.label.activity_graph")]))}))}))})(),module.exports=a})();
//# sourceMappingURL=forum.js.map