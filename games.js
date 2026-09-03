(function(){
 const all=window.ACTUARIAL_VOCAB||[];
 const menu=document.getElementById('gameMenu'),arena=document.getElementById('gameArena'),cat=document.getElementById('gameCategory'),count=document.getElementById('questionCount');
 const prompt=document.getElementById('gamePrompt'),opts=document.getElementById('gameOptions'),feedback=document.getElementById('gameFeedback'),next=document.getElementById('nextQuestion'),progress=document.getElementById('gameProgress'),scoreEl=document.getElementById('gameScore'),label=document.getElementById('gameLabel'),listen=document.getElementById('listenAgain'),spellForm=document.getElementById('spellForm'),spellInput=document.getElementById('spellInput');
 [...new Set(all.map(v=>v.cat))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});
 let mode='',deck=[],idx=0,score=0,target=null,answered=false;
 const names={match:'MATCH IT!',definition:'DEFINITION DETECTIVE',translate:'FRENCH ↔ ENGLISH',listen:'LISTEN & CHOOSE',spell:'SPELL IT!',odd:'ODD ONE OUT'};
 function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
 function pool(){const filtered=all.filter(v=>!cat.value||v.cat===cat.value);return filtered.length>=4?filtered:all}
 function distractors(t,p,n=3){return shuffle(p.filter(x=>x.w!==t.w)).slice(0,n)}
 function clean(s){return s.toLowerCase().trim().replace(/[’']/g,"'").replace(/\s+/g,' ')}
 function start(m){mode=m;deck=shuffle(pool()).slice(0,Math.min(Number(count.value),pool().length));idx=0;score=0;menu.hidden=true;arena.hidden=false;render()}
 function render(){answered=false;feedback.textContent='';next.hidden=true;opts.innerHTML='';opts.hidden=false;spellForm.hidden=true;listen.hidden=true;target=deck[idx];progress.textContent=`${idx+1} / ${deck.length}`;scoreEl.textContent=`${score} correct`;label.textContent=names[mode];
  if(mode==='match'){prompt.textContent=`Choose the French translation of “${target.w}”.`;mcq([target,...distractors(target,pool())],x=>x.fr,target)}
  if(mode==='definition'){prompt.textContent=target.def;mcq([target,...distractors(target,pool())],x=>x.w,target)}
  if(mode==='translate'){const frToEn=Math.random()>.5;prompt.textContent=frToEn?`Translate into English: ${target.fr}`:`Translate into French: ${target.w}`;mcq([target,...distractors(target,pool())],x=>frToEn?x.w:x.fr,target)}
  if(mode==='listen'){prompt.textContent='Listen, then choose the term you hear.';listen.hidden=false;listen.onclick=()=>speakWord(target.w);mcq([target,...distractors(target,pool())],x=>x.w,target);setTimeout(()=>speakWord(target.w),180)}
  if(mode==='spell'){prompt.textContent=`${target.def} — 🇫🇷 ${target.fr}`;opts.hidden=true;spellForm.hidden=false;spellInput.value='';setTimeout(()=>spellInput.focus(),0)}
  if(mode==='odd'){const same=shuffle(all.filter(x=>x.cat===target.cat)).slice(0,3);if(same.length<3){mode='definition';return render()}const outsider=shuffle(all.filter(x=>x.cat!==target.cat))[0];const items=shuffle([...same,outsider]);target=outsider;prompt.textContent='Which term does NOT belong to the same category as the other three?';mcq(items,x=>x.w,outsider)}
 }
 function mcq(items,text,correct){items.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='quiz-option';b.textContent=text(item);b.onclick=()=>answer(item===correct,b,correct,text);opts.appendChild(b)})}
 function answer(ok,button,correct,text){if(answered)return;answered=true;if(ok){score++;button.classList.add('correct');feedback.textContent='Correct ✓'}else{button.classList.add('wrong');[...opts.children].find(b=>b.textContent===text(correct))?.classList.add('correct');feedback.textContent=`Correct answer: ${text(correct)}`};scoreEl.textContent=`${score} correct`;next.hidden=false}
 spellForm.onsubmit=e=>{e.preventDefault();if(answered)return;answered=true;const ok=clean(spellInput.value)===clean(target.w);if(ok){score++;feedback.textContent='Correct ✓'}else feedback.textContent=`Correct answer: ${target.w}`;scoreEl.textContent=`${score} correct`;next.hidden=false};
 next.onclick=()=>{idx++;if(idx>=deck.length)return finish();render()};
 function finish(){prompt.textContent=`Round complete — ${score}/${deck.length}`;label.textContent='🏁 FINISHED';opts.innerHTML='';opts.hidden=false;spellForm.hidden=true;listen.hidden=true;feedback.textContent=score===deck.length?'Perfect score!':score>=Math.ceil(deck.length*.8)?'Strong result.':'Review the difficult terms, then try again.';next.hidden=true;const key='actuarial_best_'+mode;const old=Number(localStorage.getItem(key)||0);if(score>old)localStorage.setItem(key,String(score));const b=document.createElement('button');b.className='primary-link';b.type='button';b.textContent='Play again';b.onclick=()=>start(mode);opts.appendChild(b)}
 menu.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>start(b.dataset.game));document.getElementById('backToGames').onclick=()=>{arena.hidden=true;menu.hidden=false};
})();
