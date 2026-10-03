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
assert len(documents) == 95
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
