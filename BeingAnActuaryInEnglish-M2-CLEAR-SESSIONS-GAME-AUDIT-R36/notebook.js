(function(){
  const all=Array.isArray(window.ACTUARIAL_VOCAB)?window.ACTUARIAL_VOCAB:[], list=document.getElementById('savedList'), notes=document.getElementById('notes'), clear=document.getElementById('clearNotes');
  if(!list||!notes) return;
  const storage=window.actuarialStorage||{get:(_,f)=>f,set:()=>false,remove:()=>false,json:(_,f)=>f};
  notes.value=storage.get('actuarial_notes','');
  notes.addEventListener('input',()=>storage.set('actuarial_notes',notes.value));
  function render(){
    const raw=storage.json('actuarial_saved_terms',[]), saved=Array.isArray(raw)?raw:[]; list.innerHTML='';
    const terms=saved.map(w=>all.find(v=>v.w===w)).filter(Boolean);
    if(!terms.length){list.innerHTML='<p class="empty-state">No saved terms yet. Add words from the Dictionary.</p>';return;}
    terms.forEach(v=>{
      const el=document.createElement('div');el.className='saved-term';
      const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=v.w;const fr=document.createElement('div');fr.className='muted';fr.textContent=v.fr;info.append(strong,fr);
      const controls=document.createElement('div');controls.className='saved-actions';
      const listen=document.createElement('button');listen.type='button';listen.className='mini-btn';listen.textContent='🔊';listen.setAttribute('aria-label','Listen to '+v.w);listen.addEventListener('click',()=>speakWord(v.w));
      const remove=document.createElement('button');remove.type='button';remove.className='mini-btn';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+v.w+' from saved terms');remove.addEventListener('click',()=>{storage.set('actuarial_saved_terms',JSON.stringify(saved.filter(x=>x!==v.w)));render();});
      controls.append(listen,remove);el.append(info,controls);list.appendChild(el);
    });
  }
  if(clear) clear.addEventListener('click',()=>{if(!notes.value||confirm('Clear all notes stored in this browser?')){notes.value='';storage.remove('actuarial_notes');notes.focus();}});
  render();
})();
