(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const mount=$('#stageMount'), mapItems=$$('#missionMap li'), overlay=$('#missionOverlay');
const timeEl=$('#officeTime'), locationEl=$('#officeLocation'), missionEl=$('#missionNumber'), statusEl=$('#statusText');
const repEl=$('#repValue'), meterEl=$('#badgeMeter'), levelEl=$('#badgeLevel');
const soundBtn=$('#soundToggle'), resetBtn=$('#resetGame'), continueBtn=$('#continueMission');
const KEY='actuary_m1_s1_northstar_v12';
const REWARDS={1:12,2:14,3:16,4:14,5:14,6:15,7:15};
const STAGES={
 1:{time:'08:45',place:'Brief Desk',status:'Client file corrupted'},
 2:{time:'09:00',place:'Access Gate',status:'Audio clearance required'},
 3:{time:'09:15',place:'Case Room',status:'Three client files waiting'},
 4:{time:'09:38',place:'Risk Lab',status:'Model tray incomplete'},
 5:{time:'09:52',place:'Team Inbox',status:'Client pack at risk'},
 6:{time:'10:05',place:'Client Meeting',status:'Meeting live'},
 7:{time:'10:16',place:'Boardroom',status:'Presentation starts soon'}
};
const defaultState=()=>({stage:1,soundOn:true,rep:0,earned:{},brief:{},briefChecked:false,pron:{},caseDone:{},casePanel:'motor',lab:[],labTrayOK:false,labShock:false,inbox:{},meeting:[],meetingWrong:'',slide:{},slideChecked:false});
let state=load(); let selectedWord=''; let selectedReplacement=''; let voice=null; let audioCtx=null;
try{const nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]; const ref=document.referrer?new URL(document.referrer).pathname:''; if(nav&&nav.type==='navigate'&&/\/m1-day1\.html$/.test(ref)){sessionStorage.removeItem(KEY);state=defaultState();}}catch(_){ }

