(function(){
 const nav=document.querySelector('.main-nav');
 if(nav){ const page=location.pathname.split('/').pop()||'index.html'; nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===page)a.classList.add('active')}); }
 window.speakWord=function(text){ if(!('speechSynthesis'in window)) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-GB'; u.rate=.86; speechSynthesis.speak(u); };
 const root=document.documentElement;
 const state=JSON.parse(localStorage.getItem('actuarial_access')||'{}');
 function apply(){document.body.classList.toggle('large-text',!!state.large);document.body.classList.toggle('high-contrast',!!state.contrast);document.body.classList.toggle('reduced-motion',!!state.motion)}
 apply();
 const wrap=document.createElement('div');wrap.className='access-toolbar';wrap.innerHTML=`<button class="access-toggle" aria-label="Accessibility options">♿</button><div class="access-panel" hidden><strong>Accessibility</strong><label>Large text <input type="checkbox" data-a="large"></label><label>High contrast <input type="checkbox" data-a="contrast"></label><label>Reduce motion <input type="checkbox" data-a="motion"></label></div>`;document.body.appendChild(wrap);
 const panel=wrap.querySelector('.access-panel'),toggle=wrap.querySelector('.access-toggle');toggle.onclick=()=>panel.hidden=!panel.hidden;panel.querySelectorAll('input').forEach(i=>{i.checked=!!state[i.dataset.a];i.onchange=()=>{state[i.dataset.a]=i.checked;localStorage.setItem('actuarial_access',JSON.stringify(state));apply()}});
})();
