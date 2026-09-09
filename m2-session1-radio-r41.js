(()=>{
'use strict';
const AUDIO='assets/m2-radio-r41/audio/';
const STORAGE='actuarial-radio-r41-state';
const RESTORE=[15,31,48,65,82,100];
const BADGE_META={ears:'🎧 Sharp Ears',stress:'🎚️ Stress Detective',signal:'📡 Signal Master',hero:'🔴 Broadcast Hero'};

const mission1=[
 {audio:'m1-actuary.mp3',answer:'Actuary',options:['Actuarial','Actual','Actuary','Annuity'],feedback:'You recovered “actuary”. Listen for the /tʃ/ sound in the middle.'},
 {audio:'m1-annuity.mp3',answer:'Annuity',options:['Annual','Annuity','Assumption','Underwriting'],feedback:'“Annuity” has four syllables in careful British English, with main stress on the second.'},
 {audio:'m1-liability.mp3',answer:'Liability',options:['Longevity','Probability','Severity','Liability'],feedback:'“Liability” carries its main stress on the third syllable.'},
 {audio:'m1-reinsurance.mp3',answer:'Reinsurance',options:['Reserves','Reassurance','Reinsurance','Insurance'],feedback:'“Reinsurance” keeps the strong stress around “-sur-”.'},
 {audio:'m1-deductible.mp3',answer:'Deductible',options:['Deductible','Deducted','Deduction','Dividend'],feedback:'“Deductible” has main stress on the second syllable.'}
];
const mission2=[
 {audio:'m2-actuarial.mp3',word:'actuarial',answer:2,options:['<strong>AC</strong>-tu-air-i-al','ac-<strong>TU</strong>-air-i-al','ac-tu-<strong>AIR</strong>-i-al','ac-tu-air-<strong>I</strong>-al'],feedback:'Main stress: the third syllable — the “air” sound.'},
 {audio:'m2-mortality.mp3',word:'mortality',answer:1,options:['<strong>MOR</strong>-tal-i-ty','mor-<strong>TAL</strong>-i-ty','mor-tal-<strong>I</strong>-ty','mor-tal-i-<strong>TY</strong>'],feedback:'Main stress: the second syllable.'},
 {audio:'m2-probability.mp3',word:'probability',answer:2,options:['<strong>PROB</strong>-a-bil-i-ty','prob-<strong>A</strong>-bil-i-ty','prob-a-<strong>BIL</strong>-i-ty','prob-a-bil-<strong>I</strong>-ty'],feedback:'Main stress falls on “bil”.'},
 {audio:'m2-underwriting.mp3',word:'underwriting',answer:2,options:['<strong>UN</strong>-der-writ-ing','un-<strong>DER</strong>-writ-ing','un-der-<strong>WRIT</strong>-ing','un-der-writ-<strong>ING</strong>'],feedback:'Main stress falls on “writ”.'},
 {audio:'m2-severity.mp3',word:'severity',answer:1,options:['<strong>SE</strong>-ver-i-ty','se-<strong>VER</strong>-i-ty','se-ver-<strong>I</strong>-ty','se-ver-i-<strong>TY</strong>'],feedback:'Main stress: the second syllable.'}
];
const mission3=[
 {audio:'m3-mortality.mp3',answer:'Mortality',options:[['🫀','Morbidity'],['⌛','Life expectancy'],['📉','Mortality'],['💷','Premium']],feedback:'The key word was “mortality”.'},
 {audio:'m3-reserves.mp3',answer:'Reserves',options:[['🏦','Reserves'],['🧾','Claims'],['📦','Exposure'],['🛡️','Solvency']],feedback:'The caller asked you to check the reserves.'},
 {audio:'m3-exposure.mp3',answer:'Exposure',options:[['🌊','Exposure'],['💷','Premium'],['📊','Pricing'],['🧓','Pension']],feedback:'The key word was “exposure”.'},
 {audio:'m3-premium.mp3',answer:'Premium',options:[['🧾','Claims'],['💷','Premium'],['🏦','Reserves'],['⏳','Longevity']],feedback:'The key word was “premium”.'},
 {audio:'m3-life-expectancy.mp3',answer:'Life expectancy',options:[['📉','Mortality'],['🫀','Morbidity'],['⏳','Life expectancy'],['🌪️','Catastrophe']],feedback:'The board asked for an updated life expectancy assumption.'}
];
const mission4=[
 {audio:'m4-catastrophe-static.mp3',clean:'m4-catastrophe-clean.mp3',answer:'Catastrophe',options:['Catastrophe','Cash flow','Capital','Claims'],feedback:'Signal restored: “Catastrophe modelling suggests a higher loss estimate.”'},
 {audio:'m4-frequency-static.mp3',clean:'m4-frequency-clean.mp3',answer:'Frequency',options:['Severity','Frequency','Solvency','Forecast'],feedback:'Signal restored: “Claim frequency has increased this quarter.”'},
 {audio:'m4-solvency-static.mp3',clean:'m4-solvency-clean.mp3',answer:'Solvency',options:['Severity','Survey','Solvency','Sensitivity'],feedback:'Signal restored: “Solvency remains above the required level.”'},
 {audio:'m4-forecast-static.mp3',clean:'m4-forecast-clean.mp3',answer:'Forecast',options:['Frequency','Forecast','Exposure','Reserve'],feedback:'Signal restored: “The forecast depends on the new assumptions.”'}
];
const adverts=[
 {id:'life',audio:'m5-life.mp3',label:'Clip A',poster:'Life cover'},
 {id:'flood',audio:'m5-flood.mp3',label:'Clip B',poster:'Flood risk'},
 {id:'pension',audio:'m5-pension.mp3',label:'Clip C',poster:'Pension'},
 {id:'motor',audio:'m5-motor.mp3',label:'Clip D',poster:'Motor claims'}
];
const posters=[
 {id:'flood',icon:'🌊',title:'Flood risk',small:'Catastrophe modelling · storm exposure'},
 {id:'life',icon:'🛡️',title:'Life cover',small:'Protecting a family’s financial future'},
 {id:'motor',icon:'🚗',title:'Motor claims',small:'Claims handling after an accident'},
 {id:'pension',icon:'🧓',title:'Pension',small:'Retirement income · longevity'}
];
const finalQs=[
 {audio:'f-reserves.mp3',prompt:'Which word did you hear?',answer:'Reserves',options:['Reverse','Reserves','Returns','Risks']},
 {audio:'f-pricing.mp3',prompt:'Which actuarial team was mentioned?',answer:'Pricing',options:['Pension','Pricing','Claims','Solvency']},
 {audio:'f-longevity.mp3',prompt:'Where is the main stress?',answer:1,html:true,options:['<strong>LON</strong>-gev-i-ty','lon-<strong>GEV</strong>-i-ty','lon-gev-<strong>I</strong>-ty','lon-gev-i-<strong>TY</strong>']},
 {audio:'f-morbidity.mp3',prompt:'Which word did you hear?',answer:'Morbidity',options:['Mortality','Morality','Morbidity','Mobility']},
 {audio:'f-policyholder.mp3',prompt:'Which word did you hear?',answer:'Policyholder',options:['Policyholder','Policy order','Policy folder','Policy cover']},
 {audio:'f-risk-assessment.mp3',prompt:'Which phrase did you hear?',answer:'Risk assessment',options:['Risk adjustment','Risk assessment','Risk assumption','Risk assignment']},
 {audio:'f-forecast.mp3',prompt:'Which word did you hear?',answer:'Forecast',options:['Forecost','Forecast','Forfeit','Frequency']},
 {audio:'f-solvency.mp3',prompt:'Which word did you hear?',answer:'Solvency',options:['Severity','Solvency','Survey','Sensitivity']}
];

const els={
 start:document.getElementById('startGame'), shell:document.getElementById('gameShell'), brief:document.querySelector('.radio-brief'), mount:document.getElementById('gameMount'),
 sound:document.getElementById('soundToggle'), restart:document.getElementById('restartGame'), restore:document.getElementById('restorePercent'), restoreBar:document.getElementById('restoreBar'), restoreStatus:document.getElementById('restoreStatus'), lives:document.getElementById('lives'), accuracy:document.getElementById('accuracyValue'), answerCount:document.getElementById('answerCount'), badges:document.getElementById('badgeShelf'), progress:document.getElementById('progressFill'), dots:[...document.querySelectorAll('#missionDots li')], live:document.getElementById('liveRegion')
};

let state={mission:0,lives:3,correct:0,total:0,restore:0,badges:[],effects:true,finished:false};
let activeAudio=null; let finalTimer=null;

function loadState(){
 try{const raw=localStorage.getItem(STORAGE); if(!raw)return; const s=JSON.parse(raw); if(s&&Number.isInteger(s.mission)){state={...state,...s}; if(state.finished){els.start.textContent='View your completed broadcast →'} else if(state.mission>0){els.start.textContent='Continue the control room →';}}}catch(_e){}
}
function saveState(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(_e){}}
function announce(msg){els.live.textContent=''; setTimeout(()=>els.live.textContent=msg,20)}
function stopAudio(){if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;activeAudio=null;} document.querySelectorAll('.play-audio').forEach(b=>b.classList.remove('is-playing'));document.querySelectorAll('.audio-wave').forEach(w=>w.classList.remove('active'));}
function playFile(file,button){
 stopAudio(); const audio=new Audio(AUDIO+file); activeAudio=audio;
 if(button){button.classList.add('is-playing'); const wave=button.parentElement?.querySelector('.audio-wave'); if(wave)wave.classList.add('active');}
 const end=()=>{if(button){button.classList.remove('is-playing');button.parentElement?.querySelector('.audio-wave')?.classList.remove('active');} if(activeAudio===audio)activeAudio=null;};
 audio.addEventListener('ended',end,{once:true}); audio.addEventListener('error',()=>{end();showAudioError(button);},{once:true});
 audio.play().catch(()=>{end();showAudioError(button);});
}
function playSfx(file){if(!state.effects)return; const a=new Audio(AUDIO+file);a.volume=.6;a.play().catch(()=>{});}
function showAudioError(button){const host=button?.closest('.challenge-card,.clip-chip,.final-gate')||els.mount; if(host&&!host.querySelector('.audio-error')){const p=document.createElement('p');p.className='audio-error';p.textContent='Audio could not play. Check browser volume and make sure the assets/m2-radio-r41/audio folder was uploaded.';host.appendChild(p);}announce('Audio could not play.');}
function wave(){return '<span></span>'.repeat(14)}
function audioConsole(file,label='Play audio'){return `<div class="audio-console"><button type="button" class="play-audio" data-audio="${file}">▶ ${label}</button><div class="audio-wave" aria-hidden="true">${wave()}</div></div>`}
function bindAudio(root=els.mount){root.querySelectorAll('[data-audio]').forEach(btn=>btn.addEventListener('click',()=>playFile(btn.dataset.audio,btn)));}
function addBadge(id){if(!state.badges.includes(id)){state.badges.push(id);playSfx('sfx-success.mp3');updateHUD();saveState();}}
function loseFuse(){state.lives=Math.max(0,state.lives-1);playSfx('sfx-error.mp3');let backup=false;if(state.lives===0){state.lives=2;backup=true;}updateHUD();saveState();return backup;}
function recordAttempt(correct){state.total++;if(correct)state.correct++;updateHUD();saveState();}
function updateHUD(){
 els.restore.textContent=`${state.restore}%`; els.restoreBar.style.width=`${state.restore}%`; els.restoreStatus.textContent=state.restore>=100?'ON AIR':state.restore>=65?'SIGNAL STRONG':state.restore>0?'REPAIRING':'OFF AIR';
 els.lives.textContent='🎧 '.repeat(state.lives).trim() || '—';els.lives.setAttribute('aria-label',`${state.lives} studio fuse${state.lives===1?'':'s'} remaining`);
 els.accuracy.textContent=state.total?`${Math.round(state.correct/state.total*100)}%`:'—';els.answerCount.textContent=`${state.total} ${state.total===1?'attempt':'attempts'}`;
 els.badges.innerHTML=state.badges.length?state.badges.map(b=>`<span class="badge">${BADGE_META[b]}</span>`).join(''):'<span class="empty-badge">No badges yet</span>';
 els.progress.style.width=`${state.finished?100:(state.mission/6*100)}%`;
 els.dots.forEach((d,i)=>{d.classList.toggle('done',i<state.mission||state.finished);d.classList.toggle('active',!state.finished&&i===state.mission)});
}
function stageFrame(kicker,title,desc,img,alt,body){return `<article class="radio-stage"><header class="stage-head"><div><p class="stage-kicker">${kicker}</p><h2>${title}</h2><p>${desc}</p></div><img src="${img}" alt="${alt}"></header><div class="stage-body">${body}</div></article>`}
function nextButton(label='Next transmission →'){return `<div class="next-row"><button type="button" class="radio-primary" data-next>${label}</button></div>`}
function missionComplete(index,score,total,badgeId){
 state.restore=RESTORE[index];state.mission=Math.min(index+1,5);if(index===5){state.finished=true;state.mission=5;}if(badgeId)addBadge(badgeId);updateHUD();saveState();
 const nextLabel=index===4?'Open the live countdown →':'Next studio system →';
 els.mount.innerHTML=stageFrame(`SYSTEM ${index+1} RESTORED`,'Mission clear',index===5?'The station is live.':`You repaired this part of the studio with ${score}/${total} first-try answers.`,'assets/m2-radio-r41/'+(['mission-lost-r41.svg','mission-stress-r41.svg','mission-call-r41.svg','mission-interference-r41.svg','mission-adverts-r41.svg','mission-final-r41.svg'][index]),'Illustrated repaired studio system',`<div class="mission-clear"><div class="clear-icon">${index===5?'🔴':'✅'}</div><h3>${index===5?'You saved the broadcast!':'System restored'}</h3><p>${index===5?'Actuarial Radio International is back on air.':`Broadcast restoration is now at <strong>${state.restore}%</strong>.`}</p><div class="mission-stats"><span>First try: ${score}/${total}</span><span>Overall accuracy: ${state.total?Math.round(state.correct/state.total*100):100}%</span></div>${index<5?nextButton(nextLabel):'<button type="button" class="radio-primary" data-replay>Replay the whole game</button>'}</div>`);
 const n=els.mount.querySelector('[data-next]');if(n)n.addEventListener('click',()=>{state.mission=index+1;updateHUD();saveState();renderMission(index+1);window.scrollTo({top:els.shell.offsetTop-20,behavior:'smooth'});});
 const r=els.mount.querySelector('[data-replay]');if(r)r.addEventListener('click',resetGame);
}
function genericMission({index,items,kicker,title,desc,img,alt,scene,renderOptions,badgeTest,extraCorrect}){
 let q=0, first=true, firstScore=0;
 function renderQ(){
  const item=items[q];first=true;
  const options=renderOptions(item,q);
  els.mount.innerHTML=stageFrame(kicker,title,desc,img,alt,`<div class="scene-strip"><span class="scene-icon" aria-hidden="true">${scene.icon}</span><p>${scene.text}</p></div><div class="question-counter">Challenge ${q+1} of ${items.length}</div><div class="challenge-card"><h3>${scene.prompt}</h3>${scene.sub?`<p>${scene.sub}</p>`:''}${audioConsole(item.audio,scene.audioLabel||'Play recording')}<div class="answer-grid ${scene.optionClass||''}" data-options>${options}</div><div class="feedback-box" data-feedback>Listen, then choose.</div><div data-extra></div></div>`);
  bindAudio();
  const buttons=[...els.mount.querySelectorAll('[data-answer]')];const fb=els.mount.querySelector('[data-feedback]');
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.disabled)return; const val=btn.dataset.answer; const expected=String(item.answer); const ok=val===expected;recordAttempt(ok);
    if(ok){if(first)firstScore++;btn.classList.add('correct');buttons.forEach(b=>b.disabled=true);fb.className='feedback-box good';fb.innerHTML=`✅ ${item.feedback||'Correct.'}`;playSfx('sfx-success.mp3');if(extraCorrect)extraCorrect(item,els.mount);const extra=els.mount.querySelector('[data-extra]');extra.insertAdjacentHTML('beforeend',nextButton(q===items.length-1?'Finish this mission →':'Next challenge →'));extra.querySelector('[data-next]').addEventListener('click',()=>{q++;if(q>=items.length){const badge=badgeTest&&badgeTest(firstScore,items.length);missionComplete(index,firstScore,items.length,badge)}else renderQ();});}
    else{first=false;btn.classList.add('wrong');btn.disabled=true;const backup=loseFuse();fb.className='feedback-box bad';fb.textContent=`Not that one — listen again.${backup?' Emergency backup power restored two fuses.':''}`;}
  }));
 }
 renderQ();
}
function renderMission1(){genericMission({index:0,items:mission1,kicker:'MISSION 1 · RECOVER THE ARCHIVE',title:'Lost Audio Files',desc:'Five programme files have lost their labels. Hear the recording and restore the correct actuarial filename.',img:'assets/m2-radio-r41/mission-lost-r41.svg',alt:'Illustration of lost audio files and a reel in a radio archive',scene:{icon:'💾',text:'The archive server is online, but the labels are gone.',prompt:'Which filename belongs to this audio?',audioLabel:'Play lost file'},renderOptions:item=>item.options.map(o=>`<button type="button" class="answer-btn" data-answer="${o}">${o}</button>`).join(''),badgeTest:s=>s>=4?'ears':null});}
function renderMission2(){genericMission({index:1,items:mission2,kicker:'MISSION 2 · REPAIR THE MIX',title:'Fix the Word Stress',desc:'The stress markers were wiped from the pronunciation board. Listen for the strongest syllable and put the marker back.',img:'assets/m2-radio-r41/mission-stress-r41.svg',alt:'Illustration of a mixing desk and sound levels for word stress',scene:{icon:'🎚️',text:'Do not say the word. Just listen for the beat that carries the main stress.',prompt:'Where is the main stress?',audioLabel:'Hear the word',optionClass:'stress-options'},renderOptions:item=>item.options.map((o,i)=>`<button type="button" class="answer-btn stress-btn" data-answer="${i}">${o}</button>`).join(''),badgeTest:s=>s>=4?'stress':null});}
function renderMission3(){
 playSfx('sfx-phone.mp3');
 genericMission({index:2,items:mission3,kicker:'MISSION 3 · ANSWER THE DESK',title:"Who's Calling?",desc:'Client calls are coming in. Identify the key actuarial term hidden inside each natural sentence.',img:'assets/m2-radio-r41/mission-call-r41.svg',alt:'Illustration of an incoming telephone call in the radio studio',scene:{icon:'☎️',text:'Incoming line. The caller will not repeat the message automatically — use Replay if you need it.',prompt:'Which key actuarial term did you hear?',audioLabel:'Answer the call'},renderOptions:item=>item.options.map(([icon,label])=>`<button type="button" class="caller-choice" data-answer="${label}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')});
}
function renderMission4(){playSfx('sfx-static.mp3');genericMission({index:3,items:mission4,kicker:'MISSION 4 · CLEAN THE SIGNAL',title:'Signal Interference',desc:'Four international feeds are buried under static. Decode the key word, then unlock the clean transmission.',img:'assets/m2-radio-r41/mission-interference-r41.svg',alt:'Illustration of a noisy radio waveform and signal interference',scene:{icon:'📡',text:'Static is deliberate. Listen for the stressed vowel and the consonant shape.',prompt:'Which key term survived the interference?',sub:'Correct answer = clean studio feed unlocked.',audioLabel:'Play noisy feed'},renderOptions:item=>item.options.map(o=>`<button type="button" class="answer-btn" data-answer="${o}">${o}</button>`).join(''),extraCorrect:(item,root)=>{const extra=root.querySelector('[data-extra]');extra.insertAdjacentHTML('afterbegin',`<div class="static-banner"><strong>Clean feed unlocked.</strong> Compare it with the noisy version.</div>${audioConsole(item.clean,'Play clean feed')}`);bindAudio(extra);},badgeTest:s=>s>=3?'signal':null});}
function renderMission5(){
 let selected=null,matches=0,firstScore=0;const missed=new Set();
 function render(){
  els.mount.innerHTML=stageFrame('MISSION 5 · RECONNECT THE AD BREAK','The Wrong Adverts','The audio clips and visual campaigns have been unplugged. Listen to a clip, select it, then connect it to the correct poster.','assets/m2-radio-r41/mission-adverts-r41.svg','Illustration of four different insurance advertising posters',`<div class="scene-strip"><span class="scene-icon" aria-hidden="true">🔌</span><p>Four loose audio cables. Four visual campaigns. Patch every cable into the right channel.</p></div><p class="cable-note"><strong>How to play:</strong> play a clip → select its cable → click the matching poster.</p><div class="patch-board"><div><p class="question-counter">AUDIO CABLES</p><div class="clip-list">${adverts.map(a=>`<div class="clip-chip" data-clip="${a.id}"><button type="button" class="play-audio" data-audio="${a.audio}" aria-label="Play ${a.label}">▶ ${a.label}</button><button type="button" class="clip-select" data-select="${a.id}">Patch</button></div>`).join('')}</div></div><div><p class="question-counter">VISUAL CHANNELS</p><div class="poster-list">${posters.map(p=>`<button type="button" class="poster-card" data-poster="${p.id}"><span class="poster-icon" aria-hidden="true">${p.icon}</span><span><strong>${p.title}</strong><small>${p.small}</small></span></button>`).join('')}</div></div></div><div class="feedback-box" data-feedback>Select an audio cable, then a poster.</div>`);
  bindAudio();
  const fb=els.mount.querySelector('[data-feedback]');
  els.mount.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.select;if(els.mount.querySelector(`[data-clip="${id}"]`)?.classList.contains('matched'))return;selected=id;els.mount.querySelectorAll('.clip-chip').forEach(c=>c.classList.toggle('selected',c.dataset.clip===id));fb.className='feedback-box';fb.textContent=`${b.closest('.clip-chip').querySelector('.play-audio').textContent.replace('▶','').trim()} selected. Now choose its poster.`;}));
  els.mount.querySelectorAll('[data-poster]').forEach(p=>p.addEventListener('click',()=>{
   if(p.classList.contains('matched'))return;if(!selected){fb.className='feedback-box bad';fb.textContent='Choose an audio cable first.';return;}
   const ok=p.dataset.poster===selected;recordAttempt(ok);
   if(ok){if(!missed.has(selected))firstScore++;matches++;playSfx('sfx-success.mp3');p.classList.add('matched');const clip=els.mount.querySelector(`[data-clip="${selected}"]`);clip.classList.remove('selected');clip.classList.add('matched');clip.querySelectorAll('button').forEach(x=>x.disabled=true);fb.className='feedback-box good';fb.textContent=`✅ Cable connected to ${p.querySelector('strong').textContent}.`;selected=null;if(matches===adverts.length){fb.insertAdjacentHTML('afterend',nextButton('Finish the ad break →'));els.mount.querySelector('[data-next]').addEventListener('click',()=>missionComplete(4,firstScore,adverts.length,null));}}
   else{missed.add(selected);const backup=loseFuse();fb.className='feedback-box bad';fb.textContent=`Wrong channel. Replay the selected clip and try another poster.${backup?' Emergency backup power restored two fuses.':''}`;}
  }));
 }
 render();
}
function renderMission6(){
 stopFinalTimer();
 els.mount.innerHTML=stageFrame('FINAL MISSION · LIVE CONTROL','60 Seconds to Air','The studio is repaired. Now prove the signal can survive a live broadcast: eight rapid-fire listening checks in sixty seconds.','assets/m2-radio-r41/mission-final-r41.svg','Illustration of a red on-air countdown and broadcast mixing desk',`<div class="final-gate"><h3>🔴 Final transmission test</h3><p>The timer begins only when you press the button. Each question gets one answer. Wrong answers cost a fuse, but they do not stop the countdown.</p><p><strong>Headphones on. Volume checked. Ready?</strong></p></div><button type="button" class="radio-primary hot" id="launchFinal">Start 60-second broadcast →</button>`);
 document.getElementById('launchFinal').addEventListener('click',runFinal);
}
function runFinal(){
 stopAudio();playSfx('sfx-jingle.mp3');let time=60,q=0,score=0;const startTotal=state.total;
 const renderQ=()=>{
  if(time<=0){finalTimeout(score,q);return;}if(q>=finalQs.length){finishFinal(score);return;}
  const item=finalQs[q];
  els.mount.innerHTML=stageFrame('FINAL MISSION · LIVE CONTROL','60 Seconds to Air','One chance per item. Keep the broadcast moving.','assets/m2-radio-r41/mission-final-r41.svg','Illustration of the final on-air countdown',`<div class="countdown-row"><div class="timer" id="timerValue">${time}s</div><div class="final-progress">Transmission ${q+1} / ${finalQs.length}</div></div><div class="challenge-card"><h3>${item.prompt}</h3>${audioConsole(item.audio,'Play live feed')}<div class="answer-grid ${item.html?'stress-options':''}" data-options>${item.options.map((o,i)=>`<button type="button" class="answer-btn ${item.html?'stress-btn':''}" data-final-answer="${item.html?i:o}">${o}</button>`).join('')}</div><div class="feedback-box" data-feedback>Listen and decide quickly.</div></div>`);
  bindAudio();updateTimerVisual(time);
  const buttons=[...els.mount.querySelectorAll('[data-final-answer]')],fb=els.mount.querySelector('[data-feedback]');
  buttons.forEach(btn=>btn.addEventListener('click',()=>{if(btn.disabled)return;buttons.forEach(b=>b.disabled=true);const ok=String(item.answer)===btn.dataset.finalAnswer;recordAttempt(ok);if(ok){score++;btn.classList.add('correct');fb.className='feedback-box good';fb.textContent='✅ Clean hit.';playSfx('sfx-success.mp3');}else{btn.classList.add('wrong');const backup=loseFuse();fb.className='feedback-box bad';fb.textContent=`Signal miss.${backup?' Backup power restored two fuses.':''}`;}setTimeout(()=>{q++;renderQ();},520)}));
 };
 finalTimer=setInterval(()=>{time--;updateTimerVisual(time);if(time>0&&time<=10)playSfx('sfx-tick.mp3');if(time<=0){stopFinalTimer();finalTimeout(score,q);}},1000);
 renderQ();
}
function updateTimerVisual(time){const el=document.getElementById('timerValue');if(el){el.textContent=`${Math.max(0,time)}s`;el.classList.toggle('warning',time<=10);}}
function stopFinalTimer(){if(finalTimer){clearInterval(finalTimer);finalTimer=null;}}
function finalTimeout(score,done){stopFinalTimer();stopAudio();els.mount.innerHTML=stageFrame('FINAL MISSION · SIGNAL DROPPED','Broadcast delayed','The clock reached zero before all eight transmissions were checked. Nothing is lost: the station holds the repaired systems while you retry the live test.','assets/m2-radio-r41/mission-final-r41.svg','Illustration of the final on-air countdown',`<div class="mission-clear"><div class="clear-icon">⏱️</div><h3>${score}/${done || 1} correct before time</h3><p>Use the retry to restart only the final 60-second challenge.</p><button type="button" class="radio-primary hot" id="retryFinal">Retry the live test →</button></div>`);document.getElementById('retryFinal').addEventListener('click',runFinal);}
function finishFinal(score){stopFinalTimer();state.restore=100;state.finished=true;state.mission=5;if(score>=6)addBadge('hero');playSfx('sfx-onair.mp3');updateHUD();saveState();els.mount.innerHTML=stageFrame('BROADCAST RESTORED','You’re live!','Actuarial Radio International is broadcasting again.','assets/m2-radio-r41/mission-final-r41.svg','Illustration of the final on-air broadcast',`<div class="onair-card"><div class="onair-sign">ON AIR</div><h3>Broadcast saved.</h3><p>You repaired all six systems using listening, pronunciation discrimination and actuarial vocabulary.</p><div class="final-score">Final sprint: ${score}/${finalQs.length} · Overall accuracy: ${state.total?Math.round(state.correct/state.total*100):100}%</div><div class="mission-stats"><span>🎧 Audio archive restored</span><span>🎚️ Stress desk repaired</span><span>📡 Signal clean</span><span>🔌 Ad break patched</span></div><button type="button" class="radio-primary" data-replay>Replay the whole game</button></div>`);els.mount.querySelector('[data-replay]').addEventListener('click',resetGame);announce('Actuarial Radio is live. Game complete.');}
function renderFinished(){state.restore=100;updateHUD();els.mount.innerHTML=stageFrame('BROADCAST RESTORED','You’re live!','This browser has already completed the Actuarial Radio mission.','assets/m2-radio-r41/mission-final-r41.svg','Illustration of an on-air radio studio',`<div class="onair-card"><div class="onair-sign">ON AIR</div><h3>Broadcast saved.</h3><p>Your saved progress shows a completed mission.</p><div class="final-score">Overall accuracy: ${state.total?Math.round(state.correct/state.total*100):100}%</div><button type="button" class="radio-primary" data-replay>Replay the whole game</button></div>`);els.mount.querySelector('[data-replay]').addEventListener('click',resetGame);}
function renderMission(i){stopAudio();stopFinalTimer();updateHUD();if(state.finished){renderFinished();return;}[renderMission1,renderMission2,renderMission3,renderMission4,renderMission5,renderMission6][i]();}
function resetGame(){stopAudio();stopFinalTimer();state={mission:0,lives:3,correct:0,total:0,restore:0,badges:[],effects:state.effects,finished:false};try{localStorage.removeItem(STORAGE)}catch(_e){}els.start.textContent='Enter the control room →';els.brief.hidden=false;els.shell.hidden=true;updateHUD();window.scrollTo({top:0,behavior:'smooth'});}

els.start.addEventListener('click',()=>{els.brief.hidden=true;els.shell.hidden=false;playSfx('sfx-jingle.mp3');renderMission(state.mission);setTimeout(()=>window.scrollTo({top:els.shell.offsetTop-12,behavior:'smooth'}),50)});
els.sound.addEventListener('click',()=>{state.effects=!state.effects;els.sound.setAttribute('aria-pressed',String(state.effects));els.sound.textContent=state.effects?'🔊 Effects on':'🔇 Effects off';saveState();if(state.effects)playSfx('sfx-success.mp3');});
els.restart.addEventListener('click',()=>{if(els.shell.hidden||window.confirm('Restart Actuarial Radio from Mission 1?'))resetGame();});
loadState();els.sound.setAttribute('aria-pressed',String(state.effects));els.sound.textContent=state.effects?'🔊 Effects on':'🔇 Effects off';updateHUD();
})();
