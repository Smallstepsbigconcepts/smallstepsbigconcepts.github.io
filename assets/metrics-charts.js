/* SSBC metrics dashboard: one inline-SVG line chart per metric. Gaps (null) are never filled. */
(function(){
function fmtD(s){if(!s)return'';var d=new Date(s+'T12:00:00');return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function fmtV(v,u){if(v==null)return'no data';return u=='$'?'$'+v.toFixed(2):v.toLocaleString('en-US')+' '+u;}
function chart(m,weeks){
 var W=560,H=230,L=64,R=40,T=16,B=40,vals=m.values,goal=m.goal;
 var nums=vals.filter(function(v){return v!=null;}); if(goal!=null)nums.push(goal);
 var lo=0,hi=nums.length?Math.max.apply(null,nums):1; if(hi===0)hi=1;
 if(nums.length&&Math.min.apply(null,nums)>hi*0.6){lo=Math.floor(Math.min.apply(null,nums)*0.95);} hi=hi*1.08;
 var n=weeks.length,x=function(i){return L+(n==1?0:i*(W-L-R)/(n-1));},y=function(v){return T+(H-T-B)*(1-(v-lo)/(hi-lo));};
 var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+m.title+'" style="width:100%;height:auto;font:12px sans-serif">';
 var rng=hi-lo,st=Math.pow(10,Math.floor(Math.log10(rng/4)));[1,2,5,10].some(function(q){if(rng/(st*q)<=5){st*=q;return true;}});if(st<1)st=1;hi=Math.ceil(hi/st)*st;lo=Math.floor(lo/st)*st;
 for(var gv=lo;gv<=hi+1e-9;gv+=st){var gy=y(gv);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="#e6e0d8"/><text x="'+(L-6)+'" y="'+(gy+4)+'" text-anchor="end" fill="#777">'+(m.unit=='$'?'$':'')+Math.round(gv).toLocaleString('en-US')+'</text>';}
 weeks.forEach(function(w,i){s+='<text x="'+x(i)+'" y="'+(H-B+18)+'" text-anchor="middle" fill="#555">wk '+fmtD(w)+'</text>';});
 if(goal!=null)s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(goal)+'" y2="'+y(goal)+'" stroke="#d9457a" stroke-dasharray="6 4"/><text x="'+(W-R)+'" y="'+(y(goal)-6)+'" text-anchor="end" fill="#d9457a">goal $'+goal+'/mo</text>';
 var seg=[];function flush(){if(seg.length>1)s+='<polyline fill="none" stroke="#e8743b" stroke-width="3" points="'+seg.join(' ')+'"/>';seg=[];}
 vals.forEach(function(v,i){if(v==null){flush();}else seg.push(x(i)+','+y(v));});flush();
 vals.forEach(function(v,i){if(v==null){s+='<text x="'+x(i)+'" y="'+(H-B-6)+'" text-anchor="middle" fill="#aaa">gap</text>';}else{var f=m.flags&&m.flags[i]?' ('+m.flags[i]+')':'';s+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="5" fill="#e8743b"><title>'+fmtV(v,m.unit)+', read '+fmtD(m.read[i])+f+'</title></circle><text x="'+x(i)+'" y="'+(y(v)-10)+'" text-anchor="middle" fill="#3b2a2a" font-weight="700">'+(m.unit=='$'?'$'+Math.round(v):v.toLocaleString('en-US'))+'</text>';}});
 if(!nums.length||(goal!=null&&nums.length==1))s+='<text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" fill="#999">No readings on file yet</text>';
 return s+'</svg>';
}
window.ssbcRender=function(data,el){
 var h='';(data.metrics).forEach(function(m){
  var rows=data.weeks.map(function(w,i){var f=m.flags&&m.flags[i]?' · '+m.flags[i]:'';return '<tr><td>Week ending '+fmtD(w)+'</td><td class="n">'+fmtV(m.values[i],m.unit)+'</td><td>'+(m.read[i]?'read '+fmtD(m.read[i]):'')+f+'</td></tr>';}).join('');
  h+='<div class="area" style="margin-bottom:28px"><h3>'+m.title+'</h3>'+chart(m,data.weeks)+'<details><summary>Numbers</summary><table>'+rows+'</table></details></div>';});
 var P=data.products,ph='';if(P){ph='<div class="area" style="margin-top:36px;margin-bottom:28px"><h2>What\'s for sale right now</h2><p class="small">'+P.rule+' As of '+fmtD(P.as_of)+'.</p>';P.groups.forEach(function(g){if(!g.items.length){if(g.note)ph+='<p class="small">'+g.note+'</p>';return;}ph+='<h4>'+g.type+': '+g.items.length+'</h4><ul>'+g.items.map(function(it){return '<li>'+it.name+' · '+it.links.map(function(l){return '<a href="'+l[1]+'" rel="noopener">'+l[0]+'</a>';}).join(' · ')+'</li>';}).join('')+'</ul>'+(g.note?'<p class="small">'+g.note+'</p>':'');});ph+='</div>';}
 el.innerHTML='<p class="small">Data updated '+fmtD(data.updated)+'. A gap means no real reading that week; gaps are never filled in.</p>'+h+ph;
};
})();
