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
    const section=page.startsWith('m1-')?'m1.html':page.startsWith('m2-')?'m2.html':page;
    nav.querySelectorAll('a').forEach(a=>{
      const href=a.getAttribute('href');
      if(href===page){ a.classList.add('active'); a.setAttribute('aria-current','page'); }
      else if(href===section){ a.classList.add('active'); a.setAttribute('aria-current','location'); }
    });
  }

  // Fast, dependable browser speech. Prefer an on-device British voice, then
  // another on-device English voice. Remote/cloud voices are deliberately not
  // selected explicitly because they can take many seconds to start on some
  // Windows/Chromium installations.
  const synth=('speechSynthesis' in window)?window.speechSynthesis:null;
  let cachedVoice=null;
  let voiceList=[];

  function selectFastEnglishVoice(voices){
    return voices.find(v=>v.localService && /^en-GB$/i.test(v.lang)) ||
           voices.find(v=>v.localService && /^en-GB/i.test(v.lang)) ||
           voices.find(v=>v.localService && /^en(?:-|_)/i.test(v.lang)) ||
           voices.find(v=>v.localService && /^en/i.test(v.lang)) || null;
  }

  function refreshVoices(){
    if(!synth) return null;
    const voices=synth.getVoices();
    if(voices && voices.length){
      voiceList=voices;
      cachedVoice=selectFastEnglishVoice(voices);
    }
    return cachedVoice;
  }

  if(synth){
    refreshVoices();
    if(typeof synth.addEventListener==='function') synth.addEventListener('voiceschanged',refreshVoices);
    else synth.onvoiceschanged=refreshVoices;

    // Voice discovery is requested before the click handler that actually speaks.
    // This keeps Listen buttons responsive without playing unwanted audio.
    let primed=false;
    const prime=()=>{
      if(primed) return;
      primed=true;
      refreshVoices();
      // Chromium sometimes populates voices a few milliseconds after the first
      // interaction. Two cheap retries avoid doing this work inside later clicks.
      setTimeout(refreshVoices,50);
      setTimeout(refreshVoices,250);
    };
    document.addEventListener('pointerdown',prime,{once:true,capture:true,passive:true});
    document.addEventListener('keydown',prime,{once:true,capture:true});
  }

  window.prepareSpeech=refreshVoices;
  window.stopSpeech=function(){
    if(!synth) return;
    try{ synth.cancel(); }catch(_){}
  };
  window.speakWord=function(text){
    if(!synth || !window.SpeechSynthesisUtterance) return false;
    const value=String(text||'').trim();
    if(!value) return false;

    if(!cachedVoice) refreshVoices();
    const hadSpeech=synth.speaking || synth.pending;
    if(hadSpeech){ try{synth.cancel();}catch(_){} }
    if(synth.paused){ try{synth.resume();}catch(_){} }

    const makeUtterance=(withVoice=true)=>{
      const u=new SpeechSynthesisUtterance(value);
      u.lang='en-GB';
      if(withVoice && cachedVoice){ u.voice=cachedVoice; u.lang=cachedVoice.lang || 'en-GB'; }
      u.rate=0.92;
      u.pitch=1;
      u.volume=1;
      return u;
    };

    let retried=false;
    const speak=(withVoice=true)=>{
      const utterance=makeUtterance(withVoice);
      utterance.onerror=(event)=>{
        // A local voice can occasionally become unavailable after sleep/device
        // changes. Retry once using the browser's default en-GB resolver.
        if(!retried && withVoice && event.error!=='canceled' && event.error!=='interrupted'){
          retried=true;
          cachedVoice=null;
          setTimeout(()=>speak(false),40);
        }
      };
      try{ synth.speak(utterance); return true; }
      catch(_){
        if(!retried && withVoice){ retried=true; cachedVoice=null; setTimeout(()=>speak(false),40); return true; }
        return false;
      }
    };

    // Chromium may swallow a new utterance if it is queued in the same task as
    // cancel(). Only interrupted speech gets the tiny delay; a normal first click
    // still starts immediately.
    if(hadSpeech) setTimeout(()=>speak(true),25); else speak(true);
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