const briefSlots=[
{id:'b1',text:'Northstar has hired a junior ___ to support the team.',answer:'actuary'},
{id:'b2',text:'The client needs help understanding financial ___.',answer:'risk'},
{id:'b3',text:'The team is doing ___ work for the insurer.',answer:'actuarial'},
{id:'b4',text:'The future contains significant ___.',answer:'uncertainty'},
{id:'b5',text:'The team compares outcomes using ___.',answer:'probability'},
{id:'b6',text:'The analysis needs reliable ___.',answer:'data'},
{id:'b7',text:'The actuary builds a ___ to represent the situation.',answer:'model'},
{id:'b8',text:'The work supports a financial ___.',answer:'forecast'}];
const briefWords=['actuary','risk','actuarial','uncertainty','probability','data','model','forecast'];
const pron=[
{id:'actuary',word:'actuary',ipa:'/ˈæk.tʃu.ə.ri/',opts:['ACT-u-ar-y','act-u-AR-y'],correct:0,note:'Main stress on the first syllable.'},
{id:'actuarial',word:'actuarial',ipa:'/ˌæk.tʃuˈeə.ri.əl/',opts:['AC-tu-ar-i-al','ac-tu-AR-i-al'],correct:1,note:'Main stress on AR.'},
{id:'liability',word:'liability',ipa:'/ˌlaɪ.əˈbɪl.ə.ti/',opts:['LI-a-bi-li-ty','li-a-BIL-i-ty'],correct:1,note:'Main stress on BIL.'},
{id:'probability',word:'probability',ipa:'/ˌprɒb.əˈbɪl.ə.ti/',opts:['PROB-a-bi-li-ty','prob-a-BIL-i-ty'],correct:1,note:'Main stress on BIL.'},
{id:'insurance',word:'insurance',ipa:'/ɪnˈʃʊə.rəns/',opts:['IN-sur-ance','in-SUR-ance'],correct:1,note:'Main stress on SUR.'},
{id:'premium',word:'premium',ipa:'/ˈpriː.mi.əm/',opts:['PRE-mi-um','pre-MI-um'],correct:0,note:'Main stress on PRE.'},
{id:'uncertainty',word:'uncertainty',ipa:'/ʌnˈsɜː.tən.ti/',opts:['UN-cer-tain-ty','un-CER-tain-ty'],correct:1,note:'Main stress on CER.'},
{id:'forecast',word:'forecast',ipa:'/ˈfɔː.kɑːst/',opts:['FORE-cast','fore-CAST'],correct:0,note:'As a noun, stress FORE.'}];
const cases={
 motor:{label:'Motor insurer',icon:'🚗',problem:'Claim frequency is stable, but average repair costs are rising quickly.',q1:'What should the actuary do first?',o1:['Analyse claims data and update assumptions','Promise the client that costs will fall','Launch a safer-driving advert'],c1:0,q2:'What is the actuary ultimately trying to estimate?',o2:['The likely financial impact of future claims','Which driver will claim next Tuesday','The company’s best marketing slogan'],c2:0,feedback:'Evidence → assumptions → financial impact.'},
 pension:{label:'Pension fund',icon:'👥',problem:'The scheme is worried that future obligations may become more expensive.',q1:'What should the actuary investigate?',o1:['Longevity and future liabilities','Office rent and furniture','Social-media engagement'],c1:0,q2:'Why does this matter?',o2:['Longer lives can change the cost of future payments','The actuary needs to predict each member’s exact date of death','It guarantees investment returns'],c2:0,feedback:'Actuaries model long-term obligations under uncertainty.'},
 climate:{label:'Climate-risk client',icon:'🌊',problem:'A client exposed to severe weather is renewing its insurance programme.',q1:'What should the actuary focus on?',o1:['Exposure scenarios and possible losses','Only last Tuesday’s weather','Removing uncertainty from the report'],c1:0,q2:'What would make the advice stronger?',o2:['Testing several plausible scenarios','Using a single optimistic forecast','Ignoring extreme outcomes'],c2:0,feedback:'Scenario analysis helps quantify uncertain future losses.'}
};
const labItems=[['Historical claims','Claims evidence',true],['Claim frequency','How often claims occur',true],['Average claim cost','Severity of losses',true],['Repair-cost inflation','Cost pressure',true],['Model assumptions','How the model is built',true],['Company logo colour','No impact on the estimate',false],['CEO’s favourite car','Noise',false],['Social-media followers','Not relevant here',false]];
const inbox=[
{id:'i1',from:'Pricing manager',time:'09:52',text:'An actuary helps a company make informed decisions under uncertainty.',good:true,why:'Keep it: clear, accurate and client-friendly.'},
{id:'i2',from:'Intern',time:'09:54',text:'Actuaries predict the exact future.',good:false,why:'Archive it: actuaries estimate possible outcomes; they do not know the exact future.'},
{id:'i3',from:'Data team',time:'09:56',text:'Weak data can distort the model and the decision that follows.',good:true,why:'Keep it: data quality matters.'},
{id:'i4',from:'Office chat',time:'09:58',text:'Actuaries mainly make spreadsheets and reports look complicated.',good:false,why:'Archive it: the goal is useful insight, not complexity for its own sake.'},
{id:'i5',from:'Manager',time:'10:00',text:'Actuaries can work in insurance, pensions, finance, consulting and risk teams.',good:true,why:'Keep it: that is a useful overview of the profession.'}];
const meeting=[
{speaker:'Client',q:'Can your model tell us exactly what will happen next year?',answers:[['Not exactly. It can estimate likely outcomes and compare scenarios.',true],['Yes. Once the model is finished, the future is certain.',false],['We should avoid discussing uncertainty with clients.',false]],reaction:'Good. Honest about uncertainty, but still useful.'},
{speaker:'Finance Director',q:'Why do you keep asking us for better data?',answers:[['Because weak data can distort the model and lead to poor decisions.',true],['Because actuaries collect as much data as possible, even when it is irrelevant.',false],['Because good data means we no longer need professional judgement.',false]],reaction:'Exactly. Data quality affects the whole analysis.'},
{speaker:'Board Member',q:'Does an actuary only work for insurance companies?',answers:[['No. Actuaries also work in pensions, finance, consulting and wider risk roles.',true],['Yes. Insurance is the only place actuarial skills are used.',false],['Mostly, but only in motor insurance.',false]],reaction:'Right. The profession is broader than insurance.'},
{speaker:'CEO',q:'So, in one sentence, what do actuaries bring to a company?',answers:[['They help organisations understand financial risk and make better decisions under uncertainty.',true],['They make technical reports for senior management.',false],['They remove uncertainty from every business decision.',false]],reaction:'That is the clearest summary of the morning.'}];
const slideSlots=[
{id:'s1',bad:'Actuarial professionals leverage stochastic methodologies to optimise financial resilience.',answer:'Actuaries use data and models to help organisations understand future financial risk.'},
{id:'s2',bad:'The actuarial function integrates probabilistic frameworks for liability calibration.',answer:'They help organisations think clearly about uncertain future costs and risks.'},
{id:'s3',bad:'Outputs are translated into pricing adequacy metrics.',answer:'For example, an actuary can analyse claims data to help an insurer set sustainable premiums.'},
{id:'s4',bad:'The discipline delivers multi-vector optimisation under dynamic uncertainty.',answer:'In short, actuaries help people make better decisions when the future is uncertain.'}];
const replacements=[...slideSlots.map(x=>x.answer),'Actuaries always know which exact event will happen next.','Actuaries mainly produce complex spreadsheets for technical teams.','The best actuarial model removes the need for judgement.','Actuarial work is only useful in motor insurance.'];

