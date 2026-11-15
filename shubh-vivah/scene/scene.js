// Plays this scene's animated clip behind its text. The invitation page that frames the scene
// tells it when it is on screen (sceneCtl.play / pause), so clips only run while they are being looked at.
(()=>{
const CLIPS={opening:'clip-page-1',family:'clip-page-2',bhaat:'clip-page-bhaat',haldi:'clip-page-haldi',dinner:'clip-page-3',venue:'clip-page-4'};
const ONCE={dinner:true}; // the groom walks once and stays near the palace; tap him to replay
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const card=document.querySelector('.card'),key=Object.keys(CLIPS).find(k=>card.classList.contains(k));
let playing=false,started=false,v=null;window.__paused=true;
if(key){
  v=document.createElement('video');v.className='card-video';
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.setAttribute('webkit-playsinline','');
  v.poster=CLIPS[key]+'.jpg';v.preload='auto';v.loop=!ONCE[key];v.src=CLIPS[key]+'.mp4';
  v.addEventListener('loadedmetadata',()=>{card.classList.add('has-video');if(playing&&!reduce)v.play().catch(()=>{});},{once:true});
  v.addEventListener('error',()=>{card.classList.remove('has-video');v.remove();v=null;},{once:true});
  if(ONCE[key])v.addEventListener('ended',()=>{if(window.groomArrived)window.groomArrived();});
  card.querySelector('.card-art').after(v);
}
function restart(){if(!v)return;started=true;try{v.currentTime=0;}catch(e){}card.classList.remove('groom-arrived');if(!reduce)v.play().catch(()=>{});}
window.sceneCtl={
  play(){playing=true;window.__paused=false;if(!v||reduce)return;if(ONCE[key]){if(!started||v.ended)restart();else v.play().catch(()=>{});}else v.play().catch(()=>{});},
  pause(){playing=false;window.__paused=true;if(v)v.pause();},
  restart(){playing=true;window.__paused=false;restart();}
};
// iOS low-power mode can block autoplay: the first touch on the scene starts its clip
document.addEventListener('touchstart',()=>{if(playing&&v&&v.paused&&!v.ended)v.play().catch(()=>{});},{passive:true});
const replay=document.querySelector('.groom-approach-touch');
replay&&replay.addEventListener('click',()=>{if(v&&card.classList.contains('has-video'))restart();});
})();
