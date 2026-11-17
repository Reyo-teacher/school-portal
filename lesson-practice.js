/* Learning practice shared by the two existing grade 5 lessons. No network calls. */
(function (root) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value == null ? '' : value).trim().replace(/[\s\u00a0\u202f]/g, '');
  function fields(task) {
    return task.fields || [{id:'answer', label:task.ph || 'Ответ', answer:task.ans, type:'number'}];
  }
  function grade(task, values) {
    const list = fields(task);
    const missing = list.find(f => normalize(values[f.id]) === '');
    if (missing) return {ok:false, empty:true, field:missing.id, message:'Заполни поле «' + missing.label + '». Попытка не засчитывается.'};
    for (const f of list) {
      const value = normalize(values[f.id]);
      const numeric = f.type !== 'choice';
      if (numeric && !/^\d+$/.test(value)) return {ok:false, empty:true, field:f.id, message:'В поле «' + f.label + '» введи число цифрами, без букв и знаков. Попытка не засчитывается.'};
      if (numeric && value.length > 1 && value[0] === '0') return {ok:false, field:f.id, message:'В записи числа не должно быть лишних нулей слева. Проверь запись.'};
      const correct = numeric ? Number(value) === Number(f.answer) : value === normalize(f.answer);
      if (!correct) return {ok:false, field:f.id, message:(task.feedback && task.feedback(values, f.id)) || f.hint || task.hint || 'Проверь этот шаг и попробуй ещё раз.'};
    }
    return {ok:true, message:task.explanation || 'Ответ и способ решения верны. Проверь себя на другом примере.'};
  }
  function storageGet(key, fallback) {
    try { const raw = root.localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch (_) { return fallback; }
  }
  function storageSet(key, value) { try { root.localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function fingerprint(task) {
    const s = JSON.stringify([task.skill,task.html,fields(task).map(f=>[f.id,f.answer])]);
    let hash = 2166136261;
    for (let i=0;i<s.length;i++) hash = Math.imul(hash ^ s.charCodeAt(i),16777619);
    return (hash>>>0).toString(16);
  }
  function addEvidence(records,skill,id,independent) {
    const stored=records[skill];
    const record=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{independent:[],supported:[]};
    if(!Array.isArray(record.independent))record.independent=[];
    if(!Array.isArray(record.supported))record.supported=[];
    if(record.independent.includes(id)||record.supported.includes(id))return false;
    record[independent?'independent':'supported'].push(id);records[skill]=record;return true;
  }
  const LEVEL_NAMES = {a:'Основа', b:'Применение', c:'По желанию: углубление'};
  const round5 = x => Math.max(5, Math.round(x / 5) * 5);
  /* Рабочая карточка для печати. Чистая функция: на входе данные, на выходе HTML.
     withKey=true даёт лист ответов для учителя (с пояснениями). */
  function buildSheet(info) {
    const {title, code, variant, LV, tasks, withKey, exit} = info;
    const cnt = {a:0, b:0, c:0}; LV.forEach(l => cnt[l]++);
    const core = round5(cnt.a * 1.5 + cnt.b * 2.5 + (exit && exit.items ? exit.items.length * 1.2 : 0)), extra = round5(cnt.c * 3);   // примерное время, мин
    let html = `<div class="ps-head"><div><div class="ps-h1">${withKey ? 'Ответы для учителя' : 'Рабочая карточка'}</div><div>${escape(title)}${code ? ' · ' + escape(code) : ''}</div></div><div class="ps-var">Вариант № ${variant}</div></div>`;
    if (!withKey) html += `<p class="ps-name">Фамилия, имя: <span class="pe-line wide"></span> Класс: <span class="pe-line short"></span> Дата: <span class="pe-line mid"></span></p>`
      + `<p class="ps-time">Время: основная часть около ${core} мин${cnt.c ? ', углубление по желанию ещё около ' + extra + ' мин' : ''}. Записывай ответы и решения.</p>`;
    let last = '';
    tasks.forEach((t, i) => {
      const l = LV[i];
      if (l !== last) { html += `<h2 class="ps-level">${escape(LEVEL_NAMES[l])}</h2>`; last = l; }
      const list = t.fields || [{id:'answer', label:'Ответ', answer:t.ans, type:'number'}];
      const flds = list.map(f => f.type === 'choice'
        ? `<p class="pe-ans">${escape(f.label)}:</p><ul class="pe-opts">${(f.options || []).map(o => `<li>${withKey && normalize(o.value) === normalize(f.answer) ? '☑' : '☐'} ${escape(o.label)}</li>`).join('')}</ul>`
        : `<p class="pe-ans">${escape(f.label)}: ${withKey ? `<b class="pe-key">${escape(String(f.answer))}</b>` : '<span class="pe-line"></span>'}</p>`).join('');
      const tail = withKey ? (t.explanation ? `<p class="pe-note">Пояснение: ${escape(t.explanation)}</p>` : '') : '<div class="pe-work">Решение</div>';
      html += `<div class="print-exercise"><div class="pe-n">${i + 1}</div><div class="pe-body"><p class="pe-q">${t.html}</p>${t.vis || t.tiles || ''}${flds}${tail}</div></div>`;
    });
    if (exit && exit.items && exit.items.length) {
      html += `<h2 class="ps-level">${escape(exit.title)}</h2>${exit.intro ? `<p class="pe-note">${escape(exit.intro)}</p>` : ''}`;
      exit.items.forEach((it, k) => {
        html += `<div class="print-exercise"><div class="pe-n">С${k + 1}</div><div class="pe-body"><p class="pe-q">${escape(it.q)}</p>`
          + (it.options ? `<ul class="pe-opts">${it.options.map(o => `<li>${withKey && o.value === it.answer ? '☑' : '☐'} ${escape(o.label)}</li>`).join('')}</ul>`
            : `<p class="pe-ans">Ответ: ${withKey ? `<b class="pe-key">${escape(it.answer)}</b>` : '<span class="pe-line"></span>'}</p>`) + `</div></div>`;
      });
    }
    return html + `<div class="ps-foot">Портал Логунова Г.В. · номер варианта на карточке и в листе ответов совпадает</div>`;
  }

  function start(cfg) {
    const mount = document.querySelector(cfg.mount || '#trainer');
    const key = 'portal_logunov_' + cfg.id + '_skills_v2';
    let records = storageGet(key, {});
    if (!records || typeof records !== 'object' || Array.isArray(records)) records = {};
    const state = [];
    let variant = 1000 + Math.floor(Math.random() * 9000);   // номер варианта для карточки
    const levelNames = {a:'Основа',b:'Применение',c:'По желанию: углубление'};
    mount.innerHTML = `<p>Решай в своём темпе. В каждом задании нужно получить ответ, а в заданиях с объяснением — ещё и выбрать основание. Числа в жизненных ситуациях учебные.</p>
      <div class="practice-toolbar"><button type="button" class="filter-btn" data-view="core" aria-pressed="true">Основные задания</button><button type="button" class="filter-btn" data-view="all" aria-pressed="false">Включая углубление</button><button type="button" class="filter-btn" data-action="print">🖨 Рабочая карточка (PDF)</button><button type="button" class="filter-btn" data-action="print-key">🖨 Ответы для учителя</button><button type="button" class="filter-btn" data-action="renew-all">🔄 Новый вариант всех заданий</button></div>
      <div class="practice-tasks"></div>
      <section class="skill-report" aria-label="Результаты по умениям"><h3>Что у меня получается</h3><p>Отмечены выполненные примеры. Для вывода об освоении покажи учителю самостоятельную работу и объяснение.</p><div class="skill-rows"></div><p class="game-xp"></p><p><button type="button" class="filter-btn" data-action="reset-report">Начать учёт умений заново</button></p><p class="reset-status" role="status"></p></section>`;
    const tasks = mount.querySelector('.practice-tasks');
    function report() {
      mount.querySelector('.skill-rows').innerHTML = Object.entries(cfg.skills).map(([id,title]) => {
        const r=records[id] || {}; const independent=Array.isArray(r.independent)?r.independent.length:0; const supported=Array.isArray(r.supported)?r.supported.length:0;
        const status = independent ? 'Самостоятельных примеров: '+independent : supported ? 'Получилось с опорой. Попробуй новый пример самостоятельно.' : 'Пока нет выполненных примеров';
        return `<div class="skill-row"><strong>${escape(title)}</strong><span>${escape(status)}</span></div>`;
      }).join('');
      let xp=0; try {xp=Math.max(0,Number(root.localStorage.getItem('portal_logunov_1_1_xp'))||0);} catch (_) {}
      mount.querySelector('.game-xp').textContent = '⭐ Игровые очки портала: '+xp+'. Это не отметка за урок.';
    }
    function renderTask(i) {
      const s=state[i], t=s.task, level=cfg.LV[i];
      let box=tasks.querySelector(`[data-task="${i}"]`);
      if (!box) {box=document.createElement('section');box.className='task-box';box.dataset.task=i;box.dataset.level=level;tasks.appendChild(box);}
      box.classList.remove('solved');
      const controls=fields(t).map(f=>{
        const id=`${cfg.id}-task-${i}-${f.id}`;
        const input=f.type==='choice'
          ? `<select id="${id}" data-field="${escape(f.id)}"><option value="">Выбери ответ…</option>${f.options.map(o=>`<option value="${escape(o.value)}">${escape(o.label)}</option>`).join('')}</select>`
          : `<input id="${id}" data-field="${escape(f.id)}" type="text" inputmode="numeric" autocomplete="off" maxlength="20" placeholder="${escape(f.placeholder||'Число')}" >`;
        return `<label class="practice-field" for="${id}">${escape(f.label)}${input}</label>`;
      }).join('');
      box.innerHTML=`<div class="task-header"><span class="task-badge badge-${level}">${levelNames[level]}</span><span>Задание ${i+1}</span></div><p class="task-condition">${t.icon||'✏️'} ${t.html}</p>${t.tiles||t.vis||''}<form class="practice-form">${controls}<div class="practice-actions"><button class="check-btn" type="submit">Проверить</button><button class="filter-btn" type="button" data-action="hint">Подсказка</button><button class="filter-btn" type="button" data-action="another">Другой пример</button></div></form><div class="feedback" role="status" aria-live="polite"></div>`;
      const filter=mount.querySelector('[data-view="all"]').getAttribute('aria-pressed')==='true';
      box.hidden=level==='c'&&!filter;
    }
    function fresh(i) {
      const previous=state[i]&&fingerprint(state[i].task); let task=cfg.G[i]();
      for (let n=0;n<10&&fingerprint(task)===previous;n++) task=cfg.G[i]();
      state[i]={task,tries:0,hint:false,solved:false};variant=1000+Math.floor(Math.random()*9000);renderTask(i);
    }
    cfg.G.forEach((_,i)=>fresh(i)); report();
    mount.addEventListener('submit', event=>{
      if (!event.target.matches('.practice-form'))return;
      event.preventDefault();const box=event.target.closest('[data-task]'),i=Number(box.dataset.task),s=state[i];if(s.solved)return;
      const values=Object.fromEntries([...box.querySelectorAll('[data-field]')].map(el=>[el.dataset.field,el.value]));
      const result=grade(s.task,values);if(!result.empty)s.tries++;
      const feedback=box.querySelector('.feedback');feedback.className='feedback '+(result.ok?'correct':'incorrect');feedback.textContent=result.message;
      box.querySelectorAll('[data-field]').forEach(el=>el.setAttribute('aria-invalid',String(!result.ok&&el.dataset.field===result.field)));
      if (!result.ok) {box.querySelector(`[data-field="${result.field}"]`)?.focus();return;}
      s.solved=true;box.classList.add('solved');box.querySelectorAll('[data-field]').forEach(el=>el.disabled=true);box.querySelector('[type="submit"]').disabled=true;
      box.querySelector('[data-action="another"]').textContent='Проверить на другом примере';
      const skill=s.task.skill, id=fingerprint(s.task), independent=s.tries===1&&!s.hint;
      const added=addEvidence(records,skill,id,independent);
      if(added){storageSet(key,records);
        try {const xp=Math.max(0,Number(root.localStorage.getItem('portal_logunov_1_1_xp'))||0);root.localStorage.setItem('portal_logunov_1_1_xp',String(xp+10));}catch(_){}
      }
      box.querySelector('[data-action="hint"]').disabled=true;
      feedback.textContent += independent?' Получилось самостоятельно.':' Ты исправил решение или воспользовался опорой. Теперь попробуй другой пример без подсказки.';
      report();
    });
    /* Самостоятельная работа берётся прямо из страницы (.exit-form), чтобы не дублировать вопросы */
    function exitData() {
      const form = document.querySelector('.exit-form'); if (!form) return null;
      const box = form.closest('.exit-box');
      const items = [...form.querySelectorAll('label')].map(label => {
        const control = label.querySelector('select,input');
        const q = [...label.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        const options = control && control.tagName === 'SELECT' ? [...control.options].filter(o => o.value).map(o => ({value:o.value, label:o.textContent})) : null;
        const ans = control ? control.dataset.exitAnswer : '';
        return {q, options, answer: options ? ans : ans};
      });
      return {title: box && box.querySelector('h3') ? box.querySelector('h3').textContent : 'Самостоятельная работа', intro: box && box.querySelector('p') ? box.querySelector('p').textContent : '', items};
    }
    function printSheet(withKey) {
      let sheet = document.getElementById('practice-print');
      if (!sheet) { sheet = document.createElement('div'); sheet.id = 'practice-print'; document.body.appendChild(sheet); }
      sheet.innerHTML = buildSheet({title:cfg.title, code:cfg.code || '', variant, LV:cfg.LV, tasks:state.map(s => s.task), withKey, exit:exitData()});
      document.body.classList.add('practice-printing'); root.print();
    }
    mount.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.view){const all=button.dataset.view==='all';mount.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='all')===all)));tasks.querySelectorAll('[data-level="c"]').forEach(b=>b.hidden=!all);return;}
      const action=button.dataset.action;
      if(action==='reset-report'){records={};storageSet(key,records);cfg.G.forEach((_,i)=>fresh(i));report();mount.querySelector('.reset-status').textContent='Учёт умений начат заново. Общие игровые очки сохранены.';return;}
      if(action==='print'||action==='print-key'){printSheet(action==='print-key');return;}
      if(action==='renew-all'){cfg.G.forEach((_,i)=>fresh(i));report();return;}
      const box=button.closest('[data-task]');if(!box)return;const i=Number(box.dataset.task),s=state[i];
      if(action==='another')fresh(i);
      if(action==='hint'){s.hint=true;const f=box.querySelector('.feedback');f.className='feedback';f.textContent=s.task.hint||'Вернись к разобранному примеру выше и выполни первый шаг.';}
    });
    root.addEventListener('lesson-evidence',event=>{const d=event.detail;if(!d||d.lesson!==cfg.id||!Object.prototype.hasOwnProperty.call(cfg.skills,d.skill))return;if(addEvidence(records,d.skill,d.id,d.independent)){storageSet(key,records);report();}});
    root.addEventListener('afterprint',()=>document.body.classList.remove('practice-printing'));
    const openExtra=()=>{const d=document.getElementById('extra-practice');if(d&&root.location&&root.location.hash==='#extra-practice')d.open=true;};
    openExtra();root.addEventListener('hashchange',openExtra);
    return {getState:()=>state};
  }
  const api={grade,fields,fingerprint,addEvidence,start,escape,buildSheet};
  root.LessonPractice=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
