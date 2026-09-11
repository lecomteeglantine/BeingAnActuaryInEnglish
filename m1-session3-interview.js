(() => {
'use strict';
const STORAGE_KEY='being-an-actuary-m1-session3-interview-r2';
const steps=['Team','Profile','Grammar','Questions','Interview','Decision','Pitch'];
const roles={
  3:[
    ['Lead interviewer','Asks Past Simple follow-up questions.','👑'],
    ['Experience interviewer','Asks Present Perfect questions.','🔎'],
    ['Candidate + note keeper','Answers from the cards and records evidence.','🗂️']
  ],
  4:[
    ['Lead interviewer','Opens and closes the interview.','👑'],
    ['Experience interviewer','Asks Present Perfect questions.','🔎'],
    ['Follow-up interviewer','Asks Past Simple questions.','↪️'],
    ['Candidate','Answers from the candidate cards.','💼']
  ]
};
const candidate={name:'Lerato Mokoena',role:'Actuarial analyst',facts:[
  ['Education','Completed an undergraduate degree in 2022.'],
  ['Career start','Started working in insurance in 2023.'],
  ['Experience','Has worked on pricing and valuation projects.'],
  ['Exams','Has taken several professional actuarial exams.'],
  ['Challenge','Failed one exam in 2024, then retook it.'],
  ['Growth','Has learned to be more resilient under pressure.']
]};
const grammar=[
  {q:'Lerato ___ her undergraduate degree in 2022.',a:'completed',opts:['has completed','completed'],why:'2022 = finished past → Past Simple.'},
  {q:'She ___ in insurance since 2023.',a:'has worked',opts:['worked','has worked'],why:'Since 2023 and still true → Present Perfect.'},
  {q:'She ___ one professional exam in 2024.',a:'failed',opts:['has failed','failed'],why:'2024 = finished past → Past Simple.'},
  {q:'She ___ several professional exams so far.',a:'has taken',opts:['took','has taken'],why:'So far = experience up to now → Present Perfect.'},
  {q:'She ___ a pricing project during her first year at work.',a:'worked on',opts:['has worked on','worked on'],why:'A finished past period → Past Simple.'},
  {q:'She ___ a lot from difficult exam experiences.',a:'has learned',opts:['learned','has learned'],why:'The result matters now → Present Perfect.'}
];
const qbank=[
 {id:'pp1',type:'pp',good:true,text:'Have you ever worked on a pricing project?',answer:'Yes. I have worked on several pricing and valuation projects.',note:'Relevant pricing and valuation experience'},
 {id:'pp2',type:'pp',good:true,text:'How long have you worked in insurance?',answer:'I have worked in insurance since 2023.',note:'Has worked in insurance since 2023'},
 {id:'pp3',type:'pp',good:true,text:'What have you learned from difficult exam experiences?',answer:'I have learned to be more resilient, to read questions carefully and not to panic.',note:'Has learned resilience and careful reading'},
 {id:'pp4',type:'pp',good:true,text:'Have you taken any professional actuarial exams?',answer:'Yes. I have taken several professional actuarial exams.',note:'Has taken several professional exams'},
 {id:'pp5',type:'pp',good:false,text:'When have you graduated in 2022?',fix:'Use Past Simple: “When did you graduate?”'},
 {id:'pp6',type:'pp',good:false,text:'Did you ever worked on valuation projects?',fix:'Use: “Have you ever worked on valuation projects?”'},
 {id:'ps1',type:'ps',good:true,text:'When did you start working in insurance?',answer:'I started working in insurance in 2023, after completing my degree.',note:'Started working in insurance in 2023'},
 {id:'ps2',type:'ps',good:true,text:'What happened when you failed the exam?',answer:'I reviewed my mistakes, prepared again and retook the exam later.',note:'Responded constructively to an exam setback'},
 {id:'ps3',type:'ps',good:true,text:'Why did you choose actuarial work?',answer:'I chose actuarial work because I enjoyed using data to solve real problems and support decisions.',note:'Chose actuarial work for data and problem-solving'},
 {id:'ps4',type:'ps',good:true,text:'What did you do on your first pricing project?',answer:'I analysed data, checked assumptions and prepared part of the report with my team.',note:'Worked with data, assumptions and reporting'},
 {id:'ps5',type:'ps',good:false,text:'When have you started your first job?',fix:'Use Past Simple: “When did you start your first job?”'},
 {id:'ps6',type:'ps',good:false,text:'What did you learned from the exam?',fix:'After “did”, use the base form: “What did you learn…?”'}
];
const emptyState=()=>({step:0,players:null,grammarAnswers:{},questions:[],roundsDone:[],decision:'',strength1:'',strength2:'',concern:'',pitchDraft:'',timer:120,running:false});
let state=emptyState();
let timerId=null;
const $=s=>document.querySelector(s);
const screen=$('#screen'),gameArea=$('#gameArea'),status=$('#status');
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,running:false}));}catch(e){}}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return;
    const x=JSON.parse(raw);
    state={...emptyState(),...x,running:false};
    state.step=Number.isInteger(state.step)?Math.max(0,Math.min(6,state.step)):0;
    state.players=[3,4].includes(state.players)?state.players:null;
    state.grammarAnswers=state.grammarAnswers&&typeof state.grammarAnswers==='object'?state.grammarAnswers:{};
    state.questions=Array.isArray(state.questions)?state.questions.filter(id=>qbank.some(q=>q.id===id&&q.good)).filter((id,i,a)=>a.indexOf(id)===i).slice(0,6):[];
    const done=Array.isArray(state.roundsDone)?state.roundsDone.filter(n=>Number.isInteger(n)&&n>=0&&n<6).filter((n,i,a)=>a.indexOf(n)===i).sort((a,b)=>a-b):[];
    state.roundsDone=[]; for(let i=0;i<done.length&&done[i]===i;i++)state.roundsDone.push(i);
    state.timer=Number.isFinite(state.timer)?Math.max(0,Math.min(120,state.timer)):120;
  }catch(e){state=emptyState();}
}
function toast(msg){status.textContent=msg;status.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>status.classList.remove('show'),2600);}
function selectedQuestions(){return state.questions.map(id=>qbank.find(q=>q.id===id)).filter(Boolean);}
function progress(){
  const cur=Math.min(state.step,6);
  $('#stepLabel').textContent=steps[cur]||'Complete';
  $('#progressSteps').innerHTML=steps.map((s,i)=>`<div class="progress-step ${i<cur?'done':i===cur?'active':''}"><b>${i<cur?'✓':i+1}</b><span>${s}</span></div>`).join('');
  const g=Object.keys(state.grammarAnswers).filter(k=>state.grammarAnswers[k]===grammar[+k]?.a).length;
  const q=state.questions.length;
  const r=state.roundsDone.length;
  const d=state.decision?1:0;
  const pct=Math.round(((g/6)*25)+(Math.min(q,6)/6*25)+(r/6*35)+(d*15));
  $('#readinessScore').textContent=pct+'%'; $('#readinessBar').style.width=pct+'%';
}
function pitchNotes(){
  const notes=[];
  if(state.players)notes.push(['Team',`${state.players} players`]);
  if(state.roundsDone.length){const qs=selectedQuestions();notes.push(['Interview evidence',state.roundsDone.map(i=>qs[i]?.note).filter(Boolean).join('; ')]);}
  if(state.strength1||state.strength2)notes.push(['Strengths',[state.strength1,state.strength2].filter(Boolean).join(' · ')]);
  if(state.concern)notes.push(['Concern',state.concern]);
  if(state.decision)notes.push(['Decision',state.decision==='hire'?'HIRE the candidate':'DO NOT HIRE the candidate']);
  $('#pitchNotes').innerHTML=notes.length?notes.map(n=>`<div class="pitch-card"><strong>${esc(n[0])}</strong><p>${esc(n[1])}</p></div>`).join(''):'<p class="small-note">Your notes will appear here as you play.</p>';
  const text=notes.map(n=>n[1]).join(' '),words=text.trim()?text.trim().split(/\s+/).length:0,sec=Math.round(words/130*60);
  $('#wordCount').textContent=words; $('#timeEstimate').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
}
function update(){progress();pitchNotes();save();}
function startGame(){gameArea.hidden=false;render();}
function next(){state.step=Math.min(6,state.step+1);render();}
function back(){state.step=Math.max(0,state.step-1);render();}
function actions(nextLabel='Continue →',disabled=false){return `<div class="screen-actions">${state.step>0?'<button class="interview-btn ghost" id="backBtn" type="button">← Back</button>':''}<button class="interview-btn primary" id="nextBtn" type="button" ${disabled?'disabled':''}>${nextLabel}</button></div>`;}
function bindNav(onNext){$('#backBtn')?.addEventListener('click',back);$('#nextBtn')?.addEventListener('click',onNext||next);}
function render(){
  clearInterval(timerId); state.running=false; gameArea.hidden=false; update();
  if(state.step===0)renderTeam(); else if(state.step===1)renderProfile(); else if(state.step===2)renderGrammar(); else if(state.step===3)renderQuestions(); else if(state.step===4)renderInterview(); else if(state.step===5)renderDecision(); else renderPitch();
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:Math.max(0,gameArea.offsetTop-80),behavior:reduce?'auto':'smooth'});
}
function renderTeam(){
  screen.innerHTML=`<p class="eyebrow">STEP 1 · TEAM</p><h2>Choose your team</h2><p class="screen-lead">Choose <strong>3 or 4 players</strong>. Roles appear automatically.</p><div class="choice-grid"><button class="player-choice ${state.players===3?'selected':''}" data-p="3" type="button"><span class="big-num">3</span><h3>3 players</h3><p>Lead · Experience · Candidate + notes</p></button><button class="player-choice ${state.players===4?'selected':''}" data-p="4" type="button"><span class="big-num">4</span><h3>4 players</h3><p>Lead · Experience · Follow-up · Candidate</p></button></div><div id="rolesWrap"></div>${actions('Read the candidate file →',!state.players)}`;
  const showRoles=()=>{$('#rolesWrap').innerHTML=state.players?`<div class="role-list">${roles[state.players].map(r=>`<div class="role-card"><span class="role-icon">${r[2]}</span><div><strong>${esc(r[0])}</strong><small>${esc(r[1])}</small></div></div>`).join('')}</div>`:'';$('#nextBtn').disabled=!state.players;};
  document.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{state.players=+b.dataset.p;state.questions=[];state.roundsDone=[];document.querySelectorAll('[data-p]').forEach(x=>x.classList.toggle('selected',+x.dataset.p===state.players));showRoles();update();}));showRoles();bindNav();
}
function renderProfile(){
  screen.innerHTML=`<p class="eyebrow">STEP 2 · CANDIDATE FILE</p><h2>Meet Lerato</h2><p class="screen-lead">Read the six facts. Keep Yashna's video in mind: exams, setbacks, resilience and experience.</p><div class="video-link-card"><img src="assets/session3-interview/yashna-video-still.jpg" alt="Still image of the speaker from the Session 3 video."><div><p class="eyebrow">VIDEO LINK</p><h3>What can experience teach an actuary?</h3><p>Use that idea when you evaluate this fictional candidate.</p></div></div><article class="candidate-card"><div class="candidate-head"><div><p class="eyebrow" style="color:#bfe4ff">FICTIONAL CANDIDATE</p><h3>${candidate.name}</h3><p>${candidate.role}</p></div><div class="candidate-avatar">LM</div></div><div class="candidate-body">${candidate.facts.map(f=>`<div class="candidate-fact"><span>${esc(f[0])}</span><strong>${esc(f[1])}</strong></div>`).join('')}</div></article><div class="grammar-strip"><div class="grammar-box ps"><strong>Past Simple</strong>Finished past: <em>in 2022, in 2024, when…</em></div><div class="grammar-box pp"><strong>Present Perfect</strong>Experience up to now: <em>ever, so far, since…</em></div></div>${actions('Quick grammar check →')}`;bindNav();
}
function renderGrammar(){
  const correct=Object.keys(state.grammarAnswers).filter(k=>state.grammarAnswers[k]===grammar[+k]?.a).length;
  screen.innerHTML=`<p class="eyebrow">STEP 3 · QUICK CHECK</p><h2>Past Simple or Present Perfect?</h2><p class="screen-lead">Discuss, then choose. Six quick sentences.</p><div class="quiz-list">${grammar.map((g,i)=>{const chosen=state.grammarAnswers[i];return `<div class="quiz-row"><p>${i+1}. ${esc(g.q)}</p><div class="mini-options">${g.opts.map(o=>`<button class="mini-option ${chosen===o?(o===g.a?'correct':'wrong'):''}" data-gi="${i}" data-val="${esc(o)}" type="button">${esc(o)}</button>`).join('')}</div><div class="feedback ${chosen?(chosen===g.a?'good':'bad'):''}">${chosen?(chosen===g.a?'✓ ':'✗ ')+esc(g.why):''}</div></div>`}).join('')}</div><p class="counter">Score: ${correct}/6</p>${actions('Choose interview questions →',Object.keys(state.grammarAnswers).length<6)}`;
  document.querySelectorAll('[data-gi]').forEach(b=>b.addEventListener('click',()=>{state.grammarAnswers[b.dataset.gi]=b.dataset.val;save();renderGrammar();update();}));bindNav();
}
function renderQuestions(){
  const selected=state.questions,pp=selected.filter(id=>qbank.find(q=>q.id===id)?.type==='pp').length,ps=selected.filter(id=>qbank.find(q=>q.id===id)?.type==='ps').length;
  screen.innerHTML=`<p class="eyebrow">STEP 4 · QUESTIONS</p><h2>Choose 6 questions</h2><p class="screen-lead">Choose <strong>3 green</strong> experience questions and <strong>3 blue</strong> past-detail questions.</p><div class="question-help"><div class="pp-help"><strong>Present Perfect</strong><br>experience up to now</div><div class="ps-help"><strong>Past Simple</strong><br>finished past details</div></div><p class="counter">Present Perfect: ${pp}/3 · Past Simple: ${ps}/3</p><div class="question-bank">${qbank.map(q=>`<button type="button" class="question-card ${selected.includes(q.id)?'selected':''}" data-qid="${q.id}"><span class="type ${q.type}">${q.type==='pp'?'PRESENT PERFECT':'PAST SIMPLE'}</span><p>${esc(q.text)}</p></button>`).join('')}</div>${actions('Run the interview →',pp!==3||ps!==3)}`;
  document.querySelectorAll('[data-qid]').forEach(b=>b.addEventListener('click',()=>{
    const q=qbank.find(x=>x.id===b.dataset.qid); if(!q)return;
    if(!q.good){b.classList.add('trap');setTimeout(()=>b.classList.remove('trap'),650);toast(`Grammar trap. ${q.fix}`);return;}
    const same=state.questions.filter(id=>qbank.find(x=>x.id===id)?.type===q.type);
    if(state.questions.includes(q.id)) state.questions=state.questions.filter(id=>id!==q.id);
    else if(same.length<3) state.questions.push(q.id);
    else {toast(`You already chose 3 ${q.type==='pp'?'Present Perfect':'Past Simple'} questions.`);return;}
    state.roundsDone=[]; save(); renderQuestions(); update();
  }));
  bindNav(()=>{if(pp===3&&ps===3)next();});
}
function interviewerFor(q,index){
  if(state.players===3)return q.type==='pp'?'Experience interviewer':'Lead interviewer';
  if(index===0||index===5)return 'Lead interviewer';
  return q.type==='pp'?'Experience interviewer':'Follow-up interviewer';
}
function renderInterview(){
  const qs=selectedQuestions();
  if(qs.length!==6){state.step=3;render();return;}
  const nextIndex=state.roundsDone.length;
  screen.innerHTML=`<p class="eyebrow">STEP 5 · INTERVIEW</p><h2>Ask your 6 questions</h2><p class="screen-lead">Read each question aloud. The candidate reveals the answer. Then move on.</p>${qs.map((q,i)=>{const done=state.roundsDone.includes(i),locked=!done&&i!==nextIndex;return `<article class="interview-round ${i===nextIndex?'active':''} ${locked?'locked':''}"><div class="round-top"><div><span class="round-num">${i+1}</span><span class="round-type ${q.type}">${q.type==='pp'?'PRESENT PERFECT':'PAST SIMPLE'}</span></div><span class="speaker-badge">${esc(interviewerFor(q,i))}</span></div><p class="spoken-question">${esc(q.text)}</p><button class="interview-btn ghost reveal-btn" data-ri="${i}" type="button" ${locked?'disabled':''}>${done?'Answer revealed ✓':'Candidate: reveal answer'}</button><div class="answer-reveal" ${done?'':'hidden'}><strong>Candidate answer</strong><p>${esc(q.answer)}</p><small>Evidence: ${esc(q.note)}</small></div></article>`}).join('')}${actions('Make your decision →',state.roundsDone.length<6)}`;
  document.querySelectorAll('.reveal-btn').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.ri;if(i!==state.roundsDone.length||state.roundsDone.includes(i))return;state.roundsDone.push(i);toast('Evidence added to your notes.');save();renderInterview();update();}));bindNav();
}
function renderDecision(){
  screen.innerHTML=`<p class="eyebrow">STEP 6 · DECISION</p><h2>Hire or don't hire?</h2><p class="screen-lead">Choose one option. Add <strong>2 strengths</strong> and <strong>1 concern</strong>.</p><div class="decision-grid"><button type="button" class="decision-card hire ${state.decision==='hire'?'selected':''}" data-d="hire"><h3>✅ HIRE</h3><p>The evidence is strong enough.</p></button><button type="button" class="decision-card nohire ${state.decision==='nohire'?'selected':''}" data-d="nohire"><h3>❌ DON'T HIRE</h3><p>Important gaps remain.</p></button></div><div class="evidence-fields"><label>Strength 1<textarea id="s1" placeholder="She has worked on…">${esc(state.strength1)}</textarea></label><label>Strength 2<textarea id="s2" placeholder="She has learned…">${esc(state.strength2)}</textarea></label><label>One concern<textarea id="concern" placeholder="She hasn't… yet.">${esc(state.concern)}</textarea></label></div>${actions('Build the 2-minute pitch →',!state.decision||!state.strength1.trim()||!state.strength2.trim()||!state.concern.trim())}`;
  document.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>{state.decision=b.dataset.d;state.pitchDraft='';save();renderDecision();update();}));
  ['s1','s2','concern'].forEach(id=>$('#'+id).addEventListener('input',e=>{if(id==='s1')state.strength1=e.target.value;if(id==='s2')state.strength2=e.target.value;if(id==='concern')state.concern=e.target.value;state.pitchDraft='';$('#nextBtn').disabled=!state.decision||!state.strength1.trim()||!state.strength2.trim()||!state.concern.trim();update();}));bindNav();
}
function defaultPitch(){const dec=state.decision==='hire'?'hire Lerato':'not hire Lerato';return `Our candidate is Lerato Mokoena, an actuarial analyst.\n\nShe completed her undergraduate degree in 2022 and started working in insurance in 2023.\n\nSo far, she has worked on pricing and valuation projects and has taken several professional actuarial exams. She has also learned to be more resilient.\n\nHer main strengths are: ${state.strength1 || '[strength 1]'}; ${state.strength2 || '[strength 2]'}. One concern is: ${state.concern || '[concern]'}.\n\nOur final decision is to ${dec} because…`;}
function renderPitch(){
  if(!state.pitchDraft)state.pitchDraft=defaultPitch();
  const order=state.players===4?['Player 1: introduce the candidate','Player 2: give finished past details','Player 3: give experience up to now','Player 4: strengths, concern and decision']:['Player 1: introduce + past details','Player 2: experience + strengths','Player 3: concern + decision'];
  screen.innerHTML=`<p class="eyebrow">FINAL · 2-MINUTE TEAM PITCH</p><h2>Present your decision</h2><p class="screen-lead">Every student speaks. Use both tenses and evidence from the interview.</p><div class="final-grid"><div><label for="finalScript"><strong>Your team script</strong></label><textarea id="finalScript" class="final-script">${esc(state.pitchDraft)}</textarea></div><div class="timer-card"><p class="eyebrow" style="color:#bfe4ff">PRACTICE TIMER</p><div id="timerDisplay" class="time">${fmt(state.timer)}</div><div class="timer-actions"><button type="button" class="interview-btn" id="timerStart">${state.timer===0?'Restart':'Start'}</button><button type="button" class="interview-btn" id="timerReset">Reset</button></div><div class="speaking-order"><strong>Speaking order</strong><ol>${order.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div></div></div><div class="grammar-strip"><div class="grammar-box ps"><strong>Past Simple</strong><em>completed, started, failed, retook…</em></div><div class="grammar-box pp"><strong>Present Perfect</strong><em>has worked, has taken, has learned…</em></div></div><div class="screen-actions"><button class="interview-btn ghost" id="backBtn" type="button">← Back</button><button class="interview-btn success" id="copyBtn" type="button">Copy pitch</button></div>`;
  $('#finalScript').addEventListener('input',e=>{state.pitchDraft=e.target.value;save();});
  $('#backBtn').addEventListener('click',back);
  $('#copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#finalScript').value);toast('Pitch copied.');}catch(e){$('#finalScript').focus();$('#finalScript').select();toast('Select and copy your pitch.');}});
  $('#timerStart').addEventListener('click',toggleTimer); $('#timerReset').addEventListener('click',resetTimer); update();
}
function fmt(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function toggleTimer(){
  const btn=$('#timerStart'); if(!btn)return;
  if(state.running){clearInterval(timerId);state.running=false;btn.textContent='Resume';save();return;}
  if(state.timer<=0){state.timer=120;$('#timerDisplay').textContent='2:00';}
  state.running=true;btn.textContent='Pause';
  timerId=setInterval(()=>{state.timer=Math.max(0,state.timer-1);const d=$('#timerDisplay');if(d)d.textContent=fmt(state.timer);if(state.timer===0){clearInterval(timerId);state.running=false;btn.textContent='Restart';toast('Time! Finish your final sentence.');}save();},1000);
}
function resetTimer(){clearInterval(timerId);state.running=false;state.timer=120;$('#timerDisplay').textContent='2:00';$('#timerStart').textContent='Start';save();}
function reset(){if(!confirm('Restart the interview challenge and clear this team\'s progress?'))return;clearInterval(timerId);try{localStorage.removeItem(STORAGE_KEY);}catch(e){}state=emptyState();gameArea.hidden=true;update();window.scrollTo({top:0,behavior:'smooth'});}
$('#heroStart').addEventListener('click',startGame); $('#resetBtn').addEventListener('click',reset); load(); if(state.players||state.step>0){gameArea.hidden=false;render();}else update();
})();
