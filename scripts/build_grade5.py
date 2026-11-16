"""Generate the grade 5 catalog and one static HTML page per curriculum hour.

Run: python3 scripts/build_grade5.py
Only Python's standard library is required. Edit data/grade-5-curriculum.json,
then regenerate and run python3 -m unittest discover -s tests.
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/grade-5-curriculum.json').read_text(encoding='utf-8'))
LESSONS = DATA['lessons']
SECTIONS = {s['id']: s for s in DATA['sections']}


def e(value):
    return escape(str(value), quote=True)


def lesson_url(lesson):
    """Existing teaching pages are the primary destinations when available."""
    return lesson.get('contentPage', lesson['url'])


def connect_content_page(lesson):
    """Add course navigation without regenerating the original lesson/trainer."""
    n = lesson['number']
    path = ROOT / lesson['contentPage']
    content = path.read_text(encoding='utf-8')
    links = [f'<a href="grade-5.html#{lesson["section"]}" class="back-btn">← К списку уроков</a>']
    if n > 1:
        links.append(f'<a rel="prev" href="{lesson_url(LESSONS[n-2])}" class="back-btn">← Урок {n-1}</a>')
    if n < len(LESSONS):
        links.append(f'<a rel="next" href="{lesson_url(LESSONS[n])}" class="back-btn">Урок {n+1} →</a>')
    block = '\n'.join([
        '<!-- grade5-navigation:start -->',
        f'<nav aria-label="Навигация по урокам" data-curriculum-lesson="{n}">',
        *links, '</nav>',
        f'<p>Урок {n} из 170 · {lesson["quarter"]} четверть</p>',
        '<!-- grade5-navigation:end -->',
    ])
    pattern = r'<!-- grade5-navigation:start -->.*?<!-- grade5-navigation:end -->'
    if re.search(pattern, content, re.S):
        content = re.sub(pattern, lambda _: block, content, count=1, flags=re.S)
    else:
        pattern = r'<a href="grade-5\.html#ch1" class="back-btn">[^<]*</a>'
        content, replacements = re.subn(pattern, lambda _: block, content, count=1)
        if replacements != 1:
            raise ValueError(f'Could not locate course navigation in {path.name}')
    path.write_text(content, encoding='utf-8')


def document(title, body, scripts=''):
    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)} — Портал Логунова Г.В.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="grade-5.css">
</head>
<body>
<div class="wrapper curriculum">
<header><h1 class="teacher-name">Логунов Григорий Владимирович — Математика, 5 класс</h1></header>
<main>{body}</main>
</div>
{scripts}
</body>
</html>
'''


def label(lesson):
    labels = []
    if lesson['assessment']:
        labels.append(lesson['assessment'])
    if lesson['analysis']:
        labels.append('Анализ результатов')
    if not labels and lesson['kind'] == 'review':
        labels.append('Повторение')
    if lesson['kind'] == 'diagnostic':
        labels.append('Мониторинг')
    return ''.join(f'<span class="lesson-tag">{e(t)}</span>' for t in labels)


def repeated(lesson):
    return f" · Занятие {lesson['topicLesson']} из {lesson['topicHours']} по теме" if lesson['topicHours'] > 1 else ''


def catalog():
    cards = []
    for index, section in enumerate(DATA['sections']):
        group = [l for l in LESSONS if l['section'] == section['id']]
        topics = len({l['title'] for l in group})
        cards.append(f'''<a class="section-card tone-{index % 6}" href="#{section['id']}" data-section-card="{section['id']}">
<span class="section-number">{index+1:02}</span><span><strong>{e(section['title'])}</strong>
<small>Тем: {topics} · Уроков: {len(group)}</small></span><span aria-hidden="true">→</span></a>''')
    lesson_links = []
    for lesson in LESSONS:
        searchable = ' '.join([lesson['title'],lesson['objective'],lesson['assessment'],SECTIONS[lesson['section']]['title']])
        lesson_links.append(f'''<li data-lesson="{lesson['number']}" data-section="{lesson['section']}" data-quarter="{lesson['quarter']}" data-search="{e(searchable.lower())}">
<a class="lesson-link" href="{lesson_url(lesson)}"><span class="lesson-number">{lesson['number']:03}</span>
<span class="lesson-copy"><span class="lesson-meta">{lesson['quarter']} четверть{repeated(lesson)}</span>
<strong>{e(lesson['title'])}</strong><span class="lesson-tags">{label(lesson)}</span></span>
<span class="lesson-arrow" aria-hidden="true">→</span></a></li>''')
    body = f'''<section class="card">
<a class="back-btn" href="math.html">← К выбору класса</a>
<div class="course-heading"><div><p class="eyebrow">Курс на {DATA['year']} учебный год</p>
<h2>Математика · 5 класс</h2><p class="course-summary">Шаг за шагом — от повторения до итогового урока.</p></div><span class="course-owl" aria-hidden="true">🦉</span></div>
<div class="course-stats"><span><b>170</b> уроков</span><span><b>11</b> учебных разделов</span><span><b>4</b> четверти</span></div>
<p class="catalog-intro">Каждый урок открывается на отдельной странице. Повторение, мониторинг и оценивание тоже включены в курс.</p>
<div class="catalog-tools" id="catalog-tools" hidden>
<label class="search-label" for="lesson-search">Найти урок<input id="lesson-search" type="search" placeholder="Тема, цель или номер урока" autocomplete="off"></label>
<label for="quarter-filter">Учебный период<select id="quarter-filter"><option value="0">Весь год · 170 уроков</option>
{''.join(f'<option value="{q["number"]}">{q["number"]} четверть · {q["hours"]} уроков</option>' for q in DATA['quarters'])}</select></label>
</div>
<nav class="catalog-tabs" id="catalog-tabs" aria-label="Вид каталога" hidden>
<button type="button" id="sections-view" aria-pressed="true">По разделам</button><button type="button" id="lessons-view" aria-pressed="false">По порядку уроков</button></nav>
<div class="catalog-caption"><h3 id="catalog-title">Разделы курса</h3><p id="result-count" role="status" aria-live="polite">14 разделов, включая повторение и оценивание</p></div>
<div class="section-grid" id="sections">{''.join(cards)}</div>
<div id="lessons"><ol class="lesson-list">{''.join(lesson_links)}</ol></div>
<p class="empty-state" id="empty-state" hidden>Уроки не найдены. Измени запрос или выбери другую четверть.</p>
<noscript><p>Все уроки перечислены ниже разделов. Поиск и фильтры доступны при включённом JavaScript.</p></noscript>
</section>
<aside class="card source-card"><h3>Учебник к курсу</h3><p>{e(DATA['textbook']['authors'])}. «{e(DATA['textbook']['title'])}». {e(DATA['textbook']['publisher'])}, {DATA['textbook']['year']}.</p>
<p>Темы, последовательность и количество уроков — по КТП на {DATA['year']} год. На страницах указаны печатные страницы учебника.</p></aside>'''
    (ROOT/'grade-5.html').write_text(document('5 класс — Математика', body, '<script src="grade-5.js" defer></script>'), encoding='utf-8')


def lesson_page(lesson):
    n = lesson['number']
    if lesson.get('contentPage'):
        connect_content_page(lesson)
        destination = e(lesson_url(lesson))
        body = f'<section class="card"><h2>{e(lesson["title"])}</h2><p><a class="back-btn" href="{destination}">Открыть урок с лекцией и тренажёром →</a></p></section>'
        page = document(f'Урок {n}. {lesson["title"]}', body)
        page = page.replace('</head>', f'<link rel="canonical" href="{destination}">\n<meta http-equiv="refresh" content="0; url={destination}">\n</head>')
        (ROOT/lesson['url']).write_text(page, encoding='utf-8')
        return
    section = SECTIONS[lesson['section']]
    objective = lesson['objective']
    objectives = [x.strip(' ;') for x in re.split(r'(?=5\.\d\.\d\.\d+\s)', objective) if x.strip(' ;')]
    has_codes = bool(re.search(r'5\.\d\.\d\.\d+', objective))
    goals_heading = 'Цели обучения' if has_codes else 'Содержание урока'
    goals = ''.join(f'<li>{e(o)}</li>' for o in objectives)
    reference_items = []
    for ref in lesson['textbook']:
        paragraph = f' · § {ref["paragraphs"]}' if ref['paragraphs'] else ''
        reference_items.append(f'<li><strong>Часть {ref["part"]}{e(paragraph)}</strong><br>Страницы {e(ref["pages"])}</li>')
    if reference_items:
        reference = f'<ul class="textbook-refs">{"".join(reference_items)}</ul><p class="muted">Номера страниц указаны по печатному учебнику. Конкретные упражнения выбирает учитель.</p>'
    elif lesson['kind'] == 'assessment':
        reference = '<p>Для оценивания используй задания, которые выдаст учитель на уроке.</p>'
    elif lesson['kind'] == 'analysis':
        reference = '<p>Разбери проверенную работу: найди ошибки, объясни верное решение и выполни исправления.</p>'
    else:
        reference = '<p>Для этого урока отдельный параграф не назначен. Материалы для повторения и мониторинга выдаст учитель.</p>'
    material = ''
    if lesson['materials']:
        material = '<section class="card"><h3>Лекция и тренажёр</h3>' + ''.join(f'<a class="material-link" href="{m["url"]}">{e(m["title"])} <span aria-hidden="true">→</span></a>' for m in lesson['materials']) + '</section>'
    elif lesson['kind'] not in ('assessment', 'analysis', 'diagnostic'):
        material = '<p class="material-note">Материалы для этого урока: цели обучения и указания к учебнику.</p>'
    previous = f'<a rel="prev" href="{lesson_url(LESSONS[n-2])}"><small>← Предыдущий урок</small><strong>{n-1}. {e(LESSONS[n-2]["title"])}</strong></a>' if n > 1 else '<span></span>'
    following = f'<a rel="next" href="{lesson_url(LESSONS[n])}"><small>Следующий урок →</small><strong>{n+1}. {e(LESSONS[n]["title"])}</strong></a>' if n < len(LESSONS) else '<a href="grade-5.html"><small>Курс завершён</small><strong>Вернуться к разделам →</strong></a>'
    body = f'''<section class="card lesson-hero">
<nav class="lesson-breadcrumbs" aria-label="Навигация по курсу"><a href="grade-5.html">5 класс</a><span aria-hidden="true">/</span><a href="grade-5.html#q{lesson['quarter']}">{lesson['quarter']} четверть</a><span aria-hidden="true">/</span><a href="grade-5.html#{lesson['section']}">{e(section['title'])}</a></nav>
<p class="eyebrow">Урок {n} из 170 · 1 час{repeated(lesson)}</p>
<h2>{e(lesson['title'])}</h2><div class="lesson-tags">{label(lesson)}</div>
<div class="lesson-progress" role="img" aria-label="Урок {n} из 170 в годовом плане"><span style="width:{n/170*100:.2f}%"></span></div>
</section>
<div class="lesson-columns"><section class="card goals"><h3>{goals_heading}</h3><ul>{goals}</ul></section>
<aside class="card textbook"><h3>Учебник и материалы</h3>{reference}</aside></div>
{material}
<details class="card source-details"><summary>Тема по КТП</summary><p>{e(lesson['sourceTopic'])}</p><p>Учебный год {DATA['year']} · {lesson['quarter']} четверть · урок {n}.</p></details>
<nav class="lesson-pagination" aria-label="Предыдущий и следующий урок">{previous}{following}</nav>
<p class="catalog-return"><a class="back-btn" href="grade-5.html#{lesson['section']}">← Все уроки раздела</a></p>'''
    (ROOT/lesson['url']).write_text(document(f'Урок {n}. {lesson["title"]}', body), encoding='utf-8')


if __name__ == '__main__':
    catalog()
    for lesson in LESSONS:
        lesson_page(lesson)
    print(f'Generated catalog and {len(LESSONS)} lesson pages.')
