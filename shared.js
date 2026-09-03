(function(){
  'use strict';

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

  // Speech synthesis: cache the preferred voice once instead of rebuilding the
  // full voice list on every click. This greatly reduces click-to-sound latency,
  // especially on Chrome/Windows where voices can initialise slowly.
  const synth=('speechSynthesis' in window)?window.speechSynthesis:null;
  let cachedVoice=null;
  let voiceList=[];

  function selectBritishVoice(voices){
    // Prefer an on-device British voice: remote/cloud voices can take several
    // seconds to start on some browsers and networks.
    return voices.find(v=>v.localService && /^en-GB$/i.test(v.lang)) ||
           voices.find(v=>v.localService && /^en-GB/i.test(v.lang)) ||
           voices.find(v=>/^en-GB$/i.test(v.lang)) ||
           voices.find(v=>/^en-GB/i.test(v.lang)) ||
           voices.find(v=>v.localService && /^en(?:-|_)/i.test(v.lang)) ||
           voices.find(v=>/^en(?:-|_)/i.test(v.lang)) ||
           voices.find(v=>/^en/i.test(v.lang)) || null;
  }

  function refreshVoices(){
    if(!synth) return null;
    const voices=synth.getVoices();
    if(voices && voices.length){
      voiceList=voices;
      cachedVoice=selectBritishVoice(voices);
    }
    return cachedVoice;
  }

  if(synth){
    refreshVoices();
    if(typeof synth.addEventListener==='function') synth.addEventListener('voiceschanged',refreshVoices);
    else synth.onvoiceschanged=refreshVoices;

    // Ask the browser for its voice list at the earliest real user interaction.
    // This is safe under autoplay policies and avoids doing expensive discovery
    // inside the actual Listen button handler.
    let primed=false;
    const prime=()=>{ if(primed) return; primed=true; refreshVoices(); };
    document.addEventListener('pointerdown',prime,{once:true,capture:true,passive:true});
    document.addEventListener('keydown',prime,{once:true,capture:true});
  }

  window.prepareSpeech=refreshVoices;
  window.speakWord=function(text){
    if(!synth || !window.SpeechSynthesisUtterance) return false;
    const value=String(text||'').trim();
    if(!value) return false;

    // Only cancel when there is actually something queued. Repeated unconditional
    // cancel() calls can add a noticeable delay in Chromium-based browsers.
    const hadSpeech=synth.speaking || synth.pending;
    if(hadSpeech) synth.cancel();
    if(synth.paused) synth.resume();

    const utterance=new SpeechSynthesisUtterance(value);
    utterance.lang=(cachedVoice && cachedVoice.lang) || 'en-GB';
    if(cachedVoice) utterance.voice=cachedVoice;
    utterance.rate=0.92;
    utterance.pitch=1;
    utterance.volume=1;

    const speak=()=>{
      try { synth.speak(utterance); }
      catch (_) { return false; }
      return true;
    };

    // Chromium can swallow an utterance spoken in the exact same task as cancel().
    // A zero-delay task only applies after an interruption; first-click speech is immediate.
    if(hadSpeech) setTimeout(speak,0); else speak();
    return true;
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
