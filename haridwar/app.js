(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=$('#hero'),vLight=$('#v-light'),vLoop=$('#v-loop'),topbar=$('#topbar');

/* optional artwork: used automatically once the files are added to the folder */
function probe(src,ok){const i=new Image();i.onload=()=>ok(i);i.src=src+'?v=1'}
probe('paper.jpg',()=>document.body.classList.add('has-paper'));
probe('ornament.png',()=>document.body.classList.add('has-orn'));
probe('venue-map.jpg',()=>$('#venue-art').classList.add('has'));


/* ---------------- music ---------------- */
const music=$('#music'),audio=new Audio('wedding-music.mp3');audio.loop=true;audio.preload='auto';audio.volume=0;
let wanted=true,fadeT=null;
function fade(to,ms,done){clearInterval(fadeT);const s=audio.volume,t0=performance.now();fadeT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);try{audio.volume=s+(to-s)*k}catch(e){}if(k>=1){clearInterval(fadeT);done&&done()}},40)}
function mui(){const on=!audio.paused;music.classList.toggle('playing',on);music.setAttribute('aria-pressed',String(on));music.setAttribute('aria-label',on?'Pause music':'Play music')}
function play(){const p=audio.play();p&&p.then(()=>{fade(.85,1400);mui()}).catch(mui)}
music.addEventListener('click',e=>{e.stopPropagation();wanted=audio.paused;wanted?play():fade(0,500,()=>{audio.pause();mui()})});
audio.addEventListener('play',mui);audio.addEventListener('pause',mui);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!audio.paused){audio.pause();audio._r=1}}else if(audio._r&&wanted){audio._r=0;play()}});

/* ---------------- welcome text: written word by word ---------------- */
(()=>{let i=0;document.querySelectorAll('.hero-text.after > *').forEach(el=>{
  if(el.classList.contains('orn')){el.style.setProperty('--d',(.35+i*0.17)+'s');i+=2;return}
  const words=el.textContent.trim().split(/\s+/);el.textContent='';
  words.forEach((w,k)=>{const sp=document.createElement('span');sp.className='w';sp.textContent=w;sp.style.setProperty('--d',(.35+i*0.17)+'s');el.appendChild(sp);if(k<words.length-1)el.appendChild(document.createTextNode(' '));i++;});
});})();

/* ---------------- light the diyas ---------------- */
const tapHint=$('#tap-hint');
let lit=false,welcomed=false;
// keep the opening screen still until the diyas are lit (iOS ignores overflow:hidden for touch scrolling)
if('scrollRestoration' in history)history.scrollRestoration='manual';
if(location.hash)history.replaceState(null,'',location.pathname);
window.scrollTo(0,0);
const isLocked=()=>document.body.classList.contains('locked');
document.addEventListener('touchmove',e=>{if(isLocked())e.preventDefault()},{passive:false});
document.addEventListener('wheel',e=>{if(isLocked())e.preventDefault()},{passive:false});
// preload only — never start the lighting until the guest taps
vLight.removeAttribute('autoplay');vLight.pause();vLight.load();
vLight.addEventListener('play',()=>{if(!lit){vLight.pause();try{vLight.currentTime=0}catch(e){}}});
function welcome(){if(welcomed)return;welcomed=true;document.body.classList.remove('locked')}
function toLoop(){if(hero.classList.contains('lit'))return;try{vLoop.currentTime=.9}catch(e){}vLoop.play().catch(()=>{});hero.classList.add('lit');welcome()}
function light(){
  if(lit)return;lit=true;
  tapHint.style.display='none';hero.classList.add('lighting');requestAnimationFrame(()=>hero.classList.add('welcomed'));
  window.scrollTo(0,0);
  if(wanted)play();topbar.classList.add('show');
  if(reduce){toLoop();return}
  try{vLight.currentTime=0}catch(e){}
  const p=vLight.play();p&&p.catch(()=>toLoop());
  setTimeout(()=>{if(!welcomed)toLoop()},14000); // safety net on very slow connections
}
// the welcome text follows the video itself, not a clock, so it never runs ahead of the lighting
vLight.addEventListener('timeupdate',()=>{if(!lit)return;const t=vLight.currentTime,d=vLight.duration||10;if(t>=Math.min(3,d-.5))welcome();if(t>=5.3)toLoop()});
vLight.addEventListener('ended',()=>{if(lit)toLoop()});
vLoop.preload='auto';vLoop.load();
hero.addEventListener('click',e=>{if(!lit){e.preventDefault();light()}});
$('#close-again').addEventListener('click',()=>{
  lit=false;welcomed=false;hero.classList.remove('lit','welcomed','lighting');vLoop.pause();vLight.pause();
  try{vLight.currentTime=0}catch(e){}
  tapHint.style.display='';topbar.classList.remove('show');window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>document.body.classList.add('locked'),700);
});

