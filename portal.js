/* ============================================================
   portal.js — общий тренажёр портала Логунова Г.В.
   На странице темы нужно:
     1) <div id="trainer"></div>  — сюда встанет тренажёр
     2) подключить style.css и portal.js
     3) вызвать Trainer.start({ G, LV, code, title, mins })
        G     — массив функций-генераторов заданий
        LV    — уровни заданий: ['a','a','b','c', ...]
        code  — подпись для карточки, например '5 класс · Тема 1.1'
        title — название темы
        mins  — минуты на уровни, например { a: 8, b: 10, c: 7 }
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = a => a[rnd(0, a.length - 1)];

  const BADGE = { a: ['🟢 Лёгкое', 'badge-a'], b: ['🟠 Среднее', 'badge-b'], c: ['🟣 Сложное', 'badge-c'] };
  const STARS = { a: '★', b: '★★', c: '★★★' };
  const CHEER = ['Супер! Так держать! 🎉', 'Отлично! Ты настоящий математик!', 'Верно! Звёздочка твоя ⭐', 'Блестяще! Едем дальше!', 'Класс! Точно в цель! 🎯'];
  const OOPS = ['Почти! Попробуй ещё раз 💪', 'Не беда, ошибки помогают учиться. Ещё раз!', 'Давай проверим вычисления 🔍'];
  const RANKS = [[0, '🌱 Новичок'], [30, '🧮 Счетовод'], [70, '📐 Математик'], [120, '🚀 Мастер чисел'], [200, '👑 Гений чисел']];
  const KEY = 'portal_logunov_1_1_xp', NAME_KEY = 'portal_logunov_name';   // очки общие для всего портала

  function start(cfg) {
    const G = cfg.G, LV = cfg.LV, mins = cfg.mins || { a: 8, b: 10, c: 7 };
    let xp = 0, streak = 0, state = [], t0 = 0, timer = 0, variant = 0;
    try { xp = +localStorage.getItem(KEY) || 0; } catch (e) { /* localStorage может быть недоступен */ }

    /* ---------- Разметка тренажёра ---------- */
    $(cfg.mount || '#trainer').innerHTML = `
      <p>Каждый раз задания новые. Кнопка <b>↻</b> даст другое задание. За каждое верное решение ты получаешь звёздочку и очки, а очки общие для всего портала.</p>
      <div class="lesson">⏱ <b>Время на практику:</b> 🟢 лёгкие ~${mins.a} мин (обязательно) · 🟠 средние ~${mins.b} мин · 🟣 сложные ~${mins.c} мин (по желанию). Всего около ${mins.a + mins.b + mins.c} минут урока.</div>
      <div class="coach">
        <div class="coach-top"><span class="owl" id="owl">🦉</span><div class="bubble" id="say">Привет! Я сова Мудрик. Решай задания, а я буду болеть за тебя!</div></div>
        <div class="coach-stats"><span id="st-rank"></span><span id="st-xp"></span><span id="st-streak"></span></div>
        <div class="path" id="path" aria-label="Решённые задания"></div>
      </div>
      <div class="filter-container">
        <button class="filter-btn active" data-f="all">Все задания</button>
        <button class="filter-btn" data-f="a">🟢 Лёгкие</button>
        <button class="filter-btn" data-f="b">🟠 Средние</button>
        <button class="filter-btn" data-f="c">🟣 Сложные</button>
        <button class="filter-btn" id="renew-all" title="Заменить все задания новыми">🔄 Новый набор</button>
      </div>
      <div id="tasks-container"></div>
      <div id="win">🏆 Все ${LV.length} звёздочек твои! Ты настоящий математик!<br><br><button class="check-btn" id="win-btn">Новый набор заданий</button></div>
      <div class="result">
        <h3>📊 Мой результат</h3>
        <label>Имя: <input id="r-name" class="task-input" maxlength="40" placeholder="Напиши своё имя" autocomplete="off"></label>
        <div class="r-grid">
          <div><b id="r-done">0</b><small>решено</small></div>
          <div><b id="r-first">0</b><small>с первой попытки</small></div>
          <div><b id="r-time">0:00</b><small>время</small></div>
          <div><b id="r-xp">+0</b><small>очков за урок</small></div>
        </div>
        <p class="small">Покажи этот экран учителю в конце урока.</p>
      </div>
      <div class="tools">
        <b>Для учителя:</b>
        <button class="tool-btn" id="p-card">📄 Рабочая карточка (PDF)</button>
        <button class="tool-btn" id="p-key">📄 Карточка с ответами</button>
        <span class="small">Карточка собирается из заданий на экране. Нажми ↻ или «Новый набор», чтобы получить другие числа. В окне печати выбери «Сохранить как PDF».</span>
      </div>`;
    const ps = document.createElement('div'); ps.id = 'print-sheet'; document.body.appendChild(ps);   // лист для печати
    const box = $('#tasks-container');

    /* ---------- Помощник-сова ---------- */
    function coach(msg) {
      $('#say').textContent = msg;
      const o = $('#owl'); o.classList.remove('hop'); void o.offsetWidth; o.classList.add('hop');
    }

    /* ---------- Таймер урока ---------- */
    function tick() { const s = Math.floor((Date.now() - t0) / 1000); $('#r-time').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function startTimer() { if (t0) return; t0 = Date.now(); timer = setInterval(tick, 1000); }
    function resetTimer() { clearInterval(timer); t0 = 0; timer = 0; $('#r-time').textContent = '0:00'; }

    /* ---------- Панель и результат ---------- */
    function stats() {
      const done = state.filter(s => s.solved), all = done.length === LV.length;
      $('#st-rank').textContent = [...RANKS].reverse().find(r => xp >= r[0])[1];
      $('#st-xp').textContent = '⭐ ' + xp + ' очков';
      $('#st-streak').textContent = '🔥 Серия: ' + streak;
      $('#path').innerHTML = LV.map((_, i) => `<span class="dot${state[i] && state[i].solved ? ' done' : ''}">${state[i] && state[i].solved ? '⭐' : i + 1}</span>`).join('');
      $('#r-done').textContent = `${done.length} из ${LV.length}`;
      $('#r-first').textContent = done.filter(s => s.tries === 1).length;
      $('#r-xp').textContent = '+' + done.reduce((a, s) => a + s.gain, 0);
      $('#win').style.display = all ? 'block' : 'none';
      if (all && timer) { clearInterval(timer); timer = 0; tick(); }       // все решено: время остановлено
    }

    /* ---------- Задания ---------- */
    function build() {
      box.innerHTML = LV.map((l, i) => `
        <div class="task-box" id="t${i}" data-i="${i}" data-level="${l}">
          <div class="task-header"><span class="task-badge ${BADGE[l][1]}">${BADGE[l][0]}</span><span class="num">Задание №${i + 1}</span></div>
          <div class="task-condition"><span class="ic"></span><span class="tx"></span></div>
          <div class="vis"></div>
          <div class="task-controls">
            <input type="text" class="task-input" inputmode="numeric" autocomplete="off" aria-label="Ответ к заданию ${i + 1}">
            <button class="check-btn">Проверить</button>
            <button class="refresh" title="Другое задание" aria-label="Другое задание">↻</button>
          </div>
          <div class="feedback" aria-live="polite"></div>
        </div>`).join('');
      LV.forEach((_, i) => fresh(i));
    }

    function fresh(i) {                       // новое задание в ячейке i
      state[i] = { t: G[i](), tries: 0, solved: false, gain: 0 };
      variant = rnd(1000, 9999);              // номер варианта для карточки
      const b = $('#t' + i), t = state[i].t, inp = b.querySelector('input'), f = b.querySelector('.feedback'), c = b.querySelector('.check-btn');
      b.querySelector('.ic').textContent = t.icon;
      b.querySelector('.tx').innerHTML = t.html;
      b.querySelector('.vis').innerHTML = t.tiles || t.vis || '';
      inp.value = ''; inp.readOnly = false; inp.placeholder = t.ph || 'Введи ответ…';
      c.disabled = false; c.textContent = 'Проверить';
      f.textContent = ''; f.className = 'feedback';
      b.classList.remove('solved');
      stats();
    }

    function say(b, cls, html) { const f = b.querySelector('.feedback'); f.className = 'feedback ' + cls; f.innerHTML = html; }

    function check(i) {
      const s = state[i], b = $('#t' + i), inp = b.querySelector('input');
      const v = inp.value.replace(/[\s\u00A0]/g, '');
      if (s.solved) return;
      if (!v) return say(b, 'incorrect', '⚠️ Сначала введи ответ!');
      s.tries++;
      if (v === s.t.ans) {
        s.solved = true; streak++;
        s.gain = (s.tries === 1 ? 10 : 5) + (streak >= 3 ? 2 : 0);          // бонус за серию
        xp += s.gain; try { localStorage.setItem(KEY, xp); } catch (e) {}
        b.classList.add('solved'); inp.readOnly = true;
        const btn = b.querySelector('.check-btn'); btn.disabled = true; btn.textContent = '✓ Верно';
        say(b, 'correct', `🎉 Ответ верный! +${s.gain} очков${streak >= 3 ? ' (бонус за серию 🔥)' : ''}`);
        burst(b); stats();
        coach(state.every(x => x.solved) ? '🏆 Ура! Все звёздочки собраны!' : pick(CHEER));
      } else {
        streak = 0; stats();
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        say(b, 'incorrect', '❌ Пока не то. Подумай ещё!' + (s.tries >= 2 ? `<small>💡 Подсказка от Мудрика: ${s.t.hint}</small>` : ''));
        coach(s.tries >= 2 ? 'Смотри, я оставил подсказку 👇' : pick(OOPS));
      }
    }

    function burst(b) {                       // вспышка эмодзи при верном ответе
      for (let k = 0; k < 14; k++) {
        const e = document.createElement('span');
        e.className = 'burst'; e.textContent = pick(['🎉', '⭐', '✨', '🔢', '💡', '🌈']);
        e.style.setProperty('--dx', rnd(-140, 140) + 'px'); e.style.setProperty('--dy', rnd(-110, 60) + 'px');
        b.appendChild(e); setTimeout(() => e.remove(), 950);
      }
    }

    function renewAll() { streak = 0; resetTimer(); LV.forEach((_, i) => fresh(i)); coach('Новый набор готов! Поехали! 🚀'); }

    /* ---------- Рабочая карточка для печати / PDF ---------- */
    function sheet(withKey) {
      const rows = state.map((s, i) => `
        <div class="ps-task"><div class="ps-n">${i + 1}<small>${STARS[LV[i]]}</small></div>
          <div class="ps-body"><div class="ps-q">${s.t.html}</div>${s.t.tiles || s.t.vis || ''}
            <div class="ps-ans${withKey ? ' key' : ''}">Ответ: ${withKey ? `<b>${s.t.ans}</b>` : '<span class="ps-line w4"></span>'}</div></div></div>`).join('');
      ps.innerHTML = `
        <div class="ps-head"><div><div class="ps-h1">${withKey ? 'Ответы для учителя' : 'Рабочая карточка'}</div><div>${cfg.code}. ${cfg.title}</div></div><div class="ps-var">Вариант № ${variant}</div></div>
        <div class="ps-name">Фамилия, имя: <span class="ps-line w1"></span> Класс: <span class="ps-line w3"></span> Дата: <span class="ps-line w2"></span></div>
        ${rows}
        <div class="ps-foot">Портал Логунова Г.В. · ★ лёгкое, ★★ среднее, ★★★ сложное · числа в каждом варианте разные</div>`;
      document.body.classList.add('printing');
      window.print();
    }
    window.addEventListener('afterprint', () => document.body.classList.remove('printing'));

    /* ---------- События ---------- */
    box.addEventListener('click', e => {
      const t = e.target.closest('.task-box'); if (!t) return;
      const i = +t.dataset.i;
      if (e.target.closest('.check-btn')) check(i);
      if (e.target.closest('.refresh')) {
        const r = e.target.closest('.refresh'); r.classList.remove('spin'); void r.offsetWidth; r.classList.add('spin');
        fresh(i); coach('Новое задание! Посмотрим, что тут 👀');
      }
    });
    box.addEventListener('keydown', e => {   // Enter в поле = «Проверить»
      if (e.key === 'Enter' && e.target.matches('.task-input')) check(+e.target.closest('.task-box').dataset.i);
    });
    box.addEventListener('focusin', startTimer);      // таймер запускается, когда ученик начал работать
    $('#renew-all').addEventListener('click', renewAll);
    $('#win-btn').addEventListener('click', () => { renewAll(); $('#t0').scrollIntoView({ behavior: 'smooth' }); });
    $('#p-card').addEventListener('click', () => sheet(false));
    $('#p-key').addEventListener('click', () => sheet(true));
    document.querySelectorAll('.filter-btn[data-f]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-f]').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.task-box').forEach(t => t.hidden = !(btn.dataset.f === 'all' || t.dataset.level === btn.dataset.f));
    }));
    const nm = $('#r-name');                           // имя ученика помним только в этом браузере
    try { nm.value = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}
    nm.addEventListener('input', () => { try { localStorage.setItem(NAME_KEY, nm.value); } catch (e) {} });

    build();
  }

  window.Trainer = { start };
})();
