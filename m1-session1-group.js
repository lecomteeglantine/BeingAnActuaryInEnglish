(function(){
  'use strict';
  const soundToggle=document.getElementById('groupSoundToggle');
  const buildBrief=document.getElementById('buildBrief');
  const clearBrief=document.getElementById('clearBrief');
  const output=document.getElementById('firmBrief');
  const storageKey='actuarial_m1_s1_group_v1';
  let soundOn=true;

  function say(text){ if(soundOn && window.speakWord) window.speakWord(text); }
  document.querySelectorAll('.group-speak').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));
  soundToggle.addEventListener('click',()=>{ soundOn=!soundOn; soundToggle.setAttribute('aria-pressed',String(soundOn)); soundToggle.textContent=soundOn?'🔊 Sound on':'🔇 Sound off'; if(!soundOn && 'speechSynthesis' in window) speechSynthesis.cancel(); });

  function selections(id){ return [...document.querySelectorAll(`#${id} button.selected`)].map(b=>b.dataset.value); }
  function persist(){
    const data={name:document.getElementById('firmName').value,mission:document.getElementById('firmMission').value,roles:document.getElementById('rolesNote').value,services:selections('serviceChoices'),clients:selections('clientChoices'),values:selections('valueChoices')};
    try{sessionStorage.setItem(storageKey,JSON.stringify(data));}catch(_){}
  }
  function restore(){
    let data={}; try{data=JSON.parse(sessionStorage.getItem(storageKey)||'{}');}catch(_){}
    document.getElementById('firmName').value=data.name||''; document.getElementById('firmMission').value=data.mission||''; document.getElementById('rolesNote').value=data.roles||'';
    [['serviceChoices',data.services||[]],['clientChoices',data.clients||[]],['valueChoices',data.values||[]]].forEach(([id,vals])=>document.querySelectorAll(`#${id} button`).forEach(b=>{ if(vals.includes(b.dataset.value)){b.classList.add('selected');b.setAttribute('aria-pressed','true');}else b.setAttribute('aria-pressed','false'); }));
  }

  document.querySelectorAll('.selectable-grid').forEach(grid=>{
    grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    grid.addEventListener('click',e=>{
      const b=e.target.closest('button[data-value]'); if(!b)return;
      const single=grid.classList.contains('single-select'); const selected=grid.querySelectorAll('button.selected');
      if(single){ grid.querySelectorAll('button').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false');}); b.classList.add('selected');b.setAttribute('aria-pressed','true'); }
      else if(b.classList.contains('selected')){ b.classList.remove('selected');b.setAttribute('aria-pressed','false'); }
      else { const max=Number(grid.dataset.max||999); if(selected.length>=max){ grid.classList.add('selection-warning'); setTimeout(()=>grid.classList.remove('selection-warning'),450); return; } b.classList.add('selected');b.setAttribute('aria-pressed','true'); }
      persist();
    });
  });
  ['firmName','firmMission','rolesNote'].forEach(id=>document.getElementById(id).addEventListener('input',persist));

  buildBrief.addEventListener('click',()=>{
    const name=document.getElementById('firmName').value.trim(); const mission=document.getElementById('firmMission').value.trim(); const roles=document.getElementById('rolesNote').value.trim(); const services=selections('serviceChoices'); const clients=selections('clientChoices'); const values=selections('valueChoices');
    const missing=[]; if(!name)missing.push('a firm name'); if(!mission)missing.push('a one-sentence mission'); if(services.length!==3)missing.push('exactly 3 services'); if(clients.length!==1)missing.push('1 client'); if(!roles)missing.push('team roles'); if(values.length!==3)missing.push('exactly 3 values');
    output.hidden=false;
    if(missing.length){ output.innerHTML=`<div class="brief-alert"><strong>Your firm is not ready yet.</strong><p>Add ${missing.join(', ')}.</p></div>`; output.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const html=`<div class="generated-brief"><p class="module-number">YOUR FIRM BRIEF</p><h3>${escapeHtml(name)}</h3><p class="brief-mission">${escapeHtml(mission)}</p><div class="brief-columns"><div><strong>Our services</strong><ul>${services.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div><strong>Our first client</strong><p>${escapeHtml(clients[0])}</p></div><div><strong>Our values</strong><ul>${values.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div><div><strong>Our team</strong><p>${escapeHtml(roles)}</p></div><div class="brief-reminder"><strong>Pitch reminder</strong><p>Explain the problem, the actuarial work, your client and why your firm deserves trust. Every student speaks for approximately 2 minutes.</p></div><button type="button" class="secondary-btn" id="copyFirmBrief">Copy brief</button></div>`;
    output.innerHTML=html; output.scrollIntoView({behavior:'smooth',block:'start'}); persist();
    document.getElementById('copyFirmBrief').addEventListener('click',async e=>{
      const text=`${name}\n${mission}\n\nServices: ${services.join(', ')}\nClient: ${clients[0]}\nValues: ${values.join(', ')}\nTeam: ${roles}\n\nPitch: every student speaks for approximately 2 minutes.`;
      try{await navigator.clipboard.writeText(text);e.currentTarget.textContent='Copied ✓';}catch(_){e.currentTarget.textContent='Select and copy the brief above';}
    });
  });

  clearBrief.addEventListener('click',()=>{
    ['firmName','firmMission','rolesNote'].forEach(id=>document.getElementById(id).value=''); document.querySelectorAll('.selectable-grid button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');}); output.hidden=true; output.innerHTML=''; try{sessionStorage.removeItem(storageKey);}catch(_){}
  });

  function escapeHtml(s){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  restore();
})();
