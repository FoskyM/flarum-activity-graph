(()=>{var t={n:a=>{var e=a&&a.__esModule?()=>a.default:()=>a;return t.d(e,{a:e}),e},d:(a,e)=>{for(var i in e)t.o(e,i)&&!t.o(a,i)&&Object.defineProperty(a,i,{enumerable:!0,get:e[i]})},o:(t,a)=>Object.prototype.hasOwnProperty.call(t,a),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},a={};(()=>{"use strict";t.r(a);const e=flarum.core.compat["common/app"];t.n(e)().initializers.add("foskym/flarum-activity-graph",(function(){console.log("[foskym/flarum-activity-graph] Hello, forum and admin!")}));const i=flarum.core.compat["admin/app"];var s=t.n(i);const r=flarum.core.compat["common/utils/extractText"];var o=t.n(r),n=["comments","discussions","likes","custom_levels_exp_logs","invite_user_invites","store_purchases","polls_create_polls","polls_votes","username_requests_username","username_requests_nickname","best_answer_marked","badges_assigned","achievements_achieved","quest_done"];s().initializers.add("foskym/flarum-activity-graph",(function(){var t={};["top","right","bottom","left"].map((function(a){t[a]=s().translator.trans("foskym-activity-graph.admin.settings.tooltip_position_options."+a)})),s().extensionData.for("foskym-activity-graph").registerSetting({setting:"foskym-activity-graph.tooltip_position",label:s().translator.trans("foskym-activity-graph.admin.settings.tooltip_position"),type:"select",options:t,default:"top"}).registerSetting({setting:"foskym-activity-graph.times_display_format",label:s().translator.trans("foskym-activity-graph.admin.settings.times_display_format"),help:s().translator.trans("foskym-activity-graph.admin.settings.times_display_format_help"),type:"text",default:o()(s().translator.trans("foskym-activity-graph.lib.defaults.times_display_format"))}).registerSetting({setting:"foskym-activity-graph.from_year",label:s().translator.trans("foskym-activity-graph.admin.settings.from_year"),help:s().translator.trans("foskym-activity-graph.admin.settings.from_year_help"),type:"number",default:"2020"}).registerPermission({icon:"fas fa-id-card",label:s().translator.trans("foskym-activity-graph.admin.permissons.query-others-activity-graph"),permission:"foskym-activity-graph.queryOthersActivityGraph",allowGuest:!0},"view"),n.forEach((function(t){s().extensionData.for("foskym-activity-graph").registerSetting({setting:"foskym-activity-graph.count_"+t,label:s().translator.trans("foskym-activity-graph.admin.settings.count_"+t),type:"boolean",default:!0})}))}))})(),module.exports=a})();
//# sourceMappingURL=admin.js.map