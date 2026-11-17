"""Build complete short games for individual curriculum hours; no external dependencies."""
import argparse,json,re,hashlib
from pathlib import Path
from html import escape as e
from course import naturals, divisibility
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'data/grade-5-curriculum.json').read_text())
REGISTRY=ROOT/'data/grade-5-games.json'
FAMILIES={1:'review',2:'review',3:'review',6:'compare',7:'arithmetic',8:'simplify',9:'substitute',10:'equations',11:'check_equations',12:'formulas',13:'sequences',14:'invent_sequences'}

FAMILIES.update({15:"divisors",16:"find_divisors",17:"primes",18:"product_divisibility",19:"sum_divisibility",20:"rules_2_5_10",21:"rules_3_9",22:"powers",23:"write_powers",24:"factorization",25:"factorization",26:"gcd_lcm",27:"gcd_lcm_calc",28:"gcd_lcm_words"})

def content(lesson,variant):
    family=FAMILIES[lesson['number']]
    module=divisibility if 15<=lesson['number']<=28 else naturals
    return module.make(family,(lesson['number']-1 if family=='review' else lesson['topicLesson']-1)+variant,lesson['number'])

def url(l):return l.get('contentPage',l['url'])
def make_data(lesson):
    variants=[];packs=[]
    for v in range(3):
        pack=content(lesson,v);packs.append(pack)
        for i,t in enumerate(pack['tasks']):
            t['id']=f"lesson-{lesson['number']}-v{v+1}-step{i+1}"
            t['title']=['Разберёмся вместе','Попробуй','Собери решение','Примени правило','Проверь себя','Самостоятельный шаг'][i]
            if t.get('options'):
                opts=t['options'];shift=(lesson['number']+i+v)%len(opts);t['options']=opts[shift:]+opts[:shift]
        variants.append(pack['tasks'])
    p=packs[0];n=lesson['number']
    mode='practice'
    if lesson['kind']=='assessment':mode='preparation'
    elif lesson['kind']=='analysis':mode='correction'
    elif lesson['kind']=='diagnostic':mode='self_check'
    return {'version':1,'number':n,'title':lesson['title'],'mission':p['mission'],'intro':'Сначала наглядный пример, затем небольшие задания. Ошибку можно исправить.','icon':{'ch1':'🔢','ch2':'🧩','ch3':'🍰','ch4':'🧮','ch5':'🛠️','ch6':'💧','ch7':'🗂️','ch8':'💯','ch9':'📐','ch10':'📊','ch11':'📦'}.get(lesson['section'],'🦉'),'variants':variants,'notes':p['notes'],'example':p['example'],'paper':p['paper'],'next':url(DATA['lessons'][n]) if n<170 else 'grade-5.html','mode':mode}

