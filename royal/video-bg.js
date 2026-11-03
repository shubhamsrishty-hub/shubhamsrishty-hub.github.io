// Each page plays its animated clip behind the text. If a clip can't load,
// the page simply keeps its original painting and code animations.
(()=>{
const CLIPS={opening:'clip-page-1',family:'clip-page-2',bhaat:'clip-page-bhaat',haldi:'clip-page-haldi',dinner:'clip-page-3',venue:'clip-page-4'};
const ONCE={dinner:true}; // the groom walks once and stays near the palace; tap him to replay
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=[...document.querySelectorAll('.card')];
const keyOf=card=>Object.keys(CLIPS).find(k=>card.classList.contains(k));
function start(card){const v=card._video;if(!v)return;v.preload='auto';try{v.currentTime=0;}catch(e){}if(!reduce)v.play().catch(()=>{});card.classList.remove('groom-arrived');}
cards.forEach(card=>{const key=keyOf(card);if(!key)return;
  const v=document.createElement('video');v.className='card-video';
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.setAttribute('webkit-playsinline','');
  v.poster=CLIPS[key]+'.jpg?v=3';v.preload=card.classList.contains('active')?'auto':'none';v.loop=!ONCE[key];v.src=CLIPS[key]+'.mp4?v=3';
  v.addEventListener('loadedmetadata',()=>{card.classList.add('has-video');if(card.classList.contains('active')&&!reduce)v.play().catch(()=>{});},{once:true});
  v.addEventListener('error',()=>{card.classList.remove('has-video');v.remove();card._video=null;},{once:true});
  if(ONCE[key])v.addEventListener('ended',()=>{if(card.classList.contains('active')&&window.groomArrived)window.groomArrived();});
  card.querySelector('.card-art').after(v);card._video=v;card._wasOn=card.classList.contains('active');
  new MutationObserver(()=>{const on=card.classList.contains('active');if(!card._video)return;
    if(on&&!card._wasOn)start(card);
    if(!on&&card._wasOn)v.pause();
    card._wasOn=on;}).observe(card,{attributes:true,attributeFilter:['class']});
});
// warm up the next pages once the guest starts turning
document.querySelector('#forward')?.addEventListener('click',()=>cards.forEach(c=>{if(c._video&&c._video.preload==='none')c._video.preload='metadata';}),{once:true});
// iOS low-power mode can block autoplay: the first touch anywhere starts the current clip
document.addEventListener('touchstart',()=>{const c=cards.find(c=>c.classList.contains('active'));if(c&&c._video&&c._video.paused&&!c._video.ended)c._video.play().catch(()=>{});},{passive:true});
const replay=document.querySelector('.groom-approach-touch'),dinner=document.querySelector('.card.dinner');
replay&&replay.addEventListener('click',()=>{if(dinner._video&&dinner.classList.contains('has-video'))start(dinner);});
})();
