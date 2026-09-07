if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'})
      .then(reg=>reg.update().catch(()=>{}))
      .catch(err=>console.warn('Service worker registration failed:',err));
  });
}
