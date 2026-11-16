"""Curriculum integrity and static navigation regression checks (standard library)."""
import json
import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'data/grade-5-curriculum.json').read_text(encoding='utf-8'))
LESSONS = DATA['lessons']
URLS = [l.get('contentPage', l['url']) for l in LESSONS]


class Links(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.links = []
        self.ids = []
        self.h2 = []
        self.lesson_links = []
        self.in_h2 = False
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if 'href' in attr:
            self.links.append((attr['href'], attr.get('rel')))
            if 'lesson-link' in attr.get('class', '').split():
                self.lesson_links.append(attr['href'])
        if 'src' in attr:
            self.links.append((attr['src'], None))
        if 'id' in attr:
            self.ids.append(attr['id'])
        if tag == 'h2':
            self.in_h2 = True

    def handle_endtag(self, tag):
        if tag == 'h2':
            self.in_h2 = False

    def handle_data(self, data):
        if self.in_h2:
            self.h2.append(data)


class CurriculumTests(unittest.TestCase):
    def test_annual_and_quarter_hours(self):
        self.assertEqual([l['number'] for l in LESSONS], list(range(1,171)))
        self.assertEqual(sum(l['hours'] for l in LESSONS), 170)
        self.assertEqual(Counter(l['quarter'] for l in LESSONS), {1:39,2:40,3:50,4:41})
        self.assertEqual([LESSONS[i-1]['quarter'] for i in (39,40,79,80,129,130,170)], [1,2,2,3,3,4,4])

    def test_source_rows_and_sections(self):
        expected_rows = [r for a,b in [(3,41),(43,82),(84,133),(135,175)] for r in range(a,b+1)]
        self.assertEqual([l['sourceRow'] for l in LESSONS], expected_rows)
        self.assertEqual(len(DATA['sections']),14)
        self.assertEqual(sum(s['academic'] for s in DATA['sections']),11)
        self.assertEqual(Counter(l['section'] for l in LESSONS),
            {'ch12':3,'ch1':11,'ch2':14,'ch3':10,'ch4':38,'ch5':7,'ch6':31,
             'ch7':10,'ch8':13,'ch9':5,'ch10':11,'ch11':6,'ch13':7,'ch14':4})
        self.assertTrue(all(l['objective'] and l['sourceTopic'] for l in LESSONS))

    def test_assessment_hours_are_not_added_or_duplicated(self):
        self.assertEqual([(l['number'],l['assessment']) for l in LESSONS if l['assessment'].startswith('СОР')],
            list(zip([14,27,36,57,74,86,114,124,141,161],[f'СОР № {i}' for i in range(1,11)])))
        self.assertEqual([l['number'] for l in LESSONS if l['assessment'].startswith('СОЧ')],[38,76,126,165])
        self.assertTrue(LESSONS[85]['analysis'])  # Source places СОР 6 and its analysis in one hour.

    def test_static_pages_navigation_and_assets(self):
        self.assertEqual(len(set(URLS)),170)
        for index, lesson in enumerate(LESSONS):
            with self.subTest(lesson=lesson['number']):
                path = ROOT/URLS[index]
                self.assertTrue(path.is_file())
                page = Links(path.read_text(encoding='utf-8'))
                if not lesson.get('contentPage'):
                    self.assertEqual(''.join(page.h2), lesson['title'])
                else:
                    self.assertIn('trainer', page.ids)
                    alias = (ROOT/lesson['url']).read_text(encoding='utf-8')
                    self.assertIn(f'<meta http-equiv="refresh" content="0; url={URLS[index]}">', alias)
                    self.assertIn((URLS[index], 'canonical'), Links(alias).links)
                self.assertEqual([url for url,rel in page.links if rel=='prev'], [URLS[index-1]] if index else [])
                self.assertEqual([url for url,rel in page.links if rel=='next'], [URLS[index+1]] if index<169 else [])
                for url,_ in page.links:
                    parsed = urlsplit(url)
                    if parsed.scheme or not parsed.path:
                        continue
                    self.assertTrue((ROOT/parsed.path).is_file(), url)

    def test_catalog_links_and_legacy_materials(self):
        page = Links((ROOT/'grade-5.html').read_text(encoding='utf-8'))
        links = [url for url,_ in page.links]
        self.assertEqual(page.lesson_links, URLS)
        self.assertEqual(page.lesson_links[3:5], ['topic-5-1-1.html', 'topic-5-1-2.html'])
        self.assertNotIn('lesson-5-004.html', page.lesson_links)
        self.assertNotIn('lesson-5-005.html', page.lesson_links)
        self.assertEqual(len(page.ids),len(set(page.ids)))
        for section in DATA['sections']:
            self.assertIn('#'+section['id'],links)
        self.assertEqual(LESSONS[3]['materials'][0]['url'],'topic-5-1-1.html')
        self.assertEqual(LESSONS[4]['materials'][0]['url'],'topic-5-1-2.html')
        for filename in ['topic-5-1-1.html','topic-5-1-2.html']:
            self.assertIn('grade-5.html#ch1',(ROOT/filename).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