/* ---------------- reveal on scroll ---------------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.reveal').forEach(n=>io.observe(n));
new IntersectionObserver(es=>es.forEach(e=>{if(!lit)return;e.isIntersecting?(hero.classList.contains('lit')&&vLoop.play().catch(()=>{})):vLoop.pause()}),{threshold:.05}).observe(hero);

const cvid=$('#closing-video');
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){cvid.preload='auto';cvid.play().catch(()=>{})}else cvid.pause()}),{threshold:.1}).observe(cvid);

/* ---------------- sparkles ---------------- */
const cv=$('#sparkle'),cx=cv.getContext('2d');let parts=[],running=false,last=performance.now();
function size(){const d=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*d;cv.height=innerHeight*d;cx.setTransform(d,0,0,d,0,0)}size();addEventListener('resize',size);
function burst(x,y,n=40){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=1.5+Math.random()*4.5;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:1,s:1+Math.random()*2.2,c:['#ffe7a8','#ffd06a','#fff5d8','#f2b544'][i%4]})}if(!running){running=true;last=performance.now();requestAnimationFrame(tick)}}
function tick(t){const dt=Math.min(2.5,(t-last)/16.7);last=t;cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>(p.l-=.012*dt)>0);
  for(const p of parts){p.vy+=.06*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;cx.globalAlpha=Math.min(1,p.l*1.6);cx.fillStyle=p.c;cx.shadowBlur=6;cx.shadowColor=p.c;cx.beginPath();cx.arc(p.x,p.y,p.s,0,7);cx.fill()}
  cx.globalAlpha=1;cx.shadowBlur=0;if(parts.length)requestAnimationFrame(tick);else running=false}

/* ---------------- palace doors that open to reveal the date ---------------- */
const doors=$('#doors');let opened=0;
$$('.portal').forEach(pt=>pt.addEventListener('click',()=>{
  if(pt.classList.contains('open'))return;pt.classList.add('open');
  const r=pt.getBoundingClientRect();setTimeout(()=>burst(r.left+r.width/2,r.top+r.height*.45,30),350);
  if(++opened===3){doors.parentElement.classList.add('all-done');setTimeout(()=>{const rr=doors.getBoundingClientRect();burst(rr.left+rr.width/2,rr.top,90)},700)}
}));

/* ---------------- countdown in palace windows ---------------- */
const EVENTS=[['the Wedding, on Thursday, 10 December','2026-12-10T20:00:00+05:30']];
const pad=n=>String(n).padStart(2,'0');
function setVal(id,v){const el=$('#cd-'+id);if(el.textContent===v)return;el.textContent=v;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick')}
function cd(){const now=Date.now();const ev=EVENTS.find(e=>new Date(e[1]).getTime()>now);
  if(!ev){$('#until').textContent='Thank you for celebrating with us';['d','h','m','s'].forEach(k=>setVal(k,'00'))}
  else{const s=Math.floor((new Date(ev[1]).getTime()-now)/1000);
    setVal('d',pad(Math.floor(s/86400)));setVal('h',pad(Math.floor(s%86400/3600)));setVal('m',pad(Math.floor(s%3600/60)));setVal('s',pad(s%60));
    $('#until').textContent='until '+ev[0]}
}
cd();setInterval(cd,1000);

/* ---------------- add to calendar ---------------- */
const EV={
  bhaat:{t:'Bhaat & Sangeet · Srishty & Shubham',s:'20261205T160000',e:'20261205T230000',loc:'Drive Inn 24, Shahnai Hall',d:'Bhaat 4:00 PM onwards, followed by Sangeet & Dinner at 8:00 PM.'},
  haldi:{t:'Haldi · Srishty & Shubham',s:'20261209T120000',e:'20261209T150000',loc:'Hotel Grand Village',d:'Haldi ceremony at 12:00 noon.'},
  wedding:{t:'Wedding · Srishty & Shubham',s:'20261210T200000',e:'20261211T020000',loc:'Hotel Hyatt Place, NH-58, Near Toll Plaza, Bahadarabad, Haridwar',d:'Wedding & Dinner, 8:00 PM onwards.'}
};
const iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
$$('button.cal').forEach(b=>b.addEventListener('click',()=>{
  const ev=EV[b.dataset.ev];if(!ev)return;
  if(iOS){
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Srishty Shubham//Invite//EN','BEGIN:VEVENT','UID:'+b.dataset.ev+'-srishty-shubham-2026','DTSTAMP:20261101T000000Z',
      'DTSTART;TZID=Asia/Kolkata:'+ev.s,'DTEND;TZID=Asia/Kolkata:'+ev.e,'SUMMARY:'+ev.t,'LOCATION:'+ev.loc.replace(/,/g,'\\,'),'DESCRIPTION:'+ev.d.replace(/,/g,'\\,'),'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const a=document.createElement('a');a.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(ics);a.download=b.dataset.ev+'.ics';document.body.appendChild(a);a.click();a.remove();
  }else{
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(ev.t)+'&dates='+ev.s+'/'+ev.e+'&ctz=Asia/Kolkata&location='+encodeURIComponent(ev.loc)+'&details='+encodeURIComponent(ev.d),'_blank','noopener');
  }
}));
})();
