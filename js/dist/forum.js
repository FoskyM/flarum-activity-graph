(()=>{var t={n:e=>{var a=e&&e.__esModule?()=>e.default:()=>e;return t.d(a,{a}),a},d:(e,a)=>{for(var r in a)t.o(a,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:a[r]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};(()=>{"use strict";t.r(e);const a=flarum.core.compat["common/app"];t.n(a)().initializers.add("foskym/flarum-activity-graph",(function(){console.log("[foskym/flarum-activity-graph] Hello, forum and admin!")}));const r=flarum.core.compat["forum/app"];var o=t.n(r);const n=flarum.core.compat["common/extend"],i=flarum.core.compat["forum/components/UserPage"];var s=t.n(i);function c(t,e){return c=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},c(t,e)}flarum.core.compat["common/components/LoadingIndicator"];const l=flarum.core.compat["common/components/Select"];var u=t.n(l);const p=flarum.core.compat["common/utils/extractText"];var d=t.n(p),f=["comments","discussions","likes","custom_levels_exp_logs","invite_user_invites","store_purchases","polls_create_polls","polls_votes","username_requests_username","username_requests_nickname","best_answer_marked","badges_assigned","achievements_achieved"],h=function(t){var e,a;function r(){for(var e,a=arguments.length,r=new Array(a),o=0;o<a;o++)r[o]=arguments[o];return(e=t.call.apply(t,[this].concat(r))||this).loading=!0,e.year=(new Date).getFullYear().toString(),e.graphData=null,e.categories=null,e.total=0,e.graph=null,e.resize_handler_bound=!1,e.dark_mode_handler_bound=!1,e.recent_mode="light",e}a=t,(e=r).prototype=Object.create(a.prototype),e.prototype.constructor=e,c(e,a);var n=r.prototype;return n.oninit=function(e){t.prototype.oninit.call(this,e),this.loadUser(m.route.param("username")),this.loadGraph()},n.loadGraph=function(){var t=this;this.loading=!0,o().request({method:"GET",url:o().forum.attribute("apiUrl")+"/activity-graph",params:{user_id:this.user.id(),year:this.year}}).then((function(e){t.loading=!1,t.graphData=e.data,t.categories=e.categories,t.total=e.total,m.redraw(),t.renderGraph()}))},n.renderGraph=function(){var t=this;if(window.echarts){var e=document.getElementById("activity-graph");e&&setTimeout((function(){var a=document.documentElement,r=getComputedStyle(a).getPropertyValue("--color-scheme").trim(),n=getComputedStyle(a).getPropertyValue("--body-bg").trim();console.log(r,n),r!=t.recent_mode?(t.recent_mode=r,t.chart&&(t.chart.dispose(),t.chart=null),t.chart=window.echarts.init(e,"dark"==r?"dark":"light")):t.chart=t.chart||window.echarts.init(e);var i=t;t.chart.setOption({backgroundColor:n,tooltip:{position:o().forum.attribute("foskym-activity-graph.tooltip_position")||"top",className:"foskym-activity-graph-tooltip",formatter:function(t){var e=t.data[0],a=t.data[1],r=o().forum.attribute("foskym-activity-graph.times_display_format")||d()(o().translator.trans("foskym-activity-graph.lib.defaults.times_display_format")),n="<p>"+t.marker+e.substring(5)+" <b>"+(-1!=r.indexOf("[count]")?r.replace("[count]",a):a+" "+r)+"</b></p>";return f.forEach((function(t){0!=o().forum.attribute("foskym-activity-graph.count_"+t)&&i.categories[t]&&i.categories[t][e]&&(n+="<p><small>"+o().translator.trans("foskym-activity-graph.forum.label.categories."+t)+" <b>"+(-1!=r.indexOf("[count]")?r.replace("[count]",i.categories[t][e]):i.categories[t][e]+" "+r)+"</b></small></p>")})),n}},visualMap:{show:!1,min:0,max:300,calculable:!0,orient:"horizontal",left:"center",top:"top",inRange:{color:["#75ca67","#23b20c","#b99f11","#b81111","#6c0b0b","#000000"]}},calendar:[{range:t.year,cellSize:["auto","auto"],left:50,top:30,splitLine:{lineStyle:{color:"#777"}},dayLabel:{nameMap:o().translator.trans("foskym-activity-graph.forum.label.name_map")[0],firstDay:1},monthLabel:{nameMap:o().translator.trans("foskym-activity-graph.forum.label.name_map")[0]},yearLabel:{show:!0}}],series:[{type:"heatmap",coordinateSystem:"calendar",calendarIndex:0,data:t.graphData}]}),t.resize_handler_bound||(window.addEventListener("resize",(function(){t.chart.resize()})),t.resize_handler_bound=!0),t.dark_mode_handler_bound||(flarum.extensions["fof-nightmode"]&&document.addEventListener("fofnightmodechange",(function(e){t.renderGraph()})),t.dark_mode_handler_bound=!0)}),50)}else setTimeout((function(){return t.renderGraph()}),200)},n.content=function(){var t=this,e={},a=(new Date).getFullYear().toString(),r=o().forum.attribute("foskym-activity-graph.from_year")||a;r>a&&(r=a);for(var n=parseInt(r);n<=parseInt(a);n++)e[n.toString()]=n.toString();var i=o().forum.attribute("foskym-activity-graph.times_display_format")||d()(o().translator.trans("foskym-activity-graph.lib.defaults.times_display_format"));return m("div",{class:"activity-graph-page"},m("h2",null,o().translator.trans("foskym-activity-graph.forum.label.activity_graph")),m("div",{style:"display: flex; justify-content: space-between; align-items: end;"},m("span",null,o().translator.trans("foskym-activity-graph.forum.label.total_times",{total:-1!=i.indexOf("[count]")?i.replace("[count]",this.total):this.total+" "+i})),m(u(),{options:e,value:this.year,onchange:function(e){t.year=e,t.loadGraph()}})),m("div",{id:"activity-graph",style:"width:100%; height:150px;"}))},r}(s());const y=flarum.core.compat["common/components/LinkButton"];var g=t.n(y);o().initializers.add("foskym/flarum-activity-graph",(function(){o().routes["user.activity-graph"]={path:"/u/:username/activity-graph",component:h},(0,n.extend)(s().prototype,"navItems",(function(t){t.add("activity-graph",g().component({href:o().route("user.activity-graph",{username:this.user.username()}),icon:"fas fa-chart-line"},[o().translator.trans("foskym-activity-graph.forum.label.activity_graph")]))}))}))})(),module.exports=e})();
//# sourceMappingURL=forum.js.map