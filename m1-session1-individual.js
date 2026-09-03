(function(){
  'use strict';

  const stageContainer=document.getElementById('stageContainer');
  const progressFill=document.getElementById('progressFill');
  const stageDots=[...document.querySelectorAll('#stageDots li')];
  const soundToggle=document.getElementById('soundToggle');
  const resetButton=document.getElementById('resetMission');
  const STORAGE_KEY='actuarial_m1_s1_individual_v3';
  let soundOn=true;
  let audioCtx=null;
  let currentStage=1;

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
    const briefItems=[
      {before:'Our team needs an', after:'to review the financial', answer1:'actuary', answer2:'risk'},
      {before:'We have ten years of claims', after:'but there is still considerable', answer1:'data', answer2:'uncertainty'},
      {before:'Use a', after:'to estimate outcomes and discuss the', answer1:'model', answer2:'probability'},
      {before:'Prepare an', after:'report with a five-year', answer1:'actuarial', answer2:'forecast'}
    ];
    const words=['actuary','actuarial','risk','uncertainty','probability','data','model','forecast'];
    const options=['<option value="">Choose a term…</option>'].concat(words.map(w=>`<option value="${w}">${w}</option>`)).join('');
    const notes=briefItems.map((item,i)=>`<article class="brief-note" data-index="${i}"><div class="brief-note-top"><span>CLIENT NOTE ${String(i+1).padStart(2,'0')}</span><span class="brief-status" aria-hidden="true">UNRESOLVED</span></div><p>${item.before} <select data-slot="1" aria-label="Client note ${i+1}, first missing term">${options}</select> ${item.after} <select data-slot="2" aria-label="Client note ${i+1}, second missing term">${options}</select>.</p><div class="brief-feedback" aria-live="polite"></div></article>`).join('');
    stageContainer.innerHTML=stageFrame('08:45 · WELCOME TO THE RISK FLOOR','Repair the corrupted client brief','Mission 1 of 6 · about 4 minutes','assets/session1/case-files.svg',`
      <div class="scene-message"><div class="avatar">NS</div><div><strong>Welcome to Northstar.</strong><p>Your first client brief has been corrupted. Eight essential actuarial terms have disappeared from the file. Restore the brief before the 09:00 meeting.</p></div></div>
      <div class="stage-instruction"><strong>Your task</strong><span>Complete the four client notes with the correct terms. Each of the eight words is used once. Focus on meaning and context — you do not need to memorise a definition.</span></div>
      <div class="brief-word-bank" aria-label="Available terms">${words.map(w=>`<span>${w}</span>`).join('')}</div>
      <div class="brief-repair-grid">${notes}</div>
      <p class="inline-feedback" id="briefOverall" aria-live="polite"></p>
      <div class="stage-actions"><button type="button" class="primary-link" id="checkBrief">Check the client brief</button><button type="button" class="primary-link" id="completeWelcome" hidden>Brief restored — collect my badge →</button></div>`);

    document.getElementById('checkBrief').addEventListener('click',()=>{
      let correctCount=0;
      const chosen=[];
      [...document.querySelectorAll('.brief-note')].forEach((note,i)=>{
        const item=briefItems[i];
        const a=note.querySelector('select[data-slot="1"]').value;
        const b=note.querySelector('select[data-slot="2"]').value;
        chosen.push(a,b);
        const ok=a===item.answer1 && b===item.answer2;
        note.classList.toggle('brief-correct',ok);
        note.classList.toggle('brief-wrong',!ok);
        note.querySelector('.brief-status').textContent=ok?'RESTORED':'CHECK AGAIN';
        note.querySelector('.brief-feedback').textContent=ok?'Correct — this note now makes professional sense.':'One or both terms do not fit the meaning of this note.';
        if(ok) correctCount++;
      });
      const duplicates=chosen.filter(Boolean).some((w,i,a)=>a.indexOf(w)!==i);
      const overall=document.getElementById('briefOverall');
      if(correctCount===briefItems.length && !duplicates){
        overall.innerHTML='<strong>Client brief restored.</strong> You have identified how the core terms work together in real actuarial language.';
        document.getElementById('checkBrief').hidden=true;
        document.getElementById('completeWelcome').hidden=false;
        document.querySelectorAll('.brief-note select').forEach(sel=>sel.disabled=true);
        playTone('ok');
      }else{
        overall.innerHTML=duplicates?'<strong>Almost.</strong> Each term is used once. Check for repeated words and review the notes marked CHECK AGAIN.':'<strong>Not quite.</strong> Review the notes marked CHECK AGAIN and use the meaning of the full sentence as your clue.';
        playTone('bad');
      }
    });
    document.getElementById('completeWelcome').addEventListener('click',()=>{ playTone('ok'); nextStage(); });
  }

  function renderPronunciation(){
    stageContainer.innerHTML=stageFrame('09:00 · SECURITY GATE','Pass the pronunciation check','Mission 2 of 6 · about 5 minutes','assets/session1/security-gate.svg',`
      <p class="task-prompt">The gate opens only when you can identify the correct stress pattern. Use <strong>Listen</strong>, choose an answer and read the feedback. Focus on recognising stress and pronunciation accurately.</p>
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
      if(choice===q.correct){ correct++; btn.classList.add('correct'); fb.innerHTML=`<strong>Correct.</strong> ${q.note}`; playTone('ok'); }
      else { btn.classList.add('wrong'); fb.innerHTML=`<strong>Not quite.</strong> ${q.note} Use Listen again if you want to compare the stress pattern.`; playTone('bad'); }
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
      <p class="task-prompt">Five notifications have appeared on your screen. Decide whether each statement reflects real actuarial work.</p><div id="mythList" class="myth-list"></div><div class="mission-score" id="mythScore">0 / ${myths.length} checked</div><div class="stage-actions"><button type="button" class="primary-link" id="mythNext" disabled>Go to the client meeting →</button></div>`);
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

  function renderClientQuestion(){
    const decisions=[
      {
        question:'What does an actuary work with?',
        options:[
          ['Data, statistics and models',true],
          ['Intuition and personal opinion',false],
          ['Advertising slogans and branding',false],
          ['Only last year’s final result',false]
        ],
        feedback:'Exactly. Actuaries use evidence, statistics and models to analyse uncertain outcomes.'
      },
      {
        question:'What is the actuary trying to understand?',
        options:[
          ['The exact future, with no uncertainty',false],
          ['Risk and uncertainty',true],
          ['What customers will buy next week',false],
          ['Only what has already happened',false]
        ],
        feedback:'Right. The point is not to know the future exactly, but to understand risk and uncertainty.'
      },
      {
        question:'Why does this analysis matter?',
        options:[
          ['To make reports look more technical',false],
          ['To remove every possible risk',false],
          ['To estimate financial consequences and support better decisions',true],
          ['To replace business judgement completely',false]
        ],
        feedback:'Yes. Actuarial analysis becomes useful when it helps an organisation understand consequences and make informed decisions.'
      },
      {
        question:'Which example best shows actuarial work?',
        options:[
          ['Guaranteeing which policyholder will have an accident',false],
          ['Choosing an insurer’s advertising slogan',false],
          ['Ignoring recent claims because models are always right',false],
          ['Analysing claims data to help an insurer set sustainable premiums',true]
        ],
        feedback:'Exactly. This connects data, uncertainty, financial impact and a real business decision.'
      }
    ];

    stageContainer.innerHTML=stageFrame('10:00 · CLIENT MEETING','The Client Has a Question','Mission 6 of 6 · final client task','',`
      <div class="client-meeting-visual" aria-hidden="true">
        <div class="client-visual-person client"></div><div class="client-visual-table"></div><div class="client-visual-person actuary"></div>
        <div class="client-visual-screen"><span></span><span></span><span></span><i></i></div>
      </div>
      <div class="client-question"><span>CLIENT</span><blockquote>“I understand the numbers… but what exactly does an actuary bring to a company?”</blockquote></div>
      <p class="task-prompt">Build a clear answer. Choose the best idea at each step. If a choice is too vague, too technical or simply wrong, try again.</p>
      <div id="clientDecisions" class="client-decisions"></div>
      <div id="builtAnswer" class="built-answer" hidden>
        <p class="module-number">YOUR PROFESSIONAL ANSWER</p>
        <p><strong>An actuary uses data, statistics and models to understand risk and uncertainty. They estimate possible financial consequences and help organisations make informed decisions. For example, an actuary may analyse claims data to help an insurer set sustainable premiums.</strong></p>
        <button type="button" class="mini-btn" id="hearBuiltAnswer">🔊 Hear this answer</button>
      </div>
      <div id="humanChallenge" class="human-challenge" hidden>
        <div class="client-question client-followup"><span>CLIENT</span><blockquote>“That sounds very technical. Can you explain it in normal English?”</blockquote></div>
        <div class="plain-english-task">
          <p class="module-number">MAKE IT SOUND HUMAN</p>
          <h3>Now explain the job aloud in your own words.</h3>
          <p>Imagine you are talking to someone who knows nothing about actuarial science. Keep it <strong>clear, concrete and jargon-free</strong>. Give one simple example. There is <strong>no timer</strong>.</p>
          <div class="support-words" aria-label="Pronunciation support">
            ${['actuary','actuarial','risk','data','future','decisions'].map(w=>`<button type="button" data-say="${w}" aria-label="Listen to ${w}">🔊 ${w}</button>`).join('')}
          </div>
          <div class="stage-instruction"><strong>Helpful idea</strong><span>You do not need to sound like a textbook. Explain what the job is useful <em>for</em>.</span></div>
          <div class="stage-actions"><button type="button" class="primary-link" id="humanDone">I’ve explained it aloud →</button></div>
        </div>
      </div>
      <div id="selfCheck" class="self-check" hidden>
        <h3>Quick self-check</h3>
        <label><input type="checkbox"> I explained risk or uncertainty in simple words.</label>
        <label><input type="checkbox"> I explained why data or models are useful.</label>
        <label><input type="checkbox"> I explained how actuaries help people make decisions.</label>
        <label><input type="checkbox"> I gave one concrete example.</label>
        <label><input type="checkbox"> I avoided unnecessary jargon.</label>
        <label><input type="checkbox"> I pronounced <em>actuary</em> and <em>actuarial</em> carefully.</label>
        <div class="model-answer"><button type="button" class="secondary-btn" id="modelAnswer">🔊 Hear a clear example</button><p>An actuary looks at data to understand what might happen in the future and what it could cost. They help organisations prepare for risk and make better decisions. For example, they can help an insurance company decide how much it needs to charge so it can pay future claims.</p></div>
        <div class="stage-actions"><button type="button" class="primary-link" id="clientReaction">See the client’s reaction →</button></div>
      </div>
      <div id="clientEnding" class="client-ending" hidden>
        <div class="client-question client-success"><span>CLIENT</span><blockquote>“Right — so you don’t predict the future. You help people make better decisions when the future is uncertain.”</blockquote></div>
        <p class="exactly">Exactly.</p>
        <div class="completion-badges"><span>🔎 Risk Spotter</span><span>📊 Data Detective</span><span>🧠 Uncertainty Analyst</span><span>💬 Clear Communicator</span></div>
        <div class="mission-complete"><strong>FIRST DAY COMPLETED</strong><span>You can explain what an actuary does — without hiding behind jargon.</span></div>
      </div>`);

    const wrap=document.getElementById('clientDecisions');
    const saved=getState();
    let step=Math.max(0,Math.min(4,Number(saved.clientStep)||0));

    decisions.forEach((d,i)=>{
      const article=document.createElement('article');
      article.className='client-decision';
      article.dataset.index=i;
      article.hidden=i>step;
      article.innerHTML=`<div class="client-decision-head"><span>${i+1}</span><h3>${d.question}</h3></div><div class="client-decision-options">${d.options.map((o,j)=>`<button type="button" data-option="${j}">${o[0]}</button>`).join('')}</div><p class="inline-feedback" aria-live="polite"></p>`;
      wrap.appendChild(article);
    });

    function restoreCompletedDecisions(){
      [...wrap.querySelectorAll('.client-decision')].forEach((article,i)=>{
        if(i<step){
          article.hidden=false;
          const correctIndex=decisions[i].options.findIndex(o=>o[1]);
          article.querySelectorAll('button').forEach((b,j)=>{ b.disabled=true; if(j===correctIndex)b.classList.add('correct'); });
          article.querySelector('.inline-feedback').innerHTML=`<strong>Good choice.</strong> ${decisions[i].feedback}`;
        }else if(i===step && step<4){ article.hidden=false; }
      });
    }

    function revealFinalBlocks(){
      const built=document.getElementById('builtAnswer');
      const human=document.getElementById('humanChallenge');
      if(step===4){ built.hidden=false; human.hidden=false; }
      if(saved.humanDone || saved.completed) document.getElementById('selfCheck').hidden=false;
      if(saved.humanDone || saved.completed){ const btn=document.getElementById('humanDone'); if(btn)btn.hidden=true; }
      if(saved.completed){ document.getElementById('clientEnding').hidden=false; const r=document.getElementById('clientReaction'); if(r)r.hidden=true; }
    }

    restoreCompletedDecisions();
    revealFinalBlocks();

    wrap.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-option]');
      if(!btn)return;
      const article=btn.closest('.client-decision');
      const i=Number(article.dataset.index);
      if(i!==step)return;
      const choice=Number(btn.dataset.option);
      const d=decisions[i];
      const feedback=article.querySelector('.inline-feedback');
      if(!d.options[choice][1]){
        btn.classList.add('wrong');
        feedback.innerHTML='<strong>Not quite.</strong> Think about what actuarial work contributes to a real decision, then try again.';
        playTone('bad');
        return;
      }
      article.querySelectorAll('button').forEach(b=>b.disabled=true);
      btn.classList.add('correct');
      feedback.innerHTML=`<strong>Good choice.</strong> ${d.feedback}`;
      playTone('ok');
      step++;
      saveState({clientStep:step});
      const next=wrap.querySelector(`.client-decision[data-index="${step}"]`);
      if(next){ next.hidden=false; next.scrollIntoView({behavior:'smooth',block:'center'}); }
      else{
        document.getElementById('builtAnswer').hidden=false;
        document.getElementById('humanChallenge').hidden=false;
        document.getElementById('builtAnswer').scrollIntoView({behavior:'smooth',block:'center'});
        playTone('unlock');
      }
    });

    const builtAudio=document.getElementById('hearBuiltAnswer');
    if(builtAudio) builtAudio.addEventListener('click',()=>say('An actuary uses data, statistics and models to understand risk and uncertainty. They estimate possible financial consequences and help organisations make informed decisions. For example, an actuary may analyse claims data to help an insurer set sustainable premiums.'));
    document.querySelectorAll('.support-words button').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));

    const humanDone=document.getElementById('humanDone');
    if(humanDone) humanDone.addEventListener('click',()=>{
      document.getElementById('selfCheck').hidden=false;
      humanDone.hidden=true;
      saveState({humanDone:true});
      playTone('ok');
      document.getElementById('selfCheck').scrollIntoView({behavior:'smooth',block:'center'});
    });

    const model=document.getElementById('modelAnswer');
    if(model) model.addEventListener('click',()=>say('An actuary looks at data to understand what might happen in the future and what it could cost. They help organisations prepare for risk and make better decisions. For example, they can help an insurance company decide how much it needs to charge so it can pay future claims.'));

    const reaction=document.getElementById('clientReaction');
    if(reaction) reaction.addEventListener('click',()=>{
      document.getElementById('clientEnding').hidden=false;
      reaction.hidden=true;
      saveState({completed:true,humanDone:true,clientStep:4});
      playTone('unlock');
      document.getElementById('clientEnding').scrollIntoView({behavior:'smooth',block:'center'});
    });
  }

  function renderStage(){
    updateProgress();
    ({1:renderWelcome,2:renderPronunciation,3:renderCases,4:renderRiskLab,5:renderMyths,6:renderClientQuestion}[currentStage]||renderWelcome)();
    stageContainer.querySelectorAll('.mission-listen').forEach(b=>b.addEventListener('click',()=>say(b.dataset.say)));
  }

  soundToggle.addEventListener('click',()=>{ soundOn=!soundOn; soundToggle.setAttribute('aria-pressed',String(soundOn)); soundToggle.textContent=soundOn?'🔊 Sound on':'🔇 Sound off'; if(!soundOn && window.stopSpeech) window.stopSpeech(); });
  resetButton.addEventListener('click',()=>{ if(!confirm('Restart Actuary for a Day from Mission 1?')) return; if(window.stopSpeech) window.stopSpeech(); try{sessionStorage.removeItem(STORAGE_KEY);}catch(_){} currentStage=1; renderStage(); window.scrollTo({top:0,behavior:'smooth'}); });

  const saved=getState();
  if(Number.isInteger(saved.stage) && saved.stage>=1 && saved.stage<=6) currentStage=saved.stage;
  renderStage();
})();
