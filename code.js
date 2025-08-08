javascript:(function(){let START=8,END=18,MIN_FREE=30,BUFFER=15;
function promptSettings(){const s=prompt("SETTINGS:\nEarliest, Latest (24h), Min block (min), Buffer (min)",`${START},${END},${MIN_FREE},${BUFFER}`);if(s){[START,END,MIN_FREE,BUFFER]=s.split(",").map(Number)}}
class Ev{constructor(s,e){this.start=s;this.end=e}}
function to24h(t){t=t.trim();const m=t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);if(!m)return null;let h=+m[1],mi=+(m[2]||0);const p=(m[3]||"").toLowerCase();if(p==="pm"&&h!==12)h+=12;if(p==="am"&&h===12)h=0;return`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`}
function parseTimes(lbl){const m=[...lbl.matchAll(/(\d{1,2}(?::\d{2})?)\s*(am|pm)?/ig)].map(x=>x[0]);if(m.length<2)return null;return{start:m[0],end:m[1]}}
function mergeIntervals(list,adjMs=0){if(!list.length)return[];list.sort((a,b)=>a.start-b.start||a.end-b.end);const out=[new Ev(new Date(list[0].start),new Date(list[0].end))];for(let i=1;i<list.length;i++){const c=list[i],last=out[out.length-1];if(c.start<=new Date(+last.end+adjMs)){if(c.end>last.end)last.end=new Date(c.end)}else out.push(new Ev(new Date(c.start),new Date(c.end)))}return out}
function applyBuffer(ev,mins){const s=new Date(ev.start),e=new Date(ev.end);s.setMinutes(s.getMinutes()-mins);e.setMinutes(e.getMinutes()+mins);return new Ev(s,e)}
function dayWin(d){const s=new Date(d);s.setHours(START,0,0,0);const e=new Date(d);e.setHours(END,0,0,0);return[s,e]}
function parseChip(label,dayDate){const L=(label||"");const low=L.toLowerCase();if(low.includes("appointment schedule")||/appt_/.test(L))return null;const isOOO=/\b(out of office|ooo)\b/i.test(L);const isAccepted=/\baccepted\b/i.test(L);const hasStatus=/\b(accepted|declined|tentative|needs rsvp|maybe)\b/i.test(L);if(!(isAccepted||isOOO)){if(hasStatus)return null;}
const t=parseTimes(L);if(!t)return null;const s24=to24h(t.start),e24=to24h(t.end);if(!s24||!e24)return null;const base=new Date(dayDate);const s=new Date(`${base.toDateString()} ${s24}`);const e=new Date(`${base.toDateString()} ${e24}`);return e>s?new Ev(s,e):null}
function computeDayFree(col){const h2=col.querySelector("h2.XuJrye");if(!h2)return[];const txt=h2.textContent||"";const m=txt.match(/,\s*([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2})(?:,|\s*$)/)||txt.match(/,\s*([A-Za-z]+\s+\d{1,2})(?:,|\s*$)/);const ds=m?m[1]:"";const year=(new Date()).getFullYear();const day=new Date(/\d{4}/.test(ds)?ds:`${ds}, ${year}`);if(isNaN(+day))return[];const [winS,winE]=dayWin(day);const chips=[...col.querySelectorAll('div[role="button"]')];const busy=[];for(const b of chips){const label=b.getAttribute("aria-label")||b.textContent||"";const ev=parseChip(label,day);if(!ev)continue;busy.push(applyBuffer(ev,BUFFER))}
const clipped=busy.map(ev=>{const s=new Date(Math.max(ev.start,winS));const e=new Date(Math.min(ev.end,winE));return e>s?new Ev(s,e):null}).filter(Boolean);
const mergedBusy=mergeIntervals(clipped,0);const free=[];let cur=winS;for(const b of mergedBusy){if(b.start>cur)free.push(new Ev(cur,b.start));if(b.end>cur)cur=b.end}if(cur<winE)free.push(new Ev(cur,winE));const minMs=MIN_FREE*60*1000;return mergeIntervals(free,60*1000).filter(b=>b.end-b.start>=minMs).map(b=>{b.__dayKey=+new Date(day.toDateString());return b})}
function groupAndSort(all){all.sort((a,b)=>a.__dayKey-b.__dayKey||a.start-b.start);const map=new Map();for(const b of all){const k=new Date(b.__dayKey).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"});const s=b.start.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();const e=b.end.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();if(!map.has(k))map.set(k,[]);map.get(k).push([s,e])}return map}
function colorMix(a,b,t){function p(x){const m=x.match(/\d+/g).map(Number);return{r:m[0],g:m[1],b:m[2]}}function f(c){return`rgb(${c.r|0}, ${c.g|0}, ${c.b|0})`}const A=p(a),B=p(b);return f({r:A.r+(B.r-A.r)*t,g:A.g+(B.g-A.g)*t,b:A.b+(B.b-A.b)*t})}
function getTheme(){const main=document.querySelector('div[role="main"]')||document.body;const grid=document.querySelector('div[role="gridcell"]')||main;const csMain=getComputedStyle(main);const csGrid=getComputedStyle(grid);const bg=csMain.backgroundColor!=="rgba(0, 0, 0, 0)"?csMain.backgroundColor:csGrid.backgroundColor;const fg=csMain.color;function lum(rgb){const m=rgb.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]}const dark=lum(bg)<0.35;const surface=colorMix(bg, dark? "rgb(255,255,255)":"rgb(0,0,0)", dark?0.08:0.04);const border=colorMix(fg,bg,0.75);const accent=csGrid.borderColor&&csGrid.borderColor!=="rgba(0, 0, 0, 0)"?csGrid.borderColor:fg;return{bg,fg,surface,border,accent,dark}}
function ensurePanel(){let host=document.getElementById("computed-availability-host");if(host)return host;host=document.createElement("div");host.id="computed-availability-host";const tgt=document.getElementById("drawerMiniMonthNavigator")||document.querySelector('div[role="main"] h1')||document.body;const parent=tgt&&tgt.parentNode?tgt.parentNode:document.body;parent.insertBefore(host,tgt);const root=host.attachShadow({mode:"open"});const wrap=document.createElement("div");wrap.id="wrap";root.appendChild(wrap);const st=document.createElement("style");root.appendChild(st);host._shadowRoot=root;return host}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function render(map){const host=ensurePanel();const {fg,surface,border,accent}=getTheme();const sr=host._shadowRoot;const st=sr.querySelector("style");
st.textContent=`:host{all:initial}
.card{font:14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${fg};background:${surface};
  border:1px solid ${border};border-radius:12px;padding:10px 12px 10px;box-shadow:0 2px 6px rgba(0,0,0,.12);max-width:320px}
.titleRow{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.titleLeft{display:flex;align-items:center;gap:8px}
.title{font-weight:700}
.iconBtn{all:unset;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid ${border};border-radius:6px;cursor:pointer;transition:transform .08s ease, background .2s ease, box-shadow .2s ease}
.ctrlRow{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
button.ctrl{all:unset;font:inherit;padding:4px 10px;border:1px solid ${border};border-radius:8px;cursor:pointer;transition:transform .08s ease, background .2s ease, box-shadow .2s ease}
button.ctrl:hover,.iconBtn:hover{background:${colorMix(surface,accent,0.08)}}
button.ctrl:active,.iconBtn:active{transform:scale(0.98)}
.pulse{background:${colorMix(surface,accent,0.16)} !important;box-shadow:0 0 0 2px ${colorMix(surface,accent,0.22)} inset}
@keyframes pulseOut{0%{box-shadow:0 0 0 6px ${colorMix(surface,accent,0.20)} inset}100%{box-shadow:0 0 0 0 ${colorMix(surface,accent,0)} inset}}
.flash{animation:pulseOut .35s ease}
.list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.day{margin:0 0 2px 0;font-weight:600;opacity:.9}
.row{display:flex;justify-content:space-between;padding:2px 6px;border:1px dashed ${border};border-radius:6px}
.muted{opacity:.8}
.collapsed .list{display:none}
.collapsed .ctrlRow{display:none}
.collapsed .title{opacity:.9}`;
const wrap=sr.getElementById("wrap");wrap.replaceChildren();const card=el("div","card");if(sessionStorage.getItem("gcAvailCollapsed")==="1")card.classList.add("collapsed");
const titleRow=el("div","titleRow");
const left=el("div","titleLeft");
const chevron=el("button","iconBtn",card.classList.contains("collapsed")?"▸":"▾");
chevron.title="Collapse/Expand";
const flash=(btn)=>{btn.classList.add("pulse");setTimeout(()=>{btn.classList.remove("pulse");btn.classList.add("flash");setTimeout(()=>btn.classList.remove("flash"),250)},120)};
chevron.addEventListener("click",()=>{card.classList.toggle("collapsed");const c=card.classList.contains("collapsed");chevron.textContent=c?"▸":"▾";sessionStorage.setItem("gcAvailCollapsed",c?"1":"0");flash(chevron)});
const title=el("div","title","Availability");
left.appendChild(chevron);left.appendChild(title);
const close=el("button","iconBtn","×");close.title="Close";close.addEventListener("click",()=>{flash(close);setTimeout(()=>host.remove(),120)});
titleRow.appendChild(left);titleRow.appendChild(close);
card.appendChild(titleRow);
const ctrlRow=el("div","ctrlRow");
function mk(label,fn,cls){const b=el("button",cls||"ctrl",label);b.addEventListener("click",(e)=>{flash(b);fn(e)});return b}
ctrlRow.appendChild(mk("Copy",()=>{let t="Availability:\n\n";for(const [d,slots] of map.entries()){t+=d+"\n"+(slots.map(x=>x.join("–")).join("\n")||"n/a")+"\n\n"}navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{});}));
ctrlRow.appendChild(mk("Refresh",()=>run()));
ctrlRow.appendChild(mk("Settings",()=>{promptSettings();run()}));
card.appendChild(ctrlRow);
const list=el("ul","list");
for(const [day,slots] of map.entries()){
  const li=document.createElement("li");
  li.appendChild(el("div","day",day));
  if(!slots.length){li.appendChild(el("div","muted","n/a"))}
  else{for(const [s,e] of slots){const row=el("div","row");row.appendChild(el("span",null,s));row.appendChild(el("span",null,"–"));row.appendChild(el("span",null,e));li.appendChild(row)}}
  list.appendChild(li);
}
card.appendChild(list);wrap.appendChild(card)}
function run(){const cols=[...document.querySelectorAll('div[role="gridcell"][data-datekey]')];if(!cols.length){alert("Open Google Calendar in Week/5-day view and try again.");return}let all=[];for(const c of cols)all=all.concat(computeDayFree(c));render(groupAndSort(all))}
if(!window.__gcAvailInit){window.__gcAvailInit=true;promptSettings()}run();})();
