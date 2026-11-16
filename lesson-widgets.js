(function(root){
  'use strict';
  const parse=v=>v==null||String(v).trim()===''?null:/^\d+$/.test(String(v))?Number(v):NaN;
  const plural=(n,forms)=>forms[n%100>=11&&n%100<=19?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];
  function checkBuild(values,task){
    const o=parse(values.origin),one=parse(values.one),p=parse(values.point);
    if([o,one,p].some(x=>x===null)||!values.direction)return{ok:false,empty:true,message:'Отметь O, точку 1, заданную точку и выбери направление луча. Попытка не засчитывается.'};
    if([o,one,p].some(x=>!Number.isInteger(x)||x<0||x>20))return{ok:false,empty:true,message:'Используй целые номера линий сетки от 0 до 20. Попытка не засчитывается.'};
    if(o>4)return{ok:false,message:'По условию выбери начало O на одной из первых пяти линий сетки (0–4).'};
    if(values.direction!=='right')return{ok:false,message:'В этом задании луч нужно направить вправо. Измени направление стрелки.'};
    if(one-o!==task.unit)return{ok:false,message:`Между O и точкой 1 нужно отложить ${task.unit} ${plural(task.unit,["клетку","клетки","клеток"])}. Считай промежутки между линиями сетки.`};
    if(p-o!==task.coord*task.unit)return{ok:false,message:`От O до ${task.name} нужно отложить ${task.coord} одинаковых единичных отрезков. Каждый занимает ${task.unit} ${plural(task.unit,["клетку","клетки","клеток"])}. Исправь положение точки.`};
    return{ok:true,message:`Верно: начало, направление, единичный отрезок и точка ${task.name}(${task.coord}) построены согласованно. Объясни, почему от O до этой точки ${task.coord*task.unit} ${plural(task.coord*task.unit,["клетка","клетки","клеток"])}.`};
  }
  function initBuilder(el){
    let round=0,active='origin',tries=0;
    const variants=[{unit:2,coord:3,name:'A'},{unit:1,coord:5,name:'B'},{unit:2,coord:4,name:'C'},{unit:1,coord:6,name:'M'}];
    const values={origin:'',one:'',point:'',direction:''};
    el.innerHTML=`<p class="builder-task"></p><p>Сначала выбери, что поставить, затем нажми на линию сетки. Можно вместо этого заполнить поля под рисунком. Номера линий сетки — позиции для управления, не координаты точек.</p><div class="practice-toolbar"><button type="button" class="filter-btn" data-place="origin" aria-pressed="true">Поставить O</button><button type="button" class="filter-btn" data-place="one" aria-pressed="false">Поставить точку 1</button><button type="button" class="filter-btn" data-place="point" aria-pressed="false">Поставить A</button></div><div class="builder-canvas"></div><form class="builder-form"><label>Линия сетки для O<input type="number" min="0" max="20" step="1" data-build="origin"></label><label>Линия сетки для точки 1<input type="number" min="0" max="20" step="1" data-build="one"></label><label>Линия сетки для заданной точки<input type="number" min="0" max="20" step="1" data-build="point"></label><label>Направление<select data-build="direction"><option value="">Выбери…</option><option value="right">Вправо →</option><option value="left">Влево ←</option></select></label><div class="practice-actions"><button type="submit" class="check-btn">Проверить построение</button><button type="button" class="filter-btn" data-build-action="clear">Очистить</button><button type="button" class="filter-btn" data-build-action="next">Другое построение</button></div></form><p class="feedback" role="status" aria-live="polite"></p>`;
    function draw(){
      const task=variants[round%variants.length],X=i=>22+30*i;
      el.querySelector('.builder-task').textContent=`Построй луч вправо. Выбери O на одной из первых пяти линий сетки, единичный отрезок — ${task.unit} ${plural(task.unit,["клетка","клетки","клеток"])}. Отметь ${task.name}(${task.coord}). Размер клетки на экране условный; для бумажного построения используй тетрадь.`;
      el.querySelector('[data-place="point"]').textContent='Поставить '+task.name;
      let svg='<svg viewBox="0 0 650 150" class="builder-svg" role="img" aria-label="Сетка для самостоятельного построения луча">';
      for(let i=0;i<=20;i++)svg+=`<g data-grid="${i}" role="button" tabindex="0" aria-label="Линия сетки ${i}"><rect x="${X(i)-14}" y="5" width="28" height="125" fill="transparent"/><line x1="${X(i)}" y1="25" x2="${X(i)}" y2="110" stroke="#cbd5e1"/><text x="${X(i)}" y="137" text-anchor="middle" font-size="12" fill="#475569">${i}</text></g>`;
      const o=parse(values.origin);
      if(Number.isInteger(o)&&o<=20&&values.direction){const end=values.direction==='right'?642:8;svg+=`<line x1="${X(o)}" y1="85" x2="${end}" y2="85" stroke="#334155" stroke-width="3" pointer-events="none"/><path d="${values.direction==='right'?'M642 85 l-10 -6 v12 z':'M8 85 l10 -6 v12 z'}" fill="#334155" pointer-events="none"/>`;}
      const groups={};[['origin','O(0)'],['one','1'],['point',task.name]].forEach(([key,label])=>{const v=parse(values[key]);if(Number.isInteger(v)&&v<=20)(groups[v]||(groups[v]=[])).push(label);});
      Object.entries(groups).forEach(([pos,labels])=>{svg+=`<circle cx="${X(Number(pos))}" cy="85" r="6" fill="#2563eb" pointer-events="none"/><text x="${X(Number(pos))}" y="52" text-anchor="middle" font-size="16" fill="#1e40af" pointer-events="none">${labels.join(' / ')}</text>`;});
      el.querySelector('.builder-canvas').innerHTML=svg+'</svg>';
    }
    function clear(){Object.keys(values).forEach(k=>values[k]='');el.querySelectorAll('[data-build]').forEach(x=>x.value='');el.querySelector('.feedback').textContent='';draw();}
    el.addEventListener('input',event=>{const key=event.target.dataset.build;if(key){values[key]=event.target.value;el.querySelector('.feedback').textContent='';draw();}});
    el.addEventListener('change',event=>{const key=event.target.dataset.build;if(key){values[key]=event.target.value;draw();}});
    function place(target){const grid=target.closest('[data-grid]');if(!grid)return;values[active]=grid.dataset.grid;el.querySelector(`[data-build="${active}"]`).value=grid.dataset.grid;el.querySelector('.feedback').textContent='';draw();}
    el.addEventListener('click',event=>{const b=event.target.closest('button');if(b?.dataset.place){active=b.dataset.place;el.querySelectorAll('[data-place]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.place===active)));return;}if(b?.dataset.buildAction){if(b.dataset.buildAction==='next'){round++;tries=0;}clear();return;}place(event.target);});
    el.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.closest('[data-grid]')){event.preventDefault();place(event.target);}});
    el.addEventListener('submit',event=>{event.preventDefault();const result=checkBuild(values,variants[round%variants.length]);if(!result.empty)tries++;if(result.ok)el.dispatchEvent(new CustomEvent('lesson-evidence',{bubbles:true,detail:{lesson:'ray',skill:'build',id:'builder-'+(round%variants.length),independent:tries===1}}));const f=el.querySelector('.feedback');f.className='feedback '+(result.ok?'correct':'incorrect');f.textContent=result.message;});
    draw();
  }
  function initPairs(){
    const input=document.getElementById('pair-count');if(!input)return;
    function render(){const n=Number(input.value);document.getElementById('pair-value').textContent=n;
      const pairs=Math.floor(n/2),left=n%2;
      document.getElementById('pair-picture').innerHTML=Array.from({length:pairs},()=>'<span class="counter-pair" aria-hidden="true">● ●</span>').join('')+(left?'<span class="counter-single" aria-hidden="true">●</span>':'');
      document.getElementById('pair-explain').textContent=`${n} ${plural(n,["предмет","предмета","предметов"])}: ${pairs} ${plural(pairs,["пара","пары","пар"])}${left?' и один предмет без пары — число нечётное.':' без остатка — число чётное.'}${n===0?' Нуль чётный, хотя в этом курсе не входит в натуральный ряд.':''}`;
    }
    input.addEventListener('input',render);render();
  }
  function initExit(form){
    let first=null;
    form.addEventListener('submit',event=>{event.preventDefault();const fields=[...form.querySelectorAll('[data-exit-answer]')];
      const result=form.querySelector('[role="status"]');
      if(fields.some(f=>f.value.trim()==='')){result.textContent='Сначала заполни все ответы. Первая попытка пока не записана.';return;}
      const correct=fields.map(f=>({title:f.dataset.criterion,ok:/^\d+$/.test(f.dataset.exitAnswer)?/^\d+$/.test(f.value.replace(/\s/g,''))&&Number(f.value.replace(/\s/g,''))===Number(f.dataset.exitAnswer):f.value.replace(/\s/g,'')===f.dataset.exitAnswer}));
      if(first===null)first=correct.map(x=>x.ok);
      result.replaceChildren();
      const p=document.createElement('p');p.textContent='Первая попытка: '+first.filter(Boolean).length+' из '+first.length+' ответов совпали с образцом. Это самопроверка, а не отметка.';result.appendChild(p);
      correct.forEach(x=>{const line=document.createElement('p');line.textContent=(x.ok?'✓ Получилось: ':'Повтори и исправь: ')+x.title;result.appendChild(line);});
      const last=document.createElement('p');last.textContent='Покажи учителю своё объяснение'+(form.dataset.paper==='yes'?' и построение в тетради. Сайт не оценивает бумажный чертёж.':'.');result.appendChild(last);
    });
  }
  function init(){initPairs();document.querySelectorAll('[data-ray-builder]').forEach(initBuilder);document.querySelectorAll('.exit-form').forEach(initExit);}
  const api={checkBuild,init};root.LessonWidgets=api;if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
