(function(){
  const all=Array.isArray(window.ACTUARIAL_VOCAB)?window.ACTUARIAL_VOCAB:[];
  const menu=document.getElementById('gameMenu'),arena=document.getElementById('gameArena'),cat=document.getElementById('gameCategory'),count=document.getElementById('questionCount');
  const prompt=document.getElementById('gamePrompt'),opts=document.getElementById('gameOptions'),feedback=document.getElementById('gameFeedback'),next=document.getElementById('nextQuestion'),progress=document.getElementById('gameProgress'),scoreEl=document.getElementById('gameScore'),label=document.getElementById('gameLabel'),listen=document.getElementById('listenAgain'),spellForm=document.getElementById('spellForm'),spellInput=document.getElementById('spellInput'),back=document.getElementById('backToGames');
  if(!menu||!arena||!cat||!count||!prompt||!opts||!feedback||!next||!progress||!scoreEl||!label||!listen||!spellForm||!spellInput||!back) return;
  [...new Set(all.map(v=>v.cat).filter(Boolean))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});
  let mode='',deck=[],roundPool=[],idx=0,score=0,target=null,answered=false;
  const names={match:'MATCH IT!',definition:'DEFINITION DETECTIVE',translate:'FRENCH ↔ ENGLISH',listen:'LISTEN & CHOOSE',spell:'SPELL IT!',odd:'ODD ONE OUT'};
  function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
  function targetPool(){const filtered=all.filter(v=>!cat.value||v.cat===cat.value);return filtered.length?filtered:all;}
  function distractors(t,text,n=3){
    const used=new Set([text(t)]), result=[];
    for(const item of shuffle(all.filter(x=>x.w!==t.w))){const label=text(item);if(used.has(label))continue;used.add(label);result.push(item);if(result.length===n)break;}
    return result;
  }
  function clean(s){return String(s||'').toLowerCase().trim().normalize('NFKC').replace(/[’']/g,"'").replace(/\s+/g,' ')}
  function setControls(disabled){cat.disabled=disabled;count.disabled=disabled;}
  function start(m){
    if(!all.length){feedback.textContent='Vocabulary data could not be loaded.';return;}
    mode=m;roundPool=targetPool();deck=shuffle(roundPool).slice(0,Math.min(Number(count.value),roundPool.length));idx=0;score=0;menu.hidden=true;arena.hidden=false;setControls(true);render();
  }
  function render(){
    answered=false;feedback.textContent='';next.hidden=true;opts.innerHTML='';opts.hidden=false;spellForm.hidden=true;listen.hidden=true;
    target=deck[idx]; if(!target){finish();return;}
    progress.textContent=`${idx+1} / ${deck.length}`;scoreEl.textContent=`${score} correct`;label.textContent=names[mode]||'';
    if(mode==='match'){const text=x=>x.fr;prompt.textContent=`Choose the French translation of “${target.w}”.`;mcq(shuffle([target,...distractors(target,text)]),text,target)}
    if(mode==='definition'){const text=x=>x.w;prompt.textContent=target.def;mcq(shuffle([target,...distractors(target,text)]),text,target)}
    if(mode==='translate'){const frToEn=Math.random()>.5;const text=x=>frToEn?x.w:x.fr;prompt.textContent=frToEn?`Translate into English: ${target.fr}`:`Translate into French: ${target.w}`;mcq(shuffle([target,...distractors(target,text)]),text,target)}
    if(mode==='listen'){const text=x=>x.w;prompt.textContent='Listen, then choose the term you hear.';listen.hidden=false;listen.onclick=()=>speakWord(target.w);mcq(shuffle([target,...distractors(target,text)]),text,target);speakWord(target.w)}
    if(mode==='spell'){prompt.textContent=`${target.def} — 🇫🇷 ${target.fr}`;opts.hidden=true;spellForm.hidden=false;spellInput.value='';setTimeout(()=>spellInput.focus(),0)}
    if(mode==='odd') renderOdd();
  }
  function renderOdd(){
    const counts=new Map();all.forEach(x=>counts.set(x.cat,(counts.get(x.cat)||0)+1));
    let sameCat=target.cat;
    if((counts.get(sameCat)||0)<3){const eligible=[...counts].filter(([,n])=>n>=3).map(([c])=>c);sameCat=eligible[Math.floor(Math.random()*eligible.length)];}
    const same=shuffle(all.filter(x=>x.cat===sameCat)).slice(0,3);const outsiders=all.filter(x=>x.cat!==sameCat);const outsider=shuffle(outsiders)[0];
    if(same.length<3||!outsider){mode='definition';label.textContent=names[mode];return render();}
    target=outsider;prompt.textContent='Which term does NOT belong to the same category as the other three?';mcq(shuffle([...same,outsider]),x=>x.w,outsider);
  }
  function mcq(items,text,correct){
    let correctButton=null;
    items.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='quiz-option';b.textContent=text(item);if(item===correct)correctButton=b;b.addEventListener('click',()=>answer(item===correct,b,correctButton,text(correct)));opts.appendChild(b)});
  }
  function answer(ok,button,correctButton,correctText){
    if(answered)return;answered=true;opts.querySelectorAll('button').forEach(b=>b.disabled=true);
    if(ok){score++;button.classList.add('correct');feedback.textContent='Correct ✓'}else{button.classList.add('wrong');if(correctButton)correctButton.classList.add('correct');feedback.textContent=`Correct answer: ${correctText}`}
    scoreEl.textContent=`${score} correct`;next.hidden=false;next.focus();
  }
  spellForm.addEventListener('submit',e=>{e.preventDefault();if(answered)return;answered=true;const ok=clean(spellInput.value)===clean(target.w);spellInput.disabled=true;if(ok){score++;feedback.textContent='Correct ✓'}else feedback.textContent=`Correct answer: ${target.w}`;scoreEl.textContent=`${score} correct`;next.hidden=false;next.focus();});
  next.addEventListener('click',()=>{spellInput.disabled=false;idx++;if(idx>=deck.length)return finish();render();});
  function finish(){
    if('speechSynthesis'in window)speechSynthesis.cancel();prompt.textContent=`Round complete — ${score}/${deck.length}`;label.textContent='🏁 FINISHED';opts.innerHTML='';opts.hidden=false;spellForm.hidden=true;listen.hidden=true;feedback.textContent=score===deck.length?'Perfect score!':score>=Math.ceil(deck.length*.8)?'Strong result.':'Review the difficult terms, then try again.';next.hidden=true;
    const storage=window.actuarialStorage;if(storage){const key='actuarial_best_'+mode;const old=Number(storage.get(key,'0')||0);if(score>old)storage.set(key,String(score));}
    const b=document.createElement('button');b.className='primary-link';b.type='button';b.textContent='Play again';b.addEventListener('click',()=>start(mode));opts.appendChild(b);
  }
  menu.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.game)));
  back.addEventListener('click',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();spellInput.disabled=false;arena.hidden=true;menu.hidden=false;setControls(false);feedback.textContent='';});
})();
