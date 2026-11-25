(function(root){
"use strict";
const clean = x => String(x ?? "").trim();
const plainCompare = x => clean(x).toLowerCase().replace(/ё/g,"е");
const has = (x,re) => re.test(plainCompare(x));
const check = (ok,pass,fail) => ({ok:Boolean(ok), text:ok?pass:fail});
const getWord = s => clean(s).split(/\s+/).filter(Boolean);
const num = v => /^\d+$/.test(clean(v)) ? Number(v) : NaN;
const validN = v => Number.isInteger(num(v))&&num(v)>=0&&num(v)<=20;
const texts = {
  27:["Редактор макета","Создай слайд, на котором посетитель выставки за несколько секунд сравнит два блока. Измени макет и оформление и посмотри, как меняется сцена."],
  28:["Мастерская диаграмм","Построй столбчатую диаграмму по карточке. Меняй таблицу, подписи и шкалу: редактор сразу показывает последствия."],
  29:["Конструктор схем","Построй понятный маршрут и создай три разных значка из двух фигур. Сохраняй результат каждой операции."],
  30:["Проба перехода","Настрой три состояния одного жетона и сравни плавный переход с обычной сменой кадров. Эта модель объясняет идею «Трансформации», но не создаёт файл презентации."],
  31:["Редактор проверяемого запроса","Сверь данные двух учебных карточек, затем напиши нейтральный запрос. Сервис не нужен: браузер проверит, есть ли опора на источники."],
  32:["Мини-проект: мастерская","Соедини схему сортировки, диаграмму и подпись источника. Это открытая учебная практика, не СОР."],
  33:["Пробная защита","Подготовь короткую защиту и исправь ошибочный черновик. Браузер проверяет опоры в тексте, а не оценивает стиль выступления."]
};
const week = { names:["Пн","Вт","Ср","Чт"], values:[6,9,7,12] };
const weekNew = {names:week.names,values:[6,9,13,12]};
const materials = {
  3: {name:"A · журнал мастерской", values:[8,4,3]},
  4: {name:"B · подсчёт волонтёров", values:[6,7,2]},
  names:["Бумага","Картон","Пластик"]
};
const eventCards = [
  ["Карточка A","Организатор, 10 апреля. Выставка моделей 12 апреля, 14:00–16:00."],
  ["Карточка B","Волонтёры, 11 апреля. Исправление для той же выставки: 12 апреля, 14:00–15:30. Подтверждение организатора не приложено."]
];
const defenseCards = [
  ["Лист A","5 мая. Участники мастерской: 12 человек."],
  ["Журнал B","5 мая. Выданные материалы: 18 предметов."]
];
function judge27(s){
 return [
   check(s.layout==="double","Два блока стоят рядом: их можно сравнить.","Для сравнения выбери макет «Два равных блока»."),
   check(["calm","forest"].includes(s.theme),"Оформление даёт заметный контраст.","На бледном фоне мелкий текст плохо читается. Выбери более контрастную тему."),
   check(getWord(s.title).length>=2&&getWord(s.title).length<=7,"Заголовок короткий и различимый.","Дай заголовок из 2–7 слов, чтобы читатель понял тему."),
   check([s.left,s.right].every(v=>getWord(v).length>=2&&getWord(v).length<=12)&&plainCompare(s.left)!==plainCompare(s.right),"Оба блока содержательны и не повторяют друг друга.","Подпиши два разных блока; 2–12 слов в каждом.")
 ];
}
function judge28(s){
 const target=(s.updated?weekNew:week).values, leaders=s.updated?/(?:^|\s|[«(])(?:ср\.?|среда|среду|среды)(?=[^\p{L}]|$)/u:/(?:^|\s|[«(])(?:чт\.?|четверг(?:а)?)(?=[^\p{L}]|$)/u, high=s.updated?13:12;
 return [
   check(s.values.every((v,i)=>validN(v)&&num(v)===target[i]),"Значения столбцов точно совпадают с активной карточкой.","Сверь каждую ячейку таблицы с активной карточкой. Нужны целые значения от 0 до 20."),
   check(getWord(s.title).length>=2&&has(s.unit,/чел|посетител/),"Есть понятный заголовок и единица измерения.","Добавь название из 2 или более слов и единицу «чел.» или «посетители»."),
   check(String(s.base)==="0","Шкала начинается с нуля: сравнение высот честное.","Начни шкалу столбчатой диаграммы с 0."),
   check(has(s.conclusion,leaders)&&has(s.conclusion,new RegExp("\\b"+high+"\\b")),"Вывод называет день-лидер и его значение.","Напиши, какой день стал лидером, и укажи число посетителей по активной карточке.")
 ];
}
function intervals(xs){
   return xs[1]-xs[0]===xs[2]-xs[1]&&xs[1]>xs[0];
}
function judge29(s){
 return [
   check(s.labels.map(plainCompare).join(";")==="выбрать набор;взять карточку;вернуть набор","Стрелки идут в порядке действий.","Начни с выбора набора, затем получи карточку, затем верни набор."),
   check(s.ys.every(y=>y===s.ys[0]),"Блоки выровнены на одной линии.","Выровняй блоки по одной высоте."),
   check(intervals(s.xs),"Промежутки между блоками одинаковы.","Размести блоки на разных равных делениях или воспользуйся распределением."),
   check(["union","intersection","subtract"].every(op=>s.ops.has(op)),"Сохранены объединение, пересечение и вычитание из первой фигуры.","Проверь и сохрани три разные операции: объединение, общую область и остаток первой фигуры.")
 ];
}
function judge30(s){
 const near=(a,b)=>Math.abs(a-b)<=6;
 return [
   check(near(s.positions[0],10)&&near(s.positions[2],90),"Жетон начинает в зоне «Старт» и заканчивает в зоне «Готово».","Перенеси первый кадр в «Старт» (около 10) и последний в «Готово» (около 90)."),
   check(s.positions[0]<s.positions[1]&&s.positions[1]<s.positions[2]&&Math.abs(s.positions[1]-50)<=13,"Средний кадр показывает путь между началом и концом.","Поставь средний кадр близко к середине шкалы; движение должно идти слева направо."),
   check(s.played.has("snap")&&s.played.has("smooth"),"Ты сравнил обычную смену кадров и плавное движение.","Запусти оба режима, чтобы сравнивать по наблюдению, а не по догадке."),
   check(s.seconds>0&&s.seconds<=3&&getWord(s.note).length>=5&&has(s.note,/плав|скач|движ|жетон|кадр|позиц|маршрут/),"Есть наблюдение о движении и короткая длительность.","Опиши одним предложением, что видно в движении, и оставь длительность до 3 секунд.")
 ];
}
function judge31(s){
 return [
   check(s.a==="16:00"&&s.b==="15:30"&&s.same==="14:00","Начало совпадает; два времени окончания не перепутаны.","Перечитай обе карточки: выпиши время окончания отдельно для A и B и найди совпадающее начало."),
   check(s.verdict==="need","Вывод честный: точное время окончания пока нужно подтвердить.","Новизна объявления B не отменяет отсутствие подтверждения организатора."),
   check(has(s.prompt,/сравн|сопостав/)&&has(s.prompt,/(^|\s|[«(])(?:a|а)(?=[^\p{L}]|$)/u)&&has(s.prompt,/(^|\s|[«(])(?:b|б)(?=[^\p{L}]|$)/u)&&!has(s.prompt,/докажи|подтверди[, ]+что|только\s+(a|b)/),"Запрос сравнивает оба источника, не подталкивая к одному ответу.","Назови карточки A и B, используй нейтральное действие «сравни»; не проси доказать заранее выбранный ответ."),
   check(has(s.prompt,/12\s+апрел/)&&has(s.prompt,/расхожд|разниц|отлич|противореч/)&&has(s.prompt,/уточн|проверь|подтверж/),"В запросе есть дата, расхождение и шаг проверки.","Укажи дату 12 апреля, попроси назвать различие и что нужно подтвердить.")
 ];
}
function judge32(s){
 const target=materials[s.date],match=s.dest.map(plainCompare).join(";")==="бумага;картон;пластик";
 return [
   check(match,"Бумага, картон и пластик ведут в отдельные правильные лотки.","Проверь маршрут каждой категории: стрелки должны вести к лотку того же материала."),
   check(s.aligned&&s.even&&s.ops.size===3,"Схема выровнена, лотки распределены, сохранены три операции с фигурами.","Примени выравнивание и распределение; примени и сохрани три разные операции со значком."),
   check(target&&s.source===String(s.date)&&s.values.every((v,i)=>validN(v)&&num(v)===target.values[i]),"Диаграмма показывает данные одного дня и подписанного источника.","Для 3 мая выбери A, для 4 мая — B. Введи три числа именно из этого источника."),
   check(getWord(s.title).length>=2&&has(s.unit,/предмет/),"У проекта есть заголовок и единица «предметы».","Добавь осмысленный заголовок и подпиши, что число показывает количество предметов.")
 ];
}
function judge33(s){
 return [
   check(has(s.claim,/\b12\b/)&&has(s.claim,/человек|участник/)&&!has(s.claim,/\b18\b/),"Исправленный вывод называет 12 участников и не смешивает данные.","В исправленном выводе оставь число участников и его единицу; число материалов обоснуй отдельно."),
   check(has(s.source,/(?:^|[\s«(])(?:a|а)(?=[^\p{L}]|$)/u)&&has(s.limit,/\b18\b/)&&has(s.limit,/материал|предмет/),"Ты показал источник числа участников и что означает 18.","Назови лист A и поясни, что 18 — материалы или предметы, а не люди."),
   check(has(s.prompt,/сравн|сопостав|раздел/) && has(s.prompt,/единиц|кого|что\s+(счит|подсчит)/)&&!has(s.prompt,/докажи/),"Уточнённый запрос просит сравнить запись и единицы.","Попроси сравнить записи, определить, кого или что считали, и не заранее доказать готовый вывод."),
   check(getWord(s.script).length>=12&&has(s.script,/\b12\b/)&&has(s.script,/источник|лист|карточ/),"В сценарии защиты есть вывод и опора на источник.","Составь 2–3 короткие фразы, назови число участников и источник, на который опираешься.")
 ];
}
const judges={27:judge27,28:judge28,29:judge29,30:judge30,31:judge31,32:judge32,33:judge33};

function e(parent,tag,text,cls){
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=text;
 if(cls)node.className=cls;
 if(parent)parent.appendChild(node);
 return node;
}
function button(host,label,fn,cls){
 const b=e(host,"button",label,cls);
 b.type="button";b.addEventListener("click",fn);return b;
}
function field(host,label,{type="text",initial="",items,placeholder="",min,max,step,maxLength}={},refresh=()=>{}){
 const box=e(host,"label",undefined,"sl-field");
 e(box,"span",label);
 let f;
 if(items){
   f=e(box,"select");
   items.forEach(([v,t])=>{let option=e(f,"option",t);option.value=v;});
 } else if(type==="textarea") { f=e(box,"textarea"); f.rows=2; }
 else {f=e(box,"input");f.type=type; if(type==="number")f.inputMode="numeric";}
 f.value=initial;
 if(placeholder)f.placeholder=placeholder;
 if(min!==undefined)f.min=min;
 if(max!==undefined)f.max=max;
 if(step!==undefined)f.step=step;
 if(maxLength!==undefined)f.maxLength=maxLength;
 if(type==="range") {
   f.setAttribute("aria-label",label);const b=e(box,"output",f.value,"sl-range-value");
   f.addEventListener("input",()=>{b.textContent=f.value;});
 }
 f.addEventListener("input",refresh);f.addEventListener("change",refresh);
 return f;
}
const grid=h=>e(h,"div",undefined,"sl-fields");
const bar=h=>e(h,"div",undefined,"sl-actions");
const box=(h,t)=>{const a=e(h,"section",undefined,"sl-panel");if(t)e(a,"h4",t);return a;};
function showCards(host,cards){
 const a=e(host,"div",undefined,"sl-cards");
 for(const [name,text] of cards){const x=e(a,"article",undefined,"sl-card");e(x,"strong",name);e(x,"p",text);}
 return a;
}
function chart(host,opts){
 host.replaceChildren();
 const data=opts.values.map(num), n=opts.names.length;
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 520 240");svg.setAttribute("role","img");
 svg.setAttribute("aria-label",(clean(opts.title)||"Диаграмма")+". "+opts.names.map((nm,i)=>nm+": "+(validN(opts.values[i])?data[i]:"не введено")).join("; "));
 host.appendChild(svg);
 const g=(t,attrs,text)=>{
   const node=document.createElementNS("http://www.w3.org/2000/svg",t);
   Object.entries(attrs).forEach(([a,v])=>node.setAttribute(a,v));if(text!==undefined)node.textContent=text;svg.appendChild(node);
 };
 const base=Number(opts.base)||0,top=Math.max(base+5,...data.filter((v,i)=>validN(opts.values[i])),10);
 const left=52,right=493,y0=187,unit=129/(top-base),gap=(right-left)/Math.max(1,n);
 g("text",{x:12,y:25,"font-size":19,"font-weight":800},(clean(opts.title)||"Без названия").slice(0,43));
 g("text",{x:12,y:48,"font-size":13},clean(opts.unit).slice(0,23)||"Единица не указана");
 const ticks=Array.from({length:6},(_,i)=>base+Math.round((top-base)*i/5)).filter((x,i,a)=>a.indexOf(x)===i);
 for(const t of ticks){const y=y0-(t-base)*unit;g("line",{x1:left,x2:right,y1:y,y2:y,stroke:"#c7d7df"});g("text",{x:left-8,y:y+4,"text-anchor":"end","font-size":13},t);}
 for(let i=0;i<n;i++){
   const x=left+(i+.5)*gap, w=Math.min(gap/2,54), d=data[i];
   if(validN(opts.values[i])){
     const height=(Math.max(base,d)-base)*unit;
     g("rect",{x:x-w/2,y:y0-height,width:w,height,rx:4,fill:"#267373"});
     g("text",{x,y:y0-height-6,"text-anchor":"middle","font-size":14,"font-weight":750},d);
   }
   g("text",{x,y:215,"text-anchor":"middle","font-size":15},opts.names[i]);
 }
}
function shape(host,op){
 const a=e(host,"div",undefined,"sl-shape sl-op-"+op);
 a.setAttribute("role","img");
 const labels={start:"Квадрат слева и круг справа перекрываются",union:"Общий контур квадрат плюс круг",intersection:"Только общая часть квадрата и круга",subtract:"Квадрат с вырезом на месте круга"};
 a.setAttribute("aria-label",labels[op]);
 const sq=e(a,"i",undefined,"sl-square"),c=e(a,"i",undefined,"sl-circle");
 if(op==="intersection"){e(sq,"i",undefined,"sl-circle");c.hidden=true;}
 return a;
}
function shapeEditor(host,onChange){
 const panel=box(host,"Значки: операции с фигурами"), actions=bar(panel), state={current:"start",saved:new Set()};
 const preview=e(panel,"div",undefined,"sl-icon-preview"),list=e(panel,"div",undefined,"sl-saved-shapes");
 const nm={union:"Объединение",intersection:"Пересечение",subtract:"Вычитание из квадрата"};
 function repaint(){
  preview.replaceChildren();shape(preview,state.current);list.replaceChildren();
  state.saved.forEach(op=>{let p=e(list,"figure");shape(p,op);e(p,"figcaption",nm[op]);});
 }
 Object.keys(nm).forEach(op=>button(actions,nm[op],()=>{state.current=op;repaint();onChange();}));
 const save=button(actions,"Сохранить значок",()=>{if(state.current!=="start"){state.saved.add(state.current);repaint();onChange();}});
 save.setAttribute("aria-label","Сохранить результат операции как значок");
 repaint();return state;
}
function saveLocal(id, lines){
 const data=Array.isArray(lines)?lines:[lines];
 const blob=new Blob([data.join("\n")],{type:"text/plain;charset=utf-8"});
 const link=document.createElement("a");
 link.href=URL.createObjectURL(blob);link.download="informatika-6-lab-"+id+".txt";
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
function lab27(host,dirty) {
 const controls=grid(host), font=field(controls,"Тема оформления",{items:[["low","Бледная"],["calm","Светлая"],["forest","Лесная"]],initial:"low"},draw);
 const layout=field(controls,"Макет",{items:[["single","Один столбец"],["double","Два равных блока"],["right","Узкий блок справа"]],initial:"single"},draw);
 const title=field(controls,"Заголовок",{initial:"Клуб изобретателей",maxLength:65},draw);
 const left=field(controls,"Что делаем",{type:"textarea",placeholder:"Например: соберём мини-модель",maxLength:115},draw);
 const right=field(controls,"Что взять",{type:"textarea",placeholder:"Например: линейка и карандаш",maxLength:115},draw);
 const pv=e(host,"figure",undefined,"sl-slide-figure"); e(pv,"figcaption","Предпросмотр слайда");
 const slide=e(pv,"div",undefined,"sl-slide");
 const read=()=>({theme:font.value,layout:layout.value,title:title.value,left:left.value,right:right.value});
 function draw(){
   if(!slide)return; const s=read();slide.replaceChildren();slide.className="sl-slide sl-theme-"+s.theme+" sl-layout-"+s.layout;
   e(slide,"strong",clean(s.title)||"Заголовок слайда","sl-slide-title");
   const groups=e(slide,"div",undefined,"sl-slide-groups");
   const a=e(groups,"section");e(a,"strong","Что делаем");e(a,"p",clean(s.left)||"Введи первый блок");
   const b=e(groups,"section");e(b,"strong","Что взять");e(b,"p",clean(s.right)||"Введи второй блок");
   dirty();
 }
 draw();return {read, export:()=>[title.value,"Макет: "+layout.selectedOptions[0].textContent,"Тема: "+font.selectedOptions[0].textContent,"Что делаем: "+left.value,"Что взять: "+right.value]};
}
function lab28(host,dirty){
 let updated=false;
 const model=e(host,"p",undefined,"sl-note");
 const actions=bar(host);
 const chooser=button(actions,"Перейти к обновлённой карточке",()=>{
   updated=!updated;chooser.textContent=updated?"Вернуться к исходной карточке":"Перейти к обновлённой карточке";draw();
 });
 const controls=grid(host);
 const title=field(controls,"Название диаграммы",{maxLength:60},draw),unit=field(controls,"Единица измерения",{maxLength:24},draw);
 const base=field(controls,"Начало шкалы",{items:[["0","0"],["4","4"],["6","6"]],initial:"4"},draw);
 const vals=week.names.map(n=>field(controls,n+" — число посетителей",{type:"number",min:0,max:20,step:1},draw));
 const pv=e(host,"div",undefined,"sl-chart");
 const conclusion=field(host,"Вывод по диаграмме",{type:"textarea",maxLength:180},draw);
 const read=()=>({values:vals.map(x=>x.value),title:title.value,unit:unit.value,base:base.value,conclusion:conclusion.value,updated});
 function draw(){
  if(!pv||!conclusion)return;
  model.textContent=(updated?"Обновлённая":"Исходная")+" карточка: "+(updated?weekNew:week).values.map((v,i)=>week.names[i]+" "+v).join(" · ")+". Перенеси числа в свои ячейки.";
  chart(pv,{...read(),names:week.names});dirty();
 }
 draw();return {read,export:()=>[title.value,"Единица: "+unit.value,...vals.map((v,i)=>week.names[i]+": "+v.value),conclusion.value]};
}
function lab29(host,dirty){
 const labels=["Вернуть набор","Выбрать набор","Взять карточку"];
 const choose=[["","—"],...labels.map(s=>[s,s])];
 const settings=grid(host),txt=[],x=[],y=[];
 for(let i=0;i<3;i++){
   txt.push(field(settings,"Подпись блока "+(i+1),{items:choose,initial:labels[i]},draw));
   x.push(field(settings,"Блок "+(i+1)+": горизонталь",{type:"range",min:20,max:80,step:5,initial:[25,45,80][i]},draw));
   y.push(field(settings,"Блок "+(i+1)+": высота",{type:"range",min:20,max:75,step:5,initial:[25,60,35][i]},draw));
 }
 const actions=bar(host);
 button(actions,"Выровнять по высоте",()=>{y.forEach(f=>{f.value=45;f.dispatchEvent(new Event("input"));});});
 button(actions,"Распределить равномерно",()=>{x.forEach((f,i)=>{f.value=[20,50,80][i];f.dispatchEvent(new Event("input"));});});
 const pv=e(host,"div",undefined,"sl-flow");
 const ed=shapeEditor(host,dirty);
 const read=()=>({labels:txt.map(f=>f.value),xs:x.map(f=>+f.value),ys:y.map(f=>+f.value),ops:ed.saved});
 function draw(){
   if(!pv)return;pv.replaceChildren();const s=read();
   const p=e(pv,"div",undefined,"sl-flow-arrow");p.setAttribute("aria-hidden","true");
   for(let i=0;i<3;i++){const a=e(pv,"div",clean(s.labels[i])||("Блок "+(i+1)),"sl-flow-tile");a.style.left=s.xs[i]+"%";a.style.top=s.ys[i]+"%";}
   dirty();
 }
 draw();return {read,export:()=>["Схема: "+txt.map(f=>f.value).join(" → "),"Операции со значком: "+[...ed.saved].join(", ")]};
}
function lab30(host,dirty){
 const settings=grid(host), frames=["Первый кадр: Старт","Второй кадр: Путь","Третий кадр: Готово"];
 const amounts=frames.map((t,i)=>field(settings,t,{type:"range",min:0,max:100,step:1,initial:[28,36,61][i]},drawFrames));
 const sec=field(settings,"Длительность, секунды",{items:[["1","1"],["2","2"],["3","3"],["5","5"]],initial:"5"},drawFrames);
 const p=e(host,"div",undefined,"sl-frame-row");
 const scene=e(host,"div",undefined,"sl-track");
 e(scene,"span","Старт","sl-start");e(scene,"span","Готово","sl-finish");
 const puck=e(scene,"span","◆","sl-puck");
 puck.setAttribute("aria-hidden","true");
 const playback=e(host,"p","Ещё не запускали.","sl-note");
 playback.setAttribute("role","status");
 const actions=bar(host), played=new Set();
 const note=field(host,"Моё наблюдение",{type:"textarea",maxLength:200,placeholder:"Что видно зрителю на переходе?"},dirty);
 let active=0, currentTween=null, reduced=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 function setAt(v){puck.style.left=(7+.86*v)+"%";}
 function drawFrames(){
   p.replaceChildren();
   amounts.forEach((x,i)=>{
     const fig=e(p,"figure");
     const r=e(fig,"div",undefined,"sl-mini-track");e(r,"span","◆","sl-mini-puck").style.left=(7+.86*Number(x.value))+"%";
     e(fig,"figcaption",["Старт","Путь","Готово"][i]+" · "+x.value);
   });
   ++active;currentTween?.cancel();
   setAt(+amounts[0].value);played.clear();
   playback.textContent="Кадры изменились. Сравни два режима заново.";dirty();
 }
 function run(mode){
   const token=++active;const vals=amounts.map(v=>+v.value),duration=Number(sec.value)*1000;
   const text=mode==="smooth"?"Плавный переход":"Обычная смена кадров";
   currentTween?.cancel();
   setAt(vals[0]);playback.textContent=text+" начался…";
   if(mode==="smooth"&&!reduced&&typeof puck.animate==="function"){
     currentTween=puck.animate(vals.map(v=>({left:(7+.86*v)+"%"})),{duration,easing:"ease-in-out"});
     currentTween.finished.then(()=>{if(token===active){setAt(vals[2]);done();}}).catch(()=>{});
   }else{
     const wait=reduced?250:duration/2;
     setTimeout(()=>{if(token===active)setAt(vals[1]);},wait);
     setTimeout(()=>{if(token===active){setAt(vals[2]);done();}},2*wait);
   }
   function done(){
      played.add(mode);playback.textContent=text+" завершён"+(mode==="smooth"&&reduced?" (настройка уменьшенного движения: показаны кадры).":".");dirty();
   }
 }
 button(actions,"Обычная смена кадров",()=>run("snap"));
 button(actions,"Плавный переход",()=>run("smooth"));
 drawFrames();return {
   read:()=>({positions:amounts.map(v=>+v.value),seconds:+sec.value,note:note.value,played}),
   export:()=>["Кадры: "+amounts.map(v=>v.value).join(" → "),"Длительность: "+sec.value+" с",note.value]
 };
}
function lab31(host,dirty){
 showCards(host,eventCards);
 const controls=grid(host);
 const times=[["","Время не выбрано"],["14:00","14:00"],["15:30","15:30"],["16:00","16:00"]];
 const a=field(controls,"Конец по карточке A",{items:times},dirty),b=field(controls,"Конец по карточке B",{items:times},dirty);
 const same=field(controls,"Какое время совпадает?",{items:times},dirty);
 const verdict=field(controls,"Вывод для посетителя",{items:[["","Выбери вывод"],["a","Окончание точно в 16:00"],["b","Окончание точно в 15:30"],["need","Начало известно, окончание нужно подтвердить"]]},dirty);
 const prompt=field(host,"Мой нейтральный запрос",{type:"textarea",maxLength:440,placeholder:"Укажи данные, что сравнить и что уточнить."},dirty);
 e(host,"p","Проверка ищет признаки запроса, а не совпадение с одной фразой. Отвечать цифровой системе не нужно.","sl-note");
 return {read:()=>({a:a.value,b:b.value,same:same.value,verdict:verdict.value,prompt:prompt.value}),
  export:()=>["Источник A: конец "+a.value,"Источник B: конец "+b.value,"Общее начало: "+same.value,verdict.selectedOptions[0].textContent,"Уточнённый запрос: "+prompt.value]};
}
function lab32(host,dirty){
 const cards=[["3 мая · карточка A","Журнал мастерской: бумага 8, картон 4, пластик 3 предмета."],["4 мая · карточка B","Подсчёт волонтёров: бумага 6, картон 7, пластик 2 предмета."]];
 showCards(host,cards);
 const settings=grid(host), title=field(settings,"Заголовок проекта",{maxLength:55,placeholder:"Сортировка материалов"},draw);
 const unit=field(settings,"Единица измерения",{maxLength:22},draw);
 const date=field(settings,"Какой день показывает проект?",{items:[["3","3 мая"],["4","4 мая"]],initial:"3"},draw);
 const source=field(settings,"Источник диаграммы",{items:[["","—"],["3","A · журнал мастерской"],["4","B · подсчёт волонтёров"]]},draw);
 const diagram=box(host,"Схема маршрутов"), routeFields=grid(diagram);
 const dests=materials.names.map(name=>field(routeFields,"Куда направить: "+name,{items:[["","Не выбран"],...materials.names.map(n=>[n,n])]},draw));
 const actions=bar(diagram), alignBtn=button(actions,"Выровнять лотки",()=>{aligned=!aligned;alignBtn.setAttribute("aria-pressed",String(aligned));draw();});
 const evenBtn=button(actions,"Равные интервалы",()=>{even=!even;evenBtn.setAttribute("aria-pressed",String(even));draw();});
 alignBtn.setAttribute("aria-pressed","false");evenBtn.setAttribute("aria-pressed","false");
 const route=e(diagram,"div",undefined,"sl-routes");
 const editor=shapeEditor(host,dirty);
 const figures=box(host,"Числа для диаграммы"), values=grid(figures);
 const vals=materials.names.map(name=>field(values,"Количество: "+name,{type:"number",min:0,max:20,step:1},draw));
 const pv=e(figures,"div",undefined,"sl-chart");
 let aligned=false,even=false;
 const read=()=>({title:title.value,unit:unit.value,date:date.value,source:source.value,dest:dests.map(x=>x.value),values:vals.map(x=>x.value),ops:editor.saved,aligned,even});
 function draw(){
   if(!pv||!route)return;
   const t=read();route.replaceChildren();route.classList.toggle("sl-aligned",aligned);route.classList.toggle("sl-even",even);
   t.dest.forEach((v,i)=>e(route,"span",materials.names[i]+" → "+(v||"…")));
   chart(pv,{...t,names:materials.names,title:clean(t.title)?t.title+" · "+t.date+" мая":"Проект · "+t.date+" мая",base:0});dirty();
 }
 draw();return {read,export:()=>[title.value,"Дата: "+date.value+" мая","Источник: "+source.selectedOptions[0].textContent,...dests.map((f,i)=>materials.names[i]+" → "+f.value),...vals.map((f,i)=>materials.names[i]+": "+f.value+" "+unit.value),"Операции: "+[...editor.saved].join(", ")]};
}
function lab33(host,dirty){
 showCards(host,defenseCards);
 e(host,"p","Черновик автора: «В мастерскую пришло 18 участников». Перепроверь вывод и собери свою короткую защиту.","sl-note");
 const group=grid(host);
 const claim=field(group,"Мой исправленный вывод",{maxLength:145,placeholder:"Сколько участников и в какой единице?"},draw);
 const source=field(group,"Какой документ подтверждает вывод?",{maxLength:120,placeholder:"Назови учебный источник."},draw);
 const limit=field(group,"Что считается вторым числом?",{maxLength:150,placeholder:"Объясни, почему оно не равно числу участников."},draw);
 const prompt=field(host,"Мой уточнённый запрос",{type:"textarea",maxLength:330,placeholder:"Попроси сравнить, что именно посчитано в двух записях."},draw);
 const script=field(host,"Моя защита: 2–3 короткие фразы",{type:"textarea",maxLength:390,placeholder:"Мой вопрос…, мой вывод…, мой источник…"},draw);
 const stage=box(host,"Карточка для репетиции"),rendered=e(stage,"div",undefined,"sl-defense");
 const time=e(stage,"p","Цель: уложиться в 45 секунд. Здесь ничего не записывается.","sl-note");
 const actions=bar(stage);
 let ticker=null;
 button(actions,"Начать репетицию на 45 секунд",()=>{
   clearInterval(ticker);let end=Date.now()+45000;
   time.textContent="Осталось 45 сек. Произнеси текст вслух и назови ограничение.";
   ticker=setInterval(()=>{
     if(!stage.isConnected){clearInterval(ticker);return;}
     const t=Math.max(0,Math.ceil((end-Date.now())/1000));
     time.textContent=t?"Осталось "+t+" сек.":"Время вышло. Объясни партнёру, что не позволяют узнать эти два источника.";
     if(!t)clearInterval(ticker);
   },250);
 });
 button(actions,"Стоп",()=>{clearInterval(ticker);time.textContent="Репетиция остановлена. Можно начать заново.";});
 const read=()=>({claim:claim.value,source:source.value,limit:limit.value,prompt:prompt.value,script:script.value});
 function draw(){
  if(!rendered)return;rendered.replaceChildren();
  e(rendered,"strong",clean(claim.value)||"Исправленный вывод");
  e(rendered,"p",clean(script.value)||"Здесь появятся фразы для защиты.");
  if(clean(source.value))e(rendered,"p","Источник: "+source.value);
  if(clean(limit.value))e(rendered,"p","Уточнение: "+limit.value);
  dirty();
 }
 draw();return {read,export:()=>[claim.value,"Источник: "+source.value,"Уточнение: "+limit.value,"Запрос: "+prompt.value,"Текст защиты: "+script.value]};
}
const builders={27:lab27,28:lab28,29:lab29,30:lab30,31:lab31,32:lab32,33:lab33};
function mount(host){
 if(host.dataset.slidesReady)return;
 const id=Number(host.dataset.lesson), info=texts[id];
 if(!info)return;
 host.dataset.slidesReady="true";host.classList.add("sl-lab");
 const h=e(host,"header",undefined,"sl-lab-header");
 e(h,"h3",info[0]);e(h,"p",info[1]);
 const inner=e(host,"section",undefined,"sl-lab-main");
 const tools=e(host,"section",undefined,"sl-lab-check");
 const feedback=e(tools,"div","Проверка появится здесь после выполнения.","sl-feedback");
 feedback.setAttribute("aria-live","polite");
 let resultShown=false;
 function dirty(){
  if(!resultShown)return;resultShown=false;
  feedback.textContent="Работа изменилась. Проверь её снова.";
 }
 const lab=builders[id](inner,dirty);
 const buttons=bar(tools);
 button(buttons,"Проверить работу",()=>{
   const checks=judges[id](lab.read()), good=checks.filter(x=>x.ok).length;
   feedback.replaceChildren();resultShown=true;
   e(feedback,"strong",good===checks.length?"Готово: все признаки выполнены.":"Получилось "+good+" из "+checks.length+". Исправь отмеченные шаги.");
   const list=e(feedback,"ul");
   checks.forEach(c=>{const li=e(list,"li",c.text,c.ok?"sl-good":"sl-fix");li.prepend(document.createTextNode(c.ok?"Готово: ":"Исправь: "));});
 },"sl-primary");
 button(buttons,"Скачать запись работы (.txt)",()=>saveLocal(id,[info[0],"",...lab.export()]));
 e(tools,"p","Файл остаётся на устройстве. Поля и результаты не отправляются и очищаются при обновлении страницы.","sl-privacy");
}
if(typeof module==="object")module.exports={judges,mount,week,weekNew,materials};
else {
 const all=()=>document.querySelectorAll("[data-lab][data-lesson]").forEach(mount);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",all,{once:true});else all();
}
})(typeof window!=="undefined"?window:null);
