(function(){
  const data=Array.isArray(window.ACTUARIAL_VOCAB)?window.ACTUARIAL_VOCAB:[];
  const grid=document.getElementById('dictionaryGrid'), q=document.getElementById('termSearch'), cat=document.getElementById('categoryFilter'), count=document.getElementById('termCount');
  if(!grid||!q||!cat||!count) return;
  const storage=window.actuarialStorage||{json:(_,f)=>f,set:()=>false};
  const params=new URLSearchParams(location.search); if(params.get('q')) q.value=params.get('q');
  [...new Set(data.map(x=>x.cat).filter(Boolean))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});
  function saved(){ const v=storage.json('actuarial_saved_terms',[]); return Array.isArray(v)?v:[]; }
  function store(arr){ storage.set('actuarial_saved_terms',JSON.stringify(arr)); }
  function toggle(w,button){
    let s=saved(); s=s.includes(w)?s.filter(x=>x!==w):[...s,w]; store(s);
    const on=s.includes(w); button.textContent=on?'★ Saved':'☆ Save'; button.setAttribute('aria-pressed',String(on));
  }
  function addText(parent,tag,text,cls){ const el=document.createElement(tag); if(cls) el.className=cls; el.textContent=text; parent.appendChild(el); return el; }
  function render(){
    const text=q.value.trim().toLowerCase(), c=cat.value, s=saved();
    const filtered=data.filter(v=>(!c||v.cat===c)&&(!text||[v.w,v.fr,v.def,v.cat,v.ex].join(' ').toLowerCase().includes(text)));
    grid.innerHTML='';
    if(!filtered.length){ const p=document.createElement('p'); p.className='empty-state full-span'; p.textContent='No terms match this search. Try another word or category.'; grid.appendChild(p); }
    filtered.forEach(v=>{
      const card=document.createElement('article'); card.className='term-card';
      const top=document.createElement('div'); top.className='term-top';
      const left=document.createElement('div'); addText(left,'h3',v.w); addText(left,'p',v.ipa,'ipa'); top.appendChild(left); addText(top,'span',v.cat,'tag'); card.appendChild(top);
      addText(card,'p',v.def); addText(card,'p','🇫🇷 '+v.fr,'translation'); const ex=addText(card,'p',v.ex,'muted'); ex.innerHTML='<em></em>'; ex.querySelector('em').textContent=v.ex;
      const actions=document.createElement('div'); actions.className='term-actions';
      const listen=document.createElement('button'); listen.type='button'; listen.className='mini-btn'; listen.textContent='🔊 Listen'; listen.setAttribute('aria-label','Listen to '+v.w+' in British English'); listen.addEventListener('click',()=>speakWord(v.w+'. '+v.ex));
      const save=document.createElement('button'); save.type='button'; save.className='mini-btn'; const on=s.includes(v.w); save.textContent=on?'★ Saved':'☆ Save'; save.setAttribute('aria-pressed',String(on)); save.addEventListener('click',()=>toggle(v.w,save));
      actions.append(listen,save); card.appendChild(actions); grid.appendChild(card);
    });
    count.textContent=`${filtered.length} term${filtered.length!==1?'s':''}`;
  }
  q.addEventListener('input',render); cat.addEventListener('change',render); render();
})();
