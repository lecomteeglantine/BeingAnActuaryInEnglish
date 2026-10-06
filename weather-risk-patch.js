document.addEventListener('click',e=>{
  const current=e.target.closest('[data-timer]');
  if(!current)return;
  document.querySelectorAll('[data-timer]').forEach(btn=>{
    if(btn===current)return;
    btn.disabled=false;
    const id=btn.dataset.timer;
    const display=document.querySelector(`[data-time="${id}"]`);
    if(display&&display.textContent!=='Done!')display.textContent='00:30';
  });
},true);
