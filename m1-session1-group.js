(function(){
  'use strict';
  const soundToggle=document.getElementById('groupSoundToggle');
  const buildBrief=document.getElementById('buildBrief');
  const clearBrief=document.getElementById('clearBrief');
  const output=document.getElementById('firmBrief');
  const storageKey='actuarial_m1_s1_group_v2';
  let soundOn=true;

  // Starting the activity again from the Session 1 overview means a new team.
  // Reload/back-forward still preserves the current team's work.
  try{
    const navEntry=performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const navType=navEntry && navEntry.type;
    const refPath=document.referrer ? new URL(document.referrer).pathname : '';
    if(navType==='navigate' && /\/m1-day1\.html$/.test(refPath)) sessionStorage.removeItem(storageKey);
  }catch(_){}

  function say(text){ if(soundOn && window.speakWord) window.speakWord(text); }
  document.querySelectorAll('.group-speak').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));
  soundToggle.addEventListener('click',()=>{
    soundOn=!soundOn;
    soundToggle.setAttribute('aria-pressed',String(soundOn));
    soundToggle.textContent=soundOn?'🔊 Sound on':'🔇 Sound off';
    if(!soundOn && window.stopSpeech) window.stopSpeech();
  });

  function selections(id){ return [...document.querySelectorAll(`#${id} button.selected`)].map(b=>b.dataset.value); }
  function readForm(){
    return {
      name:document.getElementById('firmName').value,
      mission:document.getElementById('firmMission').value,
      roles:document.getElementById('rolesNote').value,
      services:selections('serviceChoices'),
      clients:selections('clientChoices'),
      values:selections('valueChoices')
    };
  }
  function persist(extra={}){
    let previous={};
    try{ previous=JSON.parse(sessionStorage.getItem(storageKey)||'{}'); }catch(_){}
    const data={...previous,...readForm(),...extra};
    try{sessionStorage.setItem(storageKey,JSON.stringify(data));}catch(_){}
  }
  function stored(){ try{return JSON.parse(sessionStorage.getItem(storageKey)||'{}');}catch(_){return{};} }
  function restore(){
    const data=stored();
    document.getElementById('firmName').value=data.name||'';
    document.getElementById('firmMission').value=data.mission||'';
    document.getElementById('rolesNote').value=data.roles||'';
    [['serviceChoices',data.services||[]],['clientChoices',data.clients||[]],['valueChoices',data.values||[]]].forEach(([id,vals])=>
      document.querySelectorAll(`#${id} button`).forEach(b=>{
        const on=vals.includes(b.dataset.value);
        b.classList.toggle('selected',on);
        b.setAttribute('aria-pressed',String(on));
      })
    );
  }

  document.querySelectorAll('.selectable-grid').forEach(grid=>{
    grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    grid.addEventListener('click',e=>{
      const b=e.target.closest('button[data-value]'); if(!b)return;
      const single=grid.classList.contains('single-select');
      const selected=grid.querySelectorAll('button.selected');
      if(single){
        grid.querySelectorAll('button').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false');});
        b.classList.add('selected');b.setAttribute('aria-pressed','true');
      }else if(b.classList.contains('selected')){
        b.classList.remove('selected');b.setAttribute('aria-pressed','false');
      }else{
        const max=Number(grid.dataset.max||999);
        if(selected.length>=max){
          grid.classList.add('selection-warning');
          setTimeout(()=>grid.classList.remove('selection-warning'),450);
          return;
        }
        b.classList.add('selected');b.setAttribute('aria-pressed','true');
      }
      persist({generated:false});
      output.hidden=true;
    });
  });
  ['firmName','firmMission','rolesNote'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{persist({generated:false});output.hidden=true;}));

  function validate(data){
    const missing=[];
    if(!data.name.trim())missing.push('a firm name');
    if(!data.mission.trim())missing.push('a one-sentence mission');
    if(data.services.length!==3)missing.push('exactly 3 services');
    if(data.clients.length!==1)missing.push('1 client');
    if(!data.roles.trim())missing.push('team roles');
    if(data.values.length!==3)missing.push('exactly 3 values');
    return missing;
  }

  function generateBrief({scroll=true,persistGenerated=true}={}){
    const data=readForm();
    const name=data.name.trim(), mission=data.mission.trim(), roles=data.roles.trim();
    const services=data.services, clients=data.clients, values=data.values;
    const missing=validate(data);
    output.hidden=false;
    if(missing.length){
      output.innerHTML=`<div class="brief-alert" role="alert"><strong>Your firm is not ready yet.</strong><p>Please add:</p><ul>${missing.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`;
      if(scroll) output.scrollIntoView({behavior:'smooth',block:'center'});
      persist({generated:false});
      return false;
    }
    output.innerHTML=`<div class="generated-brief"><p class="module-number">YOUR FIRM BRIEF</p><h3>${escapeHtml(name)}</h3><p class="brief-mission">${escapeHtml(mission)}</p><div class="brief-columns"><div><strong>Our services</strong><ul>${services.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div><strong>Our first client</strong><p>${escapeHtml(clients[0])}</p></div><div><strong>Our values</strong><ul>${values.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div><div><strong>Our team</strong><p>${escapeHtml(roles)}</p></div><div class="brief-reminder"><strong>Pitch reminder</strong><p>Explain the problem, the actuarial work, your client and why your firm deserves trust. Every student speaks for approximately 2 minutes.</p></div><button type="button" class="secondary-btn" id="copyFirmBrief">Copy brief</button></div>`;
    if(scroll) output.scrollIntoView({behavior:'smooth',block:'start'});
    if(persistGenerated) persist({generated:true});
    document.getElementById('copyFirmBrief').addEventListener('click',async e=>{
      const text=`${name}\n${mission}\n\nServices: ${services.join(', ')}\nClient: ${clients[0]}\nValues: ${values.join(', ')}\nTeam: ${roles}\n\nPitch: every student speaks for approximately 2 minutes.`;
      try{await navigator.clipboard.writeText(text);e.currentTarget.textContent='Copied ✓';}
      catch(_){e.currentTarget.textContent='Copy unavailable — select the brief above';}
    });
    return true;
  }

  buildBrief.addEventListener('click',()=>generateBrief());

  clearBrief.addEventListener('click',()=>{
    const hasWork=document.getElementById('firmName').value.trim() || document.getElementById('firmMission').value.trim() || document.getElementById('rolesNote').value.trim() || document.querySelector('.selectable-grid button.selected');
    if(hasWork && !confirm('Clear all choices for this firm and start again?')) return;
    ['firmName','firmMission','rolesNote'].forEach(id=>document.getElementById(id).value='');
    document.querySelectorAll('.selectable-grid button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
    output.hidden=true; output.innerHTML='';
    if(window.stopSpeech) window.stopSpeech();
    try{sessionStorage.removeItem(storageKey);}catch(_){}
  });

  function escapeHtml(s){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  restore();
  const data=stored();
  if(data.generated && !validate(readForm()).length) generateBrief({scroll:false,persistGenerated:false});
})();
