(function(){
  'use strict';
  const STORAGE_KEY='actuarial_m1_s1_firm_draft_v1';
  const MAX_BUDGET=100;
  const requiredCounts={client:1,expertise:2,team:2,tools:2,identity:2};
  const labels={client:'client',expertise:'areas of expertise',team:'team profiles',tools:'tools',identity:'identity traits'};
  let soundOn=true;
  let state={round:1,client:[],expertise:[],team:[],tools:[],identity:[],challengeResponse:'',firmName:'',firmPromise:''};

  const $=sel=>document.querySelector(sel);
  const $$=sel=>[...document.querySelectorAll(sel)];
  const errorBox=$('#draftError');

  // A fresh visit from the Session 1 overview starts a new team. Refresh/back-forward keeps the current team's draft.
  try{
    const navEntry=performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const refPath=document.referrer ? new URL(document.referrer).pathname : '';
    if(navEntry && navEntry.type==='navigate' && /\/m1-day1\.html$/.test(refPath)) sessionStorage.removeItem(STORAGE_KEY);
  }catch(_){ }

  function optionById(group,id){return $$('[data-group][data-id]').find(el=>el.dataset.group===group && el.dataset.id===id) || null;}
  function optionData(group,id){
    const el=optionById(group,id);
    return el?{id,label:el.dataset.label,cost:Number(el.dataset.cost||0)}:null;
  }
  function selectedData(group){return (state[group]||[]).map(id=>optionData(group,id)).filter(Boolean);}
  function spent(){
    return ['client','expertise','team','tools','identity'].flatMap(selectedData).reduce((sum,item)=>sum+item.cost,0);
  }
  function left(){return MAX_BUDGET-spent();}
  function save(){
    try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){ }
  }
  function load(){
    try{
      const raw=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null');
      if(raw && typeof raw==='object') state={...state,...raw};
    }catch(_){ }
    state.round=Math.min(8,Math.max(1,Number(state.round)||1));
    ['client','expertise','team','tools','identity'].forEach(k=>{
      if(!Array.isArray(state[k])) state[k]=[];
      state[k]=state[k].filter(id=>optionById(k,id)).slice(0,requiredCounts[k]);
    });
    if(typeof state.challengeResponse!=='string') state.challengeResponse='';
    if(typeof state.firmName!=='string') state.firmName='';
    if(typeof state.firmPromise!=='string') state.firmPromise='';
  }
  function showError(message){
    errorBox.textContent=message;
    errorBox.hidden=false;
    errorBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function clearError(){errorBox.hidden=true;errorBox.textContent='';}
  function say(text){if(soundOn && window.speakWord) window.speakWord(text);}

  function updateBudget(){
    const used=spent(), remaining=MAX_BUDGET-used;
    $('#budgetLeft').textContent=remaining;
    $('#budgetSpent').textContent=`${used} point${used===1?'':'s'} spent`;
    $('#budgetBar').style.width=`${Math.min(100,Math.max(0,used))}%`;
    document.querySelector('.budget-card').classList.toggle('over-budget',remaining<0);
  }
  function textList(group){const items=selectedData(group).map(x=>x.label);return items.length?items.join(', '):'—';}
  function updateSummary(){
    $('#summaryClient').textContent=textList('client');
    $('#summaryExpertise').textContent=textList('expertise');
    $('#summaryTeam').textContent=textList('team');
    $('#summaryTools').textContent=textList('tools');
    $('#summaryIdentity').textContent=textList('identity');
  }
  function renderSelections(){
    $$('[data-group][data-id]').forEach(btn=>{
      const on=(state[btn.dataset.group]||[]).includes(btn.dataset.id);
      btn.classList.toggle('selected',on);
      btn.setAttribute('aria-pressed',String(on));
    });
  }
  function renderRound(){
    $$('.draft-round').forEach(section=>section.hidden=Number(section.dataset.round)!==state.round);
    $$('.draft-progress li').forEach(li=>{
      const n=Number(li.dataset.progress);
      li.classList.toggle('active',n===state.round);
      li.classList.toggle('done',n<state.round);
      if(n===state.round) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
    });
    if(state.round===6) renderReview();
    if(state.round===7) renderChallenge();
    if(state.round===8) renderBoardroom();
    updateBudget();updateSummary();renderSelections();
  }

  function selectionMessage(group){
    const required=requiredCounts[group], count=state[group].length;
    if(count===required) return '';
    return `Choose ${required===1?'exactly 1':`exactly ${required}`} ${labels[group]} before continuing.`;
  }
  function validateRound(round){
    const group={1:'client',2:'expertise',3:'team',4:'tools',5:'identity'}[round];
    if(group){
      const msg=selectionMessage(group); if(msg){showError(msg);return false;}
    }
    if(spent()>MAX_BUDGET){showError(`Your firm costs ${spent()} points. You only have 100. Go back and change at least one paid option.`);return false;}
    if(round===3 && left()<18){showError(`You have ${left()} points left, but you must keep at least 18 points for two tools. Change one team choice before continuing.`);return false;}
    if(round===7 && !state.challengeResponse){showError('Choose one response to the client alert before going to the boardroom.');return false;}
    return true;
  }

  function toggleOption(btn){
    clearError();
    const group=btn.dataset.group,id=btn.dataset.id,required=requiredCounts[group];
    const arr=state[group];
    const existing=arr.indexOf(id);
    if(existing>=0){arr.splice(existing,1);}
    else{
      if(required===1) state[group]=[id];
      else if(arr.length>=required){showError(`You can choose only ${required} ${labels[group]}. Deselect one option first.`);return;}
      else arr.push(id);
    }
    state.challengeResponse='';
    state.firmName=$('#firmName')?$('#firmName').value:state.firmName;
    state.firmPromise=$('#firmPromise')?$('#firmPromise').value:state.firmPromise;
    save();renderSelections();updateBudget();updateSummary();
  }

  function firmProfile(){
    const s=spent();
    if(s<=90) return {title:'Lean & flexible',text:'You kept a substantial reserve. Your firm has room to adapt, but you must explain what you deliberately chose not to buy.'};
    if(s<=97) return {title:'Balanced investment',text:'You invested in a clear set of capabilities while keeping some budget in reserve.'};
    if(s<=100) return {title:'Fully invested',text:'You used almost all your resources. Your firm is ambitious, so every expensive choice needs a strong justification.'};
    return {title:'Over budget',text:'Your draft is not financially viable yet. Change at least one paid choice before continuing.'};
  }
  function configCode(){
    const codePart=(g)=>state[g].map(id=>id.slice(0,3).toUpperCase()).sort().join('-')||'---';
    return [codePart('client'),codePart('expertise'),codePart('team'),codePart('tools'),codePart('identity')].join(' / ');
  }
  function renderReview(){
    const profile=firmProfile();
    $('#draftReview').innerHTML=`
      <div class="review-score"><span>${left()}</span><small>points left</small></div>
      <div class="review-profile"><p class="module-number">${escapeHtml(profile.title)}</p><p>${escapeHtml(profile.text)}</p><p class="config-code"><strong>Configuration code:</strong> ${escapeHtml(configCode())}</p></div>
      <div class="review-grid">
        <div><strong>Client</strong><span>${escapeHtml(textList('client'))}</span></div>
        <div><strong>Expertise</strong><span>${escapeHtml(textList('expertise'))}</span></div>
        <div><strong>Team</strong><span>${escapeHtml(textList('team'))}</span></div>
        <div><strong>Tools</strong><span>${escapeHtml(textList('tools'))}</span></div>
        <div><strong>Identity</strong><span>${escapeHtml(textList('identity'))}</span></div>
      </div>`;
  }

  const challenges={
    climate:{title:'Extreme weather shock',story:'A major client has just experienced severe flooding. The financial exposure is much higher than expected, and the client wants an answer today.',question:'What should your firm do first?',responses:[
      {id:'more-data',label:'Check the exposure data and review the assumptions before updating the scenarios.',quality:'strong',feedback:'Strong actuarial response: verify the evidence, challenge the assumptions and then update the scenarios.'},
      {id:'raise-now',label:'Recommend a large price increase immediately, before analysing the new information.',quality:'risky',feedback:'Risky: acting before checking data and assumptions could create a poorly justified recommendation.'},
      {id:'ignore',label:'Ignore the event because one flood does not prove that the model is wrong.',quality:'risky',feedback:'Risky: one event does not prove the model is wrong, but it is still new evidence that should be investigated.'},
      {id:'client-only',label:'Ask the client what answer they would prefer and adjust the model to match it.',quality:'risky',feedback:'Not acceptable: actuarial judgement should remain evidence-based and independent.'}
    ]},
    pensions:{title:'Longevity assumptions challenged',story:'New population data suggest that members of your pension client may live longer than your current model assumes.',question:'What should your firm recommend?',responses:[
      {id:'review-longevity',label:'Review the longevity assumptions, test alternative scenarios and explain the financial impact.',quality:'strong',feedback:'Strong response: update assumptions carefully and show the client how uncertainty changes the obligations.'},
      {id:'keep-model',label:'Keep the existing model because changing assumptions would make the results harder to explain.',quality:'risky',feedback:'Risky: simplicity is not a reason to ignore relevant new evidence.'},
      {id:'single-forecast',label:'Replace the model with one new life-expectancy forecast and present it as the future outcome.',quality:'partial',feedback:'Partial: a single forecast hides uncertainty. Scenario analysis would give the client a more useful view.'},
      {id:'delay',label:'Wait until the next annual review even if the new data are material.',quality:'risky',feedback:'Risky: material new information may require earlier review and communication.'}
    ]},
    claims:{title:'Unexpected claims spike',story:'Your insurance client reports that claim frequency and average claim cost have both increased faster than expected.',question:'What is the best first response?',responses:[
      {id:'claims-review',label:'Analyse the new claims data, separate frequency from severity and review the pricing assumptions.',quality:'strong',feedback:'Strong response: identify what changed before making a pricing recommendation.'},
      {id:'double-premium',label:'Double premiums immediately to protect the insurer.',quality:'risky',feedback:'Risky: a large pricing change needs evidence and a clear understanding of the drivers.'},
      {id:'average-only',label:'Look only at the average claim cost and ignore claim frequency.',quality:'partial',feedback:'Incomplete: frequency and severity can change for different reasons and both matter.'},
      {id:'marketing',label:'Ask marketing to decide which customers should pay more.',quality:'risky',feedback:'Risky: segmentation and pricing decisions require actuarial evidence, not marketing preference alone.'}
    ]},
    transparency:{title:'Board challenges your model',story:'A board member says your model is too complex and asks why the company should trust its conclusions.',question:'How should your team respond?',responses:[
      {id:'explain-model',label:'Explain the purpose, key assumptions, limitations and scenario results in clear language.',quality:'strong',feedback:'Strong response: technical quality matters, but so do transparency, limitations and communication.'},
      {id:'math-proof',label:'Show every mathematical formula to prove that the model is sophisticated.',quality:'partial',feedback:'Partial: technical detail may be useful, but it does not automatically make the model understandable or trustworthy.'},
      {id:'trust-us',label:'Say that the board should trust the actuarial team because the model was built by experts.',quality:'risky',feedback:'Risky: expertise does not remove the need to explain assumptions, evidence and limitations.'},
      {id:'simplify-results',label:'Remove the unfavourable scenarios so the presentation is easier to understand.',quality:'risky',feedback:'Not acceptable: simplifying communication must not hide material risk.'}
    ]},
    data:{title:'Data quality problem',story:'Your healthcare client sends a large dataset, but several fields are incomplete and some historical definitions have changed.',question:'What should your firm do before modelling?',responses:[
      {id:'data-review',label:'Assess data quality, document limitations and decide what can be used reliably.',quality:'strong',feedback:'Strong response: a model is only as useful as the evidence and assumptions behind it.'},
      {id:'fill-random',label:'Fill every missing value automatically so the model can run immediately.',quality:'risky',feedback:'Risky: imputation needs a justified method and its impact should be understood.'},
      {id:'all-data',label:'Use all available data because a larger dataset is always better.',quality:'risky',feedback:'Risky: inconsistent or poorly defined data can make a larger dataset less reliable, not more.'},
      {id:'cancel',label:'Cancel the project because imperfect data can never be used actuarially.',quality:'partial',feedback:'Too extreme: imperfect data can sometimes be used if limitations are understood, managed and communicated.'}
    ]}
  };
  function challengeKey(){
    const ex=new Set(state.expertise), client=state.client[0];
    if(client==='climate' || ex.has('climate')) return 'climate';
    if(client==='pensions' || ex.has('pensions')) return 'pensions';
    if(client==='insurance' || ex.has('pricing') || ex.has('reserving')) return 'claims';
    if(client==='health') return 'data';
    return 'transparency';
  }
  function renderChallenge(){
    const ch=challenges[challengeKey()];
    $('#challengeCard').innerHTML=`<div class="challenge-copy"><p class="module-number">${escapeHtml(ch.title)}</p><p>${escapeHtml(ch.story)}</p><h3>${escapeHtml(ch.question)}</h3></div><div class="challenge-options">${ch.responses.map(r=>`<button type="button" data-response="${r.id}" class="${state.challengeResponse===r.id?'selected':''}" aria-pressed="${state.challengeResponse===r.id}"><span>${escapeHtml(r.label)}</span></button>`).join('')}</div><div id="challengeFeedback" class="challenge-feedback" aria-live="polite"></div>`;
    if(state.challengeResponse) showChallengeFeedback(ch,state.challengeResponse);
  }
  function showChallengeFeedback(ch,id){
    const r=ch.responses.find(x=>x.id===id); if(!r)return;
    const box=$('#challengeFeedback');
    box.className=`challenge-feedback ${r.quality}`;
    box.innerHTML=`<strong>${r.quality==='strong'?'Strong actuarial response':r.quality==='partial'?'Partly convincing':'Risky response'}</strong><p>${escapeHtml(r.feedback)}</p>`;
  }

  function renderBoardroom(){
    $('#firmName').value=state.firmName||'';
    $('#firmPromise').value=state.firmPromise||'';
    const ch=challenges[challengeKey()];
    const response=ch.responses.find(x=>x.id===state.challengeResponse);
    const profile=firmProfile();
    $('#firmBrief').innerHTML=`<div class="generated-brief"><p class="module-number">YOUR DRAFTED FIRM</p><h3>${escapeHtml(state.firmName.trim()||'Name your firm above')}</h3><p class="brief-mission">${escapeHtml(state.firmPromise.trim()||'Add a one-sentence promise above.')}</p><div class="brief-columns"><div><strong>Target client</strong><p>${escapeHtml(textList('client'))}</p></div><div><strong>Expertise</strong><ul>${selectedData('expertise').map(x=>`<li>${escapeHtml(x.label)}</li>`).join('')}</ul></div><div><strong>Budget</strong><p>${spent()} / 100 points spent<br><strong>${left()} points left</strong></p></div></div><div class="brief-columns"><div><strong>Core team</strong><ul>${selectedData('team').map(x=>`<li>${escapeHtml(x.label)}</li>`).join('')}</ul></div><div><strong>Tools</strong><ul>${selectedData('tools').map(x=>`<li>${escapeHtml(x.label)}</li>`).join('')}</ul></div><div><strong>Identity</strong><ul>${selectedData('identity').map(x=>`<li>${escapeHtml(x.label)}</li>`).join('')}</ul></div></div><div class="brief-reminder"><strong>${escapeHtml(ch.title)}</strong><p>${escapeHtml(response?response.label:'No response selected')}</p></div><p class="config-code"><strong>Configuration code:</strong> ${escapeHtml(configCode())} · ${escapeHtml(profile.title)}</p></div>`;
  }

  document.addEventListener('click',e=>{
    const option=e.target.closest('[data-group][data-id]');
    if(option){toggleOption(option);return;}
    const response=e.target.closest('[data-response]');
    if(response){
      clearError();state.challengeResponse=response.dataset.response;save();renderChallenge();return;
    }
    const next=e.target.closest('.draft-next');
    if(next){
      clearError();
      if(!validateRound(state.round)) return;
      state.round=Number(next.dataset.next);save();renderRound();
      $('#draftGame').scrollIntoView({behavior:'smooth',block:'start'});return;
    }
    const back=e.target.closest('.draft-back');
    if(back){clearError();state.round=Number(back.dataset.back);save();renderRound();$('#draftGame').scrollIntoView({behavior:'smooth',block:'start'});}
  });

  $$('.group-speak').forEach(btn=>btn.addEventListener('click',()=>say(btn.dataset.say)));
  $('#groupSoundToggle').addEventListener('click',e=>{
    soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',String(soundOn));e.currentTarget.textContent=soundOn?'🔊 Sound on':'🔇 Sound off';if(!soundOn&&window.stopSpeech)window.stopSpeech();
  });
  $('#firmName').addEventListener('input',e=>{state.firmName=e.target.value;save();if(state.round===8)renderBoardroom();});
  $('#firmPromise').addEventListener('input',e=>{state.firmPromise=e.target.value;save();if(state.round===8)renderBoardroom();});
  $('#copyFirmBrief').addEventListener('click',async e=>{
    state.firmName=$('#firmName').value;state.firmPromise=$('#firmPromise').value;save();renderBoardroom();
    const ch=challenges[challengeKey()],resp=ch.responses.find(x=>x.id===state.challengeResponse);
    const text=`${state.firmName.trim()||'Our actuarial firm'}\n${state.firmPromise.trim()}\n\nClient: ${textList('client')}\nExpertise: ${textList('expertise')}\nTeam: ${textList('team')}\nTools: ${textList('tools')}\nIdentity: ${textList('identity')}\nBudget: ${spent()}/100 (${left()} left)\nChallenge: ${ch.title}\nResponse: ${resp?resp.label:''}\nConfiguration: ${configCode()}\n\nEvery student speaks for approximately 2 minutes.`;
    try{await navigator.clipboard.writeText(text);e.currentTarget.textContent='Copied ✓';setTimeout(()=>e.currentTarget.textContent='Copy our firm brief',1500);}catch(_){e.currentTarget.textContent='Copy unavailable';}
  });
  $('#restartDraft').addEventListener('click',()=>{
    if(!confirm('Start a completely new firm? This will clear this group’s draft.'))return;
    try{sessionStorage.removeItem(STORAGE_KEY);}catch(_){ }
    if(window.stopSpeech)window.stopSpeech();
    state={round:1,client:[],expertise:[],team:[],tools:[],identity:[],challengeResponse:'',firmName:'',firmPromise:''};
    clearError();renderRound();$('#draftGame').scrollIntoView({behavior:'smooth',block:'start'});
  });

  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  load();renderRound();
})();
