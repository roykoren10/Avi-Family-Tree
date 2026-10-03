const $ = (selector) => document.querySelector(selector);
const esc = (text = '') => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = {documented:'מתועד במקור',family:'מידע משפחתי',secondary:'מקור משני',candidate:'מועמד למחקר',calculated:'חישוב מותנה',open:'שאלה פתוחה'};
let data, notes, people, documents;
let selected='avraham', branch='family', scale=.75, mode=matchMedia('(max-width:767px)').matches?'list':'graph', currentView='tree';
let graphWidth=0, graphHeight=0, nodePositions=new Map();
const badge = (status) => `<span class="badge ${esc(status)}">${esc(labels[status] || status)}</span>`;
const personHref = (id) => `#person/${encodeURIComponent(id)}`;
const documentHref = (id) => `#document/${encodeURIComponent(id)}`;
const thumbnail = (doc) => doc.thumbnail || doc.file;
const isImage = (doc) => ['JPG','PNG','AVIF','WEBP'].includes(doc.type);
const getViewPeople = () => data.people.filter(p=>p.branch===branch||p.views?.[branch]);
function setTheme(theme) {
  document.documentElement.dataset.theme=theme;
  $('#theme').textContent=theme==='dark'?'תצוגה בהירה':'תצוגה כהה';
}
try { setTheme(localStorage.getItem('avi-theme') || (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')); } catch { setTheme(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'); }
$('#theme').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('avi-theme',theme);}catch{}};

