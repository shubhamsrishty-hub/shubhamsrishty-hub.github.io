// Background music (Chaudhary, 1:10–1:45), looping softly.
// Browsers only allow sound after the visitor touches the page, so the invite opens
// with a "Tap to open" screen; that first tap starts the song. If a browser does allow
// autoplay with sound, the music starts straight away and the screen opens by itself.
(()=>{
const btn=document.getElementById('music-toggle'),gate=document.getElementById('welcome-gate');
const a=new Audio('wedding-music.mp3?v=1');a.loop=true;a.preload='auto';a.volume=0;
let wanted=true,started=false,fadeTimer=null;
function fadeTo(v,ms,done){clearInterval(fadeTimer);const s0=a.volume,t0=performance.now();
  fadeTimer=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);try{a.volume=s0+(v-s0)*k;}catch(e){}if(k>=1){clearInterval(fadeTimer);done&&done();}},40);}
function ui(){if(!btn)return;const on=!a.paused;btn.classList.toggle('playing',on);btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-label',on?'Pause music':'Play music');}
function play(){started=true;const p=a.play();if(p)return p.then(()=>{fadeTo(.85,1400);ui();return true;}).catch(()=>{started=false;ui();return false;});return Promise.resolve(true);}
function pause(){fadeTo(0,500,()=>{a.pause();ui();});}
function restartActiveVideo(){const v=document.querySelector('.card.active .card-video');if(v){try{v.currentTime=0;}catch(e){}v.play().catch(()=>{});}}
function openGate(){if(!gate||gate.classList.contains('open'))return;gate.classList.add('open');restartActiveVideo();setTimeout(()=>gate.remove(),1100);}
if(gate){
  const tap=e=>{e.preventDefault();e.stopPropagation();if(wanted&&a.paused)play();openGate();};
  gate.addEventListener('click',tap);gate.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')tap(e);});
}
// try true autoplay; succeeds only where the browser permits it
play().then(ok=>{if(ok)openGate();});
btn&&btn.addEventListener('click',e=>{e.stopPropagation();started=true;wanted=a.paused;wanted?play():pause();});
const first=e=>{if(started||(e.target&&e.target.closest&&e.target.closest('#music-toggle,#welcome-gate')))return;if(wanted&&a.paused)play();};
['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,first,{capture:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!a.paused){a.pause();a._resume=true;}}else if(a._resume&&wanted){a._resume=false;play();}});
a.addEventListener('play',ui);a.addEventListener('pause',ui);
})();