def render_course_page(lesson,data=None):
    d=data or make_data(lesson);n=lesson['number'];section=next(s for s in DATA['sections'] if s['id']==lesson['section'])
    previous=f'<a rel="prev" href="{url(DATA["lessons"][n-2])}">← Урок {n-1}</a>' if n>1 else ''
    following=f'<a rel="next" href="{url(DATA["lessons"][n])}">Урок {n+1} →</a>' if n<170 else '<a href="grade-5.html">К каталогу →</a>'
    message={'preparation':'Тренировка к оценочной работе. Саму работу и критерии выдаёт учитель.','correction':'Тренировка после разбора ошибок. Сначала обсуди с учителем свою проверенную работу.','self_check':'Учебная самопроверка перед курсом. Это не официальная диагностическая работа.'}.get(d['mode'],'')
    refs=''.join(f'<li>Часть {r["part"]}, § {e(r["paragraphs"])}, с. {e(r["pages"])}</li>' for r in lesson['textbook'])
    goals=[x.strip(' ;') for x in re.split(r'(?=5\.\d\.\d\.\d+\s)',lesson['objective']) if x.strip(' ;')]
    safe=json.dumps(d,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
    return f'''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Урок {n}. {e(lesson['title'])} — Портал Логунова Г.В.</title><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="lesson-practice.css"><link rel="stylesheet" href="lesson-adventure.css"><link rel="stylesheet" href="course-game.css"></head><body class="lesson-game-page course-page"><div class="wrapper"><header><h1 class="teacher-name">Логунов Григорий Владимирович · Математика, 5 класс</h1></header><main class="card"><nav aria-label="Навигация по урокам"><a class="back-btn" href="grade-5.html#{lesson['section']}">← К разделу</a></nav><p>Урок {n} из 170 · {lesson['quarter']} четверть · {e(section['title'])}</p><h2>{e(lesson['title'])}</h2>{f'<p class="course-mode">{message}</p>' if message else ''}<section data-course-game data-lesson-adventure aria-label="Игровой маршрут"><p>Для игры включи JavaScript. Объяснения ниже доступны без него.</p></section>
<details class="lesson-drawer" id="paper-practice"><summary>🖨 Карточка для работы на бумаге</summary><div class="lesson-drawer-content" id="course-print-panel"></div></details>
<details class="lesson-drawer" id="lesson-reference"><summary>📖 Объяснения и пример</summary><div class="lesson-drawer-content course-reference">{''.join('<p>'+e(x)+'</p>' for x in d['notes'])}<div class="worked-example"><strong>{e(d['example'][0])}</strong><p>{e(d['example'][1])}</p></div></div></details>
<details class="lesson-drawer"><summary>✏️ Попробуй в тетради</summary><div class="lesson-drawer-content"><p>{e(d['paper'])}</p><p>Объясни ход решения учителю или однокласснику. Для чертежей используй нужные инструменты.</p></div></details>
<details class="lesson-drawer"><summary>Для учителя: цели и учебник</summary><div class="lesson-drawer-content course-teacher"><ul>{''.join('<li>'+e(x)+'</li>' for x in goals)}</ul><p>Источник: КТП учителя на {DATA['year']} год, строка {lesson['sourceRow']} подробной таблицы.</p><ul>{refs}</ul><p>Учебник Алдамұратовой и соавторов, Атамұра, 2017. Задания игры авторские; жизненные данные учебные. Номера упражнений учителя не заменяются.</p><p>Наблюдайте не только ответ, но и объяснение. Последний шаг — для самостоятельной попытки. Звёзды означают завершённые шаги, а не отметку.</p></div></details>
<noscript><ol class="course-fallback">{''.join('<li>'+e(t['prompt'])+'</li>' for t in d['variants'][0])}</ol></noscript><nav class="lesson-pagination" aria-label="Предыдущий и следующий урок">{previous}{following}</nav><p class="course-sources"><a href="grade-5.html#{lesson['section']}">Все уроки раздела</a></p></main></div><script id="course-data" type="application/json">{safe}</script><script src="lesson-practice.js" defer></script><script src="lesson-voice.js" defer></script><script src="course-print.js" defer></script><script src="course-game.js" defer></script></body></html>'''

def manifest(lesson,d):
    goals=[x.strip(' ;') for x in re.split(r'(?=5\.\d\.\d\.\d+\s)',lesson['objective']) if x.strip(' ;')]
    return {'schema_version':'1.0','mode':'trainer','grade':5,'subject':'Математика','topic':lesson['title'],'interface_language':'ru','content_language':'ru','objective_source':'teacher_file','learning_objectives':[{'id':(x.split(' ',1)[0] if re.match(r'5\.',x) else f'review-{lesson["number"]}'),'text':x} for x in goals],'task_ids':[t['id'] for v in d['variants'] for t in v],'scoring':'feedback_only','source':{'file':'КТП_математика_5_класс.docx','source_row':lesson['sourceRow'],'lesson':lesson['number']},'browser_execution':'not_checked','audio_playback':'not_checked','practice_mode':d['mode']}

def build(numbers):
    registry=json.loads(REGISTRY.read_text()) if REGISTRY.exists() else {'version':1,'lessons':[4,5]}
    for n in numbers:
        l=DATA['lessons'][n-1];d=make_data(l)
        (ROOT/l['url']).write_text(render_course_page(l,d))
        (ROOT/'data/practicum'/f'lesson-{n:03}.json').write_text(json.dumps(manifest(l,d),ensure_ascii=False,indent=2)+'\n')
    registry['lessons']=sorted(set(registry['lessons'])|set(numbers));REGISTRY.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
    print('Built lessons: '+', '.join(map(str,numbers)))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('numbers',nargs='+',type=int);args=p.parse_args();build(args.numbers)
