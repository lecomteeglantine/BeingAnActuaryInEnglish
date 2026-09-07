(function(){
  const vocab=Array.isArray(window.ACTUARIAL_VOCAB)?window.ACTUARIAL_VOCAB:[];
  const els={word:document.getElementById('wodWord'),ipa:document.getElementById('wodIPA'),def:document.getElementById('wodDefinition'),fr:document.getElementById('wodFrench'),cat:document.getElementById('wodCategory')};
  if(vocab.length && Object.values(els).every(Boolean)){
    function render(i){const v=vocab[((i%vocab.length)+vocab.length)%vocab.length];els.word.textContent=v.w;els.ipa.textContent=v.ipa;els.def.textContent=v.def;els.fr.textContent=v.fr;els.cat.textContent=v.cat;const ill=document.getElementById('wodIllustration');if(ill)ill.textContent=['📊','📈','🧮','🛡️','💷'][i%5];const listen=document.getElementById('wodListen');if(listen)listen.onclick=()=>speakWord(v.w)}
    render(Math.floor(Date.now()/86400000)%vocab.length);const another=document.getElementById('anotherWord');if(another)another.onclick=()=>render(Math.floor(Math.random()*vocab.length));
  }
  const helpBtn=document.getElementById('installHelpButton'),help=document.getElementById('installHelp');if(helpBtn&&help)helpBtn.onclick=()=>{help.hidden=!help.hidden;helpBtn.setAttribute('aria-expanded',String(!help.hidden))};
  const status=document.getElementById('connectionStatus');function update(){if(!status)return;status.textContent=navigator.onLine?'● Online':'● Offline';status.classList.toggle('is-offline',!navigator.onLine)}window.addEventListener('online',update);window.addEventListener('offline',update);update();
  let deferred=null;const install=document.getElementById('installAppButton');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(install)install.hidden=false});if(install)install.onclick=async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice}catch(_){}deferred=null;install.hidden=true};
})();