function showView(view) {
  currentView=view;
  document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==view);
  document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  if(view==='library')renderDocuments();
  if(view==='research')renderReport($('#report').value);
}
function route() {
  const hash=decodeURIComponent(location.hash.slice(1));
  if(hash.startsWith('document/')) {
    const id=hash.slice(9); if(documents.has(id)){if(!currentView)showView('library');showDocument(id);return;}
    showView('library'); $('#document-count').textContent='המסמך המבוקש אינו נמצא בארכיון. אפשר לחפש מסמך אחר.';return;
  }
  if($('#document-dialog').open)$('#document-dialog').close();
  if(hash.startsWith('person/')) {
    const id=hash.slice(7);
    if(people.has(id)) {
      selected=id;
      if(!getViewPeople().some(p=>p.id===id))branch=people.get(id).branch;
      $('#branch').value=branch; showView('tree');renderTree();renderPerson();centerPerson(id);
      if(matchMedia('(max-width:767px)').matches)$('#person-panel').scrollIntoView({block:'start',behavior:'instant'});
    } else {showView('tree');$('#person-panel').innerHTML='<h2>האדם לא נמצא</h2><p>הקישור אינו תואם לתיק בארכיון. אפשר לחפש שם בעץ המשפחה.</p>';}
    return;
  }
  const view=['tree','library','timeline','research'].includes(hash)?hash:'tree';showView(view);
  if(view==='tree'){renderTree();renderPerson();centerPerson(selected);}
}
function selectPerson(id) {
  if(location.hash===personHref(id)){selected=id;renderTree();renderPerson();centerPerson(id);}else location.hash=personHref(id);
}
function renderPerson() {
  const p=people.get(selected);if(!p)return;
  const relations=data.relationships.filter(r=>r.fromId===p.id||r.toId===p.id);
  const relationName=r=>r.kind==='spouse'?'בן / בת זוג':r.kind==='sibling'?'אח / אחות':r.fromId===p.id?'ילד / ילדה':'הורה';
  const docs=p.documents.map(id=>documents.get(id)).filter(Boolean);
  const documentNote=p.id==='avraham'?'מסמכי ההורים מובאים כרקע משפחתי. הם אינם תעודת לידה או הוכחה עצמאית להורות לאברהם עמנואל.':p.id==='tzvi-menachemi'?'מודעת 1945 מזכירה מארח בשם צבי מנחמי. זהותו עם החתן מתעודת 1933 אינה מוכחת.':'';
  $('#person-panel').innerHTML=`<p class="person-kicker">תיק אדם</p><h2>${esc(p.name)}</h2><p class="dates">${esc(p.dates)}</p>${badge(p.status)}<p class="summary">${esc(p.summary)}</p>${p.aliases?`<p class="aliases"><strong>שמות וכתיבים:</strong> ${esc(p.aliases)}</p>`:''}<a class="share-link" href="${personHref(p.id)}">קישור ישיר לתיק</a>
  <section class="panel-section"><h3>הפרטים והוודאות</h3>${p.facts.map(f=>`<div class="fact">${badge(f.confidence)}<p>${esc(f.text)}</p><span class="fact-source">מקור: ${esc(f.source)}</span></div>`).join('')}</section>
  <section class="panel-section"><h3>קשרים משפחתיים</h3>${relations.length?`<div class="relatives">${relations.map(r=>{const id=r.fromId===p.id?r.toId:r.fromId;return `<div class="relative"><div><button data-person="${esc(id)}">${esc(people.get(id).name)}</button><small style="display:block">${esc(relationName(r))} · ${esc(r.note)}</small></div>${badge(r.confidence)}</div>`;}).join('')}</div>`:'<p class="document-note">לא הוגדר קשר משפחתי מאומת לאדם זה. אפשר לקרוא את כיוון המחקר בממצאים.</p>'}</section>
  <section class="panel-section"><h3>מסמכים קשורים <span class="fact-source">(${docs.length})</span></h3>${documentNote?`<p class="document-note">${esc(documentNote)}</p>`:''}${docs.length?`<div class="panel-documents">${docs.map(doc=>`<button class="mini-document" data-document="${esc(doc.id)}">${isImage(doc)?`<img src="${esc(thumbnail(doc))}" alt="" loading="lazy" width="65" height="76">`:'<span class="badge">'+esc(doc.type)+'</span>'}<span>${esc(doc.title)}</span></button>`).join('')}</div>`:'<p class="document-note">אין סריקת מקור אישית שנשמרה. קישורי המקורות וכיוון המחקר מופיעים בתיק.</p>'}</section>
  <section class="panel-section"><h3>מקורות חיצוניים</h3><div class="source-links">${p.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')||'<p>מידע משפחתי בלבד; מקור עצמאי טרם נמצא.</p>'}</div></section>`;
}
function renderTree() {
  const info=data.branches.find(b=>b.id===branch);$('#branch-title').textContent=info.name;$('#branch-note').textContent=info.note;
  const filter=$('#confidence').value;
  const ps=getViewPeople().filter(p=>filter==='all'||p.status===filter);
  $('#person-list').innerHTML=ps.map(p=>`<button class="list-person ${p.id===selected?'selected':''}" data-person="${esc(p.id)}"><strong>${esc(p.name)}</strong><small>${esc(p.dates||p.summary)}</small><br>${badge(p.status)}</button>`).join('')||'<p class="empty">אין אנשים מסוג מידע זה בענף. בחרו בכל סוגי המידע.</p>';
  if(branch==='leads'){mode='list';} toggleMode();
  const positioned=ps.filter(p=>p.views?.[branch]||p.pos);
  if(!positioned.length){$('#graph').innerHTML='<p class="empty">אין קשרים מחוברים בתצוגה זו.</p>';graphWidth=800;graphHeight=400;applyScale();return;}
  const coords=p=>p.views?.[branch]||p.pos;
  const minX=Math.min(...positioned.map(p=>coords(p)[0])),minY=Math.min(...positioned.map(p=>coords(p)[1]));
  nodePositions=new Map(positioned.map(p=>[p.id,{x:coords(p)[0]-minX+70,y:coords(p)[1]-minY+60}]));
  graphWidth=Math.max(...[...nodePositions.values()].map(p=>p.x))+294;graphHeight=Math.max(...[...nodePositions.values()].map(p=>p.y))+190;
  const visible=new Set(positioned.map(p=>p.id));
  const paths=data.relationships.filter(r=>visible.has(r.fromId)&&visible.has(r.toId)).map(r=>{
    const a=nodePositions.get(r.fromId),b=nodePositions.get(r.toId);let path;
    if(r.kind==='spouse'||r.kind==='sibling') {
      const right=a.x<b.x?b:a,left=a.x<b.x?a:b;
      path=`M ${left.x+224} ${left.y+56} H ${(left.x+224+right.x)/2} V ${right.y+56} H ${right.x}`;
    }else {const middle=(a.y+113+b.y)/2;path=`M ${a.x+112} ${a.y+113} V ${middle} H ${b.x+112} V ${b.y}`;}
    return `<path d="${path}" class="${esc(r.confidence)}"><title>${esc(people.get(r.fromId).name+' / '+people.get(r.toId).name+': '+r.note)}</title></path>`;
  }).join('');
  $('#graph').innerHTML=`<svg width="${graphWidth}" height="${graphHeight}" aria-hidden="true">${paths}</svg>${positioned.map(p=>{const pos=nodePositions.get(p.id);return `<button class="person-node ${p.id===selected?'selected':''}" data-person="${esc(p.id)}" data-status="${esc(p.status)}" style="left:${pos.x}px;top:${pos.y}px" aria-pressed="${p.id===selected}"><span class="node-status">${esc(labels[p.status])}</span><strong>${esc(p.name)}</strong><small>${esc(p.dates||'לתיק האדם ולמקורות')}</small></button>`;}).join('')}`;
  applyScale();
}
function applyScale() {
  $('#graph').style.width=graphWidth+'px';$('#graph').style.height=graphHeight+'px';$('#graph').style.transform=`scale(${scale})`;
  $('#graph-size').style.width=Math.ceil(graphWidth*scale)+'px';$('#graph-size').style.height=Math.ceil(graphHeight*scale)+'px';$('#zoom-label').textContent=Math.round(scale*100)+'%';
}
function centerPerson(id) {
  if(mode!=='graph')return;const p=nodePositions.get(id);if(!p)return;
  const view=$('#graph-viewport');view.scrollLeft=(p.x+112)*scale-view.clientWidth/2;view.scrollTop=(p.y+56)*scale-view.clientHeight/2;
}
function toggleMode() {
  $('#graph-viewport').hidden=mode!=='graph';$('#person-list').hidden=mode!=='list';$('.zoom-controls').hidden=mode!=='graph';
  $('#graph-mode').setAttribute('aria-pressed',String(mode==='graph'));$('#list-mode').setAttribute('aria-pressed',String(mode==='list'));
  $('#graph-mode').disabled=branch==='leads';
}
function searchPeople() {
  const query=$('#person-search').value.trim().toLowerCase();const status=$('#confidence').value;const out=$('#search-results');
  if(!query){out.hidden=true;return;}
  const matches=data.people.filter(p=>(status==='all'||p.status===status)&&[p.name,p.aliases,p.dates,p.summary,...p.facts.map(f=>f.text)].join(' ').toLowerCase().includes(query));
  out.hidden=false;out.innerHTML=`<p>${matches.length?'נמצאו '+matches.length+' אנשים בכל הענפים.':'לא נמצאה התאמה. נסו כתיב אחר או חלק מהשם.'}</p><div class="search-buttons">${matches.map(p=>`<button data-person="${esc(p.id)}">${esc(p.name)} ${badge(p.status)}</button>`).join('')}</div>`;
}
function renderDocuments() {
  const query=$('#document-search').value.trim().toLowerCase(),category=$('#document-category').value;
  const docs=data.documents.filter(d=>(category==='all'||d.category===category)&&[d.title,d.id,...d.people.map(id=>people.get(id).name)].join(' ').toLowerCase().includes(query));
  $('#document-count').textContent=docs.length+' מסמכים';
  $('#documents').innerHTML=docs.map(doc=>`<article class="document-card"><button data-document="${esc(doc.id)}" aria-label="צפייה: ${esc(doc.title)}">${isImage(doc)?`<img src="${esc(thumbnail(doc))}" alt="${esc(doc.title)}" loading="lazy" width="350" height="235">`:`<div class="text-preview">${doc.type==='PDF'?'גיליון עיתון מלא':'דוח מחקר'}</div>`}</button><h3>${esc(doc.title)}</h3><p>${esc(doc.category)} · ${esc(doc.type)} · ${(doc.bytes/1024/1024).toFixed(2)} MB</p>${doc.id.includes('1908-marriage-scan')?'<p class="document-note">סריקת כרך למחקר; שמות רבים טרם פוענחו.</p>':''}<div class="card-links"><a href="${esc(doc.file)}" target="_blank" rel="noopener">פתיחת המקור</a><a href="${esc(doc.file)}" download>הורדה</a></div></article>`).join('')||'<div class="empty">לא נמצאו מסמכים. נסו שנה או שם אחר, או בחרו בכל המסמכים.</div>';
}
function showDocument(id) {
  const doc=documents.get(id);if(!doc)return;
  $('#dialog-title').textContent=doc.title;
  $('#dialog-note').textContent=doc.note || (doc.id.includes('1908-marriage-scan')?'חלק מכרך מחקר. אין פירוש הדבר שהסריקה פוענחה או שהיא תעודת אדם מזוהה.':doc.type==='MD'?'דוח מחקר. קריאות היסטוריות כפופות לתיקונים בתמונת המצב העדכנית.':'הסריקה השמורה. פרטי המקור והוודאות מופיעים בתיקי האדם ובדוחות המחקר.');
  $('#open-document').href=doc.file;$('#download-document').href=doc.file;
  $('#document-viewer').innerHTML=isImage(doc)?`<img src="${esc(doc.file)}" alt="${esc(doc.title)}">`:doc.type==='PDF'?`<iframe src="${esc(doc.file)}" title="${esc(doc.title)}"></iframe>`:`<div class="report-content">${markdown(notes[id]||'הדוח אינו זמין בתצוגה. אפשר לפתוח את קובץ המקור.')}</div>`;
  if(!$('#document-dialog').open)$('#document-dialog').showModal();
}
function closeDocument(){ $('#document-dialog').close(); if(location.hash.startsWith('#document/'))history.replaceState(null,'','#'+currentView); }
$('#close-dialog').onclick=closeDocument;$('#document-dialog').addEventListener('cancel',event=>{event.preventDefault();closeDocument();});
$('#document-dialog').addEventListener('click',event=>{if(event.target===$('#document-dialog')){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDocument();}});
function inlineMarkdown(raw) {
  let value=esc(raw);
  value=value.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,title,url)=>{
    const decoded=url.replaceAll('&amp;','&');
    if(/^https?:\/\//.test(decoded))return `<a href="${esc(decoded)}" target="_blank" rel="noopener">${title}</a>`;
    const local=decoded.replace(/^\.\//,'');
    if(documents.has(local))return `<a href="${documentHref(local)}">${title}</a>`;
    return title+' <small>(קובץ מחקר שאינו בספרייה הציבורית)</small>';
  });
  return value.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
}
function markdown(raw) {
  const lines=raw.replaceAll('\u2014','-').replaceAll('\u2013','-').split('\n');let out=[],list='',paragraph=[],table=[];
  const flush=()=>{if(paragraph.length){out.push('<p>'+inlineMarkdown(paragraph.join(' '))+'</p>');paragraph=[];}};
  const closeList=()=>{if(list){out.push('</'+list+'>');list='';}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter(line=>!/^\|\s*[-:]+/.test(line));out.push('<div class="table-scroll"><table><thead>'+rows.slice(0,1).map(row=>'<tr>'+row.split('|').slice(1,-1).map(cell=>'<th>'+inlineMarkdown(cell.trim())+'</th>').join('')+'</tr>').join('')+'</thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.split('|').slice(1,-1).map(cell=>'<td>'+inlineMarkdown(cell.trim())+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');table=[];};
  for(const line of lines){if(line.startsWith('|')){flush();closeList();table.push(line);continue;}flushTable();
    if(!line.trim()){flush();closeList();continue;}
    const h=line.match(/^(#{1,6})\s+(.+)/);if(h){flush();closeList();out.push(`<h${h[1].length}>${inlineMarkdown(h[2])}</h${h[1].length}>`);continue;}
    const li=line.match(/^(?:([-*])\s+|(\d+)\.\s+)(.+)/);if(li){flush();const type=li[2]?'ol':'ul';if(list!==type){closeList();out.push('<'+type+'>');list=type;}out.push('<li>'+inlineMarkdown(li[3])+'</li>');continue;}
    if(/^[-]{3,}$/.test(line)){flush();closeList();continue;}
    closeList();paragraph.push(line);
  }flush();closeList();flushTable();return out.join('');
}
function renderReport(id) {
  const text=notes[id];if(!text)return;
  $('#report-content').innerHTML=`<a class="report-download" href="${esc(documents.get(id).file)}" download>הורדת דוח המחקר</a>`+markdown(text);
}
function searchNotes() {
  const query=$('#note-search').value.trim().toLowerCase();if(query.length<2){$('#note-results').innerHTML='';return;}
  let hits=[];
  for(const [id,text] of Object.entries(notes)){for(const paragraph of text.split(/\n\s*\n/)){const index=paragraph.toLowerCase().indexOf(query);if(index>=0)hits.push({id,excerpt:paragraph.slice(Math.max(0,index-60),index+160)});}}
  $('#note-results').innerHTML=`<p class="result-count">${hits.length} קטעים נמצאו</p>`+hits.slice(0,30).map(hit=>`<button class="note-hit" data-report="${esc(hit.id)}">${esc(documents.get(hit.id).title)}<small>${esc(hit.excerpt)}</small></button>`).join('')+(hits.length>30?'<p class="result-count">מוצגים 30 קטעים. צמצמו את החיפוש לתוצאה מדויקת יותר.</p>':'');
}
function renderTimeline() {
  $('#timeline-content').innerHTML=data.timeline.map(t=>`<article class="timeline-item"><time datetime="${esc(t.date)}">${esc(t.date.split('-').reverse().join('.'))}</time><div>${badge(t.confidence)}<h3>${esc(t.title)}</h3><p>${esc(t.note)}</p><div class="timeline-people">${t.people.map(id=>`<a href="${personHref(id)}">${esc(people.get(id).name)}</a>`).join('')}</div></div></article>`).join('');
}
// Delegate navigation so graph rerenders do not accumulate listeners.
document.addEventListener('click',event=>{
  const person=event.target.closest('[data-person]');if(person){selectPerson(person.dataset.person);return;}
  const doc=event.target.closest('[data-document]');if(doc){showDocument(doc.dataset.document);return;}
  const report=event.target.closest('[data-report]');if(report){$('#report').value=report.dataset.report;renderReport(report.dataset.report);$('#report-content').scrollIntoView({block:'start'});}
});
$('#branch').onchange=()=>{branch=$('#branch').value;$('#confidence').value='all';mode=branch==='leads'||matchMedia('(max-width:767px)').matches?'list':'graph';renderTree();history.replaceState(null,'','#tree');const first=getViewPeople()[0];if(first){selected=first.id;renderTree();renderPerson();centerPerson(selected);}};
$('#confidence').onchange=()=>{renderTree();searchPeople();};$('#person-search').oninput=searchPeople;
$('#graph-mode').onclick=()=>{mode='graph';toggleMode();centerPerson(selected);};$('#list-mode').onclick=()=>{mode='list';toggleMode();};
$('#zoom-in').onclick=()=>{scale=Math.min(1.6,scale+.1);applyScale();centerPerson(selected);};$('#zoom-out').onclick=()=>{scale=Math.max(.35,scale-.1);applyScale();centerPerson(selected);};
$('#fit').onclick=()=>{scale=Math.max(.35,Math.min(1,$('#graph-viewport').clientWidth/graphWidth));applyScale();$('#graph-viewport').scrollTo(0,0);};
$('#document-search').oninput=renderDocuments;$('#document-category').onchange=renderDocuments;$('#report').onchange=()=>renderReport($('#report').value);$('#note-search').oninput=searchNotes;
const viewport=$('#graph-viewport');let dragging=null;
viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button')||e.button!==0)return;dragging={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!dragging)return;viewport.scrollLeft=dragging.left-(e.clientX-dragging.x);viewport.scrollTop=dragging.top-(e.clientY-dragging.y);});
const endDrag=()=>{dragging=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
window.addEventListener('hashchange',route);
try {
  const responses=await Promise.all([fetch('data.json'),fetch('notes.json')]);
  if(responses.some(r=>!r.ok))throw new Error('Archive response unavailable');
  [data,notes]=await Promise.all(responses.map(r=>r.json()));people=new Map(data.people.map(p=>[p.id,p]));documents=new Map(data.documents.map(d=>[d.id,d]));
  $('#stats').innerHTML=`<span><strong>${data.people.length}</strong>תיקי אדם</span><span><strong>${data.documents.length}</strong>מסמכים</span><span><strong>${data.branches.length}</strong>ענפי מחקר</span>`;
  $('#updated').textContent='עודכן '+data.updated+'.';$('#branch').innerHTML=data.branches.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
  $('#report').innerHTML=Object.keys(notes).sort((a,b)=>a==='family-tree-current.md'?-1:b==='family-tree-current.md'?1:0).map(id=>`<option value="${esc(id)}">${esc(documents.get(id).title)}</option>`).join('');
  renderTimeline();$('#loading').hidden=true;route();
} catch(error) {
  $('#loading').innerHTML='<h2>הארכיון לא נטען</h2><p>נסו לרענן את הדף. אפשר גם לפתוח את <a href="assets/documents/family-tree-current.md">תמונת המצב כקובץ</a>.</p>';console.error(error);
}
