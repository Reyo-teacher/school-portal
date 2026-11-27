(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pre='ev3-cabinet-public-test-v1-';
const profiles={pilot1:'Пилот-01',pilot2:'Пилот-02'};
const fresh=()=>({year:1,bot:'base',lecture:{},practice:{},build:{},week:{}});
const profile=(id)=>Object.hasOwn(profiles,id);
let mode='',mem=fresh();
function setMode(m,remember=true){
 mode=m;mem=fresh();
 if(profile(m)){try{mem={...mem,...JSON.parse(localStorage.getItem(pre+m)||'{}')}}catch{}}
 if(remember){try{if(m)sessionStorage.setItem(pre+'mode',m);else sessionStorage.removeItem(pre+'mode');}catch{}}
}
try{const m=sessionStorage.getItem(pre+'mode');if(m==='guest'||profile(m))setMode(m,false);}catch{}
const isTest=()=>profile(mode);
const pilot=()=>profiles[mode]||'Гость';
let student=true, detail=null, response='', filter='year', storageFail=false, previousTab='';
const ws=$('#workspace'), gate=$('#gate'), desk=$('#desk');
const full=[...GARAGE,...RESERVE.map(([id,n,ys,t,k,d,u])=>[id,n,Number(ys.split(',')[0]),t,k,d,u,'#e8ede3',''])];
const getBot=id=>full.find(b=>b[0]===id);
const active=()=>Object.entries(mem.build).find(([k,v])=>Number.isFinite(v.start)&&v.start>0);
const weeks=()=>CURRICULUM[mem.year];
const wk=()=>Number(mem.week[mem.year]||1);
const course=(w=wk())=>'kurs.html'+(mem.year===1?'#week-'+w:'#year-'+mem.year+'-week-'+w);
const minutes=(time)=>Math.floor(time/60000)+' мин '+String(Math.floor((time%60000)/1000)).padStart(2,'0')+' с';
const timeString=(time)=>[Math.floor(time/3600000),Math.floor((time%3600000)/60000),Math.floor((time%60000)/1000)].map(n=>String(n).padStart(2,'0')).join(':');
const elapsed=(b)=>b.ms+(b.start?Math.max(0,Date.now()-b.start):0);
const buildKey=(id)=>mem.year+':'+id;
const realTab=()=>location.hash.slice(1).match(/^(home|lecture|practice|garage)(?:\/[a-z]+)?$/)?.[1]||'home';
const ratings={1:[['Болт-07',25,45,60],['Шестерня-12',15,30,20],['Импульс-02',10,15,30]],2:[['Линия-01',25,60,50],['Мотор-04',20,45,30],['Контур-08',10,30,20]],3:[['Вектор-06',30,75,60],['Поворот-03',20,45,40],['Датчик-11',15,30,30]]};
const quiz={
 1:{1:['Робот смотрит на финиш. Он находится ровно в трёх клетках перед роботом. Какие команды нужны?',['Вперёд, вперёд, вперёд','Направо, вперёд, вперёд','Назад, назад, назад'],0,'Каждый блок «Вперёд» сдвигает робота на одну клетку.'],2:['Робот смотрит вперёд. Что изменится после команды «Назад»?',['Только направление корпуса','Место, но не направление корпуса','И место, и направление корпуса'],1,'Шаг назад не разворачивает корпус.'],7:['Робот должен отъехать от перегородки при касании. Какое условие использовать?',['Если цвет зелёный, ехать','Если время вышло, ехать','Если бампер нажат, отъехать'],2,'Для реакции на касание нужен сигнал бампера.']},
 2:{1:['Как выяснить, стабильно ли робот проезжает 50 см?',['Сделать один быстрый заезд','Сделать три заезда при одинаковых условиях','Для каждого заезда менять колёса'],1,'Так можно оценить разброс, не смешивая разные условия.'],7:['Датчик показал 18 над чёрным и 66 над белым. Какой пробный порог взять?',['75','12','42'],2,'(18 + 66) ÷ 2 = 42. Проверь параметр на трассе.'],15:['Дальномер показывает свободный путь, но бампер нажат. Что делать?',['Остановиться','Разогнаться','Продолжать без изменений'],0,'Бампер имеет приоритет.']},
 3:{1:['Зачем запустить робота пять раз до любого улучшения?',['Чтобы засчитать только лучший запуск','Чтобы получить исходные показатели для сравнения','Чтобы не проверять новую версию'],1,'Исходная серия нужна, чтобы сравнить версии в одинаковых условиях.'],3:['Истекло время ожидания метки, но метки нет. Какое действие безопасно?',['Сразу ехать в зону доставки','Ждать бесконечно','Остановить моторы и сообщить об ошибке'],2,'Тайм-аут завершает ожидание, не выдавая отсутствие сигнала за успех.'],12:['Последние показания: 30, 4, 31 см. Какова медиана?',['30 см','4 см','21,7 см'],0,'Упорядочим: 4, 30, 31. Средний по порядку элемент равен 30.']}
};
function save(){
 if(!isTest())return;
 try{localStorage.setItem(pre+mode,JSON.stringify(mem));storageFail=false;}
 catch{storageFail=true;}
}
function timeStop(b){if(b.start){b.ms=elapsed(b);b.start=null;}}
function inYear(k){return k.startsWith(mem.year+':')}
function totals(){
 const l=Object.keys(mem.lecture).filter(inYear).length*5, p=Object.keys(mem.practice).filter(inYear).length*15;
 const b=Object.entries(mem.build).filter(([k,b])=>inYear(k)&&b.status==='approved').reduce((sum,[k,b])=>sum+b.score,0);
 return [l,p,b];
}
function ranking(){
 const me=['Ты · '+pilot(),...totals(),true];
 const values=[...ratings[mem.year],...(isTest()?[me]:[])].map(v=>({v,total:v[1]+v[2]+v[3]})).sort((x,y)=>y.total-x.total);
 return '<div class="scroll-table"><table class="score"><thead><tr><th scope="col">Место</th><th scope="col">Участник</th><th scope="col">Лекции</th><th scope="col">Практика</th><th scope="col">Сборка</th><th scope="col">Всего</th></tr></thead><tbody>'+
 values.map(({v,total},i)=>'<tr class="'+(v[4]?'self':'')+'"><td>'+(values.findIndex(r=>r.total===total)+1)+'</td><td>'+esc(v[0])+'</td><td>'+v[1]+'</td><td>'+v[2]+'</td><td>'+v[3]+'</td><td><strong>'+total+'</strong></td></tr>').join('')+
 '</tbody></table></div>';
}
const photo=(bot,alt='')=>bot[8]?'<img src="assets/'+bot[8]+'" alt="'+esc(alt)+'">':'';
const header=(pre,title,desc='')=>'<div class="titlebar"><p class="eyebrow">'+esc(pre)+'</p><h1>'+esc(title)+'</h1>'+(desc?'<p class="quiet">'+esc(desc)+'</p>':'')+'</div>';
function home(){
 const card=GARAGE.find(b=>b[0]===mem.bot)||GARAGE[0];
 const list=GARAGE.filter(b=>b[2]===mem.year||['base','grip','plot'].includes(b[0])).filter((b,i,a)=>a.findIndex(x=>x[0]===b[0])===i);
 const [l,p,b]=totals();
 return header('ПАНЕЛЬ УЧЕНИКА / ГОД '+mem.year,'Твоя мастерская','Выбери сборку, продолжи занятие или посмотри свой прогресс.')+
 '<div class="home-grid"><div><section aria-labelledby="models-title"><h2 id="models-title">Роботы из гаража</h2><div class="rail" aria-label="Карточки роботов">'+
 list.map(r=>'<button class="robot-card" data-action="bot" data-id="'+r[0]+'" aria-pressed="'+(r[0]===card[0])+'" style="background:'+r[7]+'">'+photo(r)+'<strong>'+esc(r[1])+'</strong><small>'+esc(r[3])+'</small></button>').join('')+
 '</div><a href="#garage">Открыть гараж →</a></section><section class="panel" style="margin-top:16px"><h2>Рейтинг группы</h2><div class="stats"><div class="stat"><strong>'+l+'</strong><span>Лекции</span></div><div class="stat"><strong>'+p+'</strong><span>Практика</span></div><div class="stat"><strong>'+b+'</strong><span>Сборки</span></div></div>'+ranking()+
 '<p class="quiet">Результаты вымышленные. '+(isTest()?'Твой результат в этом браузере.':'Ты смотришь гостевой пример рейтинга; твои действия не записываются.')+' За скорость баллов нет.</p></section></div>'+
 '<article class="robot-hero" style="--bot:'+card[7]+'"><p class="eyebrow">EV3 / ВЫБРАННАЯ СБОРКА</p><figure>'+photo(card,card[1])+'</figure><h2>'+esc(card[1])+'</h2><p>'+esc(card[5])+'</p><div class="actions"><a class="btn primary" href="#garage/'+card[0]+'">Открыть карточку</a><span>'+esc(card[3])+'</span></div></article></div>';
}
function modulePage(tab){
 const n=wk(),w=weeks()[n-1], id=mem.year+':'+n, listing=weeks().map((v,i)=>'<button data-action="week" data-id="'+(i+1)+'" aria-current="'+(i+1===n)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(v[0])+((tab==='lecture'?mem.lecture[idFor(i+1)]:mem.practice[idFor(i+1)])?' ✓':'')+'</button>').join('');
 const quizData=quiz[mem.year][n];
 const pane=tab==='lecture'
  ?'<p>'+esc(w[1])+'</p><h3>'+ (mem.year===1?'Работа на занятии':'Логика блоков')+'</h3><p>'+esc(w[2])+'</p><div class="actions">'+(isTest()?'<button class="btn primary" data-action="lecture" '+(mem.lecture[id]?'disabled':'')+'>'+(mem.lecture[id]?'Лекция зачтена · 5 баллов':'Отметить лекцию · +5')+'</button>':'<span class="quiet">Гость: лекция не записывается.</span>')+'<a class="btn outline" href="#practice">К практике →</a></div>'
  :'<p>'+esc(w[3])+'</p><h3>'+(mem.year===1?'Вопрос для обсуждения':'Критерий приёмки')+'</h3><p>'+esc(w[4])+'</p>'+
    (quizData?'<form id="quiz"><h3>'+ (isTest()?'Проверка для рейтинга · 15 баллов':'Проверь себя · без сохранения') +'</h3><p>'+esc(quizData[0])+'</p><div class="choices">'+quizData[1].map((v,i)=>'<label><input type="radio" name="answer" required value="'+i+'">'+esc(v)+'</label>').join('')+'</div><button class="btn primary" '+(mem.practice[id]?'disabled':'')+'>'+(mem.practice[id]?'Зачтено · 15 баллов':'Проверить ответ')+'</button></form>':'<p class="quiet">Задание есть в курсе. Для этой недели проверка с начислением баллов в демо не подключена.</p>')+
    '<div id="practice-result" class="result" role="status" '+(response?'':'hidden')+'>'+esc(response)+'</div>';
 return header('ГОД '+mem.year+' / '+(tab==='lecture'?'34 ТЕМЫ':'34 ЗАНЯТИЯ'),tab==='lecture'?'Лекции':'Практика')+
 '<div class="study-grid"><div class="panel"><h2>Недели</h2><div class="study-list">'+listing+'</div></div><article class="panel lesson-panel"><p class="eyebrow">НЕДЕЛЯ '+n+'</p><h2>'+esc(w[0])+'</h2>'+pane+
 '<p style="margin-top:14px"><a href="'+course()+'" target="_blank" rel="noopener">Открыть полный урок и тренажёр ↗</a></p></article></div>';
}
const idFor=n=>mem.year+':'+n;
function stateLabel(b){return !b?'Не начато':b.status==='approved'?'Подтверждено · '+b.score+' баллов':b.status==='pending'?'Ждёт проверки':b.start?'Идёт сборка':'На паузе'}
function garage(){
 const current=active(), r=detail&&getBot(detail), e=r&&mem.build[buildKey(detail)], busy=current&&current[0]!==buildKey(detail), any=filter==='all';
 const pool=full.filter(x=>any||x[2]===mem.year||(mem.year>1&&x[0]==='base'));
 const preview=r?'<section class="panel"><p class="eyebrow">СБОРКА / '+esc(r[4])+'</p><h2>'+esc(r[1])+'</h2><p>'+esc(r[5])+'</p><p>Ориентир: '+esc(r[3])+'.</p><p class="hint">Сначала проверь детали по схеме и освободите зону движения. Секундомер нужен для планирования, не для баллов. Нажми паузу на перерыве.</p><div class="timer" data-timer="'+esc(detail)+'">'+timeString(e?elapsed(e):0)+'</div><p>'+esc(stateLabel(e))+'</p><div class="actions">'+
 (!isTest()?'<span class="quiet">Войди в тестовый кабинет, чтобы проверить таймер и сохранение сборки.</span>':!e?'<button class="btn primary" data-action="start">Начать сборку и открыть инструкцию</button>':'')+
 (e?.status==='open'?(e.start?'<button class="btn" data-action="pause">Пауза</button>':'<button class="btn" data-action="start">Продолжить</button>')+'<button class="btn primary" data-action="submit">Готово, отправить учителю</button>':'')+
 '<a class="btn outline" href="'+esc(r[6])+'" target="_blank" rel="noopener">Смотреть PDF без запуска ↗</a></div>'+
 (busy?'<p class="quiet">Если запустишь эту сборку, другая активная сборка автоматически встанет на паузу.</p>':'')+
 (e?.status==='pending'?'<p class="quiet">В демоверсии можно переключиться в «Вид учителя» и проверить, как работает приёмка. Ничего в интернет не отправлено.</p>':'')+
 '</section>':'';
 return header('КОНСТРУКТОРСКАЯ / ГОД '+mem.year,'Гараж','Схемы LEGO Education, секундомер и журнал выполненных сборок. Время не влияет на рейтинг.')+
 (current&&!r?'<p class="hint">Таймер сборки запущен. <a href="#garage/'+current[0].split(':')[1]+'">Открыть сборку</a> или <button class="btn outline" data-action="pause-current">Поставить на паузу</button></p>':'')+preview+
 '<label>Фильтр <select id="garage-filter"><option value="year" '+(!any?'selected':'')+'>Для этого года</option><option value="all" '+(any?'selected':'')+'>Все модели</option></select></label><div class="garage-grid">'+
 pool.map(bot=>'<article class="garage-tile" style="background:'+bot[7]+'">'+photo(bot)+'<h3>'+esc(bot[1])+'</h3><p class="quiet">'+esc(bot[3])+' · '+esc(bot[4])+'</p><p>'+esc(stateLabel(mem.build[buildKey(bot[0])]))+'</p><a class="btn outline" href="#garage/'+bot[0]+'">Карточка сборки →</a></article>').join('')+
 '</div><p style="margin-top:16px"><a href="kurs.html#garage-reserve" target="_blank" rel="noopener">Все исходные схемы и мастерская из курса ↗</a></p>';
}
function teacher(){
 const rows=Object.entries(mem.build);
 return header('ДЕМОНСТРАЦИЯ / ВИД УЧИТЕЛЯ','Журнал сборок','В рабочем кабинете эту страницу видит только учитель своей группы.')+
 '<section class="panel"><h2>Попытки и подтверждение</h2>'+(rows.length?'<ul class="log-list">'+rows.map(([key,b])=>{
   const [y,mid]=key.split(':'),model=getBot(mid);
   return '<li><strong>'+esc(pilot())+' · '+esc(model?.[1]||mid)+'</strong><p>Год '+y+' · '+minutes(elapsed(b))+' · '+esc(stateLabel(b))+'</p>'+
   (b.status==='pending'?'<form class="approve" data-build="'+esc(key)+'"><p>Отметь выполненные критерии (по 10 баллов).</p><div class="choices"><label><input type="checkbox"> Модель собрана</label><label><input type="checkbox"> Модель выполняет задачу</label><label><input type="checkbox"> Ученик объяснил решение</label></div><div class="actions"><button class="btn primary" type="submit">Подтвердить баллы</button><button class="btn warn" type="button" data-action="return" data-id="'+esc(key)+'">Вернуть на доработку</button></div></form>':'')+'</li>';}).join('')+'</ul>':'<p>Пока нет сборок. Начни одну в гараже и закончи, чтобы она появилась здесь.</p>')+'</section>';
}
function render(){
 $('#mode-badge').textContent=!mode?'ДЕМО':isTest()?'ДЕМО · '+pilot():'ГОСТЬ · БЕЗ СОХРАНЕНИЯ';
 if(!mode){gate.hidden=false;desk.hidden=true;return}
 gate.hidden=true;desk.hidden=false;
 all('[data-year]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.year)===mem.year)));
 const tab=realTab();
 detail=tab==='garage'&&location.hash.includes('/')?location.hash.split('/')[1]:null;
 if(previousTab!==tab){response=''; previousTab=tab}
 all('[data-tab]').forEach(b=>{if(student&&b.dataset.tab===tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('[data-action=mode]').hidden=!isTest();
 $('[data-action=mode]').textContent=student?'Вид учителя':'Вид ученика';
 ws.innerHTML=(!student?teacher():tab==='home'?home():tab==='garage'?garage():modulePage(tab))+
 (storageFail?'<p class="hint">Этот браузер не разрешил сохранять данные локально. В этой вкладке демо продолжит работать.</p>':'');
 if(detail&&tab==='garage')document.documentElement.scrollTop=0;
}
function userAction(button){
 const action=button.dataset.action;
 if(action==='guest'){setMode('guest');location.hash='home';render();return}
 if(action==='exit'){const c=active();if(c)timeStop(c[1]);save();setMode('');student=true;response='';$('#test-login').reset();render();return}
 if(action==='mode'&&isTest()){student=!student;render();return}
 if(action==='bot'){mem.bot=button.dataset.id;save();render();document.querySelector('[data-action=bot][data-id="'+mem.bot+'"]')?.focus({preventScroll:true});return}
 if(action==='week'){mem.week[mem.year]=Number(button.dataset.id);response='';save();render();const b=$('[data-action=week][data-id="'+wk()+'"]');b?.scrollIntoView({block:'nearest'});b?.focus({preventScroll:true});return}
 if(action==='lecture'&&isTest()){mem.lecture[idFor(wk())]=true;save();render();return}
 if(action==='return'){
  const e=mem.build[button.dataset.id];if(e?.status==='pending')e.status='open';save();render();return
 }
 if(action==='pause-current'){const c=active();if(c)timeStop(c[1]);save();render();return}
 if(!isTest()||!detail||!getBot(detail))return;
 const id=buildKey(detail), b=mem.build[id];
 if(action==='start'&&(!b||b.status==='open')){
  const c=active();if(c&&c[0]!==id)timeStop(c[1]); const fresh=!b;
  mem.build[id]=b||{status:'open',ms:0,start:null};if(!mem.build[id].start)mem.build[id].start=Date.now();
  save();render();
  if(fresh)window.open(getBot(detail)[6],'_blank','noopener');
  return;
 }
 if(action==='pause'&&b?.status==='open'){timeStop(b);save();render();return}
 if(action==='submit'&&b?.status==='open'){
   timeStop(b);b.status='pending';b.sent=Date.now();save();render();
 }
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[data-tab]');
 if(a&&!student){student=true;if(location.hash===a.getAttribute('href')){e.preventDefault();render();return}}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.year){mem.year=Number(b.dataset.year);mem.bot=(GARAGE.find(r=>r[2]===mem.year)||GARAGE[0])[0];response='';filter='year';save();if(realTab()==='garage'&&detail)location.hash='garage';else render();return}
 if(b.dataset.action)userAction(b);
});
document.addEventListener('change',e=>{if(e.target.id==='garage-filter'){filter=e.target.value;render();$('#garage-filter')?.focus()}});
document.addEventListener('submit',e=>{
 if(e.target.id==='test-login'){
  e.preventDefault();const fd=new FormData(e.target),m=String(fd.get('user')||'').trim().toLowerCase();
  const err=$('#login-error');
  if(!profile(m)||fd.get('pass')!=='ev3-demo'){err.hidden=false;err.textContent='Не совпало. Используй pilot1 или pilot2 и пароль ev3-demo.';return}
  err.hidden=true;e.target.reset();setMode(m);student=true;response='';location.hash='home';render();return;
 }
 if(e.target.id==='quiz'){
  e.preventDefault();const r=quiz[mem.year][wk()], chosen=new FormData(e.target).get('answer');if(!r||chosen===null)return;
  if(Number(chosen)===r[2]){if(isTest())mem.practice[idFor(wk())]=true;response='Верно. '+r[3]+(isTest()?'':' Гостевой результат не сохранён.');save();render();}
  else {response='Пока нет. '+r[3];const el=$('#practice-result');el.hidden=false;el.textContent=response}
 }else if(e.target.classList.contains('approve')&&!student&&isTest()){
  e.preventDefault();const b=mem.build[e.target.dataset.build];if(b?.status!=='pending')return;
  const checks=all('input[type=checkbox]',e.target);if(!checks[0].checked){checks[0].setCustomValidity('Прежде чем подтвердить, отметь, что модель собрана. Иначе верни работу на доработку.');checks[0].reportValidity();checks[0].addEventListener('change',()=>checks[0].setCustomValidity(''),{once:true});return}
  b.status='approved';b.score=checks.filter(v=>v.checked).length*10;save();render();
 }
});
window.addEventListener('hashchange',()=>{student=true;render()});
setInterval(()=>{for(const el of all('[data-timer]')){const value=mem.build[buildKey(el.dataset.timer)];if(value?.start)el.textContent=timeString(elapsed(value))}},1000);
render();
})();
