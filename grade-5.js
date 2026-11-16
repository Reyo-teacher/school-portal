/* All lesson links/content are static HTML; this only enhances catalog navigation. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const rows = [...document.querySelectorAll('[data-lesson]')];
  const cards = [...document.querySelectorAll('[data-section-card]')];
  const titles = new Map(cards.map(card => [card.dataset.sectionCard, card.querySelector('strong').textContent]));
  const normalize = text => text.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
  let section = null;
  let quarter = 0;
  let view = 'sections';

  function readHash() {
    const match = /^#(ch\d+|all|q[1-4])(?:-q([1-4]))?$/.exec(location.hash);
    section = match && titles.has(match[1]) ? match[1] : null;
    quarter = match ? Number(match[2] || (/^q/.test(match[1]) ? match[1].slice(1) : 0)) : 0;
    view = match && (section || match[1] === 'all' || /^q/.test(match[1])) ? 'lessons' : 'sections';
    $('quarter-filter').value = String(quarter);
  }

  function render() {
    const query = normalize($('lesson-search').value);
    let count = 0;
    for (const row of rows) {
      const matches = (!section || row.dataset.section === section)
        && (!quarter || Number(row.dataset.quarter) === quarter)
        && (!query || normalize(row.dataset.search).includes(query) || Number(query) === Number(row.dataset.lesson));
      row.hidden = !matches;
      if (matches) count++;
    }
    const showLessons = view === 'lessons' || !!query;
    $('sections').hidden = showLessons;
    $('lessons').hidden = !showLessons;
    $('sections-view').setAttribute('aria-pressed', String(!showLessons));
    $('lessons-view').setAttribute('aria-pressed', String(showLessons));
    $('catalog-title').textContent = section ? titles.get(section) : query ? 'Результаты поиска' : showLessons ? (quarter ? `${quarter} четверть` : 'Все уроки по порядку') : 'Разделы курса';
    $('result-count').textContent = showLessons ? `Уроков: ${count}` : '14 разделов, включая повторение и оценивание';
    $('empty-state').hidden = !showLessons || count > 0;
  }

  function navigate(hash) {
    if (location.hash === hash) {
      readHash(); render();
    } else location.hash = hash;
  }
  $('lesson-search').addEventListener('input', render);
  $('quarter-filter').addEventListener('change', () => {
    const q = Number($('quarter-filter').value);
    navigate(section ? `#${section}${q ? '-q' + q : ''}` : q ? `#q${q}` : '#all');
  });
  $('sections-view').addEventListener('click', () => {
    $('lesson-search').value = ''; navigate('');
  });
  $('lessons-view').addEventListener('click', () => navigate(quarter ? `#q${quarter}` : '#all'));
  window.addEventListener('hashchange', () => { readHash(); render(); });
  $('catalog-tools').hidden = false;
  $('catalog-tabs').hidden = false;
  readHash(); render();
})();
