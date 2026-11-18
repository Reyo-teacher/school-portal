/* Curriculum games: one action at a time, exact lesson data and optional narration. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function numeric(value){
 const s=String(value??'').trim().replace(/,/g,'.');if(!s)return null;
 let m=s.match(/^(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[3]?(+m[1]+ +m[2]/+m[3]):NaN;
 const t=s.replace(/\s/g,'');m=t.match(/^([+-]?\d+)\/([1-9]\d*)$/);if(m)return +m[1]/+m[2];
 return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)?Number(t):NaN;
}
function cubeNet(cells){
 if(!Array.isArray(cells)||cells.length!==6||new Set(cells).size!==6||cells.some(c=>!/^\d+,\d+$/.test(c)))return false;
 const set=new Set(cells),neg=a=>a.map(v=>-v),frames=new Map([[cells[0],[[1,0,0],[0,1,0],[0,0,1]]]]),todo=[cells[0]];
 while(todo.length){const key=todo.pop(),[x,y]=key.split(',').map(Number),[r,u,n]=frames.get(key);
  for(const [dx,dy,next] of [[1,0,[neg(n),u,r]],[-1,0,[n,u,neg(r)]],[0,-1,[r,neg(n),u]],[0,1,[r,n,neg(u)]]]){
   const k=(x+dx)+','+(y+dy);if(!set.has(k))continue;
   if(frames.has(k)){if(JSON.stringify(frames.get(k))!==JSON.stringify(next))return false;}
   else{frames.set(k,next);todo.push(k);}
  }
 }
 return frames.size===6&&new Set([...frames.values()].map(f=>f[2].join(','))).size===6;
}
function grade(t,value){
 if(t.type==='number'){const raw=String(value??'').trim();if(raw&&((t.format==='fraction'&&!/^\d+\s*\/\s*[1-9]\d*$/.test(raw))||(t.format==='decimal'&&!/^\d+(?:[,.]\d+)?$/.test(raw))))return {ok:false,format:true};const n=numeric(value);if(n===null||!Number.isFinite(n))return {ok:false,empty:true};return {ok:Math.abs(n-numeric(t.answer))<1e-9};}
 if(t.type==='net')return {ok:cubeNet(value)};
 if(t.type==='sequence'){const a=String(value).trim().split(/[;\s]+/).map(numeric);if(a.length!==t.count||a.some(x=>x===null||!Number.isFinite(x)||(!t.decimal&&!Number.isSafeInteger(x))))return {ok:false,empty:true};const d=a[0]-t.start;return {ok:d>0&&a.every((x,i)=>Math.abs(x-(t.start+(i+1)*d))<1e-9)};}
 if(t.type==='multi')return {ok:Array.isArray(value)&&[...value].sort().join('|')===[...t.answer].sort().join('|')};
 if(t.type==='order')return {ok:Array.isArray(value)&&value.join('|')===t.answer.join('|')};
 if(t.type==='chart')return {ok:Array.isArray(value)&&value.length===t.answer.length&&t.answer.every((x,i)=>value[i]!=null&&value[i]!==''&&Number(value[i])===x)};
 return {ok:String(value)===String(t.answer)};
}
function model(m){
 if(!m)return '';
 if(m.type==='expression')return `<div class="course-expression">${esc(m.text)}</div>`;
 if(m.type==='fraction'){let cells='';for(let i=0;i<Math.max(m.d,Math.ceil(m.n/m.d)*m.d);i++)cells+=`<span class="fraction-piece ${i<m.n?'filled':''}" ${i&&i%m.d===0?'style="margin-left:8px"':''}></span>`;return `<div class="course-fraction ${m.d===100?'hundred-grid':''}" role="img" aria-label="${m.n} частей из целых, разделённых на ${m.d} равных частей">${cells}</div>`;}
 if(m.type==='ray'){const W=420,X=i=>25+365*i/m.max;let out=`<svg viewBox="0 0 420 115" class="course-svg" role="img" aria-label="Координатный луч"><path d="M25 65H405l-8-5m8 5l-8 5" fill="none" stroke="#476456" stroke-width="2"/>`;for(let i=0;i<=m.max;i++)out+=`<path d="M${X(i)} 59v12" stroke="#476456"/><text x="${X(i)}" y="94" text-anchor="middle">${i}</text>`;for(const [p,label] of m.points||[])out+=`<circle cx="${X(p)}" cy="65" r="6" fill="#8359b8"/><text x="${X(p)}" y="43" text-anchor="middle">${esc(label)}</text>`;return out+'</svg>';}
 if(m.type==='bars'){const max=Math.max(...m.values,1);return `<div class="course-bars" role="img" aria-label="${esc(m.labels.map((l,i)=>l+': '+m.values[i]).join('; '))}">${m.labels.map((l,i)=>`<div><strong>${m.values[i]}</strong><span style="height:${100*m.values[i]/max}px"></span><small>${esc(l)}</small></div>`).join('')}</div>`;}
 if(m.type==='table')return `<table class="unit-table"><thead><tr>${m.headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${m.rows.map(row=>'<tr>'+row.map(x=>`<td>${esc(x)}</td>`).join('')+'</tr>').join('')}</tbody></table>`;
 if(m.type==='angle'){const a=m.degrees*Math.PI/180,x=150+115*Math.cos(a),y=170-115*Math.sin(a);let ticks='';if(m.protractor){for(let d=0;d<=180;d+=10){const q=d*Math.PI/180,X=150+132*Math.cos(q),Y=170-132*Math.sin(q);ticks+=`<path d="M${150+120*Math.cos(q)} ${170-120*Math.sin(q)}L${X} ${Y}" stroke="#789088"/><text x="${150+147*Math.cos(q)}" y="${175-147*Math.sin(q)}" text-anchor="middle" font-size="10">${d}</text>`;}}
 return `<svg class="course-svg" viewBox="0 0 330 210" role="img" aria-label="Угол с вершиной O; нуль шкалы справа"><path d="M30 170A120 120 0 0 1 270 170" fill="none" stroke="#c5d4cc"/>${ticks}<path d="M295 170H150L${x} ${y}" fill="none" stroke="#315b50" stroke-width="4"/><circle cx="150" cy="170" r="4" fill="#8b5cb8"/><text x="145" y="198">O</text>${m.label?`<text x="200" y="155">${m.degrees}°</text>`:''}</svg>`;}
 if(m.type==='polygon'){const pts=Array.from({length:m.sides},(_,i)=>{const a=2*Math.PI*i/m.sides-Math.PI/2;return `${140+85*Math.cos(a)},${100+85*Math.sin(a)}`;}).join(' ');return `<svg class="course-svg" viewBox="0 0 280 200" role="img" aria-label="Многоугольник"><polygon points="${pts}" fill="#e3d8f6" stroke="#7752aa" stroke-width="3"/></svg>`;}
 if(m.type==='circle')return `<svg class="course-svg" viewBox="0 0 280 210" role="img" aria-label="Окружность с центром O, радиусом OA и диаметром BC"><circle cx="140" cy="105" r="80" fill="${m.disk?'#dceee5':'none'}" stroke="#35634d" stroke-width="3"/><path d="M60 105H220M140 105V25" stroke="#8256b8" stroke-width="3"/><circle cx="140" cy="105" r="4"/><text x="145" y="126">O</text><text x="140" y="20">A</text><text x="44" y="108">B</text><text x="225" y="108">C</text></svg>`;
 if(m.type==='net')return `<svg class="course-svg" viewBox="0 0 300 230" role="img" aria-label="Развёртка из квадратных клеток">${m.cells.map(([x,y])=>`<rect x="${25+x*45}" y="${20+y*45}" width="45" height="45" fill="#e1d6f1" stroke="#745794" stroke-width="2"/>`).join('')}</svg>`;
 if(m.type==='grid')return `<svg class="course-svg" viewBox="0 0 ${m.cols*30+20} ${m.rows*30+20}" role="img" aria-label="Клетчатый прямоугольник">${Array.from({length:m.rows*m.cols},(_,i)=>`<rect x="${10+i%m.cols*30}" y="${10+Math.floor(i/m.cols)*30}" width="30" height="30" fill="white" stroke="#506b59"/>`).join('')}</svg>`;
 if(m.type==='venn'||m.type==='vennCounts'){
 const count=m.type==='vennCounts',a=count?m.left:m.a.filter(x=>!m.b.includes(x)).join(', '),b=count?m.right:m.b.filter(x=>!m.a.includes(x)).join(', '),both=count?m.both:m.a.filter(x=>m.b.includes(x)).join(', '),labels=m.labels||['A','B'];
 return `<svg class="course-svg" viewBox="0 0 410 220" role="img" aria-label="Диаграмма Эйлера — Венна: слева только первое множество, в центре общие элементы, справа только второе"><rect x="5" y="5" width="400" height="210" rx="12" fill="white" stroke="#a1b7a8"/><ellipse cx="155" cy="110" rx="95" ry="75" fill="#d8ebe0" fill-opacity=".65" stroke="#477a61"/><ellipse cx="255" cy="110" rx="95" ry="75" fill="#e5daf4" fill-opacity=".65" stroke="#8565a8"/><text x="120" y="28" text-anchor="middle" font-size="13">${esc(labels[0])}</text><text x="290" y="28" text-anchor="middle" font-size="13">${esc(labels[1])}</text><text x="120" y="118" text-anchor="middle">${esc(a)}</text><text x="205" y="118" text-anchor="middle">${esc(both)}</text><text x="290" y="118" text-anchor="middle">${esc(b)}</text>${count?`<text x="15" y="202" font-size="12">Вне обоих: ${m.outside}</text>`:''}</svg>`;
 }
 if(m.type==='line'){const max=Math.max(...m.values,1),X=i=>55+280*i/Math.max(m.values.length-1,1),Y=v=>165-125*v/max;return `<svg class="course-svg" viewBox="0 0 390 220" role="img" aria-label="Линейная диаграмма"><path d="M45 25V165H355" fill="none" stroke="#52705e"/><text x="25" y="169">0</text><polyline points="${m.values.map((v,i)=>X(i)+','+Y(v)).join(' ')}" fill="none" stroke="#7854a1" stroke-width="3"/>${m.values.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="#47775a"/><text x="${X(i)}" y="${Y(v)-10}" text-anchor="middle">${v}</text><text x="${X(i)}" y="195" text-anchor="middle">${esc(m.labels[i])}</text>`).join('')}</svg>`;}
 if(m.type==='pie'||m.type==='sector'){
 const vals=m.type==='sector'?[m.degrees,360-m.degrees]:m.values,total=vals.reduce((a,b)=>a+b,0),colors=['#97bea2','#b7a0d4','#edc57f','#83b8d1'];let a=-Math.PI/2,paths='';
 for(let i=0;i<vals.length;i++){const da=total?2*Math.PI*vals[i]/total:0,b=a+da,x=130+85*Math.cos(a),y=100+85*Math.sin(a),xx=130+85*Math.cos(b),yy=100+85*Math.sin(b);if(da>=Math.PI*2-1e-8)paths+=`<circle cx="130" cy="100" r="85" fill="${colors[i%4]}" stroke="#45624f"/>`;else if(da>0)paths+=`<path d="M130 100L${x} ${y}A85 85 0 ${da>Math.PI?1:0} 1 ${xx} ${yy}Z" fill="${colors[i%4]}" stroke="#45624f"/>`;a=b;}
 return `<svg class="course-svg" viewBox="0 0 380 210" role="img" aria-label="${m.type==='sector'?'Сектор круга':'Круговая диаграмма'}">${paths}${m.type==='sector'?'<text x="140" y="120">O</text>':m.labels.map((l,i)=>`<rect x="235" y="${35+i*40}" width="12" height="12" fill="${colors[i%4]}"/><text x="254" y="${46+i*40}" font-size="12">${esc(l)}: ${vals[i]}</text>`).join('')}</svg>`;
 }
 return '';
}
function mount(el,data){
 const key='portal_course_'+data.number+'_v1';let saved={round:0,done:[]};try{const x=JSON.parse(root.localStorage.getItem(key));if(x&&Number.isInteger(x.round)&&x.round>=0&&x.round<3&&Array.isArray(x.done)&&x.done.length<=6&&x.done.every(v=>typeof v==='boolean'))saved=x;}catch(_){}
 let tasks=data.variants[saved.round],index=saved.done.length,started=false,solved=false,help=false,selected=[],input='',hint=false;
 el.innerHTML='<div class="adventure-audio"></div><div class="course-body"></div><div class="adventure-feedback" role="status" aria-live="polite"></div>';
 const body=el.querySelector('.course-body'),feedback=el.querySelector('.adventure-feedback');
 function text(){if(!started)return data.mission+'. Нажми Начать игру.';if(index===6)return 'Маршрут завершён. '+data.paper;const t=tasks[index];if(solved)return t.success;if(hint)return 'Подсказка. '+t.hint;return t.note+' '+t.prompt+(['choice','multi','order'].includes(t.type)?' Карточки: '+t.options.join('; '):'');}
 const voice=root.LessonVoice?.mount(el.querySelector('.adventure-audio'),text);
 function save(){try{root.localStorage.setItem(key,JSON.stringify(saved));}catch(_){}}
 function say(s,ok=false){feedback.textContent=s;feedback.className='adventure-feedback'+(ok?' is-success':'');voice?.read(s);}
 function focus(){body.querySelector('h3')?.focus({preventScroll:true});}
 function controls(t){
  const off=solved?'disabled':'';
  if(t.type==='choice')return `<div class="adventure-choices">${t.options.map(x=>`<button class="adventure-choice" type="button" data-answer="${esc(x)}" ${off}>${esc(x)}</button>`).join('')}</div>`;
  if(['number','sequence'].includes(t.type))return `<form class="course-form"><label>${t.type==='sequence'?'Четыре числа через точку с запятой':'Твой ответ'}<input class="course-input" value="${esc(input)}" inputmode="${t.type==='sequence'?'text':'decimal'}" autocomplete="off" maxlength="80" ${off}></label><p class="course-format">${t.type==='sequence'?(t.decimal?'Например: 0,2; 0,4; 0,6; 0,8':'Например: 5; 8; 11; 14'):(t.format==='fraction'?'Запиши обыкновенную дробь через /, например 3/2.':t.format==='decimal'?'Запиши десятичную дробь с запятой или точкой.':'Можно вводить целое число, десятичную дробь или дробь через /.')}</p><button class="adventure-primary" ${off}>Проверить</button></form>`;
  if(t.type==='net')return `<div class="course-net-editor" role="group" aria-label="Поле для развёртки: 5 столбцов и 4 строки">${Array.from({length:20},(_,i)=>{const key=(i%5)+','+Math.floor(i/5);return `<button type="button" data-pick="${key}" aria-label="Строка ${Math.floor(i/5)+1}, столбец ${i%5+1}" aria-pressed="${selected.includes(key)}" class="${selected.includes(key)?'filled':''}" ${off}></button>`;}).join('')}</div><p>Выбрано клеток: ${selected.length} из 6</p><button class="adventure-primary" data-action="check" ${off}>Проверить развёртку</button>`;
  if(t.type==='shade')return `<div class="course-shade" style="--cols:${t.total<=12?Math.min(t.total,6):10}">${Array.from({length:t.total},(_,i)=>`<button type="button" class="${selected.includes(String(i))?'filled':''}" data-pick="${i}" aria-label="Часть ${i+1}" aria-pressed="${selected.includes(String(i))}" ${off}></button>`).join('')}</div><p>Закрашено: ${selected.length} из ${t.total}</p><button class="adventure-primary" data-action="check" ${off}>Проверить</button>`;
  if(['multi','order'].includes(t.type))return `<div class="adventure-choices">${t.options.map(x=>`<button type="button" class="adventure-choice ${selected.includes(x)?'picked':''}" data-pick="${esc(x)}" aria-pressed="${selected.includes(x)}" ${off||t.type==='order'&&selected.includes(x)?'disabled':''}>${esc(x)}</button>`).join('')}</div>${t.type==='order'?`<p class="course-order">${esc(selected.join(' → '))||'Нажимай на карточки по порядку.'}</p><button class="adventure-help" data-action="clear" ${off}>Собрать заново</button>`:''}<button class="adventure-primary" data-action="check" ${off}>Проверить</button>`;
  if(t.type==='ray')return `<div class="course-ray-grid" style="--cols:${t.max+1}" role="group" aria-label="Координатный луч">${Array.from({length:t.max+1},(_,i)=>`<button type="button" data-answer="${i}" aria-label="${i} промежутков от начала" ${off}><span>●</span><small>${i===0?'0':i===t.unit?'1':i===t.unit*2?'2':''}</small></button>`).join('')}</div>`;
  if(t.type==='angle')return `<div class="course-angle-view">${model({type:'angle',degrees:Number(input)||0,label:true,protractor:true})}</div><label class="course-slider">Угол: <strong>${Number(input)||0}°</strong><input type="range" min="0" max="180" step="5" value="${Number(input)||0}" data-angle ${off}></label><button class="adventure-primary" data-action="check" ${off}>Проверить построение</button>`;
  if(t.type==='chart')return `<div class="course-chart-editor">${t.labels.map((l,i)=>`<label>${esc(l)}<input type="number" min="0" max="30" step="1" data-bar="${i}" value="${selected[i]??0}" ${off}></label>`).join('')}</div>${model({type:t.chartType||'bars',labels:t.labels,values:t.labels.map((_,i)=>Number(selected[i])||0)})}<button class="adventure-primary" data-action="check" ${off}>Проверить диаграмму</button>`;
  return '';
 }
 function render(){
  if(!started){body.innerHTML=`<div class="adventure-welcome"><div class="adventure-mascot" aria-hidden="true"><span>${esc(data.icon||'🦉')}</span><i class="mascot-spark">✦</i></div><div class="adventure-intro"><p class="adventure-eyebrow">Урок ${data.number} · Играем и разбираемся</p><h3>${esc(data.mission)}</h3><p>${esc(data.intro)}</p><p class="adventure-chips"><span>6 коротких шагов</span><span>С голосом совы</span></p><button class="adventure-primary" data-action="start">${index===6?'Мой результат':index?'Продолжить':'Начать игру'} →</button></div></div>`;return;}
  if(index===6){body.innerHTML=`<div class="adventure-finish"><div class="finish-badge" aria-hidden="true">🦉<span>★ ★ ★</span></div><h3 tabindex="-1">Маршрут завершён!</h3><p>${esc(data.paper)}</p><p class="finish-note">Звёзды отмечают пройденные шаги. Объясни решение учителю: игра не заменяет проверку понимания.</p><div class="adventure-finish-actions"><button class="adventure-primary" data-action="replay">Сыграть с другими числами</button><a class="adventure-secondary" href="${esc(data.next)}">К следующему уроку →</a></div></div>`;return;}
  const t=tasks[index];body.innerHTML=`<div class="adventure-top"><p class="adventure-eyebrow">Шаг ${index+1} из 6</p><span class="adventure-stars">★ ${saved.done.length}/6</span></div><div class="adventure-route">${tasks.map((_,i)=>`<span class="route-stop ${i<saved.done.length?'is-done':i===index?'is-current':''}">${i<saved.done.length?'★':i+1}</span>`).join('')}</div><div class="adventure-stage stage-${['count','zero','even-pairs','build','length','try-yourself'][index]}"><h3 tabindex="-1">${esc(t.title)}</h3><p class="adventure-instruction">${esc(t.prompt)}</p><div class="adventure-coach"><span aria-hidden="true">🦉</span><p>${esc(t.note)}</p></div>${model(t.model)}${controls(t)}</div><div class="adventure-footer">${solved?'<span class="step-complete">✓ Шаг пройден</span><button class="adventure-primary" data-action="next">Дальше →</button>':`<button class="adventure-help" data-action="hint" aria-expanded="${hint}">💡 Подсказка</button>`}</div>${hint?`<p class="adventure-hint">${esc(t.hint)}</p>`:''}`;
 }
 function reset(){solved=false;help=false;selected=[];input='';hint=false;feedback.textContent='';}
 function check(value){if(solved)return;const t=tasks[index],r=grade(t,value);if(r.format){say(t.format==='fraction'?'Запиши ответ обыкновенной дробью через /, например 3/2.':'Для этого задания запиши десятичную дробь с запятой или точкой.');return;}if(r.empty){say(t.type==='sequence'?(t.decimal?'Введи четыре числа через точку с запятой.':'Введи четыре целых числа через точку с запятой.'):'Введи число. Для дроби используй /, для десятичной дроби — запятую.');return;}if(!r.ok){help=true;say('Попробуй ещё. '+t.hint);return;}solved=true;saved.done.push(help);save();render();say(t.success,true);body.querySelector('[data-action="next"]')?.focus({preventScroll:true});}
 el.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.disabled||b.hasAttribute('data-voice-action'))return;voice?.stop();const action=b.dataset.action;
  if(action==='start'){started=true;render();focus();voice?.read(text());return;}
  if(action==='replay'){saved={round:(saved.round+1)%3,done:[]};tasks=data.variants[saved.round];index=0;reset();save();render();focus();voice?.read(text());return;}
  if(index>=6)return;
  if(action==='next'&&solved){index++;reset();render();focus();voice?.read(text());return;}
  if(solved)return;const t=tasks[index];
  if(action==='hint'){help=true;hint=!hint;render();if(hint)say(t.hint);return;}
  if(action==='clear'){selected=[];render();return;}
  if(b.hasAttribute('data-answer')){check(b.dataset.answer);return;}
  if(b.hasAttribute('data-pick')){const x=b.dataset.pick;if(selected.includes(x))selected=selected.filter(y=>y!==x);else selected.push(x);render();const picks=[...body.querySelectorAll('[data-pick]')];(picks.find(p=>p.dataset.pick===x&&!p.disabled)||picks.find(p=>!p.disabled))?.focus({preventScroll:true});return;}
  if(action==='check')check(t.type==='shade'?selected.length:t.type==='angle'?input:t.type==='chart'?t.labels.map((_,i)=>Number(selected[i]??0)):selected);
 });
 el.addEventListener('input',event=>{if(event.target.matches('.course-input'))input=event.target.value;if(event.target.hasAttribute('data-angle')){input=event.target.value;body.querySelector('.course-angle-view').innerHTML=model({type:'angle',degrees:Number(input),label:true,protractor:true});body.querySelector('.course-slider strong').textContent=input+'°';}if(event.target.hasAttribute('data-bar'))selected[Number(event.target.dataset.bar)]=event.target.value;});
 el.addEventListener('change',event=>{if(event.target.hasAttribute('data-bar')){const i=event.target.dataset.bar;render();body.querySelector(`[data-bar="${i}"]`)?.focus({preventScroll:true});}});
 el.addEventListener('submit',event=>{if(!event.target.matches('.course-form'))return;event.preventDefault();voice?.stop();check(input);});
 render();
 const printPanel=document.getElementById('course-print-panel');
 if(printPanel&&root.CoursePrint&&root.LessonPractice)root.CoursePrint.mount(printPanel,()=>({data,round:saved.round,renderModel:model}));
}
const api={numeric,grade,model,mount,cubeNet};root.CourseGame=api;if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof document!=='undefined'){const init=()=>{const el=document.querySelector('[data-course-game]'),data=document.getElementById('course-data');if(el&&data)mount(el,JSON.parse(data.textContent));document.querySelectorAll('[data-practice-model]').forEach(node=>{node.innerHTML=model(JSON.parse(node.dataset.practiceModel));});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
