'use strict';
(()=>{
const box=document.querySelector('[data-lab]');
if(!box)return;
const n=Number(box.dataset.lesson);
const root=new URL('./',document.currentScript.src);
const tasks={
17:[
 ['Табличка из двух строк','Выведи две строки одной командой print(): сначала: Кабинет «Роботы» (вместо «» используй обычные двойные кавычки), потом: Папка: C:\\Роботы. Используй \\n, \\" и \\\\ внутри строки.','# Напиши одну команду print()\n',[[[], 'Кабинет "Роботы"\nПапка: C:\\Роботы']],{lits:['\\n','\\"','\\\\']}],
 ['Одинарные кавычки','Выведи две строки одной командой: Клуб \'Старт\' и Вход открыт. Используй одинарные кавычки для строки и экранируй кавычки вокруг слова Старт.','',[[[],"Клуб 'Старт'\nВход открыт"]],{lits:["\\'","\\n"]}]],
18:[
 ['Приглашение','Напечатай три строки: Кружок: "Роботы", Начало: 15:30, План: Кружок\\Занятие. Используй одну строку Python с \\n.','',[[[],'Кружок: "Роботы"\nНачало: 15:30\nПлан: Кружок\\Занятие']],{lits:['\\n','\\\\']}],
 ['Найди и исправь сбой','Исправь строку: она должна вывести слово Код: "А1", а на новой строке Путь: A:\\План.','print("Код: "А1" Путь: A:\\План")',[[[],'Код: "А1"\nПуть: A:\\План']],{lits:['\\n','\\\\']}]],
19:[
 ['Паспорт наблюдения','Создай переменные city, days, temp, rain. Запиши: Костанай, 3, 14.5, False. Выведи четыре значения и тип каждого в отдельной строке в формате «значение тип».','city = "Костанай"\n# Добавь ещё три переменные и четыре print(...)\n',[[[],'Костанай str\n3 int\n14.5 float\nFalse bool']],{calls:['type'],vars:{city:'str',days:'int',temp:'float',rain:'bool'}}],
 ['Типы мини-опроса','Создай переменные topic, votes, hours, passed. Выведи только четыре типа в том же порядке, по одному в строке. Данные: Графика, 12, 1.5, True.','',[[[],'str\nint\nfloat\nbool']],{calls:['type'],vars:{topic:'str',votes:'int',hours:'float',passed:'bool'}}]],
20:[
 ['Учёт книг','Сохрани исходные 12 книг в before. Прибавь 3 и вычти 2, каждый раз меняя переменную books. Выведи сначала конечное, потом исходное число (две строки).','books = 12\nbefore = books\n',[[[],'13\n12']],{reassign:true,ops:['Add','Sub']}],
 ['Баллы за неделю','Начни с 20 баллов. Прибавь 7, вычти 4, затем удвой результат, меняя score. Выведи только итог.','score = 20\n',[[[],'46']],{reassign:true,ops:['Add','Sub','Mult']}]],
21:[
 ['Семь операций','Возьми a = 17, b = 5. Выведи по строкам: сумму, разность, произведение, a в степени b, частное /, частное // и остаток %.','a = 17\nb = 5\n',[[[],'22\n12\n85\n1419857\n3.4\n3\n2']],{ops:['Add','Sub','Mult','Pow','Div','FloorDiv','Mod']}],
 ['Скобки меняют итог','Выведи в двух строках 6 + 2 * 3 и (6 + 2) * 3. Введи именно выражения, не готовые ответы.','',[[[],'12\n24']],{ops:['Add','Mult']}]],
22:[
 ['Полные коробки','В каждой коробке 8 мест, значков 53. Выведи количество полных коробок, затем остаток (по строкам).','badges = 53\nsize = 8\n',[[[],'6\n5']],{ops:['FloorDiv','Mod']}],
 ['Обратная проверка','Для 36 предметов и коробок по 7 мест выведи число полных коробок, остаток и восстановленное исходное число через умножение и сложение.','count = 36\nsize = 7\n',[[[],'5\n1\n36']],{ops:['FloorDiv','Mod','Mult','Add']}]],
23:[
 ['Считаем детали','Прочитай два целых числа через input(), преврати обе строки в int и выведи сумму. При запуске вводи одно число на строку.','a = int(input())\n# прочитай второе число и выведи сумму\n',[[['2','3'],'5'],[['12','8'],'20'],[['0','5'],'5']],{calls:['input','int'],ops:['Add']}],
 ['Длина дорожки','Прочитай длины двух отрезков через float(input()). Выведи их сумму. Дробь во входных данных вводится с точкой.','',[[['1.5','2.5'],'4.0'],[['0.25','0.5'],'0.75'],[['2.0','1.25'],'3.25']],{calls:['input','float'],ops:['Add']}]],
24:[
 ['Чек в тенге','Выведи f-строкой: 3 значка × 150 тг = 450 тг. Используй count, price и вычисли стоимость.','count = 3\nprice = 150\n',[[[],'3 значка × 150 тг = 450 тг']],{ops:['JoinedStr','Mult']}],
 ['Время занятия','Возьми topic = "Графика" и minutes = 35. Выведи f-строкой: Кружок: Графика. Время: 35 мин.','topic = "Графика"\nminutes = 35\n',[[[],'Кружок: Графика. Время: 35 мин.']],{ops:['JoinedStr']}]],
25:[
 ['Тренировка: значки по коробкам','Прочитай число значков и вместимость. Выведи f-строкой: Полных: 4; остаток: 3 (это пример для 23 и 5). Программа должна работать и с другими числами.','badges = int(input())\ncapacity = int(input())\n',[[['23','5'],'Полных: 4; остаток: 3'],[['20','5'],'Полных: 4; остаток: 0'],[['3','5'],'Полных: 0; остаток: 3']],{calls:['input','int'],ops:['FloorDiv','Mod','JoinedStr']}],
 ['Тренировка: стоимость заказа','Прочитай целое количество и цену в тенге. Выведи f-строкой: К оплате: 240 тг (пример для 3 и 80).','',[[['3','80'],'К оплате: 240 тг'],[['5','120'],'К оплате: 600 тг'],[['1','45'],'К оплате: 45 тг']],{calls:['input','int'],ops:['Mult','JoinedStr']}]],
26:[
 ['Исправь арифметику','Программа должна вывести полные упаковки, остаток и проверку количества (по строкам). Исправь операции для 17 предметов и упаковки по 5.','n = 17\nk = 5\nfull = n / k\nleft = n // k\nprint(full)\nprint(left)\nprint(full + k * left)',[[[],'3\n2\n17']],{ops:['FloorDiv','Mod','Mult','Add']}],
 ['Проверь на трёх наборах','Напиши проверку деления для произвольных n и k: прочитай два целых числа, выведи n // k, n % k и результат обратной проверки по строкам. Размер k всегда больше нуля.','',[[['17','5'],'3\n2\n17'],[['20','5'],'4\n0\n20'],[['4','7'],'0\n4\n4']],{calls:['input','int'],ops:['FloorDiv','Mod','Mult','Add']}]]
};
if(!tasks[n])return;
const section=(tag,txt,cl)=>{const el=document.createElement(tag);if(txt)el.textContent=txt;if(cl)el.className=cl;return el;};
const title=section('h3','Лаборатория Python 3');
const intro=section('p','Пиши и запускай код в этой вкладке. При первом запуске браузер загружает Python, поэтому подожди немного. Установки и регистрации нет. Твой код и ввод не отправляются на сервер.','note');
const select=section('select');select.id='py-task';
tasks[n].forEach((t,i)=>{const x=section('option',t[0]);x.value=i;select.append(x);});
const taskLabel=section('label','Задание ');taskLabel.htmlFor=select.id;taskLabel.append(select);
const desc=section('p','','py-desc');
const editor=section('textarea');editor.id='py-code';editor.rows=9;editor.spellcheck=false;editor.maxLength=5000;editor.autocapitalize='off';editor.wrap='off';editor.setAttribute('aria-label','Код Python');
const input=section('textarea');input.id='py-input';input.rows=3;input.maxLength=300;input.spellcheck=false;input.setAttribute('aria-label','Входные данные');
const inputWrap=section('label','Входные данные: одно значение на строку','py-input');inputWrap.htmlFor=input.id;inputWrap.append(input);
const buttons=section('div','','actions');
const run=section('button','Запустить','button alt'),check=section('button','Проверить работу','button'),reset=section('button','Вернуть заготовку','button alt'),save=section('button','Скачать мою программу','button alt');
for(const b of [run,check,reset,save]){b.type='button';buttons.append(b);}
const log=section('pre','','py-log');log.tabIndex=0;log.setAttribute('aria-label','Вывод программы');
const status=section('p','','py-status');status.setAttribute('role','status');
const report=section('ul','','py-report');
const hint=section('details'), hintTitle=section('summary','Подсказка и пример');
const guide=section('p','Сравни свой результат с эталоном для первого набора. Сайт проверяет вывод и нужный приём, а не точное совпадение текста кода.','note');
const sample=section('pre','','py-log');
hint.append(hintTitle,guide,sample);
box.classList.add('py-lab');box.append(title,intro,taskLabel,desc,editor,inputWrap,buttons,status,log,report,hint);
let worker,seq=0,timer;
const current=()=>tasks[n][Number(select.value)];
function resetTask(){
 const t=current();desc.textContent=t[1];editor.value=t[2];input.value=t[3][0][0].join('\n');inputWrap.hidden=t[3][0][0].length===0;
 status.textContent='';log.textContent='Здесь появится вывод программы.';report.replaceChildren();sample.textContent=t[3][0][1];hint.open=false;
}
function stop(){
 clearTimeout(timer);if(worker)worker.terminate();worker=undefined;
}
function busy(yes){for(const b of [run,check,reset,select])b.disabled=yes;}
function timed(ms,error){
 clearTimeout(timer);timer=setTimeout(()=>{stop();busy(false);status.textContent=error;},ms);
}
function row(text,ok){const x=section('li',text);x.dataset.ok=String(ok);report.append(x);}
const norm=s=>String(s).replace(/\r\n/g,'\n').trimEnd().split('\n').map(x=>x.trim()).join('\n');
const ops={JoinedStr:'f-строку',Add:'+',Sub:'-',Mult:'*',Div:'/',FloorDiv:'//',Mod:'%',Pow:'**'};
function send(grade){
 if(!editor.value.trim()){status.textContent='Сначала напиши программу.';return;}
 const t=current(), id=++seq;
 const tests=grade?t[3].map(([inputs,expected])=>({inputs,expected})):[{inputs:inputWrap.hidden?[]:input.value.replace(/\r/g,'').split('\n')}];
 report.replaceChildren();log.textContent='';busy(true);status.textContent='Загружаю Python и выполняю код…';
 try{
 if(!worker)worker=new Worker(new URL('python-lab-worker.js',root));
 timed(60000,'Python не успел загрузиться. Проверь интернет и попробуй снова.');
 worker.onerror=()=>{stop();busy(false);status.textContent='Не удалось запустить Python в этом браузере. Обнови страницу или открой её в другом современном браузере.';};
 worker.onmessage=({data})=>{
  if(data.id!==id)return;
  if(data.state==='ready'){timed(3500,'Код выполнялся слишком долго. Проверь вычисления и попробуй снова.');status.textContent='Выполняю код…';return;}
  clearTimeout(timer);busy(false);
  if(data.unavailable){stop();status.textContent=data.unavailable;return;}
  const result=data.response;
  if(result.error){status.textContent=result.error;return;}
  const first=result.runs[0];
  log.textContent=first.output||(first.error?'':'(Программа ничего не напечатала.)');
  if(!grade){status.textContent=first.error||'Готово. Чтобы проверить задание, нажми «Проверить работу».';return;}
  let ok=true;
  result.runs.forEach((a,i)=>{
   const pass=!a.error && norm(a.output)===norm(tests[i].expected);
   ok=ok&&pass;
   const context=tests[i].inputs.length?' (ввод: '+tests[i].inputs.join(', ')+')':'';
   row('Проверка '+(i+1)+context+': '+(pass?'вывод совпал.':a.error||('сверь формат и числа. Ожидалось: '+tests[i].expected.replace(/\n/g,' / '))),pass);
  });
  const rules=t[4]||{};
  const missing=[...(rules.calls||[]).filter(x=>!result.markers.calls.includes(x)).map(x=>x+'()'),...(rules.ops||[]).filter(x=>!result.markers.types.includes(x)).map(x=>ops[x]||x),...(rules.lits||[]).filter(x=>!editor.value.includes(x))];
  if(rules.reassign&&!result.markers.reassign)missing.push('повторное присваивание');
  for(const [x,type] of Object.entries(rules.vars||{}))if(first.types[x]!==type)missing.push(x+': '+type);
  if(missing.length){ok=false;row('Добавь: '+missing.join(', ')+'.',false);}
  status.textContent=ok?'Задание выполнено: программа прошла все проверки.':'Поправь отмеченные места и проверь снова.';
 };
 worker.postMessage({id,code:editor.value,cases:tests.map(x=>({inputs:x.inputs}))});
 } catch {stop();busy(false);status.textContent='Этот браузер не разрешил запустить учебную лабораторию Python.';}
}
run.onclick=()=>send(false);check.onclick=()=>send(true);
save.onclick=()=>{
 if(!editor.value.trim()){status.textContent='Сначала напиши программу.';return;}
 const link=document.createElement('a'),url=URL.createObjectURL(new Blob([editor.value+'\n'],{type:'text/x-python;charset=utf-8'}));
 link.href=url;link.download='inform-6-lesson-'+n+'-task-'+(Number(select.value)+1)+'.py';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
};
reset.onclick=resetTask;select.onchange=resetTask;
editor.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(!run.disabled)send(false);}});
resetTask();
})();
