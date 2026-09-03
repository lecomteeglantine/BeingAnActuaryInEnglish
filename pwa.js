if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).catch(err=>console.warn('Service worker registration failed:',err));
  });
}
