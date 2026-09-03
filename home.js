(function(){
 const vocab=window.ACTUARIAL_VOCAB||[]; if(!vocab.length)return;
 const els={word:document.getElementById('wodWord'),ipa:document.getElementById('wodIPA'),def:document.getElementById('wodDefinition'),fr:document.getElementById('wodFrench'),cat:document.getElementById('wodCategory')};
 function render(i){const v=vocab[i%vocab.length];els.word.textContent=v.w;els.ipa.textContent=v.ipa;els.def.textContent=v.def;els.fr.textContent=v.fr;els.cat.textContent=v.cat;document.getElementById('wodIllustration').textContent=['📊','📈','🧮','🛡️','💷'][i%5];document.getElementById('wodListen').onclick=()=>speakWord(v.w+' — '+v.ex)}
 const day=Math.floor(Date.now()/86400000);render(day%vocab.length);document.getElementById('anotherWord').onclick=()=>render(Math.floor(Math.random()*vocab.length));
 const helpBtn=document.getElementById('installHelpButton'),help=document.getElementById('installHelp');if(helpBtn&&help)helpBtn.onclick=()=>{help.hidden=!help.hidden;helpBtn.setAttribute('aria-expanded',String(!help.hidden))};
 const status=document.getElementById('connectionStatus');function update(){if(!status)return;status.textContent=navigator.onLine?'● Online':'● Offline';status.style.color=navigator.onLine?'#216e39':'#9b2c2c'};window.addEventListener('online',update);window.addEventListener('offline',update);update();
 let deferred; const install=document.getElementById('installAppButton');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;install.hidden=false});if(install)install.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;install.hidden=true};
})();