function load(){try{return {...defaultState(),...(JSON.parse(sessionStorage.getItem(KEY)||'null')||{})};}catch(_){return defaultState();}}
function save(){state.soundOn=state.soundOn!==false; try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch(_){}}
function maxUnlocked(){let n=1; for(let i=1;i<=7;i++){if(state.earned[i]) n=Math.min(7,i+1); else break;} return n;}
function badgeLevel(){const r=state.rep||0; if(r>=100)return ['Northstar cleared','Boardroom access']; if(r>=75)return ['Client trusted','Level 4 access']; if(r>=50)return ['Project team','Level 3 access']; if(r>=25)return ['Analyst access','Level 2 access']; return ['Visitor access','Level 1 access'];}
function updateHUD(){const s=STAGES[state.stage]; timeEl.textContent=s.time; locationEl.textContent=s.place; missionEl.textContent=state.stage; statusEl.textContent=state.earned[state.stage]?'Mission cleared':s.status; repEl.textContent=state.rep||0; meterEl.style.width=Math.min(100,state.rep||0)+'%'; levelEl.textContent=badgeLevel()[0]; mapItems.forEach(li=>{const n=Number(li.dataset.step); li.classList.toggle('active',n===state.stage); li.classList.toggle('done',!!state.earned[n]); const btn=$('button',li); btn.disabled=n>maxUnlocked(); btn.style.cursor=n<=maxUnlocked()?'pointer':'default';}); save();}
function stageFrame(num,title,subtitle,img,chips,body){return `<article class="stage-card"><div class="stage-visual"><img src="${img}" alt="Illustration for ${escapeHtml(title)}"><div class="visual-copy"><span class="mission-label">${STAGES[num].time} · MISSION ${num} OF 7</span><h2>${title}</h2><p>${subtitle}</p><div class="visual-chip-row">${chips.map(c=>`<span>${c}</span>`).join('')}</div></div></div><div class="stage-body">${body}</div></article>`;}
function dispatch(icon,title,text){return `<div class="dispatch"><div class="dispatch-icon">${icon}</div><div><strong>${title}</strong><p>${text}</p></div></div>`;}
function footer(score,nextEnabled,label='Mission complete'){return `<div class="stage-footer"><div class="stage-score">${score}</div><div class="stage-actions"><button class="primary-game" id="completeMission" ${nextEnabled?'':'disabled'}>${label} →</button></div></div>`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function selectClass(selected,correct,idx){if(selected===undefined)return 'choice'; if(idx===correct)return 'choice correct'; if(idx===selected)return 'choice wrong'; return 'choice';}
function awardAndClear(num,title,text){const fresh=!state.earned[num];if(fresh){state.earned[num]=true;state.rep=Math.min(100,(state.rep||0)+REWARDS[num]);save();sfx('clear');} $('#clearTitle').textContent=title; $('#clearText').textContent=text; $('#clearReward').textContent=fresh?('+'+REWARDS[num]):'earned'; overlay.hidden=false; continueBtn.dataset.from=String(num); updateHUD();}
continueBtn.addEventListener('click',()=>{const from=Number(continueBtn.dataset.from)||state.stage; overlay.hidden=true; if(from<7){state.stage=Math.max(state.stage,from+1);render(); window.scrollTo({top:document.querySelector('.game-layout').offsetTop-80,behavior:'smooth'});} else {render();}});
mapItems.forEach(li=>$('button',li).addEventListener('click',()=>{const n=Number(li.dataset.step); if(n<=maxUnlocked()){state.stage=n;render();window.scrollTo({top:document.querySelector('.game-layout').offsetTop-80,behavior:'smooth'});}}));
resetBtn.addEventListener('click',()=>{if(!confirm('Restart Actuary for a Day from the beginning?'))return;sessionStorage.removeItem(KEY);location.reload();});
soundBtn.addEventListener('click',()=>{state.soundOn=!state.soundOn; soundBtn.textContent=state.soundOn?'🔊 Sound on':'🔈 Sound off'; soundBtn.setAttribute('aria-pressed',String(state.soundOn));save();primeVoice();});
function primeVoice(){if(!('speechSynthesis'in window))return;const voices=speechSynthesis.getVoices(); if(!voice&&voices.length){voice=voices.find(v=>v.localService&&/en-GB/i.test(v.lang))||voices.find(v=>/en-GB/i.test(v.lang))||voices.find(v=>v.localService&&/^en/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;}}
if('speechSynthesis'in window){primeVoice();speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',primeVoice,{once:false});}
function speak(text){if(!state.soundOn||!('speechSynthesis'in window))return;primeVoice();const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;u.lang=voice?.lang||'en-GB';u.rate=.94;if(speechSynthesis.speaking)speechSynthesis.cancel();speechSynthesis.speak(u);}
function sfx(kind){if(!state.soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const seq=kind==='clear'?[523,784]:kind==='bad'?[210,165]:[660,820];o.type=kind==='bad'?'triangle':'sine';o.frequency.setValueAtTime(seq[0],now);o.frequency.exponentialRampToValueAtTime(seq[1],now+.13);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+.19);o.start(now);o.stop(now+.2);}catch(_){}}

function renderBrief(){
 const used=Object.values(state.brief); const correctCount=briefSlots.filter(x=>state.brief[x.id]===x.answer).length;
 mount.innerHTML=stageFrame(1,'Restore the client brief','Your first file is corrupted. Rebuild it from the word bank before your visitor badge expires.','assets/session1/realistic/brief-desk.png',['Vocabulary puzzle','Tap-to-place','8 key terms'],`${dispatch('🗂️','Message from your manager','Select a term from the word bank, then click the line where it belongs. You can move terms until the brief is correct.')}
 <div class="word-bank">${briefWords.map(w=>`<button class="word-chip ${selectedWord===w?'active':''} ${used.includes(w)?'used':''}" data-word="${w}">${w}</button>`).join('')}</div>
 <div class="game-grid">${briefSlots.map((x,i)=>{const assigned=state.brief[x.id]||'drop term';let cls='drop-line';if(state.briefChecked)cls+=assigned===x.answer?' correct':' wrong';return `<button class="${cls}" data-slot="${x.id}"><span class="micro-label">LINE ${i+1}</span><div>${x.text.replace('___',`<span>${escapeHtml(assigned)}</span>`)}</div></button>`;}).join('')}</div>
 <div class="feedback" id="briefFeedback">${state.briefChecked?(correctCount===8?'Brief restored. Every key term is now in the right place.':`${correctCount}/8 lines are correct. Move the red terms and check again.`):'Tip: a used term can still be moved to another line.'}</div>
 <div class="stage-footer"><div class="stage-score">${correctCount}/8 lines correct</div><div class="stage-actions"><button class="secondary-game" id="checkBrief">Check brief</button><button class="primary-game" id="completeMission" ${correctCount===8?'':'disabled'}>Send to manager →</button></div></div>`);
 $$('[data-word]',mount).forEach(b=>b.onclick=()=>{selectedWord=b.dataset.word;renderBrief();});
 $$('[data-slot]',mount).forEach(b=>b.onclick=()=>{if(!selectedWord)return;Object.keys(state.brief).forEach(k=>{if(state.brief[k]===selectedWord)delete state.brief[k];});state.brief[b.dataset.slot]=selectedWord;selectedWord='';state.briefChecked=false;save();renderBrief();});
 $('#checkBrief').onclick=()=>{state.briefChecked=true;sfx(correctCount===8?'ok':'bad');save();renderBrief();};
 $('#completeMission').onclick=()=>awardAndClear(1,'Brief rescued','You restored the client brief and unlocked analyst access.');
}
function renderPron(){
 const done=Object.keys(state.pron).length;
 mount.innerHTML=stageFrame(2,'Clear the access gate','The client floor is locked. Use the audio and identify the correct stress pattern for eight words.','assets/session1/realistic/hero-office.png',['British English','Audio gate','Stress patterns'],`${dispatch('🎧','Security protocol','Listen when you need to. A wrong answer triggers a correction but does not lock you out; choose again to clear that word.')}
 <div class="gate-grid">${pron.map((w,i)=>`<div class="gate-card"><div class="gate-head"><div class="gate-word"><span class="micro-label">CHECKPOINT ${i+1}</span><strong>${w.word}</strong><small>${w.ipa}</small></div><button class="listen-btn" data-say="${w.word}">🔊 Listen</button></div><div class="choice-grid">${w.opts.map((o,j)=>`<button class="choice ${state.pron[w.id]?'correct':''}" data-pron="${w.id}" data-choice="${j}" ${state.pron[w.id]?'disabled':''}>${o}</button>`).join('')}</div><div class="feedback" id="fb-${w.id}">${state.pron[w.id]?w.note:''}</div></div>`).join('')}</div>${footer(`${done}/8 access checks cleared`,done===8,'Open client floor')}`);
 $$('[data-say]',mount).forEach(b=>b.onclick=()=>speak(b.dataset.say));
 $$('[data-pron]',mount).forEach(b=>b.onclick=()=>{const w=pron.find(x=>x.id===b.dataset.pron),choice=Number(b.dataset.choice);if(choice===w.correct){state.pron[w.id]=true;sfx('ok');save();renderPron();}else{sfx('bad');b.classList.add('wrong');$('#fb-'+w.id).textContent='Not that stress pattern. Listen again and retry.';}});
 $('#completeMission').onclick=()=>awardAndClear(2,'Access granted','The security gate recognises your actuarial English. The client floor is open.');
}
function caseComplete(id){const c=state.caseDone[id];return c&&c.q1&&c.q2;}
function renderCases(){
 const ids=Object.keys(cases),done=ids.filter(caseComplete).length,active=cases[state.casePanel]||cases.motor;
 mount.innerHTML=stageFrame(3,'Triage the client files','Three cases have arrived at once. Open each folder and make two actuarial decisions before the manager returns.','assets/session1/realistic/case-files.png',['3 client sectors','2 decisions per file','Case triage'],`${dispatch('📁','Case room unlocked','Choose a folder. Each client has two decisions: what to do first, then what the actuarial analysis is actually trying to understand.')}
 <div class="folder-shelf">${ids.map(id=>`<button class="folder-btn ${state.casePanel===id?'active':''} ${caseComplete(id)?'done':''}" data-folder="${id}"><strong>${cases[id].icon} ${cases[id].label}</strong><small>${caseComplete(id)?'✓ File cleared':'Open file'}</small></button>`).join('')}</div>
 <div class="case-panel"><span class="micro-label">ACTIVE FILE</span><h3>${active.icon} ${active.label}</h3><div class="problem">${active.problem}</div>${caseQuestion(state.casePanel,1,active.q1,active.o1,active.c1)}${state.caseDone[state.casePanel]?.q1?caseQuestion(state.casePanel,2,active.q2,active.o2,active.c2):''}<div class="feedback">${caseComplete(state.casePanel)?active.feedback:''}</div></div>
 ${footer(`${done}/3 client files cleared`,done===3,'Send triage report')}`);
 $$('[data-folder]',mount).forEach(b=>b.onclick=()=>{state.casePanel=b.dataset.folder;save();renderCases();});
 $$('[data-case]',mount).forEach(b=>b.onclick=()=>{const id=b.dataset.case,step='q'+b.dataset.step,c=cases[id],correct=c['c'+b.dataset.step],choice=Number(b.dataset.choice);state.caseDone[id]=state.caseDone[id]||{};if(choice===correct){state.caseDone[id][step]=true;sfx('ok');save();renderCases();}else{sfx('bad');b.classList.add('wrong');const fb=$(`#casefb-${id}-${b.dataset.step}`);if(fb)fb.textContent='That would not move the actuarial analysis forward. Try another option.';}});
 $('#completeMission').onclick=()=>awardAndClear(3,'Case triage complete','You identified how actuaries approach insurance, pensions and climate-risk problems.');
}
function caseQuestion(id,step,q,opts,correct){const done=state.caseDone[id]?.['q'+step];return `<div style="margin-top:17px"><strong>${q}</strong><div class="choice-grid one">${opts.map((o,i)=>`<button class="choice ${done&&i===correct?'correct':''}" data-case="${id}" data-step="${step}" data-choice="${i}" ${done?'disabled':''}>${o}</button>`).join('')}</div><div class="feedback" id="casefb-${id}-${step}"></div></div>`;}
function renderLab(){
 const selected=state.lab||[],correct=selected.length===5&&selected.every(i=>labItems[i][2]),complete=state.labTrayOK&&state.labShock;
 mount.innerHTML=stageFrame(4,'Build the model tray','The modelling bay is full of data. Your model has only five input slots: keep the signal and reject the noise.','assets/session1/realistic/risk-lab.png',['Signal vs noise','Model inputs','Assumption shock'],`${dispatch('📊','Risk Lab brief','A motor portfolio has 10,000 policyholders and 620 claims. Repair costs are rising. Pick exactly five items that should enter the analysis.')}
 <div class="lab-layout"><div class="data-wall">${labItems.map((x,i)=>`<button class="data-tile ${selected.includes(i)?'selected':''}" data-lab="${i}" ${state.labTrayOK?'disabled':''}><strong>${x[0]}</strong><small>${x[1]}</small></button>`).join('')}</div><div class="model-tray"><h3>MODEL TRAY</h3><p>${selected.length}/5 slots filled</p>${[0,1,2,3,4].map(i=>`<div class="tray-slot ${selected[i]!==undefined?'filled':''}">${selected[i]!==undefined?labItems[selected[i]][0]:'Empty input slot'}</div>`).join('')}</div></div>
 <div class="feedback" id="labFeedback">${state.labTrayOK?'Model tray accepted. A new alert just arrived.':''}</div>
 ${state.labTrayOK?`<div class="game-card" style="margin-top:18px"><span class="micro-label">ASSUMPTION SHOCK</span><h3>Repair costs suddenly rise by 18%.</h3><p>Which part of the model should be reviewed immediately?</p><div class="choice-grid one"><button class="choice ${state.labShock?'correct':''}" data-shock="0" ${state.labShock?'disabled':''}>Claim-cost / inflation assumptions</button><button class="choice" data-shock="1" ${state.labShock?'disabled':''}>The company logo</button><button class="choice" data-shock="2" ${state.labShock?'disabled':''}>The office seating plan</button></div><div class="feedback" id="shockFeedback">${state.labShock?'Correct. The cost assumptions must reflect the new environment.':''}</div></div>`:''}
 <div class="stage-footer"><div class="stage-score">${complete?'Risk Lab cleared':state.labTrayOK?'Tray accepted — solve the shock':'Select 5 model inputs'}</div><div class="stage-actions">${!state.labTrayOK?'<button class="secondary-game" id="checkLab">Run model check</button>':''}<button class="primary-game" id="completeMission" ${complete?'':'disabled'}>Send model note →</button></div></div>`);
 $$('[data-lab]',mount).forEach(b=>b.onclick=()=>{const i=Number(b.dataset.lab);if(state.labTrayOK)return;state.lab=selected.includes(i)?selected.filter(x=>x!==i):selected.length<5?[...selected,i]:selected;save();renderLab();});
 if($('#checkLab'))$('#checkLab').onclick=()=>{if(correct){state.labTrayOK=true;sfx('ok');save();renderLab();}else{sfx('bad');$('#labFeedback').textContent=selected.length!==5?'Fill exactly five slots first.':'Some of your inputs are noise. Remove them and rebuild the tray.';}};
 $$('[data-shock]',mount).forEach(b=>b.onclick=()=>{if(Number(b.dataset.shock)===0){state.labShock=true;sfx('ok');save();renderLab();}else{sfx('bad');b.classList.add('wrong');$('#shockFeedback').textContent='That would not change the financial estimate. Try again.';}});
 $('#completeMission').onclick=()=>awardAndClear(4,'Risk Lab cleared','You separated useful evidence from noise and reacted to a change in assumptions.');
}
function renderInbox(){
 const done=Object.keys(state.inbox).length;
 mount.innerHTML=stageFrame(5,'Protect the client pack','The team inbox is filling up. Decide what belongs in the client pack before misinformation reaches the meeting.','assets/session1/realistic/hero-office.png',['Inbox clean-up','Myth vs reality','Client pack quality'],`${dispatch('📥','Incoming messages','For each message, choose KEEP if it is a useful actuarial insight or ARCHIVE if it is misleading.')}
 <div class="phone-frame"><div class="phone-screen"><div class="phone-head"><strong>Northstar · Team Inbox</strong><span>${done}/${inbox.length} checked</span></div><div class="mail-list">${inbox.map(m=>`<article class="mail"><div class="mail-top"><strong>${m.from}</strong><span>${m.time}</span></div><p>${m.text}</p><div class="mail-actions"><button class="choice ${state.inbox[m.id]===true?'correct':''}" data-mail="${m.id}" data-v="true" ${state.inbox[m.id]!==undefined?'disabled':''}>✓ Keep</button><button class="choice ${state.inbox[m.id]===false?'correct':''}" data-mail="${m.id}" data-v="false" ${state.inbox[m.id]!==undefined?'disabled':''}>Archive</button></div><div class="feedback" id="mailfb-${m.id}">${state.inbox[m.id]!==undefined?m.why:''}</div></article>`).join('')}</div></div></div>
 ${footer(`${done}/${inbox.length} messages classified`,done===inbox.length,'Send clean client pack')}`);
 $$('[data-mail]',mount).forEach(b=>b.onclick=()=>{const m=inbox.find(x=>x.id===b.dataset.mail),v=b.dataset.v==='true';if(v===m.good){state.inbox[m.id]=v;sfx('ok');save();renderInbox();}else{sfx('bad');b.classList.add('wrong');$('#mailfb-'+m.id).textContent='That would damage the client pack. Reconsider this message.';}});
 $('#completeMission').onclick=()=>awardAndClear(5,'Client pack protected','You removed the myths and kept the explanations that a client can actually use.');
}
function renderMeeting(){
 const idx=state.meeting.length,turn=meeting[idx],complete=idx===meeting.length;
 const transcript=state.meeting.map((a,i)=>`<div class="bubble client"><strong>${meeting[i].speaker}:</strong> ${meeting[i].q}</div><div class="bubble you"><strong>You:</strong> ${meeting[i].answers[a][0]}</div>`).join('');
 mount.innerHTML=stageFrame(6,'Keep the client meeting on track','The client is here. This time the questions arrive one by one — answer clearly without overpromising or hiding behind jargon.','assets/session1/realistic/client-meeting.png',['Live conversation','Clear English','Decision support'],`${dispatch('🤝','Meeting live','A poor answer stalls the conversation; a clear one moves it forward. There is no timer.')}
 <div class="meeting-scene"><div class="meeting-photo"><img src="assets/session1/realistic/client-meeting.png" alt="Actuarial consultant in a client meeting."></div><div class="chat-panel"><div class="chat-log">${transcript}${!complete?`<div class="bubble client"><strong>${turn.speaker}:</strong> ${turn.q}</div>`:''}</div>${!complete?`<div class="live-choice"><span class="micro-label">YOUR RESPONSE</span><div class="choice-grid one">${turn.answers.map((a,i)=>`<button class="choice" data-meet="${i}">${a[0]}</button>`).join('')}</div><div class="feedback" id="meetingFeedback">${state.meetingWrong||''}</div></div>`:`<div class="final-card"><span class="micro-label" style="color:#b8e4e5">MEETING RESULT</span><h3>Client confidence maintained</h3><p>You were useful without pretending that uncertainty can disappear.</p></div>`}</div></div>
 ${footer(`${idx}/${meeting.length} questions handled`,complete,'Close the meeting')}`);
 $$('[data-meet]',mount).forEach(b=>b.onclick=()=>{const i=Number(b.dataset.meet);if(turn.answers[i][1]){state.meeting.push(i);state.meetingWrong='';sfx('ok');save();renderMeeting();}else{state.meetingWrong='The room goes quiet. That answer is either too confident, too vague or simply wrong. Try another response.';sfx('bad');renderMeeting();}});
 $('#completeMission').onclick=()=>awardAndClear(6,'Meeting survived','You explained actuarial thinking clearly without promising certainty.');
}
function renderBoard(){
 const used=Object.values(state.slide),correct=slideSlots.filter(s=>state.slide[s.id]===s.answer).length;
 mount.innerHTML=stageFrame(7,'Rescue the board slide','The meeting is over — almost. The final slide is unreadable actuarial jargon. Fix it before it appears on the boardroom screen.','assets/session1/realistic/boardroom.png',['Final mission','Jargon rescue','Board-ready English'],`${dispatch('🚨','Five minutes to presentation','Select a clear replacement from the deck, then click the line you want to replace. Four correct lines will rebuild the slide.')}
 <div class="slide-workbench"><div class="bad-slide"><span class="micro-label" style="color:#9ec5d3">ORIGINAL SLIDE</span><h3>What actuarial professionals deliver</h3><ul>${slideSlots.map(s=>`<li>${s.bad}</li>`).join('')}</ul></div><div class="good-slide"><span class="micro-label">YOUR BOARD-READY SLIDE</span><h3>What does an actuary do?</h3>${slideSlots.map((s,i)=>{const val=state.slide[s.id];let cls='slide-slot';if(val)cls+=' filled';if(state.slideChecked)cls+=val===s.answer?' correct':' wrong';return `<button class="${cls}" data-slide="${s.id}"><span class="micro-label">LINE ${i+1}</span><div>${val?escapeHtml(val):'Choose a replacement line…'}</div></button>`;}).join('')}</div></div>
 <div class="replacement-deck">${replacements.map((r,i)=>`<button class="replacement ${selectedReplacement===r?'active':''} ${used.includes(r)?'used':''}" data-replace="${i}">${r}</button>`).join('')}</div>
 <div class="feedback" id="slideFeedback">${state.slideChecked?(correct===4?'Board-ready. Clear, concrete and useful.':`${correct}/4 lines work. Replace the red lines.`):'Pick a line from the deck, then choose its destination.'}</div>
 <div class="stage-footer"><div class="stage-score">${correct}/4 board lines correct</div><div class="stage-actions"><button class="secondary-game" id="checkSlide">Run clarity check</button><button class="primary-game" id="completeMission" ${correct===4?'':'disabled'}>Send to board →</button></div></div>
 ${state.earned[7]?finalSummary():''}`);
 $$('[data-replace]',mount).forEach(b=>b.onclick=()=>{selectedReplacement=replacements[Number(b.dataset.replace)];renderBoard();});
 $$('[data-slide]',mount).forEach(b=>b.onclick=()=>{if(!selectedReplacement)return;Object.keys(state.slide).forEach(k=>{if(state.slide[k]===selectedReplacement)delete state.slide[k];});state.slide[b.dataset.slide]=selectedReplacement;selectedReplacement='';state.slideChecked=false;save();renderBoard();});
 $('#checkSlide').onclick=()=>{state.slideChecked=true;sfx(correct===4?'ok':'bad');save();renderBoard();};
 $('#completeMission').onclick=()=>awardAndClear(7,'Northstar cleared','The board slide is clear. Your visitor badge has become full Northstar access.');
}
function finalSummary(){return `<div class="final-card"><span class="micro-label" style="color:#b8e4e5">FIRST MORNING COMPLETE</span><h3>Northstar access: CLEARED</h3><p>You repaired a real brief, handled three client sectors, filtered model inputs, protected a client pack, survived a meeting and translated actuarial jargon into usable English.</p><div class="final-stats"><div><span>REPUTATION</span><strong>${state.rep}/100</strong></div><div><span>MISSIONS</span><strong>7/7</strong></div><div><span>ACCESS</span><strong>BOARDROOM</strong></div></div><div style="margin-top:16px"><a class="primary-link" href="m1-day1.html">Return to Session 1 →</a></div></div>`;}
function render(){updateHUD();soundBtn.textContent=state.soundOn?'🔊 Sound on':'🔈 Sound off';soundBtn.setAttribute('aria-pressed',String(state.soundOn));({1:renderBrief,2:renderPron,3:renderCases,4:renderLab,5:renderInbox,6:renderMeeting,7:renderBoard}[state.stage]||renderBrief)();}
render();
})();
