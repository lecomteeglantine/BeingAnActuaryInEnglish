(function(){
  'use strict';

  const stageContainer=document.getElementById('stageContainer');
  const progressFill=document.getElementById('progressFill');
  const stageDots=[...document.querySelectorAll('#stageDots li')];
  const soundToggle=document.getElementById('soundToggle');
  const resetButton=document.getElementById('resetMission');
  const STORAGE_KEY='actuarial_m1_s1_individual_v2';
  let soundOn=true;
  let audioCtx=null;
  let currentStage=1;
  let timerId=null;

  // A deliberate new launch from the Session 1 overview starts clean on shared
  // classroom devices. A reload/back-forward keeps the current student's work.
  try{
    const navEntry=performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const navType=navEntry && navEntry.type;
    const refPath=document.referrer ? new URL(document.referrer).pathname : '';
    if(navType==='navigate' && /\/m1-day1\.html$/.test(refPath)) sessionStorage.removeItem(STORAGE_KEY);
  }catch(_){}

  const pronunciation=[
    {word:'actuary',ipa:'/ˈæk.tʃu.ə.ri/',options:['ACT-u-ar-y','act-u-AR-y'],correct:0,note:'Stress the first syllable.'},
    {word:'actuarial',ipa:'/ˌæk.tʃuˈeə.ri.əl/',options:['AC-tu-ar-i-al','ac-tu-AR-i-al'],correct:1,note:'The main stress moves: actuARial.'},
    {word:'liability',ipa:'/ˌlaɪ.əˈbɪl.ə.ti/',options:['li-a-BIL-i-ty','LI-a-bi-li-ty'],correct:0,note:'Stress BIL.'},
    {word:'probability',ipa:'/ˌprɒb.əˈbɪl.ə.ti/',options:['PROB-a-bi-li-ty','prob-a-BIL-i-ty'],correct:1,note:'Stress BIL.'},
    {word:'insurance',ipa:'/ɪnˈʃʊə.rəns/',options:['IN-sur-ance','in-SUR-ance'],correct:1,note:'Stress the second syllable.'},
    {word:'premium',ipa:'/ˈpriː.mi.əm/',options:['PRE-mi-um','pre-MI-um'],correct:0,note:'Stress the first syllable.'},
    {word:'uncertainty',ipa:'/ʌnˈsɜː.tən.ti/',options:['UN-cer-tain-ty','un-CER-tain-ty'],correct:1,note:'Stress CER.'},
    {word:'forecast',ipa:'/ˈfɔː.kɑːst/',options:['fore-CAST','FORE-cast'],correct:1,note:'As a noun, stress the first syllable.'},
    {word:'portfolio',ipa:'/pɔːtˈfəʊ.li.əʊ/',options:['PORT-fo-li-o','port-FO-li-o'],correct:1,note:'Stress FO.'},
    {word:'model',ipa:'/ˈmɒd.əl/',options:['MOD-el','mo-DEL'],correct:0,note:'Stress the first syllable.'}
  ];

  const cases=[
    {icon:'🚗',label:'CASE A · MOTOR INSURANCE',problem:'Claim numbers and repair costs are rising.',question:'What should the actuary do?',options:['Increase every premium immediately.','Analyse claims and cost data before recommending pricing action.','Ask the marketing team to guess next year’s losses.','Ignore recent data because the past is more reliable.'],correct:1,feedback:'Actuarial work starts with relevant evidence. The actuary analyses frequency, severity and cost trends before recommending action.'},
    {icon:'👵',label:'CASE B · PENSION FUND',problem:'Members may live longer than current assumptions.',question:'What is the actuarial task?',options:['Predict the exact age at which each member will die.','Reduce all pensions now.','Model possible longevity outcomes and estimate future liabilities.','Replace the pension model with a customer survey.'],correct:2,feedback:'The actuary models uncertain longevity outcomes and estimates their financial impact on future pension obligations.'},
    {icon:'🌊',label:'CASE C · EXTREME WEATHER',problem:'A coastal company may face larger losses from severe weather.',question:'What would an actuary contribute?',options:['Use scenarios to estimate possible financial losses and advise on risk management.','Guarantee that no extreme event will happen.','Choose the company’s advertising strategy.','Focus only on last year’s weather.'],correct:0,feedback:'Actuaries use scenarios and models to quantify possible losses and support decisions under uncertainty.'}
  ];

  const myths=[
    {text:'Actuaries can predict exactly what will happen.',reality:false,why:'Actuaries quantify uncertainty; they do not promise certainty.'},
    {text:'Actuaries only work in insurance.',reality:false,why:'Actuarial skills are used in pensions, finance, risk, consulting, data and other fields.'},
    {text:'An actuary combines mathematics, statistics and business knowledge.',reality:true,why:'Technical analysis only becomes useful when it supports a real decision.'},
    {text:'Actuaries help organisations make decisions under uncertainty.',reality:true,why:'This is one of the profession’s central purposes.'},
    {text:'Actuaries spend their entire working day doing calculations alone.',reality:false,why:'Communication, judgement, teamwork and explaining results are essential parts of the job.'}
  ];

  const vocab=[
    ['actuary','/ˈæk.tʃu.ə.ri/','a professional who assesses financial risk'],
    ['actuarial','/ˌæk.tʃuˈeə.ri.əl/','relating to actuarial work'],
    ['risk','/rɪsk/','the possibility of an adverse outcome'],
    ['uncertainty','/ʌnˈsɜː.tən.ti/','not knowing exactly what will happen'],
    ['probability','/ˌprɒb.əˈbɪl.ə.ti/','how likely an event is'],
    ['data','/ˈdeɪ.tə/','facts or observations used for analysis'],
    ['model','/ˈmɒd.əl/','a simplified representation used to analyse outcomes'],
    ['forecast','/ˈfɔː.kɑːst/','an estimate of what may happen in the future']
  ];

  function getState(){
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'{}'); } catch(_){ return {}; }
  }
  function saveState(extra={}){
    try { sessionStorage.setItem(STORAGE_KEY,JSON.stringify({...getState(),stage:currentStage,...extra})); } catch(_){}
  }

  function playTone(kind='ok'){
    if(!soundOn) return;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      const now=audioCtx.currentTime;
      const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      const map={ok:[660,880],bad:[240,190],unlock:[523,659],tick:[880,880]};
      const pair=map[kind]||map.ok;
      o.type=kind==='bad'?'triangle':'sine'; o.frequency.setValueAtTime(pair[0],now); o.frequency.exponentialRampToValueAtTime(pair[1],now+.12);
      g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.12,now+.015); g.gain.exponentialRampToValueAtTime(.0001,now+.18);
      o.start(now); o.stop(now+.2);
    }catch(_){}
  }

  function say(text){ if(soundOn && window.speakWord) window.speakWord(text); }
  function listenButton(word,label='Listen'){
    return `<button type="button" class="mini-btn mission-listen" data-say="${escapeAttr(word)}" aria-label="Listen to ${escapeAttr(word)}">🔊 ${label}</button>`;
  }
  function escapeAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function updateProgress(){
    progressFill.style.width=`${((currentStage-1)/5)*100}%`;
    stageDots.forEach((li,i)=>{ const active=i===currentStage-1; li.classList.toggle('active',active); li.classList.toggle('done',i<currentStage-1); if(active) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current'); });
    saveState();
  }

  function nextStage(){ if(currentStage<6){ currentStage++; updateProgress(); renderStage(); playTone('unlock'); window.scrollTo({top:document.querySelector('.mission-progress').offsetTop-20,behavior:'smooth'}); } }

  function stageFrame(kicker,title,time,img,content){
    return `<div class="stage-card"><div class="stage-card-head"><div><p class="module-number">${kicker}</p><h2>${title}</h2><p class="stage-time">${time}</p></div>${img?`<img src="${img}" alt="">`:''}</div><div class="stage-card-body">${content}</div></div>`;
  }

  function renderWelcome(){
    const cards=vocab.map(([w,ipa,def])=>`<article class="vocab-pass"><div><strong>${w}</strong><span class="ipa">${ipa}</span></div><p>${def}</p>${listenButton(w)}</article>`).join('');
    stageContainer.innerHTML=stageFrame('08:45 · WELCOME TO THE RISK FLOOR','Collect your professional badge','Mission 1 of 6 · about 3 minutes','',`
      <div class="scene-message"><div class="avatar">NS</div><div><strong>Welcome to Northstar.</strong><p>Before your first client meeting, you need to prove that you can speak the language of risk. Start with the eight words below. Listen, then say each word aloud.</p></div></div>
      <div class="vocab-pass-grid">${cards}</div>
      <div class="stage-instruction"><strong>Your task</strong><span>Use the Listen buttons to practise the words you need. Then say: <em>“An actuary uses data and models to understand risk and uncertainty.”</em></span></div>
      <div class="stage-actions"><button type="button" class="primary-link" id="completeWelcome">I’m ready. Give me my badge →</button></div>`);
    document.getElementById('completeWelcome').addEventListener('click',()=>{ playTone('ok'); nextStage(); });
  }

  function renderPronunciation(){
    stageContainer.innerHTML=stageFrame('09:00 · SECURITY GATE','Pass the pronunciation check','Mission 2 of 6 · about 5 minutes','assets/session1/security-gate.svg',`
      <p class="task-prompt">The gate opens only when you can identify the correct stress pattern. Use <strong>Listen</strong>, choose an answer, read the feedback, then say the word aloud.</p>
      <div id="pronunciationQuiz" class="pronunciation-quiz"></div>
      <div class="mission-score" id="pronScore">0 / ${pronunciation.length} checked</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="pronNext" disabled>Security cleared →</button></div>`);
    const quiz=document.getElementById('pronunciationQuiz');
    pronunciation.forEach((q,i)=>{
      const article=document.createElement('article'); article.className='pron-item'; article.dataset.index=i;
      article.innerHTML=`<div class="pron-word"><div><span class="pron-count">${String(i+1).padStart(2,'0')}</span><strong>${q.word}</strong><span class="ipa">${q.ipa}</span></div>${listenButton(q.word,'Listen')}</div><div class="pron-options">${q.options.map((o,j)=>`<button type="button" data-choice="${j}">${o}</button>`).join('')}</div><p class="inline-feedback" aria-live="polite"></p>`;
      quiz.appendChild(article);
    });
    let checked=0; let correct=0;
    quiz.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-choice]'); if(!btn) return;
      const item=btn.closest('.pron-item'); if(item.dataset.done) return;
      const q=pronunciation[Number(item.dataset.index)]; const choice=Number(btn.dataset.choice); item.dataset.done='1'; checked++;
      item.querySelectorAll('.pron-options button').forEach((b,j)=>{ b.disabled=true; if(j===q.correct)b.classList.add('correct'); });
      const fb=item.querySelector('.inline-feedback');
      if(choice===q.correct){ correct++; btn.classList.add('correct'); fb.innerHTML=`<strong>Correct.</strong> ${q.note} Say it aloud now.`; playTone('ok'); }
      else { btn.classList.add('wrong'); fb.innerHTML=`<strong>Not quite.</strong> ${q.note} Listen again, then say it aloud.`; playTone('bad'); }
      say(q.word);
      document.getElementById('pronScore').textContent=`${checked} / ${pronunciation.length} checked · ${correct} correct first time`;
      if(checked===pronunciation.length) document.getElementById('pronNext').disabled=false;
    });
    document.getElementById('pronNext').addEventListener('click',nextStage);
  }

  function renderCases(){
    stageContainer.innerHTML=stageFrame('09:15 · THREE FILES. THREE PROBLEMS.','Open your first client files','Mission 3 of 6 · about 5 minutes','assets/session1/case-files.svg',`
      <p class="task-prompt">Your manager has left three files on your desk. For each client, choose the response that best reflects actuarial work.</p><div id="caseList" class="case-list"></div><div class="mission-score" id="caseScore">0 / ${cases.length} files reviewed</div><div class="stage-actions"><button type="button" class="primary-link" id="caseNext" disabled>Send my advice →</button></div>`);
    const list=document.getElementById('caseList'); let done=0; let score=0;
    cases.forEach((c,i)=>{
      const el=document.createElement('article'); el.className='client-file'; el.dataset.index=i;
      el.innerHTML=`<div class="file-tab">${c.icon} ${c.label}</div><h3>${c.problem}</h3><p><strong>${c.question}</strong></p><div class="case-options">${c.options.map((o,j)=>`<button type="button" data-choice="${j}">${o}</button>`).join('')}</div><p class="inline-feedback" aria-live="polite"></p>`; list.appendChild(el);
    });
    list.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-choice]'); if(!btn) return;
      const file=btn.closest('.client-file'); if(file.dataset.done) return; file.dataset.done='1';
      const c=cases[Number(file.dataset.index)]; const choice=Number(btn.dataset.choice); done++;
      file.querySelectorAll('.case-options button').forEach((b,j)=>{ b.disabled=true; if(j===c.correct)b.classList.add('correct'); });
      const fb=file.querySelector('.inline-feedback');
      if(choice===c.correct){ score++; btn.classList.add('correct'); fb.innerHTML=`<strong>Good actuarial judgement.</strong> ${c.feedback}`; playTone('ok'); }
      else { btn.classList.add('wrong'); fb.innerHTML=`<strong>Think like an actuary.</strong> ${c.feedback}`; playTone('bad'); }
      document.getElementById('caseScore').textContent=`${done} / ${cases.length} files reviewed · ${score} good decisions`;
      if(done===cases.length) document.getElementById('caseNext').disabled=false;
    });
    document.getElementById('caseNext').addEventListener('click',nextStage);
  }

  function renderRiskLab(){
    const items=[
      ['historical claims','Relevant',true],['claim frequency','Relevant',true],['average claim cost','Relevant',true],['repair-cost inflation','Relevant',true],['model assumptions','Relevant',true],['company logo colour','Noise',false],['CEO’s favourite car','Noise',false],['social media followers','Noise',false]
    ];
    stageContainer.innerHTML=stageFrame('09:35 · RISK LAB','Find the signal in the noise','Mission 4 of 6 · about 4 minutes','assets/session1/risk-lab.svg',`
      <div class="lab-brief"><strong>Situation</strong><span>Last year, 10,000 policyholders generated 620 claims. This year, repair costs are rising.</span></div><p class="task-prompt">Select the <strong>five pieces of information</strong> an actuary should examine before advising the insurer.</p><div class="lab-grid" id="labGrid">${items.map((it,i)=>`<button type="button" data-index="${i}" aria-pressed="false"><span>${it[0]}</span><small>${it[1]}</small></button>`).join('')}</div><p id="labFeedback" class="inline-feedback" aria-live="polite"></p><div class="stage-actions"><button type="button" class="primary-link" id="checkLab">Check my dashboard</button><button type="button" class="primary-link" id="labNext" hidden>Enter the client meeting →</button></div>`);
    const grid=document.getElementById('labGrid');
    grid.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const on=b.getAttribute('aria-pressed')==='true'; b.setAttribute('aria-pressed',String(!on)); b.classList.toggle('selected',!on); });
    document.getElementById('checkLab').addEventListener('click',()=>{
      const selected=[...grid.querySelectorAll('button[aria-pressed="true"]')].map(b=>Number(b.dataset.index));
      const correct=selected.length===5 && selected.every(i=>items[i][2]);
      const fb=document.getElementById('labFeedback');
      if(correct){ fb.innerHTML='<strong>Dashboard ready.</strong> You focused on evidence that affects claims, costs and the model. <button type="button" class="mini-btn" id="speakLabSentence">🔊 Hear the key sentence</button><br><em>Actuaries use data and models to estimate financial risks and support decisions under uncertainty.</em>'; playTone('ok'); document.getElementById('checkLab').hidden=true; document.getElementById('labNext').hidden=false; document.getElementById('speakLabSentence').addEventListener('click',()=>say('Actuaries use data and models to estimate financial risks and support decisions under uncertainty.')); }
      else { fb.innerHTML='<strong>Not yet.</strong> Choose exactly five items that could change the analysis. Remove information that has no meaningful link to the risk.'; playTone('bad'); }
    });
    document.getElementById('labNext').addEventListener('click',nextStage);
  }

  function renderMyths(){
    stageContainer.innerHTML=stageFrame('09:50 · MYTH OR REALITY?','Correct the office rumours','Mission 5 of 6 · about 4 minutes','',`
      <p class="task-prompt">Five notifications have appeared on your screen. Decide whether each statement reflects real actuarial work.</p><div id="mythList" class="myth-list"></div><div class="mission-score" id="mythScore">0 / ${myths.length} checked</div><div class="stage-actions"><button type="button" class="primary-link" id="mythNext" disabled>Go to the lift →</button></div>`);
    const list=document.getElementById('mythList'); let done=0; let score=0;
    myths.forEach((m,i)=>{ const el=document.createElement('article'); el.className='myth-item'; el.dataset.index=i; el.innerHTML=`<p>${m.text}</p><div><button type="button" data-answer="false">MYTH</button><button type="button" data-answer="true">REALITY</button></div><span class="inline-feedback" aria-live="polite"></span>`; list.appendChild(el); });
    list.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-answer]'); if(!btn)return; const item=btn.closest('.myth-item'); if(item.dataset.done)return; item.dataset.done='1'; const m=myths[Number(item.dataset.index)]; const ans=btn.dataset.answer==='true'; done++;
      item.querySelectorAll('button').forEach(b=>b.disabled=true); const correct=ans===m.reality; if(correct){score++;btn.classList.add('correct');playTone('ok');}else{btn.classList.add('wrong'); item.querySelector(`button[data-answer="${m.reality}"]`).classList.add('correct');playTone('bad');}
      item.querySelector('.inline-feedback').innerHTML=`<strong>${correct?'Correct.':'Correction.'}</strong> ${m.why}`;
      document.getElementById('mythScore').textContent=`${done} / ${myths.length} checked · ${score} correct first time`;
      if(done===myths.length) document.getElementById('mythNext').disabled=false;
    });
    document.getElementById('mythNext').addEventListener('click',nextStage);
  }

  function renderElevator(){
    if(timerId) clearInterval(timerId);
    const supports=['risk','uncertainty','data','models','financial impact','decisions'];
    stageContainer.innerHTML=stageFrame('10:00 · THE ELEVATOR TEST','Explain the job in 60 seconds','Mission 6 of 6 · final challenge','assets/session1/elevator.svg',`
      <div class="elevator-question"><span>COLLEAGUE</span><blockquote>“I’ve never really understood what actuaries do. What exactly is an actuary?”</blockquote></div>
      <div class="final-instructions"><h3>Your instructions</h3><ol><li>Explain the job <strong>in your own words</strong>. Do not read a definition.</li><li>Give <strong>one concrete example</strong>.</li><li>Use at least <strong>four</strong> of the key terms below.</li><li>Speak for up to <strong>60 seconds</strong>.</li></ol></div>
      <div class="support-words">${supports.map(w=>`<button type="button" data-say="${w}">🔊 ${w}</button>`).join('')}</div>
      <div class="timer-card"><span id="timerValue">60</span><small>SECONDS</small><div class="timer-bar"><span id="timerBar"></span></div></div>
      <div class="stage-actions" id="timerActions"><button type="button" class="primary-link" id="startTimer">Start my 60-second pitch</button></div>
      <div id="selfCheck" class="self-check" hidden><h3>Self-check</h3><label><input type="checkbox"> I explained what an actuary does.</label><label><input type="checkbox"> I mentioned risk or uncertainty.</label><label><input type="checkbox"> I explained why data or models are used.</label><label><input type="checkbox"> I mentioned decision-making.</label><label><input type="checkbox"> I gave a concrete example.</label><label><input type="checkbox"> I pronounced <em>actuary</em> and <em>actuarial</em> carefully.</label><div class="model-answer"><button type="button" class="secondary-btn" id="modelAnswer">🔊 Listen to a model answer</button><p>An actuary uses data, mathematics and statistical models to understand financial risk and uncertainty. Actuaries estimate possible future outcomes, explain their financial impact and help organisations make informed decisions. For example, an actuary may analyse claims data to help an insurer set sustainable premiums.</p></div><div class="completion-badges"><span>🔎 Risk Spotter</span><span>📊 Data Detective</span><span>🧠 Uncertainty Analyst</span><span>🎤 Clear Communicator</span></div><div class="mission-complete"><strong>FIRST DAY COMPLETED</strong><span>You are ready to explain what an actuary actually does.</span></div></div>`);
    document.querySelectorAll('.support-words button').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));
    const start=document.getElementById('startTimer');
    const saved=getState();
    if(saved.completed){
      document.getElementById('timerValue').textContent='0';
      document.getElementById('timerBar').style.width='0%';
      document.getElementById('selfCheck').hidden=false;
      start.hidden=true;
    }else{
      start.addEventListener('click',()=>{
        let left=60; let finished=false; start.textContent='I’m done'; start.classList.add('timer-running');
        const finish=()=>{ if(finished)return; finished=true; if(timerId){clearInterval(timerId);timerId=null;} document.getElementById('timerValue').textContent='0'; document.getElementById('timerBar').style.width='0%'; document.getElementById('selfCheck').hidden=false; start.hidden=true; playTone('unlock'); saveState({completed:true}); };
        start.onclick=finish;
        timerId=setInterval(()=>{ left--; document.getElementById('timerValue').textContent=left; document.getElementById('timerBar').style.width=`${Math.max(0,(left/60)*100)}%`; if(left<=0)finish(); else if(left<=5) playTone('tick'); },1000);
      },{once:true});
    }
    document.getElementById('modelAnswer').addEventListener('click',()=>say('An actuary uses data, mathematics and statistical models to understand financial risk and uncertainty. Actuaries estimate possible future outcomes, explain their financial impact and help organisations make informed decisions. For example, an actuary may analyse claims data to help an insurer set sustainable premiums.'));
  }

  function renderStage(){
    updateProgress();
    ({1:renderWelcome,2:renderPronunciation,3:renderCases,4:renderRiskLab,5:renderMyths,6:renderElevator}[currentStage]||renderWelcome)();
    stageContainer.querySelectorAll('.mission-listen').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));
  }

  soundToggle.addEventListener('click',()=>{ soundOn=!soundOn; soundToggle.setAttribute('aria-pressed',String(soundOn)); soundToggle.textContent=soundOn?'🔊 Sound on':'🔇 Sound off'; if(!soundOn && window.stopSpeech) window.stopSpeech(); });
  resetButton.addEventListener('click',()=>{ if(!confirm('Restart Actuary for a Day from Mission 1?')) return; if(timerId){clearInterval(timerId);timerId=null;} if(window.stopSpeech) window.stopSpeech(); try{sessionStorage.removeItem(STORAGE_KEY);}catch(_){} currentStage=1; renderStage(); window.scrollTo({top:0,behavior:'smooth'}); });

  const saved=getState();
  if(Number.isInteger(saved.stage) && saved.stage>=1 && saved.stage<=6) currentStage=saved.stage;
  renderStage();
})();
