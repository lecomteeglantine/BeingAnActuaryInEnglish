(function(){
  const storage = {
    get(key, fallback='') { try { const v=localStorage.getItem(key); return v===null?fallback:v; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key,value); return true; } catch (_) { return false; } },
    remove(key) { try { localStorage.removeItem(key); return true; } catch (_) { return false; } },
    json(key, fallback) { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch (_) { return fallback; } }
  };
  window.actuarialStorage=storage;

  const nav=document.querySelector('.main-nav');
  if(nav){
    const page=location.pathname.split('/').pop()||'index.html';
    nav.querySelectorAll('a').forEach(a=>{
      if(a.getAttribute('href')===page){ a.classList.add('active'); a.setAttribute('aria-current','page'); }
    });
  }

  function britishVoice(){
    if(!('speechSynthesis' in window)) return null;
    const voices=speechSynthesis.getVoices();
    return voices.find(v=>/^en-GB$/i.test(v.lang)) || voices.find(v=>/^en-GB/i.test(v.lang)) || voices.find(v=>/^en/i.test(v.lang)) || null;
  }
  window.speakWord=function(text){
    if(!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return false;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(text||''));
    u.lang='en-GB'; u.rate=.86;
    const voice=britishVoice(); if(voice) u.voice=voice;
    speechSynthesis.speak(u); return true;
  };

  const state=storage.json('actuarial_access',{});
  function apply(){
    document.body.classList.toggle('large-text',!!state.large);
    document.body.classList.toggle('high-contrast',!!state.contrast);
    document.body.classList.toggle('reduced-motion',!!state.motion);
  }
  apply();

  const wrap=document.createElement('div');
  wrap.className='access-toolbar';
  wrap.innerHTML='<button class="access-toggle" type="button" aria-label="Accessibility options" aria-expanded="false" aria-controls="accessibility-panel">♿</button><div class="access-panel" id="accessibility-panel" hidden><strong>Accessibility</strong><label>Large text <input type="checkbox" data-a="large"></label><label>High contrast <input type="checkbox" data-a="contrast"></label><label>Reduce motion <input type="checkbox" data-a="motion"></label></div>';
  document.body.appendChild(wrap);
  const panel=wrap.querySelector('.access-panel'), toggle=wrap.querySelector('.access-toggle');
  function setOpen(open){ panel.hidden=!open; toggle.setAttribute('aria-expanded',String(open)); }
  toggle.addEventListener('click',()=>setOpen(panel.hidden));
  panel.querySelectorAll('input').forEach(i=>{
    i.checked=!!state[i.dataset.a];
    i.addEventListener('change',()=>{ state[i.dataset.a]=i.checked; storage.set('actuarial_access',JSON.stringify(state)); apply(); });
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.hidden){ setOpen(false); toggle.focus(); } });
  document.addEventListener('click',e=>{ if(!panel.hidden && !wrap.contains(e.target)) setOpen(false); });
})();
