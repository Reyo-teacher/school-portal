/* Short, untimed learning routes. Only completed steps are stored locally. */
(function(root){
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parity=n=>n%2===0?'even':'odd';
  const units=n=>n===1?'единичный отрезок':n>=2&&n<=4?'единичных отрезка':'единичных отрезков';
  const parityChoices=[['even','Чётное'],['odd','Нечётное']];
  const choices=values=>values.map(n=>[String(n),String(n)]);
  function makeSteps(kind,round=0){
    const v=(Number.isSafeInteger(round)&&round>=0?round:0)%3;
    if(kind==='naturals'){
      const count=[6,4,8][v],even=[6,8,4][v],odd=[5,7,9][v],large=[14,18,12][v],last=[7,9,5][v];
      return [
        {id:'count',type:'choice',title:'Собери урожай',prompt:'Сколько яблок в корзине?',note:'Когда считаем предметы, используем числа 1, 2, 3… Их называют натуральными.',scene:'apples',count,options:choices([count-1,count,count+1]),answer:String(count),hint:'Считай яблоки по одному. Каждое яблоко посчитай только раз.',success:`В корзине ${count} яблок. ${count} — натуральное число.`},
        {id:'zero',type:'choice',title:'А если корзина пустая?',prompt:'Какое число запишем?',note:'Все яблоки раздали ребятам.',scene:'apples',count:0,options:choices([1,2,0]),answer:'0',hint:'Нуль показывает, что предметов нет.',success:'Пустая корзина — 0 яблок. В нашем курсе натуральный ряд начинается с 1, поэтому 0 в него не входит.'},
        {id:'even-pairs',type:'pairs',title:'Собери команды',prompt:'Объедини ребят в пары.',note:'Нажми на одного участника, затем на второго.',count:even,options:parityChoices,answer:'even',hint:'Пара — это двое. Если никто не остался один, число чётное.',success:`У каждого есть пара. ${even} — чётное число!`},
        {id:'odd-pairs',type:'pairs',title:'Кому не хватит пары?',prompt:'Попробуй снова собрать пары.',note:'Если один останется — число нечётное.',count:odd,options:parityChoices,answer:'odd',hint:'Собери все возможные пары. Посмотри, останется ли кто-нибудь один.',success:`Один участник без пары. ${odd} — нечётное число.`},
        {id:'last-digit',type:'choice',title:'Секрет последней цифры',prompt:`Число ${large} — чётное или нечётное?`,note:'Чётные числа оканчиваются на 0, 2, 4, 6, 8. Смотри на последнюю цифру.',scene:'number',count:large,options:parityChoices,answer:parity(large),hint:`Последняя цифра числа ${large} — ${large%10}. Найди её в подсказке над числом.`,success:`Последняя цифра ${large%10} подсказывает: ${large} — чётное.`},
        {id:'try-yourself',type:'choice',title:'Теперь попробуй сам',prompt:`Получатся ли пары из ${last} бусин без остатка?`,note:'Сначала реши сам. Если нужно, подсказка рядом.',scene:'beads',count:last,options:[['all','Да, у каждой будет пара'],['one','Одна бусина останется']],answer:'one',hint:`Раздели ${last} бусин на двойки. Можно рисовать пары в тетради.`,success:`Одна бусина останется: ${last} — нечётное. Объясни своими словами, как ты это понял.`}
      ];
    }
    if(kind!=='ray')throw new Error('Unknown lesson');
    const walk=[3,4,5][v],read=[4,3,5][v],build=[3,5,4][v],coord=[3,2,4][v],final=[2,3,4][v];
    return [
      {id:'start',type:'point',title:'Найди начало пути',prompt:'Нажми на начало луча.',note:'Начало луча — точка O с координатой 0. Стрелка показывает направление.',max:6,unit:1,labels:'all',target:0,hint:'Ищи точку с подписью O(0).',success:'Верно! Начало — O(0). В наших рисунках луч направлен вправо.'},
      {id:'walk',type:'walk',title:'В путь, Мудрик!',prompt:`Дойди до числа ${walk}.`,note:'Один ход вправо — один единичный отрезок.',max:6,unit:1,labels:'all',target:walk,hint:`Нажимай «Шаг вправо», пока не окажешься у числа ${walk}.`,success:`От 0 до ${walk} — ${walk} ${units(walk)}.`},
      {id:'read',type:'choice',title:'Где остановилась сова?',prompt:'Выбери координату точки A.',note:'Считай одинаковые отрезки от 0 до A.',scene:'ray',max:6,unit:1,labels:'first',marker:read,options:choices([read,read+1,read-1]),answer:String(read),hint:'Считай промежутки между отметками. Сам нуль не считается шагом.',success:`От O до A — ${read} ${units(read)}. Записываем A(${read}).`},
      {id:'build',type:'build',title:'Собери свой луч',prompt:`Отметь точку 1, затем A(${build}).`,note:'Начало и стрелка уже есть. Единичный отрезок — одна клетка.',max:6,unit:1,labels:'origin',target:build,hint:'От O одна клетка вправо — точка 1. Дальше откладывай такие же отрезки.',success:`Ты отметил единичный отрезок и построил A(${build}). Все шаги одинаковой длины.`},
      {id:'length',type:'choice',title:'Сделаем шаг длиннее',prompt:`Один отрезок — 2 см. Чему равно OA?`,note:`Координата A — ${coord}. Посчитай длину: ${Array(coord).fill('2').join(' + ')} см.`,scene:'length',max:coord+1,unit:1,labels:'all',marker:coord,options:[[String(coord),`${coord} см`],[String(coord*2),`${coord*2} см`],[String(coord*2+2),`${coord*2+2} см`]],answer:String(coord*2),hint:'Координата считает отрезки, а расстояние — сантиметры. Сложи по 2 см за каждый отрезок.',success:`OA = ${coord*2} см. Координата A всё ещё ${coord}: она считает единичные отрезки.`},
      {id:'try-yourself',type:'point',title:'Теперь попробуй сам',prompt:`Отметь B(${final}).`,note:'От 0 до 1 — две клетки. Откладывай такие же единичные отрезки.',max:8,unit:2,labels:'first',target:final*2,hint:`До B(${final}) нужно ${final} раза отложить отрезок O–1. Каждый раз проходи две клетки.`,success:`B(${final}) находится в ${final} единичных отрезках от O. Каждый занимает две клетки. Покажи такое построение в тетради.`}
    ];
  }
  function restore(kind,saved){
    const round=saved&&saved.version===1&&saved.kind===kind&&Number.isSafeInteger(saved.round)&&saved.round>=0?saved.round%3:0;
    const steps=makeSteps(kind,round),done=[];
    if(saved&&saved.version===1&&saved.kind===kind&&Array.isArray(saved.done)){
      for(let i=0;i<Math.min(saved.done.length,steps.length);i++){
        const d=saved.done[i];if(!d||d.id!==steps[i].id||typeof d.supported!=='boolean')break;
        done.push({id:d.id,supported:d.supported});
      }
    }
    return {version:1,kind,round,done};
  }
  function pairClick(count,paired,pending,index){
    if(!Number.isInteger(index)||index<0||index>=count||paired.includes(index))return {paired:[...paired],pending};
    if(pending===index)return {paired:[...paired],pending:null};
    if(pending===null)return {paired:[...paired],pending:index};
    return {paired:[...paired,pending,index],pending:null};
  }
  function isCorrect(step,value){
    return step.type==='choice'||step.type==='pairs'?String(value)===step.answer:Number.isInteger(value)&&value===step.target;
  }
  function apple(){return '<svg viewBox="0 0 56 60" aria-hidden="true"><path d="M29 18Q25 6 34 3" fill="none" stroke="#694632" stroke-width="4" stroke-linecap="round"/><path d="M31 12Q38 0 48 8Q42 20 31 12" fill="#38936b"/><path d="M28 20C9 8 1 28 9 44Q18 62 28 54Q40 62 49 43C57 24 45 9 28 20" fill="#eb6f51"/><path d="M17 26Q12 30 15 37" stroke="#ffcfb9" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';}
  function person(index){return `<span class="person-face" style="--person-hue:${[165,37,260,340,204,80,20,280,180][index]}"><span aria-hidden="true">● ●<br>⌣</span></span><span class="person-name">${index+1}</span>`;}
  function rayPicture(step){
    const max=step.max,x=n=>28+48*n,w=x(max)+30;
    const alt=step.scene==='length'?`Точка A с координатой ${step.marker}; каждый единичный отрезок равен 2 см.`:`От 0 до точки A ${step.marker} ${units(step.marker)} одинаковой длины. Подписаны 0 и 1.`;
    let out=`<svg class="adventure-ray-picture" viewBox="0 0 ${w} 140" role="img" aria-label="${esc(alt)}"><path d="M28 80H${w-12}l-8-5m8 5l-8 5" fill="none" stroke="#425c6b" stroke-width="3"/>`;
    for(let n=0;n<=max;n++){
      out+=`<path d="M${x(n)} 73v14" stroke="#425c6b" stroke-width="2"/>`;
      if(step.labels==='all'||n<2)out+=`<text x="${x(n)}" y="112" text-anchor="middle">${n}</text>`;
      if(step.scene==='length'&&n<step.marker)out+=`<path d="M${x(n)+3} 61v-5h42v5" fill="none" stroke="#168568"/><text class="ray-unit" x="${x(n)+24}" y="44" text-anchor="middle">2 см</text>`;
    }
    out+=`<circle cx="${x(step.marker)}" cy="80" r="7" fill="#7758bb"/><text x="${x(step.marker)}" y="${step.scene==='length'?23:52}" text-anchor="middle">${step.scene==='length'?'A('+step.marker+')':'🦉 A'}</text></svg>`;
    return `<div class="adventure-diagram">${out}</div>`;
  }
  function mount(el){
    const kind=el.dataset.lesson, key='portal_adventure_'+kind+'_v1';let stored;
    try{stored=JSON.parse(root.localStorage.getItem(key));}catch(_){}
    let saved=restore(kind,stored),steps=makeSteps(kind,saved.round),index=saved.done.length,started=false,solved=false,supported=false,hint=false,paired=[],pending=null,position=0,oneSet=false;
    const title=kind==='naturals'?'Миссия «Найди пару»':'Миссия «Путь Мудрика»';
    const intro=kind==='naturals'?'Считай яблоки, собирай команды и открой секрет чётных чисел.':'Шагай вместе с совой и научись отмечать числа на луче.';
    el.innerHTML='<div class="adventure-body"></div><div class="adventure-feedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    const body=el.querySelector('.adventure-body'),feedback=el.querySelector('.adventure-feedback');
    function save(){try{root.localStorage.setItem(key,JSON.stringify(saved));}catch(_){}}
    function say(text,ok=false){feedback.textContent=text;feedback.className='adventure-feedback'+(ok?' is-success':'');}
    function resetStep(){solved=false;supported=false;hint=false;paired=[];pending=null;position=0;oneSet=false;say('');}
    function focus(selector){body.querySelector(selector)?.focus({preventScroll:true});}
    function route(){return `<div class="adventure-route" aria-label="Пройдено ${saved.done.length} из ${steps.length} шагов">${steps.map((s,i)=>`<span class="route-stop ${i<saved.done.length?'is-done':i===index?'is-current':''}" ${i===index?'aria-current="step"':''}><span aria-hidden="true">${i<saved.done.length?'★':i+1}</span><span class="adventure-sr">${esc(s.title)}${i<saved.done.length?' — пройден':''}</span></span>`).join('')}</div>`;}
    function choiceButtons(step){return `<div class="adventure-choices ${step.options.every(o=>/^\d+$/.test(o[1]))?'number-choices':''}" role="group" aria-label="Варианты ответа">${step.options.map(([value,label])=>`<button type="button" class="adventure-choice" data-answer="${esc(value)}" ${solved?'disabled':''}>${esc(label)}</button>`).join('')}</div>`;}
    function interactiveRay(step){
      const final=step.unit===2;
      const labelAt=i=>i===0?'O(0)':i===step.unit?'1':step.labels==='all'?String(i/step.unit):'';
      return `<div class="adventure-track-wrap"><div class="adventure-track" style="--stops:${step.max+1}" role="group" aria-label="${final?'Сетка: от 0 до 1 две клетки':'Координатный луч, одинаковые отрезки'}">${Array.from({length:step.max+1},(_,i)=>{
        const label=labelAt(i),mark=step.type==='walk'&&position===i?'🦉':solved&&i===step.target?(step.id==='start'?'O':index===steps.length-1?'B':'A'):'';
        const aria=final?i===0?'Начало O, координата 0':i===step.unit?'Точка 1, две клетки от O':`${i} клеток от O`:step.labels==='all'?`Точка ${i}`:`${i} клеток от O`;
        const caption=step.type==='build'?(i===0?'O(0)':i===1&&oneSet?'1':solved&&i===step.target?'A('+step.target+')':''):label;
        return `<div class="track-stop ${i===position&&step.type==='walk'?'has-owl':''}"><span class="track-marker" aria-hidden="true">${mark}</span><button type="button" class="track-point ${oneSet&&i===1?'unit-set':''}" data-point="${i}" aria-label="${aria}" ${solved||step.type==='walk'?'disabled':''}><span aria-hidden="true">${i===0?'◉':'●'}</span></button><span class="track-label" aria-hidden="true">${caption}</span></div>`;
      }).join('')}<span class="track-arrow" aria-hidden="true">➜</span></div></div>`;
    }
    function scene(step){
      if(step.type==='pairs'){
        const all=paired.length===step.count-step.count%2;
        return `<div class="adventure-pair-board"><div class="adventure-people" role="group" aria-label="Участники кружка">${Array.from({length:step.count},(_,i)=>{const p=paired.indexOf(i);return `<button type="button" class="adventure-person ${p>=0?'is-paired':''} ${pending===i?'is-picked':''}" style="--pair-color:${['#e2d6fa','#c9ede2','#ffe2b8','#d2e6ff'][Math.floor(p/2)]||'#fff'}" data-person="${i}" aria-label="Участник ${i+1}${p>=0?', пара '+(Math.floor(p/2)+1):''}" aria-pressed="${pending===i}" ${p>=0||all||solved?'disabled':''}>${person(i)}${p>=0?`<span class="pair-tag">Пара ${Math.floor(p/2)+1}</span>`:''}</button>`;}).join('')}</div><p class="pair-counter">Пар: <strong>${paired.length/2}</strong> · Без пары: <strong>${step.count-paired.length}</strong></p></div>${all?`<p class="adventure-question">${step.count-paired.length?'Один остался.':'Никто не остался один.'} Значит, ${step.count} — какое число?</p>${choiceButtons(step)}`:''}`;
      }
      if(['point','walk','build'].includes(step.type))return `${step.type==='build'?`<p class="build-current">${oneSet?`Теперь нажми, где будет A(${step.target}).`:'Сначала нажми, где будет точка 1.'}</p>`:''}${interactiveRay(step)}${step.type==='walk'?`<div class="adventure-walk"><button type="button" class="adventure-secondary" data-move="-1" ${position===0||solved?'disabled':''}>← Шаг влево</button><button type="button" class="adventure-primary" data-move="1" ${position===step.max||solved?'disabled':''}>Шаг вправо →</button></div><p class="walk-position">Сова у числа <strong>${position}</strong></p>`:''}`;
      let picture='';
      if(step.scene==='apples')picture=`<div class="adventure-basket" role="img" aria-label="${step.count===0?'Пустая корзина':step.count+' яблок в корзине'}"><div class="basket-fruit">${Array.from({length:step.count},apple).join('')||'<span class="empty-basket">Пусто</span>'}</div><div class="basket-weave" aria-hidden="true"></div></div>`;
      if(step.scene==='beads')picture=`<div class="adventure-beads" role="img" aria-label="${step.count} бусин">${Array.from({length:step.count},(_,i)=>`<span style="--bead-color:${['#9d80d7','#57b89e','#ecaa56'][i%3]}"></span>`).join('')}</div>`;
      if(step.scene==='number')picture=`<div class="adventure-number" aria-label="${step.count}">${String(step.count).slice(0,-1)}<span>${step.count%10}</span></div>`;
      if(step.scene==='ray'||step.scene==='length')picture=rayPicture(step);
      return picture+choiceButtons(step);
    }
    function render(){
      if(!started){
        const completed=saved.done.length===steps.length;
        body.innerHTML=`<div class="adventure-welcome"><div class="adventure-mascot" aria-hidden="true"><span>🦉</span><i class="mascot-spark">✦</i><i class="mascot-number">${kind==='naturals'?'2 + 2':'0 → 1'}</i></div><div class="adventure-intro"><p class="adventure-eyebrow">Играем и разбираемся</p><h3>${title}</h3><p>${intro}</p><p class="adventure-chips"><span>6 коротких шагов</span><span>Без таймера</span></p><button type="button" class="adventure-primary" data-action="start">${completed?'Посмотреть свой маршрут':index>0?'Продолжить · шаг '+(index+1):'Начать игру'} <span aria-hidden="true">→</span></button>${index>0&&!completed?`<p class="resume-note">Уже пройдено шагов: ${index}. Продолжим с этого места.</p>`:''}</div></div>`;return;
      }
      if(index>=steps.length){
        const help=saved.done.filter(d=>d.supported).length;
        body.innerHTML=`<div class="adventure-finish"><div class="finish-badge" aria-hidden="true">🦉<span>★ ★ ★</span></div><p class="adventure-eyebrow">Все 6 шагов пройдены</p><h3 tabindex="-1">Маршрут завершён!</h3><p>${kind==='naturals'?'Ты считал предметы и собирал пары. Теперь объясни: чем 6 отличается от 7?':'Ты двигался по лучу и отмечал точки. Теперь покажи в тетради, как построить A(3).'}</p><p class="finish-note">${help?'Подсказки помогли в пути — это часть учёбы. Попробуй новый маршрут с другими числами.':'Попробуй объяснить решение учителю или однокласснику.'} Звёзды отмечают пройденные шаги, это не отметка.</p><div class="adventure-finish-actions"><button type="button" class="adventure-primary" data-action="replay">Сыграть с другими числами</button><button type="button" class="adventure-secondary" data-action="extras">Хочу ещё задания</button></div>${kind==='naturals'?'<a class="adventure-next-lesson" href="topic-5-1-2.html">Следующая миссия: координатный луч →</a>':'<a class="adventure-next-lesson" href="grade-5.html#ch1">Вернуться к урокам →</a>'}</div>`;return;
      }
      const step=steps[index];
      body.innerHTML=`<div class="adventure-top"><p class="adventure-eyebrow">Шаг ${index+1} из ${steps.length}</p><span class="adventure-stars" aria-label="Пройдено шагов: ${saved.done.length}">★ ${saved.done.length}/${steps.length}</span></div>${route()}<div class="adventure-stage stage-${step.id}"><h3 tabindex="-1">${esc(step.title)}</h3><p class="adventure-instruction">${esc(step.prompt)}</p><div class="adventure-coach"><span aria-hidden="true">🦉</span><p>${esc(step.note)}</p></div>${scene(step)}</div><div class="adventure-footer">${!solved?`<button type="button" class="adventure-help" data-action="hint" aria-expanded="${hint}" aria-controls="${kind}-game-hint">💡 Подсказка</button>`:`<span class="step-complete">✓ Шаг пройден</span><button type="button" class="adventure-primary" data-action="next">${index===steps.length-1?'Завершить маршрут':'Дальше'} →</button>`}</div><p class="adventure-hint" id="${kind}-game-hint" ${hint&&!solved?'':'hidden'}>${esc(step.hint)}</p>`;
    }
    function complete(){
      if(solved)return;
      solved=true;saved.done.push({id:steps[index].id,supported});save();render();say(steps[index].success,true);focus('[data-action="next"]');
    }
    function wrong(message){supported=true;say(message);}
    el.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||!el.contains(button)||button.disabled)return;
      const action=button.dataset.action;
      if(action==='start'){started=true;render();focus('h3');return;}
      if(action==='replay'){saved={version:1,kind,round:(saved.round+1)%3,done:[]};steps=makeSteps(kind,saved.round);index=0;resetStep();save();render();focus('h3');return;}
      if(action==='extras'){const more=document.getElementById('extra-practice');if(more){more.open=true;more.querySelector('summary').focus();more.scrollIntoView({block:'start'});}return;}
      if(!started||index>=steps.length)return;
      const step=steps[index];
      if(action==='next'&&solved){index++;resetStep();render();focus('h3');return;}
      if(solved)return;
      if(action==='hint'){supported=true;hint=!hint;render();focus('[data-action="hint"]');say(hint?step.hint:'Подсказка закрыта.');return;}
      if(button.hasAttribute('data-person')&&step.type==='pairs'){
        const result=pairClick(step.count,paired,pending,Number(button.dataset.person));paired=result.paired;pending=result.pending;render();
        const ready=paired.length===step.count-step.count%2;
        say(ready?(step.count%2?'Один участник остался без пары. Выбери, какое это число.':'Все собрались в пары. Выбери, какое это число.'):pending===null?'Пара готова! Выбери следующих участников.':'Теперь выбери второго участника пары.');
        focus(ready?'[data-answer]':`[data-person]:not(:disabled)${pending===null?'':`:not([data-person="${pending}"])`}`);return;
      }
      if(button.hasAttribute('data-move')&&step.type==='walk'){
        position=Math.max(0,Math.min(step.max,position+Number(button.dataset.move)));if(isCorrect(step,position)){complete();return;}render();say('Сова у числа '+position+'.');focus('[data-move="1"]');return;
      }
      if(button.hasAttribute('data-point')&&(step.type==='point'||step.type==='build')){
        const point=Number(button.dataset.point);
        if(step.type==='build'&&!oneSet){if(point===1){oneSet=true;render();say('Единичный отрезок выбран. Теперь отметь точку A.');focus('[data-point="2"]');}else wrong('От O до точки 1 нужна ровно одна клетка. Попробуй ещё.');return;}
        if(isCorrect(step,point))complete();else wrong(step.id==='start'?'Начни с отметки O(0). Попробуй ещё.':step.unit===2?'Считай отрезки от 0. Каждый занимает две клетки.':`От O до A(${step.target}) нужно ${step.target} одинаковых шага. Попробуй ещё.`);return;
      }
      if(button.hasAttribute('data-answer')&&(step.type==='choice'||step.type==='pairs')){
        if(step.type==='pairs'&&paired.length!==step.count-step.count%2)return;
        if(isCorrect(step,button.dataset.answer))complete();else wrong(step.id==='zero'?'В корзине нет ни одного яблока. Как это записать числом?':step.id==='length'?'Координата и длина — разные величины. Сложи по 2 см за каждый отрезок.':step.type==='pairs'?'Посмотри: остался ли кто-нибудь без пары? Попробуй ещё.':'Пока не совпало. Рассмотри рисунок ещё раз или открой подсказку.');
      }
    });
    render();
  }
  function init(){document.querySelectorAll('[data-lesson-adventure]').forEach(mount);}
  const api={makeSteps,restore,pairClick,isCorrect,mount};
  root.LessonAdventure=api;if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
