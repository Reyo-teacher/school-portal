(() => {
'use strict';
const el = (s, t = document) => t.querySelector(s);
const all = (s, t) => [...t.querySelectorAll(s)];
const E = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const opts = (list, selected = '', prompt = 'Выбери') =>
  '<option value="">'+E(prompt)+'</option>'+list.map(([v,t])=>`<option value="${E(v)}"${v===selected?' selected':''}>${E(t)}</option>`).join('');
const captioned = (legend, items, extra='') => `<fieldset><legend>${legend}</legend>${extra}<div class="b-fields">${items.join('')}</div></fieldset>`;
const select = (id, label, list, value) => `<label>${E(label)}<select name="${id}">${opts(list,value)}</select></label>`;
const input = (id,label,placeholder='', extra='') => `<label>${E(label)}<input name="${id}" placeholder="${E(placeholder)}" ${extra}></label>`;
const lookup = (xs,id) => xs.find(x=>x[0]===id)?.[1] || '—';
const button = (id, text, extra='') => `<button type="button" data-act="${id}" ${extra}>${E(text)}</button>`;
const setShell = (root, title, brief, content) => {
  root.innerHTML = `<section class="basics-lab" aria-label="${E(title)}"><h3>${E(title)}</h3><p class="b-brief">${brief}</p>${content}<div class="b-feedback" aria-live="polite" role="status"></div></section>`;
};
const output = (root, checks) => {
  el('.b-feedback',root).innerHTML = checks.length ?
    '<ul>'+checks.map(([ok,msg])=>`<li class="${ok?'b-pass':'b-revise'}">${ok?'✓':'↻'} ${E(msg)}</li>`).join('')+'</ul>' : '';
};
const clear = root => { el('.b-feedback',root).textContent=''; };
const val = (root,name) => el(`[name="${name}"]`,root)?.value.trim() || '';
const table = (head, rows, caption) => `<div class="b-table-wrap"><table>${caption?'<caption>'+E(caption)+'</caption>':''}<thead><tr>${head.map(x=>`<th scope="col">${E(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map(x=>'<td>'+E(x)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
const handle = (root, act, change) => {
  root.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&root.contains(b))act(b.dataset.act,b);});
  if(change)root.addEventListener('change', e=>change(e.target));
  root.addEventListener('submit',e=>e.preventDefault());
};
const save = (filename,copy,mime='text/plain') => {
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([copy],{type:mime+';charset=utf-8'}));a.download=filename;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
};
const planData=[
 ['А','В чате обещают приз за код из SMS.','fraud',['hold','official'],'account','Код подтверждает вход или действие. Начни с того, чтобы его не передавать.'],
 ['Б','Одноклассника снова оскорбляют в общем чате.','bully',['support','block'],'hurt','Не отвечай обидой. Можно попросить взрослого помочь, пожаловаться или заблокировать.'],
 ['В','Несколько дней подряд игра продолжается до ночи, а утром трудно встать.','time',['pause','routine'],'sleep','Посмотри, что игра уже вытесняет. Первый шаг должен помочь восстановить режим.']
];
const consequences=[['sleep','Недосып, сложнее учиться'],['hurt','Переживания, травля может продолжиться'],['account','Доступ к аккаунту может получить другой человек'],['no','По этой фразе вред не виден'],['nothing','Ничего не может случиться']];
const actions=[['check','Сверить сообщение в обычном канале'],['hold','Не отправлять код и прекратить переписку'],['official','Не отправлять код и проверить через официальный канал'],['support','Не огрызаться и обратиться к взрослому'],['block','Не огрызаться и заблокировать или пожаловаться'],['pause','Завершить игру на сегодня и восстановить сон'],['routine','Попросить взрослого помочь наладить режим'],['reply','Ответить угрозой'],['send','Отправить код и посмотреть, что будет'],['wait','Играть дальше до утра']];
function plan(root) {
  const draw = () => setShell(root,'Собери план безопасного ответа','Подбери последствие и первое действие для трёх вымышленных случаев. Черновик обновляется сразу. Не вводи реальные имена, ссылки и коды.',
    planData.map(([id,text])=>captioned(id+'. '+E(text),[select('effect'+id,'Что может случиться',consequences),select('step'+id,'Мой первый шаг',actions)])).join('')+
    '<div data-plan></div><div class="b-actions">'+button('check','Проверить памятку')+button('download','Скачать памятку', 'disabled')+button('reset','Начать заново')+'</div>');
  const rows=()=>planData.map(([id,text])=>[text,lookup(consequences,val(root,'effect'+id)),lookup(actions,val(root,'step'+id))]);
  const paint=()=>{el('[data-plan]',root).innerHTML=table(['Случай','Возможное последствие','Первый шаг'],rows(),'Моя памятка');};
  draw();paint();
  handle(root, a=>{
    if(a==='reset'){draw();paint();}
    if(a==='download')save('Памятка_безопасность.txt','Моя памятка\n\n'+rows().map(r=>r.join(' → ')).join('\n'));
    if(a==='check'){
      const checks=planData.map(([id,,risk,allowed,expected,hint])=>{
        const x=val(root,'effect'+id),y=val(root,'step'+id),ok=x===expected&&allowed.includes(y);
        return [ok,id+': '+(ok?'последствие и шаг соответствуют ситуации.':!x||!y?'заполни оба поля.':(x!==expected?'Уточни последствие. ':'Измени первый шаг. ')+hint)];
      });
      output(root,checks);el('[data-act="download"]',root).disabled=!checks.every(c=>c[0]);
    }
  }, e=>{if(e.matches('select')){paint();clear(root);el('[data-act="download"]',root).disabled=true;}});
}
const riskLabels=[['time','Вред режиму'],['ordinary','Обычное / можно уточнить'],['bully','Сетевая агрессия'],['fraud','Мошенничество']];
const clues=[['schedule','Написали время кружка, секретных данных не просят'],['secret','Просят код, торопят и запрещают рассказывать'],['repeat','Оскорбления продолжаются'],['late','Из-за поздней игры уже опаздываю'],['emoji','В сообщении есть буквы'],['internet','Ситуация происходит в интернете']];
function risks(root){
  const cases=[
    ['А','«Кружок начнётся в 15:00».','schedule','ordinary','no',['check']],
    ['Б','«Срочно назови код из SMS. Никому не говори!»','secret','fraud','account',['hold','official']],
    ['В','«Тебя добавили в чат и снова оскорбляют».','repeat','bully','hurt',['support','block']],
    ['Г','«Играю допоздна, утром опаздываю».','late','time','sleep',['pause','routine']]
  ];
  const draw=()=>setShell(root,'Заполни журнал сетевых рисков','Оцени четыре записи. Не всякое сообщение опасно. Для каждой запиши наблюдаемый признак, риск, последствие и действие.',
    cases.map(([id,text])=>captioned(id+'. '+E(text),[select('clue'+id,'Какой признак вижу',clues),select('risk'+id,'Как помечу',riskLabels),select('effect'+id,'Какое последствие',consequences),select('act'+id,'Что сделаю сначала',actions)])).join('')+
      '<div data-log></div><div class="b-actions">'+button('check','Проверить журнал')+button('download','Скачать журнал','disabled')+button('reset','Начать заново')+'</div>');
  const rows=()=>cases.map(([id,text])=>[id+' '+text,lookup(clues,val(root,'clue'+id)),lookup(riskLabels,val(root,'risk'+id)),lookup(consequences,val(root,'effect'+id)),lookup(actions,val(root,'act'+id))]);
  const paint=()=>{el('[data-log]',root).innerHTML=table(['Запись','Признак','Риск','Последствие','Действие'],rows(),'Мой журнал');};
  draw();paint();
  handle(root,a=>{
    if(a==='reset'){draw();paint();}
    if(a==='download')save('Журнал_рисков.txt','Журнал рисков\n\n'+rows().map(r=>r.join(' | ')).join('\n'));
    if(a==='check'){
      const checks=cases.map(([id,,cl,r,e,allowed])=>{
        const x=[val(root,'clue'+id),val(root,'risk'+id),val(root,'effect'+id),val(root,'act'+id)];
        const bad=[x[0]!==cl?'наблюдаемый признак':'',x[1]!==r?'метку риска':'',x[2]!==e?'последствие':'',!allowed.includes(x[3])?'действие':''].filter(Boolean);
        return [!bad.length,id+': '+(!bad.length?'запись подтверждается текстом.':x.includes('')?'есть незаполненные поля.':'пересмотри '+bad.join(', ')+'. Опирайся на конкретные слова, не на сам факт общения онлайн.')];
      });output(root,checks);el('[data-act="download"]',root).disabled=!checks.every(c=>c[0]);
    }
  },e=>{if(e.matches('select')){paint();clear(root);el('[data-act="download"]',root).disabled=true;}});
}
function contexts(root){
  const objects=[['water','Температура воды'],['pl','Число всходов'],['step','Число сделанных шагов']];
  const units=[['degree','°C'],['count','штук'],['minute','минут']];
  const expected={water:'degree',pl:'count',step:'count'};
  const draw=()=>setShell(root,'Преврати записи в таблицу наблюдений','Сырые данные: <strong>3, 5, 7</strong>. Задай им два разных смысла. Выбери один набор наблюдений для прогноза, предложи постоянную прибавку и проверь её на новом наблюдении: в четвёртой записи оказалось <strong>8</strong>.',
    [1,2].map(i=>captioned('Таблица '+i,[select('kind'+i,'Что наблюдали',objects),select('unit'+i,'Единица',units)])).join('')+
    captioned('Моя проверяемая догадка',[select('target','Какой ряд проверять',[['1','Таблица 1'],['2','Таблица 2']]),input('step','Постоянная прибавка на каждом шаге','Число','type="number" step="any"'),input('forecast','Мой прогноз для 4-й записи','Число','type="number" step="any"')])+
    '<div data-contexts></div><div class="b-actions">'+button('check','Проверить таблицы и правило')+button('reset','Начать заново')+'</div>');
  const paint=()=>{
    el('[data-contexts]',root).innerHTML=[1,2].map(i=>{
      const k=val(root,'kind'+i),u=val(root,'unit'+i);
      return k&&u?table(['Наблюдение',lookup(objects,k)+' ('+lookup(units,u)+')'],[[1,3],[2,5],[3,7]],'Таблица '+i):'';
    }).join('');
  };
  draw();paint();
  handle(root,a=>{
    if(a==='reset'){draw();paint();}
    if(a==='check'){
      const k=val(root,'kind1'),l=val(root,'kind2'),target=val(root,'target'),dRaw=val(root,'step'),fRaw=val(root,'forecast');
      const d=Number(dRaw), f=Number(fRaw);
      const ready=Boolean(k&&l&&expected[k]===val(root,'unit1')&&expected[l]===val(root,'unit2')&&k!==l);
      const fitted=Boolean(target&&dRaw&&5-3===d&&7-5===d);
      const fOK=Boolean(fRaw&&fitted&&f===7+d);
      output(root,[[ready,ready?'Те же данные стали разной информацией: два разных контекста с подходящими единицами.':'Выбери два разных объекта. Температуру измеряют в °C, а всходы и шаги считают в штуках.'],
        [fitted,fitted?'Прибавка '+d+' подходит обеим парам в выбранной таблице.':'Выбери таблицу и проверь, насколько изменилось значение от 3 к 5 и от 5 к 7.'],
        [fOK,fOK?'Прогноз по правилу: '+f+'. Новая запись: 8. Значит, правило подходило старым наблюдениям, но не предсказало новое. Так же важно проверять модель ИИ на новых примерах.':'Запиши прогноз по своему правилу: добавь постоянную прибавку к последнему значению.']]);
    }
  },e=>{if(e.matches('select,input')){paint();clear(root);}});
}
const col=[['red','Красный'],['blue','Синий'],['green','Зелёный'],['yellow','Жёлтый']];
const sh=[['tri','треугольник'],['circle','круг']];
const shapeText=(c,s)=>lookup(col,c)+' '+lookup(sh,s);
const initial=[['red','tri','tri'],['red','tri','tri'],['blue','circle','circle'],['blue','circle','circle']];
const testSet=[['blue','tri','tri'],['red','circle','circle'],['yellow','tri','tri'],['green','circle','circle']];
function featureClassifier(rows,feature){
  return function(key){
    const tally=rows.filter(r=>r[feature]===key).reduce((obj,r)=>(obj[r[2]]=(obj[r[2]]||0)+1,obj),{});
    const a=tally.tri||0,b=tally.circle||0;
    return a===b?'':a>b?'tri':'circle';
  };
}
function dataset(root){
  let A,B,history;
  const reset=()=>{A=initial.map(x=>[...x]);B=initial.map(x=>[...x]);history=[];};
  const renderRow=(rs)=>rs.map(([c,s,label],i)=>`<tr><td>${E(shapeText(c,s))}</td><td><select aria-label="Метка карточки Б ${i+1}" data-label="${i}">${opts(sh,label,'Выбери метку')}</select></td><td>${button('remove','Удалить',`data-index="${i}" aria-label="Удалить карточку Б ${i+1}"`)}</td></tr>`).join('');
  const draw=()=>setShell(root,'Испытай два набора примеров','Набор А: красные треугольники и синие круги. Набор Б начнётся с тех же карточек. Сначала проверь А, затем добавь в Б <strong>зелёный треугольник</strong> и <strong>жёлтый круг</strong>, подпиши и проверь Б. Измени одну верную метку, проверь Б снова, затем исправь.',
   '<p class="b-small">Это простая учебная модель, а не настоящий ИИ: она для каждого цвета или формы выбирает самую частую метку. При равенстве или неизвестном признаке ответ «не знаю».</p>'+
   table(['Фигура','Метка'],A.map(([c,s,l])=>[shapeText(c,s),lookup(sh,l)]),'Набор А (эталон для сравнения)')+
   '<div class="b-actions">'+button('runA','Проверить набор А')+'</div>'+
   '<div data-dataset></div>'+captioned('Добавить пример в набор Б',[select('color','Цвет',col),select('shape','Форма',sh),select('label','Метка ученика',sh)])+
   '<div class="b-actions">'+button('add','Добавить карточку')+button('runB','Проверить набор Б')+button('verify','Проверить мой эксперимент')+button('reset','Начать заново')+'</div><div data-experiment></div>');
  const paint=()=>{el('[data-dataset]',root).innerHTML='<div class="b-table-wrap"><table><caption>Набор Б (редактируемый)</caption><thead><tr><th scope="col">Фигура</th><th scope="col">Метка</th><th scope="col">Действие</th></tr></thead><tbody>'+renderRow(B)+'</tbody></table></div>';};
  const results=(rows,kind)=>{
    const fc=featureClassifier(rows,0),fs=featureClassifier(rows,1);
    const counts=[0,0];const observations=testSet.map(([c,s,l])=>{
      const p=fc(c),q=fs(s);counts[0]+=(p===l);counts[1]+=(q===l);
      return [shapeText(c,s),lookup(sh,l),p?lookup(sh,p):'не знаю',q?lookup(sh,q):'не знаю'];
    });
    const diverse=rows.some(([c,s,l])=>c==='green'&&s==='tri')&&rows.some(([c,s,l])=>c==='yellow'&&s==='circle');
    const errors=rows.filter(([,s,l])=>s!==l).length;
    history.push({kind,diverse,errors,counts});
    el('[data-experiment]',root).innerHTML=table(['Новая фигура','Верная метка','Модель по цвету','Модель по форме'],observations,'Проверка набора '+kind)+
      table(['Запуск','Разноцветные примеры','Ошибочные метки','Цвет: верно из 4','Форма: верно из 4'],history.map((h,i)=>[i+1+'. '+h.kind,h.diverse?'есть':'нет',h.errors,...h.counts]),'Журнал эксперимента');
  };
  reset();draw();paint();
  handle(root,(a,b)=>{
    if(a==='reset'){reset();draw();paint();}
    if(a==='add'){
      const c=val(root,'color'),s=val(root,'shape'),l=val(root,'label');
      if(B.length>=12)return output(root,[[false,'В учебном наборе помещается до 12 карточек. Удали лишний повтор.']]);
      if(!c||!s||!l)return output(root,[[false,'Выбери цвет, форму и метку для новой карточки.']]);
      B.push([c,s,l]);paint();el('[name="color"]',root).focus();output(root,[[true,'Пример добавлен в набор Б.']]);
    }
    if(a==='remove'){B.splice(Number(b.dataset.index),1);paint();el('[data-act="add"]',root).focus();clear(root);}
    if(a==='runA'||a==='runB'){
      const rows=a==='runA'?A:B;
      if(!rows.length||rows.some(r=>!r[2]))return output(root,[[false,'Для запуска нужна хотя бы одна карточка и метка на каждой карточке.']]);
      results(rows,a==='runA'?'А':'Б');clear(root);
    }
    if(a==='verify'){
      const i=history.findIndex(h=>h.kind==='А'),j=history.findIndex((h,n)=>n>i&&h.kind==='Б'&&h.diverse&&h.errors===0&&h.counts[1]===4),
       k=history.findIndex((h,n)=>n>j&&h.kind==='Б'&&h.diverse&&h.errors===1);
      const clean=B.length&&B.every(([,s,l])=>s===l);
      output(root,[[i>=0,i>=0?'У тебя есть результат на исходном наборе А.':'Сначала проверь набор А.'],
       [i>=0&&j>=0,i>=0&&j>=0?'Ты проверил разнообразный набор Б с правильными метками.':'Добавь две указанные карточки с правильными метками и проверь Б после набора А.'],
       [j>=0&&k>=0&&Boolean(clean),j>=0&&k>=0&&clean?'Ты проверил набор с одной ошибочной меткой и исправил её. Одна ошибка не всегда меняет итог: сравни прогнозы и число верных ответов в журнале.':'После правильного запуска измени одну метку (не форму), проверь Б и верни правильную метку.']]);
    }
  },e=>{if(e.matches('[data-label]')){B[Number(e.dataset.label)][2]=e.value;clear(root);}});
}
function devices(root){
  const uses=[['storage','Хранит файлы после отключения'],['ram','Хранит открытые данные для работы; при отключении они теряются'],['cpu','Обрабатывает команды и данные'],['cache','Держит часто нужные процессору данные ближе к нему'],['rom','Хранит микропрограмму для запуска'],['board','Соединяет устройства и даёт им обмениваться данными']];
  const parts=[['cpu','ЦП'],['ram','ОЗУ'],['cache','Кэш'],['storage','Накопитель'],['rom','ПЗУ / память микропрограммы'],['board','Материнская плата']];
  let memory, disk, ran, phase;
  const reset=()=>{memory=null;disk='◻ Контур';ran={lost:false,kept:false};phase='';};
  const draw=()=>setShell(root,'Собери схему и проследи путь файла','Сопоставь узлы и их функции. Затем открой рисунок, измени его и отключи питание <strong>без сохранения</strong>. Повтори, но на этот раз сохрани рисунок перед отключением.',
    captioned('Как работает системный блок',parts.map(([id,label])=>select('p'+id,label,uses)))+
    '<p class="b-small">ЦП в этой модели: 4 ядра, 3 ГГц. Это пример характеристик, а не оценка скорости.</p>'+
    '<div data-device-state></div><div class="b-actions">'+button('open','Открыть рисунок')+button('edit','Добавить солнце / убрать солнце')+button('write','Сохранить')+button('power','Отключить питание')+'</div>'+
    '<p data-device-event class="b-note" aria-live="polite"></p><div class="b-actions">'+button('check','Проверить схему и опыты')+button('reset','Начать заново')+'</div>');
  const paint=()=>{
    el('[data-device-state]',root).innerHTML=table(['Где','Что находится сейчас'],[['ОЗУ (рабочая версия)',memory===null?'Редактор закрыт':memory],['Накопитель (файл)',disk]],'Состояние рисунка');
    el('[data-act="edit"]',root).disabled=memory===null;el('[data-act="write"]',root).disabled=memory===null;
    el('[data-act="open"]',root).disabled=memory!==null;
    el('[data-act="power"]',root).disabled=memory===null;
    el('[data-device-event]',root).textContent=phase;
  };
  reset();draw();paint();
  handle(root,a=>{
    if(a==='reset'){reset();draw();paint();return;}
    if(a==='open'&&memory===null){
      memory=disk;phase='ОС открыла файл: копия с накопителя теперь в ОЗУ.';
    }
    if(a==='edit'&&memory!==null){
      memory=memory.includes('☀')?'◻ Контур':'◻ Контур + ☀ солнце';phase='ЦП обработал изменение. Рабочая версия в ОЗУ; накопитель ещё не изменился.';
    }
    if(a==='write'&&memory!==null){
      if(memory!==disk){disk=memory;phase='Изменение записано в файл на накопителе.';}else{phase='Рабочая версия уже совпадает с файлом.';}
    }
    if(a==='power'&&memory!==null){
      if(memory!==disk){ran.lost=true;phase='Несохранённая версия исчезла из ОЗУ, прежний файл на накопителе остался.';}
      else if(memory.includes('☀')){ran.kept=true;phase='ОЗУ очистилось. На накопителе осталось изменение: солнце.';}
      else{phase='ОЗУ очистилось. На накопителе остался контур. Чтобы показать сохранение изменения, добавь и сохрани солнце.';}
      memory=null;
    }
    if(a==='check'){
      const missing = parts.filter(([key])=>val(root,'p'+key)!==key).map(([,label])=>label);
      output(root,[[!missing.length,missing.length?'Уточни функции узлов: '+missing.join(', ')+'. Подсказка: раздели обработку, временную и постоянную запись, загрузку компьютера и соединение устройств.':'Каждый узел подписан по функции.'],
        [ran.lost,ran.lost?'В опыте с отключением без сохранения накопитель не изменился.':'Открой, измени и отключи питание, не нажимая «Сохранить».'],
        [ran.kept,ran.kept?'В опыте с сохранением солнце осталось в файле после отключения.':'Добавь солнце, сохрани и только затем отключи питание.']]);return;
    }
    clear(root);paint();
  },e=>{if(e.matches('select'))clear(root);});
}
function computer(root){
  const models=[{id:'А',cores:4,ghz:'3,4',ram:8,ssd:512},{id:'Б',cores:6,ghz:'3,0',ram:16,ssd:256}];
  const briefs=[['Программа','не менее 12 ГБ ОЗУ',12,0],['Архив рисунков','не менее 400 ГБ на SSD',0,400],['Оба одновременно','не менее 12 ГБ ОЗУ и 400 ГБ на SSD',12,400]];
  const choices=[['a','Только А'],['b','Только Б'],['both','Оба подходят'],['none','Ни один']];
  const match=(r,s)=>{
    const a=models[0].ram>=r&&models[0].ssd>=s,b=models[1].ram>=r&&models[1].ssd>=s;
    return a?(b?'both':'a'):(b?'b':'none');
  };
  let saved;
  const draw=()=>setShell(root,'Подбери компьютер под требования','В таблице ёмкость накопителя указана для условно пустого SSD. В каждом случае сначала сделай прогноз, затем задай пороги и запусти сравнение. Запись в отчёт появится, когда пороги совпадут с условиями задачи.',
    table(['Компьютер','Ядра','Частота','ОЗУ','SSD'],models.map(m=>[m.id,m.cores,m.ghz+' ГГц',m.ram+' ГБ',m.ssd+' ГБ']),'Учебные модели')+
    captioned('Измерительный стенд',[
      select('scenario','Для какой задачи',briefs.map((b,i)=>[String(i),b[0]+': '+b[1]])),
      select('prediction','Мой прогноз',choices),
      input('ram','Требуется ОЗУ, ГБ','0, если не требуется','type="number" min="0" max="1024" step="1"'),
      input('disk','Требуется места на SSD, ГБ','0, если не требуется','type="number" min="0" max="4096" step="1"')])+
    '<div class="b-actions">'+button('compare','Запустить сравнение')+'</div><div data-computer-report></div>'+
    captioned('Вывод о процессоре',[select('benchmark','Как честно сравнить скорость?',[['clock','По одной цифре частоты всегда можно выбрать более быстрый'],['test','Запустить одинаковую задачу при сопоставимых условиях и сравнить время'],['disk','Выбрать компьютер с более вместительным SSD']])])+
    '<div class="b-actions">'+button('check','Проверить отчёт')+button('reset','Начать заново')+'</div>');
  const paint=()=>{el('[data-computer-report]',root).innerHTML=table(['Сценарий','Пороги (ОЗУ / SSD)','Мой прогноз','Проверка стендом'],briefs.map(([name,,r,s],i)=>[name,r+' / '+s+' ГБ',saved[i]?lookup(choices,saved[i].pred):'—',saved[i]?lookup(choices,saved[i].result):'—']),'Мой отчёт');};
  saved={};draw();paint();
  handle(root,a=>{
    if(a==='reset'){saved={};draw();paint();}
    if(a==='compare'){
      const key=val(root,'scenario'),pr=val(root,'prediction'),r0=val(root,'ram'),s0=val(root,'disk');
      if(!key||!pr||!r0||!s0)return output(root,[[false,'Выбери сценарий, запиши прогноз и оба числа. Если требования нет, поставь 0.']]);
      const r=Number(r0),s=Number(s0);
      if(!Number.isInteger(r)||!Number.isInteger(s)||r<0||s<0||r>1024||s>4096)return output(root,[[false,'Допустимы целые значения: ОЗУ 0–1024 ГБ, SSD 0–4096 ГБ.']]);
      const result=match(r,s),b=briefs[Number(key)];
      const exact=r===b[2]&&s===b[3];
      if(exact){saved[key]={pred:pr,result};paint();}
      const comp=models.map(m=>m.id+': '+m.ram+' '+(m.ram>=r?'≥':'<')+' '+r+' ГБ ОЗУ; '+m.ssd+' '+(m.ssd>=s?'≥':'<')+' '+s+' ГБ SSD').join('. ');
      output(root,[[pr===result,'С этими порогами: '+lookup(choices,result)+'. '+comp+'.'],
        [exact,exact?(pr===result?'Прогноз совпал; сохранили запись в отчёте.':'Прогноз расходится с результатом. Разбери числа и повтори запуск.'):'Результат виден, но пороги отличаются от условий сценария. Для отчёта используй его требования.']]);
    }
    if(a==='check'){
      const rows=briefs.map(([name],i)=>[Boolean(saved[i]&&saved[i].pred===saved[i].result),name+': '+(!saved[i]?'сначала проведи сравнение и запиши результат.':saved[i].pred===saved[i].result?'прогноз подтверждён.':'пересмотри рекомендацию по числам в таблице.')]);
      const test=val(root,'benchmark')==='test';
      output(root,[...rows,[test,test?'Проверка скорости опирается на одинаковую задачу, не только на ГГц.':'Частота и число ядер не доказывают, кто быстрее в любой задаче. Выбери сравнение, которое действительно измеряет скорость.']]);
    }
  },()=>{clear(root);});
}
const vSources={
  7:[['text','черновик.txt','Заметки о школьном саде.'],['image','рисунок.png','Учебная схема клумбы (условное изображение).']],
  8:[['notice','текст.txt','Объявление о выставке.'],['first','картинка1.png','Иллюстрация 1 (условное изображение).'],['second','картинка2.png','Иллюстрация 2 (условное изображение).']]
};
function files(root,num){
  const sources=vSources[num], is8=num===8;
  let dirs,items,serial,opened,didLoss;
  const norm=n=>n.replace(/\\/g,'/').split('/').map(s=>s.trim()).join('/').normalize('NFC').toLocaleLowerCase('ru-RU');
  const key=n=>n.normalize('NFC').toLocaleLowerCase('ru-RU');
  const valid=s=>s.length>=2&&s.length<=45&&/^[\p{L}\p{N}][\p{L}\p{N} _-]*$/u.test(s);
  const path=id=>{
    const d=dirs.find(o=>o.id===id);if(!d||!d.id)return '';
    return (path(d.parent)?path(d.parent)+'/':'')+d.name;
  };
  const fname=f=>f.base+f.ext;
  const fpath=f=>(path(f.dir)?path(f.dir)+'/':'')+fname(f);
  const extOf=name=>name.slice(name.lastIndexOf('.'));
  const stem=name=>name.slice(0,name.lastIndexOf('.'));
  const reset=()=>{
    dirs=[{id:0,parent:null,name:'Рабочая область'}];
    items=sources.map(([source,n,body])=>({id:source,base:stem(n),original:stem(n),ext:extOf(n),dir:0,body}));
    serial=1;opened=null;didLoss=false;
  };
  const draw=()=>setShell(root,is8?'Самопроверка: разложи файлы выставки':'Наведи порядок в папке проекта',
    (is8?'Самостоятельная тренировка, не СОР. Придумай свою папку проекта и внутри раздели объявление и иллюстрации на две папки. Дай всем файлам новые понятные имена. Впиши относительные пути к объявлению и одной иллюстрации.':'В рабочей области создай «Сад_проект», а внутри неё «Тексты» и «Рисунки». Переименуй учебные копии: «школьный_сад.txt» и «схема_клумбы.png». Разложи их по папкам, затем впиши оба пути.')+
    ' Это виртуальные файлы. Программа не читает и не изменяет файлы твоего устройства.',
    '<div data-file-tree></div>'+
    captioned('Создать папку',[select('folderParent','Где создать',[]),input('dirName','Имя папки','Например: Мой_проект','maxlength="45"')],
      '<p class="b-small">Из разрешённых знаков: буквы, цифры, пробел, дефис и подчёркивание.</p>')+
    '<div class="b-actions">'+button('mkdir','Создать папку')+'</div>'+
    captioned('Работать с копией',[
      select('selectedFile','Файл',[]),input('baseName','Новое имя без расширения','Например: макет_сада','maxlength="45"'),select('fileDest','Папка назначения',[])])+
    '<div class="b-actions">'+button('rename','Переименовать')+button('move','Переместить')+button('inspect','Открыть выбранную копию')+'</div><p data-file-note aria-live="polite" class="b-note"></p><div data-file-preview></div>'+
    captioned('Запиши пути от рабочей области',[
      input('pathText',is8?'Путь к объявлению .txt':'Путь к тексту .txt','Папка/Подпапка/имя.txt','maxlength="180"'),
      input('pathImage',is8?'Путь к любой иллюстрации .png':'Путь к рисунку .png','Папка/Подпапка/имя.png','maxlength="180"')])+
    (is8?'<div data-ram-simulation></div>':'')+
    '<div class="b-actions">'+button('check','Проверить работу')+button('download','Скачать дерево и пути','disabled')+button('reset','Начать заново')+'</div>');
  const paint = () => {
    const tree=id=>{
      const children=dirs.filter(d=>d.parent===id).map(d=>`<li><span>📁 ${E(d.name)}/</span>${tree(d.id)}</li>`);
      const fs=items.filter(f=>f.dir===id).map(f=>`<li><span>📄 ${E(fname(f))}</span></li>`);
      return children.length||fs.length?'<ul>'+[...children,...fs].join('')+'</ul>':'<p class="b-small">Пока пусто</p>';
    };
    el('[data-file-tree]',root).innerHTML='<div class="b-tree"><strong>📂 Рабочая область/</strong>'+tree(0)+'</div>';
    const names=dirs.map(d=>[String(d.id),path(d.id)||'Рабочая область']);
    ['folderParent','fileDest','selectedFile'].forEach(name=>{
      const target=el(`[name="${name}"]`,root);
      const current=target.value,entries=name==='selectedFile'?items.map(f=>[f.id,fpath(f)]):names;
      target.innerHTML=opts(entries,current);
    });
    if(is8){
      const d=items[0];
      el('[data-ram-simulation]',root).innerHTML='<fieldset><legend>Опыт: ОЗУ и накопитель</legend><p>Открой объявление, добавь учебную правку, не сохраняй. Перед отключением питания сравни обе версии.</p>'+
        table(['Состояние','Текст'],[['На виртуальном накопителе',d.body],['В виртуальном ОЗУ',opened?.text??'Редактор закрыт']], 'Что где хранится')+
        '<div class="b-actions">'+button('ramOpen','Открыть объявление',opened?'disabled':'')+button('ramEdit','Добавить правку',!opened||opened.text!==d.body?'disabled':'')+button('ramPower','Отключить питание',!opened?'disabled':'')+'</div></fieldset>';
    }
  };
  const note=t=>el('[data-file-note]',root).textContent=t;
  const preview=f=>{
    const place=el('[data-file-preview]',root);
    if(!f){place.textContent='';return;}
    const drawing=f.id==='image'?'<rect x="25" y="22" width="150" height="65" rx="12" fill="#c7e5da" stroke="#427c65" stroke-width="3"/><path d="M55 80V30m45 50V30m45 50V30M38 55H162" stroke="#427c65" stroke-width="2"/>':
        f.id==='first'?'<circle cx="100" cy="55" r="42" fill="#f5dcad" stroke="#926121" stroke-width="4"/><path d="M68 55h64M100 23v64" stroke="#926121" stroke-width="3"/>':
        '<path d="M35 89 100 15l65 74z" fill="#dec8f4" stroke="#6b448e" stroke-width="4"/><circle cx="100" cy="61" r="11" fill="#6b448e"/>';
    const demo=f.ext==='.png'?'<svg width="200" height="110" viewBox="0 0 200 110" role="img" aria-label="'+E(f.body)+'">'+drawing+'</svg>':'<p>'+E(f.body)+'</p>';
    place.innerHTML='<div class="b-file-preview"><strong>'+E(fname(f))+'</strong>'+demo+'</div>';
  };
  const found=f=>f.id===val(root,'selectedFile');
  const findPath=(name,pred)=>items.find(f=>norm(fpath(f))===norm(val(root,name))&&pred(f));
  const disable=()=>{clear(root);preview(null);el('[data-act="download"]',root).disabled=true;};
  reset();draw();paint();
  handle(root,a=>{
    if(a==='reset'){reset();draw();paint();return;}
    const f=items.find(found);
    if(a==='mkdir'){
      const n=val(root,'dirName'),p=val(root,'folderParent');
      if(!p||!valid(n))return output(root,[[false,'Выбери, где создать папку, и введи имя из 2–45 букв, цифр, пробелов, дефисов или подчёркиваний.']]);
      if(dirs.some(d=>d.parent===Number(p)&&key(d.name)===key(n))||items.some(item=>item.dir===Number(p)&&key(fname(item))===key(n)))return output(root,[[false,'В этой папке уже есть элемент с таким именем.']]);
      if(dirs.length>=30)return output(root,[[false,'Рабочая область достигла предела в 29 учебных папок. Чтобы начать с чистого дерева, нажми «Начать заново».']]);
      dirs.push({id:serial++,parent:Number(p),name:n});el('[name="dirName"]',root).value='';disable();paint();note('Папка «'+n+'» создана.');return;
    }
    if(a==='inspect'&&f){note(fpath(f)+' · Тип: '+f.ext);preview(f);return;}
    if(['rename','move','inspect'].includes(a)&&!f)return output(root,[[false,'Сначала выбери файл в списке «Файл».']]);
    if(a==='rename'){
      const n=val(root,'baseName');
      if(!valid(n))return output(root,[[false,'Введи новое имя без точки и расширения. Расширение '+f.ext+' сохраняется автоматически.']]);
      if(items.some(other=>other!==f&&other.dir===f.dir&&key(fname(other))===key(n+f.ext)))return output(root,[[false,'В этой папке уже есть файл с таким именем и расширением.']]);
      f.base=n;el('[name="baseName"]',root).value='';disable();paint();note('Файл переименован: '+fpath(f)+'.');return;
    }
    if(a==='move'){
      const p=val(root,'fileDest');
      if(!p)return output(root,[[false,'Выбери папку назначения.']]);
      if(items.some(other=>other!==f&&other.dir===Number(p)&&key(fname(other))===key(fname(f))))return output(root,[[false,'В папке назначения уже есть файл с таким именем. Исходный файл не перемещён.']]);
      f.dir=Number(p);disable();paint();note('Файл перемещён: '+fpath(f)+'.');return;
    }
    if(a==='ramOpen'){opened={text:items[0].body};disable();paint();note('Копия объявления открыта в ОЗУ.');el('[data-act="ramEdit"]',root).focus();return;}
    if(a==='ramEdit'&&opened){opened.text=items[0].body+' Добавлена новая строка.';disable();paint();note('Изменилась только версия в ОЗУ.');el('[data-act="ramPower"]',root).focus();return;}
    if(a==='ramPower'&&opened){
      if(opened.text!==items[0].body)didLoss=true;
      opened=null;disable();paint();note('ОЗУ очистилось. Сохранённый файл не изменился.');el('[data-act="ramOpen"]',root).focus();return;
    }
    if(a==='download'){
      const copy=items.map(f=>fpath(f)).join('\n')+'\n\nМои пути:\n'+val(root,'pathText')+'\n'+val(root,'pathImage')+(is8?'\n\nОпыт: несохранённая правка была в ОЗУ и исчезла при отключении. На накопителе осталась прежняя версия.':'');
      save('Учебное_дерево_урок_'+num+'.txt',copy);
    }
    if(a==='check'){
      const t=items[0],pictures=items.slice(1);
      const haveTree=is8?
        (t.dir!==0&&pictures.every(f=>f.dir===pictures[0].dir)&&pictures[0].dir!==0&&t.dir!==pictures[0].dir&&dirs.find(d=>d.id===t.dir)?.parent!==0&&
          dirs.find(d=>d.id===t.dir)?.parent===dirs.find(d=>d.id===pictures[0].dir)?.parent):
        (norm(path(t.dir))===norm('Сад_проект/Тексты')&&norm(path(pictures[0].dir))===norm('Сад_проект/Рисунки'));
      const namesOK=is8?items.every(f=>key(f.base)!==key(f.original)):
        key(t.base)===key('школьный_сад')&&key(pictures[0].base)===key('схема_клумбы');
      const textOK=Boolean(findPath('pathText',f=>f.ext==='.txt')),imageOK=Boolean(findPath('pathImage',f=>f.ext==='.png'));
      const checks=[[haveTree,haveTree?'Текст и изображения разложены по нужным папкам.':is8?'В одной папке проекта нужны две подпапки: объявление отдельно, обе иллюстрации вместе.':'Проверь вложенность: «Тексты» и «Рисунки» должны находиться внутри «Сад_проект».'],
        [namesOK,namesOK?'Копии переименованы, их форматы сохранены.':is8?'Дай каждому файлу новое понятное имя без расширения. Формат сохранится автоматически.':'Сверь имена: школьный_сад.txt и схема_клумбы.png.'],
        [textOK,textOK?'Первый путь открывает существующий .txt.':'Первый путь пока не ведёт к тексту. Запиши папки через / и закончи именем с .txt.'],
        [imageOK,imageOK?'Второй путь открывает существующий .png.':'Второй путь пока не ведёт к иллюстрации. Запиши папки через / и закончи именем с .png.']];
      if(is8)checks.push([didLoss,didLoss?'В опыте ты изменил текст в ОЗУ, отключил питание и сохранил исходный файл на накопителе.':'Выполни опыт: открой объявление, внеси правку и отключи питание без сохранения.']);
      output(root,checks);el('[data-act="download"]',root).disabled=!checks.every(x=>x[0]);
    }
  },e=>{if(['pathText','pathImage'].includes(e.name))disable();});
}
const labs={1:plan,2:risks,3:contexts,4:dataset,5:devices,6:computer,7:r=>files(r,7),8:r=>files(r,8)};
const init=()=>all('[data-lab][data-lesson]',document).forEach(root=>{
  const run=labs[root.dataset.lesson];if(run&&!root.dataset.basicsReady){root.dataset.basicsReady='1';run(root);}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
