"""Validate references and the research boundaries of the public genealogy archive."""
from pathlib import Path
from urllib.parse import urlparse
import json
root = Path(__file__).parent / 'site'
data = json.loads((root / 'data.json').read_text())
notes = json.loads((root / 'notes.json').read_text())
people = {person['id']: person for person in data['people']}
documents = {document['id']: document for document in data['documents']}
branches = {branch['id'] for branch in data['branches']}
assert len(people) == len(data['people']), 'Duplicate person IDs'
assert len(documents) == len(data['documents']), 'Duplicate document IDs'
confidences = {'documented', 'family', 'secondary', 'candidate', 'calculated', 'open'}
for person in people.values():
    assert person['branch'] in branches, person['id']
    assert person['status'] in confidences, person['id']
    for document in person['documents']:
        assert document in documents, (person['id'], document)
    for fact in person['facts']:
        assert fact['confidence'] in confidences and fact['source'], person['id']
    for source in person['sources']:
        assert urlparse(source['url']).scheme in {'https', 'http'}, source
for document in documents.values():
    assert (root / document['file']).is_file(), document['file']
    assert not (root / document['file']).is_symlink(), document['file']
    for person in document['people']:
        assert person in people and document['id'] in people[person]['documents'], (document['id'], person)
    if document.get('thumbnail'):
        assert (root / document['thumbnail']).is_file(), document['thumbnail']
for relationship in data['relationships']:
    assert relationship['fromId'] in people and relationship['toId'] in people, relationship
    assert relationship['confidence'] in confidences and relationship['note'], relationship
for event in data['timeline']:
    assert all(person in people for person in event['people']), event
for name, content in notes.items():
    assert name in documents and (root / documents[name]['file']).read_text() == content, name
    assert '/Users/' not in content, name
assert len([document for document in documents if '1908-marriage-scan' in document]) == 39
assert len(documents) == 111
assert {doc['id'] for doc in documents.values() if doc['type'] == 'MD'} == set(notes)
for name in ['yocheved-grave-identification.md', 'myheritage-match-followup.md', 'plonsk-1914-birth-reading.md', 'plonsk-1915-birth-reading.md', 'banko-name-change-followup.md', 'kosava-original-records-route.md', 'hirsch-birth-candidates.md', 'yocheved-naturalization-followup.md', 'jewishgen-focused-followup.md']:
    content = notes[name]
    assert not any(private in content for private in ['discovery-hub/', 'match-compare/', 'perm_id=', '../work/', 'favsearch.php', 'Logged in:']), name
    assert documents[name]['bytes'] == len(content.encode()), name
assert people['yocheved']['dates'] == 'מגורי קוסוב פולסקי ב־1933'
assert any(fact['confidence'] == 'candidate' and 'BG24024099' in fact['text'] and 'אין בעל' in fact['text'] for fact in people['yocheved']['facts'])
assert 'י״ג סיון תש״י' in notes['yocheved-grave-identification.md']
assert '42' in notes['plonsk-1915-birth-reading.md'] and 'Baum' in notes['plonsk-1915-birth-reading.md']
assert 'Алфавитъ родившихся евреевъ въ теченіе 1914 года' in notes['plonsk-1914-birth-reading.md']
assert all(name in notes['hirsch-birth-candidates.md'] for name in ['Moszek Józef Fuks', 'Moszek Michel Finsker', 'Lejb Homan'])
assert 'מספר דף פנקס' in notes['hirsch-birth-candidates.md'] and 'תאריך הלידה לא אומת' in notes['hirsch-birth-candidates.md']
assert 'שבע השאילתות' in notes['yocheved-naturalization-followup.md'] and 'באינדקס בלבד' in notes['yocheved-naturalization-followup.md']
assert 'תת־קבוצה בתוך אותן 129' in notes['jewishgen-focused-followup.md'] and 'בדיקה חוזרת' in notes['jewishgen-focused-followup.md']
for name in ['plonsk-1916-birth-reading.md', 'kosava-public-copy-search.md', 'tzvi-lucia-naturalization-search.md', 'yarkoni-burial-search-followup.md', 'plonsk-1907-voter-followup.md', 'immigration-ocr-partial-search.md', 'plonsk-1917-birth-reading.md']:
    content = notes[name]
    assert documents[name]['bytes'] == len(content.encode()), name
    assert not any(private in content for private in ['/Users/', 'pages.jsonl', 'run.log', 'PID ', 'Chrome', 'המחובר לחשבון', 'discovery-hub/', 'match-compare/', 'perm_id=', 'logowanie']), name
assert all(text in notes['plonsk-1916-birth-reading.md'] for text in ['1-145', 'Lejb Blumstein', 'Jankel Abramowicz', 'Moszek Sznajder', 'שלילה מוגבלת'])
assert all(text in notes['plonsk-1917-birth-reading.md'] for text in ['44-45', '1-30 ו־32-59', '64-95, 96-125, 126-155 ו־156-166', 'Moszek Taub', 'מאשתו', 'שלילה מלאה', 'אקט 98'])
assert len(people) == 62 and len(data['relationships']) == 72 and len(notes) == 23
assert '27 צירופי שם מדויקים ושתי בדיקות' in notes['tzvi-lucia-naturalization-search.md']
assert 'שם האדם והעיר לא נקראו' in notes['family-tree-current.md']
assert all(text in notes['immigration-ocr-partial-search.md'] for text in ['612 עמודים ייחודיים', 'כל 612', '21 עמודים', 'עמוד 133', 'שורה 49', 'גיל 21', 'שם המשפחה', 'לא מוכרע', 'אין לומר שכל המועמדים נשללו', 'עמוד 494'])
assert 'אין לומר שכל המועמדים נשללו' in notes['family-tree-current.md']
assert 'MV6HM' in notes['yarkoni-burial-search-followup.md'] and 'מועמד לא מזוהה' in notes['yarkoni-burial-search-followup.md']
assert people['avraham']['dates'] == '29.11.1945' and people['avraham']['status'] == 'family'
assert not any(r['kind'] == 'spouse' and 'zipporah' in [r['fromId'], r['toId']] for r in data['relationships'])
assert {r['fromId'] for r in data['relationships'] if r['toId'] == 'lucia' and r['kind'] == 'parent'} == {'moshe', 'yocheved'}
for relationship in data['relationships']:
    endpoints = [people[relationship['fromId']], people[relationship['toId']]]
    assert not ({p['branch'] for p in endpoints} == {'family', 'plonsk1910'}), relationship
assert any('28.3.1940' in fact['text'] for fact in people['shoshana']['facts'])
assert any('5 אחה״צ' in fact['text'] for fact in people['tzvi']['facts'])
assert people['yocheved-marmor']['id'] != people['yocheved']['id']
for filename in ['index.html', 'app.js', 'style.css']:
    assert '—' not in (root / filename).read_text(), filename
print(f"Validated {len(people)} people, {len(data['relationships'])} relationships, {len(documents)} documents, {len(notes)} research reports and key accuracy guardrails.")
