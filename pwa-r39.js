if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker-r42.js',{scope:'./',updateViaCache:'none'})
      .then(reg=>reg.update().catch(()=>{}))
      .catch(err=>console.warn('Service worker registration failed:',err));
  });
}
