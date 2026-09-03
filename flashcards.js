(function(){
  const all=Array.isArray(window.ACTUARIAL_VOCAB)?window.ACTUARIAL_VOCAB:[];
  const card=document.getElementById('flashcard'), prog=document.getElementById('progress');
  const prev=document.getElementById('prevBtn'), flipBtn=document.getElementById('flipBtn'), next=document.getElementById('nextBtn'), shuffleBtn=document.getElementById('shuffleBtn'), listenBtn=document.getElementById('listenCard');
  if(!card||!prog) return;
  function shuffled(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
  let deck=shuffled(all), i=0, back=false;
  function render(){
    if(!deck.length){ card.innerHTML='<p>No vocabulary is available.</p>'; prog.textContent='0 cards'; [prev,flipBtn,next,shuffleBtn,listenBtn].filter(Boolean).forEach(b=>b.disabled=true); return; }
    const v=deck[i]; prog.textContent=`Card ${i+1} of ${deck.length}`;
    card.innerHTML=back?`<div><p class="tag"></p><h2></h2><p class="definition"></p><p><em class="example"></em></p></div>`:`<div><p class="tag"></p><h2></h2><p class="ipa"></p><p>Press the card or Flip to reveal the meaning</p></div>`;
    card.querySelector('.tag').textContent=v.cat; card.querySelector('h2').textContent=back?v.fr:v.w;
    if(back){ card.querySelector('.definition').textContent=v.def; card.querySelector('.example').textContent=v.ex; }
    else card.querySelector('.ipa').textContent=v.ipa;
    card.setAttribute('aria-label',back?`${v.w}. ${v.fr}. ${v.def}`:`${v.w}. Press Enter or Space to reveal the answer.`);
  }
  function flip(){ if(!deck.length)return; back=!back; render(); }
  card.addEventListener('click',flip);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});
  if(flipBtn) flipBtn.addEventListener('click',flip);
  if(next) next.addEventListener('click',()=>{if(!deck.length)return;i=(i+1)%deck.length;back=false;render();});
  if(prev) prev.addEventListener('click',()=>{if(!deck.length)return;i=(i-1+deck.length)%deck.length;back=false;render();});
  if(shuffleBtn) shuffleBtn.addEventListener('click',()=>{deck=shuffled(deck);i=0;back=false;render();});
  if(listenBtn) listenBtn.addEventListener('click',()=>{if(deck.length)speakWord(deck[i].w+'. '+deck[i].ex);});
  render();
})();
