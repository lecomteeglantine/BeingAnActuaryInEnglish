(function(){
 const data=window.ACTUARIAL_VOCAB||[], grid=document.getElementById('dictionaryGrid'), q=document.getElementById('termSearch'), cat=document.getElementById('categoryFilter');
 const params=new URLSearchParams(location.search); if(params.get('q')) q.value=params.get('q');
 const cats=[...new Set(data.map(x=>x.cat))].sort();cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});
 function saved(){return JSON.parse(localStorage.getItem('actuarial_saved_terms')||'[]')} function store(arr){localStorage.setItem('actuarial_saved_terms',JSON.stringify(arr))}
 function toggle(w){let s=saved();s=s.includes(w)?s.filter(x=>x!==w):[...s,w];store(s);render()}
 function render(){const text=q.value.trim().toLowerCase(),c=cat.value,s=saved();const filtered=data.filter(v=>(!c||v.cat===c)&&(!text||[v.w,v.fr,v.def,v.cat].join(' ').toLowerCase().includes(text)));grid.innerHTML='';filtered.forEach(v=>{const card=document.createElement('article');card.className='term-card';card.innerHTML=`<div class="term-top"><div><h3>${v.w}</h3><p class="ipa">${v.ipa}</p></div><span class="tag">${v.cat}</span></div><p>${v.def}</p><p class="translation">🇫🇷 ${v.fr}</p><p class="muted"><em>${v.ex}</em></p><div class="term-actions"><button class="mini-btn listen">🔊 Listen</button><button class="mini-btn save">${s.includes(v.w)?'★ Saved':'☆ Save'}</button></div>`;card.querySelector('.listen').onclick=()=>speakWord(v.w+'. '+v.ex);card.querySelector('.save').onclick=()=>toggle(v.w);grid.appendChild(card)});document.getElementById('termCount').textContent=`${filtered.length} term${filtered.length!==1?'s':''}`}
 q.oninput=render;cat.onchange=render;render();
})();
