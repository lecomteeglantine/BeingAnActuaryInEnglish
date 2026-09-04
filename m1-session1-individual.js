(function(){
  'use strict';

  const stageContainer = document.getElementById('stageContainer');
  const progressFill = document.getElementById('progressFill');
  const stageDots = [...document.querySelectorAll('#stageDots li')];
  const soundToggle = document.getElementById('soundToggle');
  const resetButton = document.getElementById('resetMission');
  const officeTime = document.getElementById('officeTime');
  const officeLocation = document.getElementById('officeLocation');
  const STORAGE_KEY = 'actuarial_m1_s1_individual_v8_extended';
  let soundOn = true;
  let audioCtx = null;

  try {
    const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const navType = navEntry && navEntry.type;
    const refPath = document.referrer ? new URL(document.referrer).pathname : '';
    if (navType === 'navigate' && /\/m1-day1\.html$/.test(refPath)) sessionStorage.removeItem(STORAGE_KEY);
  } catch (_) {}

  const times = {
    1:['08:45','Risk Floor · Brief Desk'],
    2:['09:00','Security Gate · Audio Check'],
    3:['09:15','Client Desk · Case Files'],
    4:['09:25','Meeting Room · Follow-up Questions'],
    5:['09:40','Risk Lab · Modelling Bay'],
    6:['09:50','Team Inbox · Reality Check'],
    7:['10:00','Client Meeting · Clear Explanations'],
    8:['10:10','Boardroom · Slide Emergency']
  };

  const defaultState = () => ({
    stage: 1,
    briefAnswers: {},
    briefChecked: false,
    pronAnswers: {},
    caseAnswers: {},
    followAnswers: {},
    labSelected: [],
    labSolved: false,
    inboxAnswers: {},
    meetingAnswers: {},
    rescueAnswers: {},
    soundOn: true
  });

  const briefBlocks = [
    {
      title:'Brief note 1 · Role and mission',
      intro:'A new insurer has asked Northstar to explain the value of actuarial work.',
      items:[
        {id:'b1', prompt:'Northstar has hired a junior ___ to support the team.', options:['actuary','premium','policyholder','broker'], correct:0, note:'An actuary is the professional, not the product or the customer.'},
        {id:'b2', prompt:'The first question from the client is about financial ___.', options:['marketing','risk','branding','recruitment'], correct:1, note:'Actuarial work focuses on uncertainty and financial risk.'}
      ]
    },
    {
      title:'Brief note 2 · Type of work',
      intro:'The project needs the right label and the right business context.',
      items:[
        {id:'b3', prompt:'The team is doing ___ work for the insurer.', options:['medical','actuarial','advertising','legal'], correct:1, note:'Actuarial is the adjective that describes the work.'},
        {id:'b4', prompt:'The client wants help because the future contains too much ___.', options:['certainty','certainty planning','uncertainty','routine'], correct:2, note:'Uncertainty is central to actuarial analysis.'}
      ]
    },
    {
      title:'Brief note 3 · Evidence',
      intro:'The analyst has drafted the evidence section but two keywords are missing.',
      items:[
        {id:'b5', prompt:'To compare possible outcomes, the team studies ___.', options:['probability','publicity','liquidity','geometry'], correct:0, note:'Probability helps estimate how likely an event is.'},
        {id:'b6', prompt:'To do that properly, the team also needs reliable ___.', options:['rumours','data','guesswork','opinions'], correct:1, note:'Data gives the evidence base for the analysis.'}
      ]
    },
    {
      title:'Brief note 4 · Output',
      intro:'The client now wants to know what the team will build and deliver.',
      items:[
        {id:'b7', prompt:'The actuary will build a ___ to represent the situation.', options:['poster','model','slogan','discount'], correct:1, note:'A model helps structure assumptions and evidence.'},
        {id:'b8', prompt:'That work will support a financial ___.', options:['forecast','corridor','certificate','meeting room'], correct:0, note:'A forecast is an estimate about future outcomes.'}
      ]
    }
  ];

  const pronunciation = [
    {id:'actuary', word:'actuary', ipa:'/ˈæk.tʃu.ə.ri/', options:['ACT-u-ar-y','act-u-AR-y'], correct:0, note:'Stress the first syllable.'},
    {id:'actuarial', word:'actuarial', ipa:'/ˌæk.tʃuˈeə.ri.əl/', options:['AC-tu-ar-i-al','ac-tu-AR-i-al'], correct:1, note:'The main stress falls on AR.'},
    {id:'liability', word:'liability', ipa:'/ˌlaɪ.əˈbɪl.ə.ti/', options:['LI-a-bi-li-ty','li-a-BIL-i-ty'], correct:1, note:'Stress BIL.'},
    {id:'probability', word:'probability', ipa:'/ˌprɒb.əˈbɪl.ə.ti/', options:['PROB-a-bi-li-ty','prob-a-BIL-i-ty'], correct:1, note:'Again, the stress falls on BIL.'},
    {id:'insurance', word:'insurance', ipa:'/ɪnˈʃʊə.rəns/', options:['IN-sur-ance','in-SUR-ance'], correct:1, note:'Stress the second syllable.'},
    {id:'premium', word:'premium', ipa:'/ˈpriː.mi.əm/', options:['PRE-mi-um','pre-MI-um'], correct:0, note:'Stress the first syllable.'},
    {id:'uncertainty', word:'uncertainty', ipa:'/ʌnˈsɜː.tən.ti/', options:['UN-cer-tain-ty','un-CER-tain-ty'], correct:1, note:'Stress CER.'},
    {id:'forecast', word:'forecast', ipa:'/ˈfɔː.kɑːst/', options:['FORE-cast','fore-CAST'], correct:0, note:'As a noun, the stress is on FORE.'}
  ];

  const cases = [
    {
      id:'c1',
      label:'Motor insurance',
      icon:'🚗',
      problem:'Claims frequency is stable, but average claim costs are rising quickly.',
      question:'What would an actuary most usefully do first?',
      options:['Redesign the company logo','Analyse claims data and update assumptions','Promise clients that claims will fall next year','Write a TV advert about safer driving'],
      correct:1,
      feedback:'That is the actuarial move: analyse evidence, update assumptions and estimate the financial impact.'
    },
    {
      id:'c2',
      label:'Pension fund',
      icon:'👥',
      problem:'A pension scheme needs to know whether future obligations may become too expensive.',
      question:'How can an actuary help?',
      options:['By modelling longevity and future costs','By guessing how long members will live','By replacing the trustees','By choosing the office furniture'],
      correct:0,
      feedback:'Exactly. Pension work often involves liabilities, longevity and long-term financial projections.'
    },
    {
      id:'c3',
      label:'Climate risk',
      icon:'🌊',
      problem:'A client exposed to severe weather wants advice before renewing its insurance programme.',
      question:'What should the actuary focus on?',
      options:['Future exposure scenarios and possible losses','Only the weather last Tuesday','The colour of the annual report','Removing every mention of uncertainty'],
      correct:0,
      feedback:'Yes. Scenario analysis and exposure modelling are exactly the kinds of tools actuaries use here.'
    }
  ];

  const followUps = [
    {
      id:'f1',
      label:'Motor insurer',
      prompt:'Which follow-up question would best help an actuary here?',
      options:[
        'How have claim frequency and average repair costs changed this year?',
        'Which social-media campaign performed best?',
        'What snacks are available in the staff room?'
      ],
      correct:0,
      feedback:'That question targets the variables that could change the financial estimate.'
    },
    {
      id:'f2',
      label:'Pension fund',
      prompt:'What would an actuary most need to ask next?',
      options:[
        'Are future obligations likely to increase if members live longer than expected?',
        'Would members prefer a different office location?',
        'Can we ignore long-term uncertainty to save time?'
      ],
      correct:0,
      feedback:'Exactly. Pension work often starts with future obligations, longevity and cost pressure.'
    },
    {
      id:'f3',
      label:'Climate-risk client',
      prompt:'Which question best reflects actuarial thinking?',
      options:[
        'What loss scenarios should we test if severe weather becomes more frequent or more costly?',
        'Can we remove all uncertainty from the discussion?',
        'What font should the report use?'
      ],
      correct:0,
      feedback:'Good. An actuary asks for scenarios, exposure and potential losses — not cosmetic details.'
    }
  ];

  const labItems = [
    ['Historical claims', 'Relevant', true],
    ['Claim frequency', 'Relevant', true],
    ['Average claim cost', 'Relevant', true],
    ['Repair-cost inflation', 'Relevant', true],
    ['Model assumptions', 'Relevant', true],
    ['Company logo colour', 'Noise', false],
    ['CEO’s favourite car', 'Noise', false],
    ['Social media followers', 'Noise', false]
  ];

  const inboxItems = [
    {id:'i1', from:'Pricing manager', time:'09:51', text:'“An actuary helps a company make informed decisions under uncertainty.”', reality:true, why:'Useful insight. It is clear, accurate and client-friendly.'},
    {id:'i2', from:'Intern', time:'09:53', text:'“Actuaries predict the exact future.”', reality:false, why:'Misleading. Actuaries estimate possible outcomes; they do not know the future exactly.'},
    {id:'i3', from:'Colleague', time:'09:55', text:'“Good data matters because weak data can distort the model.”', reality:true, why:'Useful insight. Data quality affects the entire analysis.'},
    {id:'i4', from:'Office chat', time:'09:56', text:'“Actuaries mainly make reports sound technical.”', reality:false, why:'Misleading. The goal is insight and decision support, not empty jargon.'},
    {id:'i5', from:'Manager', time:'09:58', text:'“Actuaries often work with insurers, pensions, investments and risk teams.”', reality:true, why:'Useful insight. That is a solid overview of where the profession works.'}
  ];

  const meetingMoves = [
    {
      id:'m1',
      from:'Client question',
      text:'“Can you tell us exactly what will happen next year?”',
      prompt:'Choose the best actuarial answer.',
      options:[
        ['Not exactly, but we can estimate likely outcomes and compare different scenarios.', true],
        ['Yes. Actuaries know the exact future once the model is finished.', false],
        ['We prefer not to talk to clients about the future at all.', false]
      ],
      feedback:'A good answer is honest about uncertainty but still useful.'
    },
    {
      id:'m2',
      from:'Finance director',
      text:'“Why do you keep asking for better data?”',
      prompt:'Choose the clearest reply.',
      options:[
        ['Because weak data can distort the model and lead to poor decisions.', true],
        ['Because actuaries like collecting numbers, even when they are not useful.', false],
        ['Because good data means we no longer need judgement.', false]
      ],
      feedback:'Clear and practical: data quality affects the whole analysis.'
    },
    {
      id:'m3',
      from:'Board member',
      text:'“So what does an actuary bring to a company?”',
      prompt:'Choose the strongest summary.',
      options:[
        ['Actuaries help organisations understand financial risk and make better decisions under uncertainty.', true],
        ['Actuaries mainly make reports sound technical.', false],
        ['Actuaries work alone and avoid business decisions.', false]
      ],
      feedback:'That summary is accurate, professional and understandable for a non-specialist.'
    }
  ];

  const rescueSteps = [
    {
      id:'r1',
      title:'Fix the opening line',
      bad:'“Actuarial professionals leverage stochastic methodologies to optimise financial resilience.”',
      options:[
        ['Actuaries use data and models to help organisations understand future financial risk.', true],
        ['Actuaries write complex sentences so that reports sound technical.', false],
        ['Actuaries are specialists who always remove uncertainty completely.', false]
      ],
      feedback:'Start simple: who the actuaries are, what they use, and what problem they help solve.'
    },
    {
      id:'r2',
      title:'Explain the core job',
      bad:'“The actuarial function integrates probabilistic frameworks for liability calibration.”',
      options:[
        ['They help organisations think clearly about uncertain future costs and risks.', true],
        ['They mainly make spreadsheets look more complicated.', false],
        ['They decide every business strategy on behalf of management.', false]
      ],
      feedback:'The board needs the purpose of the job, not a cloud of technical nouns.'
    },
    {
      id:'r3',
      title:'Add a concrete example',
      bad:'“Outputs are translated into pricing adequacy metrics.”',
      options:[
        ['For example, an actuary can analyse claims data to help an insurer set sustainable premiums.', true],
        ['For example, an actuary can guarantee exactly who will make a claim next year.', false],
        ['For example, an actuary can remove the need for any human judgement.', false]
      ],
      feedback:'A concrete example helps a non-specialist understand the value immediately.'
    },
    {
      id:'r4',
      title:'Finish with the value',
      bad:'“The discipline delivers multi-vector optimisation under dynamic uncertainty.”',
      options:[
        ['In short, actuaries help people make better decisions when the future is uncertain.', true],
        ['In short, actuaries replace every other professional in the company.', false],
        ['In short, actuaries should avoid explaining their work in simple words.', false]
      ],
      feedback:'End with the client benefit: better decisions under uncertainty.'
    }
  ];

  let state = loadState();
  let currentStage = clampStage(state.stage || 1);
  soundOn = state.soundOn !== false;
  updateSoundUI();

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    state.soundOn = soundOn;
    saveState();
    updateSoundUI();
    playTone(soundOn ? 'ok' : 'tick');
  });

  resetButton.addEventListener('click', () => {
    if (!window.confirm('Restart this mission from the beginning?')) return;
    sessionStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    currentStage = 1;
    soundOn = true;
    updateSoundUI();
    renderStage();
    window.scrollTo({top:0, behavior:'smooth'});
  });

  function clampStage(n){ return Math.max(1, Math.min(8, Number(n) || 1)); }

  function loadState(){
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      return parsed ? {...defaultState(), ...parsed} : defaultState();
    } catch (_) {
      return defaultState();
    }
  }

  function saveState(){
    state.stage = currentStage;
    state.soundOn = soundOn;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function updateSoundUI(){
    soundToggle.textContent = soundOn ? '🔊 Sound on' : '🔈 Sound off';
    soundToggle.setAttribute('aria-pressed', String(soundOn));
  }

  function playTone(kind='ok'){
    if(!soundOn) return;
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      const map={ok:[660,880],bad:[240,190],unlock:[523,659],tick:[880,880]};
      const pair=map[kind]||map.ok;
      o.type = kind==='bad' ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(pair[0],now);
      o.frequency.exponentialRampToValueAtTime(pair[1],now+.12);
      g.gain.setValueAtTime(.0001,now);
      g.gain.exponentialRampToValueAtTime(.12,now+.015);
      g.gain.exponentialRampToValueAtTime(.0001,now+.18);
      o.start(now); o.stop(now+.2);
    }catch(_){ }
  }

  function say(text){ if(soundOn && window.speakWord) window.speakWord(text); }
  function listenButton(text,label='Listen'){ return `<button type="button" class="mini-btn mission-listen" data-say="${escapeHtml(text)}">🔊 ${label}</button>`; }
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function attachListenButtons(scope=stageContainer){
    scope.querySelectorAll('.mission-listen').forEach(btn=>btn.addEventListener('click',()=>say(btn.dataset.say)));
  }

  function stageFrame(kicker,title,time,img,content){
    return `<div class="stage-card"><div class="stage-card-head"><div><p class="module-number">${kicker}</p><h2>${title}</h2><p class="stage-time">${time}</p></div>${img?`<img src="${img}" alt="Illustration for ${title}">`:""}</div><div class="stage-card-body">${content}</div></div>`;
  }

  function updateProgress(){
    progressFill.style.width = `${((currentStage-1)/7)*100}%`;
    stageDots.forEach((li,i)=>{
      const active = i === currentStage-1;
      li.classList.toggle('active', active);
      li.classList.toggle('done', i < currentStage-1);
      if(active) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
    });
    const t = times[currentStage] || ['',''];
    if(officeTime) officeTime.textContent = t[0];
    if(officeLocation) officeLocation.textContent = t[1];
    saveState();
  }

  function nextStage(){
    if(currentStage < 8){
      currentStage += 1;
      updateProgress();
      renderStage();
      playTone('unlock');
      window.scrollTo({top:document.querySelector('.mission-progress').offsetTop - 20, behavior:'smooth'});
    }
  }

  function renderStage(){
    updateProgress();
    ({1:renderBrief,2:renderPronunciation,3:renderCases,4:renderFollowUps,5:renderRiskLab,6:renderInbox,7:renderMeeting,8:renderRescue}[currentStage] || renderBrief)();
    attachListenButtons(stageContainer);
  }

  function renderBrief(){
    const cards = briefBlocks.map(block=>`
      <article class="note-card">
        <h3>${block.title}</h3>
        <p>${block.intro}</p>
        ${block.items.map(item=>{
          const saved = state.briefAnswers[item.id];
          const checked = state.briefChecked;
          return `<div class="blank-block"><strong>${item.prompt}</strong><div class="choice-row">${item.options.map((opt,i)=>{
            let cls = '';
            if(saved === i) cls += ' selected';
            if(checked && saved !== undefined){
              if(i === item.correct) cls += ' correct';
              else if(saved === i && saved !== item.correct) cls += ' wrong';
            }
            return `<button type="button" data-brief="${item.id}" data-choice="${i}" class="${cls.trim()}">${opt}</button>`;
          }).join('')}</div></div>`;
        }).join('')}
      </article>`).join('');

    stageContainer.innerHTML = stageFrame('08:45 · CLIENT BRIEF DESK','Rebuild the corrupted client brief','Mission 1 of 8 · about 4 minutes','assets/session1/realistic/brief-desk.png',`
      <div class="scene-message"><div class="avatar">NS</div><div><strong>Your manager needs help.</strong><p>A badly exported client brief has arrived on your desk. Key actuarial terms have disappeared. Restore the brief before the 09:00 security check.</p></div></div>
      <div class="office-alert"><strong>Objective</strong><div>Choose the correct term for each missing line. This mission covers the 8 key words you need today: <strong>actuary, actuarial, risk, uncertainty, probability, data, model, forecast</strong>.</div></div>
      <div class="stage-note-grid">${cards}</div>
      <p id="briefFeedback" class="inline-feedback" aria-live="polite">${state.briefMessage || ''}</p>
      <div class="stage-actions"><button type="button" class="secondary-btn" id="checkBrief">Check the brief</button><button type="button" class="primary-link" id="briefNext" ${allBriefCorrect() ? '' : 'disabled'}>Badge collected →</button></div>
    `);

    stageContainer.querySelectorAll('[data-brief]').forEach(btn=>btn.addEventListener('click',()=>{
      state.briefAnswers[btn.dataset.brief] = Number(btn.dataset.choice);
      state.briefChecked = false;
      state.briefMessage = '';
      saveState();
      renderBrief();
    }));

    document.getElementById('checkBrief').addEventListener('click',()=>{
      const total = briefBlocks.flatMap(b=>b.items).length;
      const chosen = Object.keys(state.briefAnswers).length;
      const fb = document.getElementById('briefFeedback');
      if(chosen < total){
        state.briefMessage = `<strong>Almost there.</strong> ${total-chosen} line(s) still need a term.`;
        saveState();
        fb.innerHTML = state.briefMessage;
        playTone('bad');
        return;
      }
      state.briefChecked = true;
      saveState();
      if(allBriefCorrect()){
        state.briefMessage = '<strong>Brief restored.</strong> Your client note is now clear, accurate and ready for the team.';
        saveState();
        playTone('ok');
        renderBrief();
      } else {
        const correct = briefCorrectCount();
        state.briefMessage = `<strong>Good start.</strong> ${correct} / ${total} lines are correct. Review the red choices and fix the brief.`;
        saveState();
        playTone('bad');
        renderBrief();
      }
    });

    document.getElementById('briefNext').addEventListener('click', nextStage);
  }

  function briefCorrectCount(){
    return briefBlocks.flatMap(b=>b.items).reduce((sum,item)=>sum + (state.briefAnswers[item.id] === item.correct ? 1 : 0), 0);
  }
  function allBriefCorrect(){ return briefCorrectCount() === briefBlocks.flatMap(b=>b.items).length; }

  function renderPronunciation(){
    stageContainer.innerHTML = stageFrame('09:00 · SECURITY GATE','Pass the pronunciation check','Mission 2 of 8 · about 5 minutes','assets/session1/realistic/hero-office.png',`
      <div class="scene-message"><div class="avatar">🔐</div><div><strong>The security gate is voice-controlled.</strong><p>Before the client files unlock, check the correct stress pattern for each key word. Use the audio when needed.</p></div></div>
      <div id="pronunciationQuiz" class="pronunciation-quiz"></div>
      <div class="mission-score" id="pronScore">${Object.keys(state.pronAnswers).length} / ${pronunciation.length} checked</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="pronNext" ${Object.keys(state.pronAnswers).length===pronunciation.length ? '' : 'disabled'}>Security cleared →</button></div>
    `);
    const quiz = document.getElementById('pronunciationQuiz');
    pronunciation.forEach((q,i)=>{
      const saved = state.pronAnswers[q.id];
      const article = document.createElement('article');
      article.className = 'pron-item';
      article.innerHTML = `<div class="pron-word"><div><span class="pron-count">${String(i+1).padStart(2,'0')}</span><strong>${q.word}</strong><span class="ipa">${q.ipa}</span></div>${listenButton(q.word,'Listen')}</div><div class="pron-options">${q.options.map((o,j)=>{
        let cls='';
        if(saved !== undefined){ if(j===q.correct) cls='correct'; if(saved===j && saved!==q.correct) cls='wrong'; }
        return `<button type="button" data-word="${q.id}" data-choice="${j}" class="${cls}" ${saved !== undefined ? 'disabled' : ''}>${o}</button>`;
      }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>${saved===q.correct?'Correct.':'Correction.'}</strong> ${q.note}` : ''}</p>`;
      quiz.appendChild(article);
    });
    quiz.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-word]'); if(!btn) return;
      const id = btn.dataset.word;
      if(state.pronAnswers[id] !== undefined) return;
      state.pronAnswers[id] = Number(btn.dataset.choice);
      saveState();
      playTone(state.pronAnswers[id]===pronunciation.find(x=>x.id===id).correct ? 'ok' : 'bad');
      renderPronunciation();
    });
    document.getElementById('pronNext').addEventListener('click', nextStage);
  }

  function renderCases(){
    stageContainer.innerHTML = stageFrame('09:15 · THREE FILES, THREE DECISIONS','Open your first client files','Mission 3 of 8 · about 5 minutes','assets/session1/realistic/case-files.png',`
      <div class="scene-message"><div class="avatar">📁</div><div><strong>Your manager has left three files on your desk.</strong><p>For each client, choose the response that best reflects actuarial work.</p></div></div>
      <div id="caseList" class="case-list"></div>
      <div class="mission-score" id="caseScore">${Object.keys(state.caseAnswers).length} / ${cases.length} files reviewed</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="caseNext" ${Object.keys(state.caseAnswers).length===cases.length ? '' : 'disabled'}>Send my advice →</button></div>
    `);
    const list = document.getElementById('caseList');
    cases.forEach(c=>{
      const saved = state.caseAnswers[c.id];
      const el = document.createElement('article');
      el.className = 'client-file';
      el.innerHTML = `<div class="file-tab">${c.icon} ${c.label}</div><h3>${c.problem}</h3><p><strong>${c.question}</strong></p><div class="case-options">${c.options.map((o,j)=>{
        let cls='';
        if(saved !== undefined){ if(j===c.correct) cls='correct'; if(saved===j && saved!==c.correct) cls='wrong'; }
        return `<button type="button" data-case="${c.id}" data-choice="${j}" class="${cls}" ${saved !== undefined ? 'disabled' : ''}>${o}</button>`;
      }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>${saved===c.correct?'Good actuarial judgement.':'Think like an actuary.'}</strong> ${c.feedback}` : ''}</p>`;
      list.appendChild(el);
    });
    list.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-case]'); if(!btn) return;
      const c = cases.find(x=>x.id===btn.dataset.case); if(!c || state.caseAnswers[c.id] !== undefined) return;
      state.caseAnswers[c.id] = Number(btn.dataset.choice);
      saveState();
      playTone(state.caseAnswers[c.id]===c.correct ? 'ok' : 'bad');
      renderCases();
    });
    document.getElementById('caseNext').addEventListener('click', nextStage);
  }

  function renderFollowUps(){
    stageContainer.innerHTML = stageFrame('09:25 · FOLLOW-UP QUESTIONS','Ask the right actuarial question','Mission 4 of 8 · about 4 minutes','assets/session1/realistic/client-meeting.png',`
      <div class="scene-message"><div class="avatar">💬</div><div><strong>You are now in the meeting room.</strong><p>Your manager wants to know whether you can ask useful actuarial follow-up questions before the client arrives.</p></div></div>
      <div id="followList" class="case-list"></div>
      <div class="mission-score" id="followScore">${Object.keys(state.followAnswers).length} / ${followUps.length} questions chosen</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="followNext" ${Object.keys(state.followAnswers).length===followUps.length ? '' : 'disabled'}>Move to the modelling bay →</button></div>
    `);
    const list = document.getElementById('followList');
    followUps.forEach((q,i)=>{
      const saved = state.followAnswers[q.id];
      const el = document.createElement('article');
      el.className = 'client-file';
      el.innerHTML = `<span class="file-tab">QUESTION ${i+1}</span><h3>${q.label}</h3><p><strong>${q.prompt}</strong></p><div class="case-options">${q.options.map((opt,j)=>{
        let cls='';
        if(saved !== undefined){ if(j===q.correct) cls='correct'; if(saved===j && saved!==q.correct) cls='wrong'; }
        return `<button type="button" data-follow="${q.id}" data-choice="${j}" class="${cls}" ${saved !== undefined ? 'disabled' : ''}>${opt}</button>`;
      }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>${saved===q.correct?'Good choice.':'Correction.'}</strong> ${q.feedback}` : ''}</p>`;
      list.appendChild(el);
    });
    list.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-follow]'); if(!btn) return;
      const q = followUps.find(x=>x.id===btn.dataset.follow); if(!q || state.followAnswers[q.id] !== undefined) return;
      state.followAnswers[q.id] = Number(btn.dataset.choice);
      saveState();
      playTone(state.followAnswers[q.id]===q.correct ? 'ok' : 'bad');
      renderFollowUps();
    });
    document.getElementById('followNext').addEventListener('click', nextStage);
  }

  function renderRiskLab(){
    const selected = state.labSelected || [];
    stageContainer.innerHTML = stageFrame('09:35 · RISK LAB','Find the signal in the noise','Mission 5 of 8 · about 4 minutes','assets/session1/realistic/risk-lab.png',`
      <div class="lab-brief"><strong>Situation</strong><span>Last year, 10,000 policyholders generated 620 claims. This year, repair costs are rising. Select the five items that an actuary should prioritise before giving advice.</span></div>
      <div class="lab-grid" id="labGrid">${labItems.map((it,i)=>`<button type="button" data-index="${i}" aria-pressed="${selected.includes(i)}" class="${selected.includes(i)?'selected':''}"><span>${it[0]}</span><small>${it[1]}</small></button>`).join('')}</div>
      <p id="labFeedback" class="inline-feedback" aria-live="polite">${state.labSolved ? '<strong>Dashboard ready.</strong> You focused on evidence that changes claims, costs or assumptions.' : ''}</p>
      <div class="stage-actions"><button type="button" class="secondary-btn" id="checkLab">Check my dashboard</button><button type="button" class="primary-link" id="labNext" ${state.labSolved ? '' : 'disabled'}>Enter the client meeting →</button></div>
    `);
    const grid = document.getElementById('labGrid');
    grid.addEventListener('click',e=>{
      const b = e.target.closest('button[data-index]'); if(!b) return;
      const idx = Number(b.dataset.index);
      const arr = new Set(state.labSelected || []);
      if(arr.has(idx)) arr.delete(idx); else arr.add(idx);
      state.labSelected = [...arr].sort((a,b)=>a-b);
      state.labSolved = false;
      saveState();
      renderRiskLab();
    });
    document.getElementById('checkLab').addEventListener('click',()=>{
      const correct = state.labSelected.length===5 && state.labSelected.every(i=>labItems[i][2]);
      state.labSolved = correct;
      saveState();
      const fb = document.getElementById('labFeedback');
      if(correct){
        fb.innerHTML = '<strong>Dashboard ready.</strong> You focused on the evidence that genuinely drives the analysis.';
        playTone('ok');
        renderRiskLab();
      } else {
        fb.innerHTML = '<strong>Not yet.</strong> Choose exactly five items that could change the analysis. Remove the noise.';
        playTone('bad');
      }
    });
    document.getElementById('labNext').addEventListener('click', nextStage);
  }

  function renderInbox(){
    stageContainer.innerHTML = stageFrame('09:50 · TEAM INBOX','Reality check: which messages deserve to stay?','Mission 6 of 8 · about 4 minutes','assets/session1/realistic/hero-office.png',`
      <div class="scene-message"><div class="avatar">✉️</div><div><strong>The office inbox is buzzing.</strong><p>Your manager wants you to clean up the messages before they go into the client pack. Keep the useful insights and reject the misleading ones.</p></div></div>
      <div id="inboxList" class="inbox-list"></div>
      <div class="mission-score" id="inboxScore">${Object.keys(state.inboxAnswers).length} / ${inboxItems.length} messages checked</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="inboxNext" ${Object.keys(state.inboxAnswers).length===inboxItems.length ? '' : 'disabled'}>Go to the boardroom →</button></div>
    `);
    const list = document.getElementById('inboxList');
    inboxItems.forEach(item=>{
      const saved = state.inboxAnswers[item.id];
      const card = document.createElement('article');
      card.className = 'inbox-card';
      card.innerHTML = `<div class="inbox-card-head"><strong>${item.from}</strong><span>${item.time}</span></div><p>${item.text}</p><div class="decision-buttons">${[['Misleading',false],['Useful actuarial insight',true]].map(([label,val])=>{
        let cls='';
        if(saved !== undefined){ if(item.reality===val) cls='correct'; if(saved===val && saved!==item.reality) cls='wrong'; }
        return `<button type="button" data-inbox="${item.id}" data-answer="${val}" class="${cls}" ${saved !== undefined ? 'disabled' : ''}>${label}</button>`;
      }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>${saved===item.reality?'Correct.':'Correction.'}</strong> ${item.why}` : ''}</p>`;
      list.appendChild(card);
    });
    list.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-inbox]'); if(!btn) return;
      const item = inboxItems.find(x=>x.id===btn.dataset.inbox); if(!item || state.inboxAnswers[item.id] !== undefined) return;
      state.inboxAnswers[item.id] = btn.dataset.answer === 'true';
      saveState();
      playTone(state.inboxAnswers[item.id]===item.reality ? 'ok' : 'bad');
      renderInbox();
    });
    document.getElementById('inboxNext').addEventListener('click', nextStage);
  }

  function renderMeeting(){
    stageContainer.innerHTML = stageFrame('10:00 · CLIENT MEETING','Give the clearest professional answer','Mission 7 of 8 · about 4 minutes','assets/session1/realistic/client-meeting.png',`
      <div class="scene-message"><div class="avatar">🤝</div><div><strong>The client has arrived.</strong><p>Three people ask you direct questions. Choose the clearest professional answer each time.</p></div></div>
      <div id="meetingList" class="inbox-list"></div>
      <div class="mission-score" id="meetingScore">${Object.keys(state.meetingAnswers).length} / ${meetingMoves.length} replies chosen</div>
      <div class="stage-actions"><button type="button" class="primary-link" id="meetingNext" ${Object.keys(state.meetingAnswers).length===meetingMoves.length ? '' : 'disabled'}>Enter the boardroom →</button></div>
    `);
    const list = document.getElementById('meetingList');
    meetingMoves.forEach(item=>{
      const saved = state.meetingAnswers[item.id];
      const card = document.createElement('article');
      card.className = 'inbox-card';
      card.innerHTML = `<div class="inbox-card-head"><strong>${item.from}</strong><span>Live</span></div><p>${item.text}</p><p><strong>${item.prompt}</strong></p><div class="decision-buttons">${item.options.map((opt,j)=>{
        let cls='';
        if(saved !== undefined){ if(opt[1]) cls='correct'; if(saved===j && !opt[1]) cls='wrong'; }
        return `<button type="button" data-meeting="${item.id}" data-choice="${j}" class="${cls}" ${saved !== undefined ? 'disabled' : ''}>${opt[0]}</button>`;
      }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>${item.options[saved][1]?'Correct.':'Correction.'}</strong> ${item.feedback}` : ''}</p>`;
      list.appendChild(card);
    });
    list.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-meeting]'); if(!btn) return;
      const item = meetingMoves.find(x=>x.id===btn.dataset.meeting); if(!item || state.meetingAnswers[item.id] !== undefined) return;
      state.meetingAnswers[item.id] = Number(btn.dataset.choice);
      saveState();
      playTone(item.options[state.meetingAnswers[item.id]][1] ? 'ok' : 'bad');
      renderMeeting();
    });
    document.getElementById('meetingNext').addEventListener('click', nextStage);
  }

  function renderRescue(){
    const unlocked = rescueUnlockedCount();
    stageContainer.innerHTML = stageFrame('10:10 · BOARDROOM','Rescue the boardroom slide','Mission 8 of 8 · final mission','assets/session1/realistic/boardroom.png',`
      <div class="scene-message"><div class="avatar">📣</div><div><strong>Emergency from the boardroom.</strong><p>A slide for the client meeting is far too technical. Rewrite it now so the board can understand what actuaries actually do.</p></div></div>
      <div class="rescue-bad"><p class="module-number">THE BAD SLIDE</p><h3>Current draft</h3><ul>${rescueSteps.map(step=>`<li>${step.bad}</li>`).join('')}</ul></div>
      <div id="rescueStepsWrap">${rescueSteps.map((step,index)=>{
        const saved = state.rescueAnswers[step.id];
        const locked = index > unlocked;
        return `<article class="rescue-step ${locked?'locked':''}" ${locked?'data-locked="1"':''}><p class="module-number">STEP ${index+1}</p><h4>${step.title}</h4><p>${step.feedback}</p><div class="rescue-options">${step.options.map((opt,j)=>{
          let cls='';
          if(saved !== undefined){ if(opt[1]) cls='correct'; if(saved===j && !opt[1]) cls='wrong'; }
          const dis = locked || saved !== undefined ? 'disabled' : '';
          return `<button type="button" data-rescue="${step.id}" data-choice="${j}" class="${cls}" ${dis}>${opt[0]}</button>`;
        }).join('')}</div><p class="inline-feedback" aria-live="polite">${saved !== undefined ? `<strong>Saved.</strong> ${step.options[saved][1] ? 'This line is now fit for a non-specialist audience.' : 'Use the highlighted correction instead.'}` : locked ? 'Complete the previous step first.' : ''}</p></article>`;
      }).join('')}</div>
      <div id="boardReady" ${unlocked===rescueSteps.length ? '' : 'hidden'} class="board-ready-slide"><p class="module-number">BOARD-READY VERSION</p><h3>What does an actuary do?</h3><ul><li>Actuaries use data and models to understand future financial risk.</li><li>They help organisations think clearly about uncertain future costs and risks.</li><li>For example, they can analyse claims data to help an insurer set sustainable premiums.</li><li>In short, actuaries help people make better decisions when the future is uncertain.</li></ul><blockquote>“Clear, concrete and client-friendly. Send it.”</blockquote></div>
      <div id="missionComplete" ${unlocked===rescueSteps.length ? '' : 'hidden'} class="mission-complete"><strong>FIRST MORNING COMPLETED</strong><span>You restored the brief, handled the files, survived the client meeting and turned actuarial jargon into a clear client message.</span></div>
    `);
    const rescueWrap = document.getElementById('rescueStepsWrap');
    rescueWrap.addEventListener('click',e=>{
      const btn = e.target.closest('button[data-rescue]'); if(!btn) return;
      const step = rescueSteps.find(x=>x.id===btn.dataset.rescue); if(!step) return;
      if(state.rescueAnswers[step.id] !== undefined) return;
      const stepIndex = rescueSteps.findIndex(x=>x.id===step.id);
      if(stepIndex > rescueUnlockedCount()) return;
      const choice = Number(btn.dataset.choice);
      if(!step.options[choice][1]){
        playTone('bad');
        btn.classList.add('wrong');
        const feedback = btn.closest('.rescue-step').querySelector('.inline-feedback');
        feedback.innerHTML = '<strong>Too vague or too technical.</strong> Try again and choose the clearest option.';
        return;
      }
      state.rescueAnswers[step.id] = choice;
      saveState();
      playTone('ok');
      renderRescue();
    });
  }

  function rescueUnlockedCount(){
    let count = 0;
    for(const step of rescueSteps){
      const idx = state.rescueAnswers[step.id];
      if(idx === undefined || !step.options[idx] || !step.options[idx][1]) break;
      count += 1;
    }
    return count;
  }

  renderStage();
})();
