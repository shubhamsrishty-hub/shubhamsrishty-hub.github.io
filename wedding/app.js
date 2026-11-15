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

/* ---------------- the top pill tucks away while scrolling down ---------------- */
let lastY=0;addEventListener('scroll',()=>{const y=scrollY;if(Math.abs(y-lastY)<10)return;topbar.classList.toggle('tucked',y>lastY&&y>innerHeight*.5);lastY=y},{passive:true});

/* ---------------- reveal on scroll ---------------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.reveal').forEach(n=>io.observe(n));
new IntersectionObserver(es=>es.forEach(e=>{if(!lit)return;e.isIntersecting?(hero.classList.contains('lit')&&vLoop.play().catch(()=>{})):vLoop.pause()}),{threshold:.05}).observe(hero);

const cvid=$('#closing-video');
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){cvid.preload='auto';cvid.play().catch(()=>{})}else cvid.pause()}),{threshold:.1}).observe(cvid);

/* ---------------- Shiva–Parvati arch: falling petals ---------------- */
(()=>{const pf=$('#petal-fall');if(!pf||reduce)return;const cols=['#ff9f1c','#ffd23f','#f7a6b4','#fff3d6','#ff7b54'];
  for(let i=0;i<11;i++){const el=document.createElement('i');
    el.style.cssText=`--x:${Math.round(Math.random()*96)}%;--t:${(10+Math.random()*7).toFixed(1)}s;--dl:${(-Math.random()*16).toFixed(1)}s;--c:${cols[i%5]};--sw:${Math.round(Math.random()*44-22)}px;--z:${(7+Math.random()*5).toFixed(1)}px`;pf.appendChild(el)}})();

/* ---------------- gold frames that draw themselves (invitation card and royal paintings) ---------------- */
function frameFor(el,g,mo,mi){const svg=el.querySelector(':scope>.frame');if(!svg)return;
  const out=svg.querySelector('.f-out'),inn=svg.querySelector('.f-in'),beam=svg.querySelector('.f-beam'),cn=svg.querySelector('.f-cn');
  function draw(){const w=el.offsetWidth,h=el.offsetHeight;if(!w||!h)return;const c=w/2;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const d=m=>`M${c+g} ${m}H${w-m}V${h-m}H${m}V${m}H${c-g}`;
    out.setAttribute('d',d(mo));inn.setAttribute('d',d(mi));beam.setAttribute('d',d(mo));
    [out,inn].forEach(p=>p.style.setProperty('--L',Math.ceil(p.getTotalLength())));
    const dm=(x,y)=>`M${x} ${y-5}L${x+5} ${y}L${x} ${y+5}L${x-5} ${y}Z`;
    cn.setAttribute('d',dm(mi,mi)+dm(w-mi,mi)+dm(w-mi,h-mi)+dm(mi,h-mi));}
  draw();addEventListener('resize',draw);
  if(window.ResizeObserver)new ResizeObserver(draw).observe(el);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);}

/* ---------------- invitation card: gold dust and written names ---------------- */
(()=>{const card=$('#card');if(!card)return;
  frameFor(card,92,3,11);
  card.querySelectorAll('.write').forEach(el=>{const s=+el.dataset.s||0,words=el.textContent.trim().split(/\s+/);el.textContent='';
    words.forEach((w,k)=>{const sp=document.createElement('span');sp.className='w';sp.textContent=w;sp.style.setProperty('--d',(.5+(s+k*1.4)*.2).toFixed(2)+'s');el.appendChild(sp);if(k<words.length-1)el.appendChild(document.createTextNode(' '))})});
  const motes=$('#motes');if(motes&&!reduce)for(let i=0;i<12;i++){const m=document.createElement('i');
    m.style.cssText=`--x:${Math.round(4+Math.random()*92)}%;--t:${(11+Math.random()*9).toFixed(1)}s;--dl:${(-Math.random()*20).toFixed(1)}s;--z:${(2+Math.random()*2.5).toFixed(1)}px;--sw:${Math.round(Math.random()*30-15)}px`;motes.appendChild(m)}
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){card.classList.add('awake');o.disconnect()}}),{threshold:.22}).observe(card);
})();

/* ---------------- royal living paintings ----------------
   Each royal page lives in its own small document, loaded only while it is near the screen
   and played only while it is actually being looked at. */
(()=>{const scenes=$$('.scene');if(!scenes.length)return;
  const ctl=sc=>{try{return sc._f&&sc._loaded&&sc._f.contentWindow.sceneCtl||null}catch(e){return null}};
  function sync(sc){const c=ctl(sc);if(!c)return;(sc._vis&&!sc._gated)?c.play():c.pause()}
  function mount(sc){if(sc._f)return;const f=document.createElement('iframe');f.title=sc.dataset.title||'Royal scene';
    f.setAttribute('scrolling','no');f.setAttribute('allow','autoplay');f.src='scene/'+sc.dataset.scene+'.html?v=1';
    f.addEventListener('load',()=>{if(sc._f!==f)return;sc._loaded=true;sc.classList.add('ready');sync(sc)});
    sc.querySelector('.scene-box').prepend(f);sc._f=f}
  function unmount(sc){if(!sc._f)return;sc._f.remove();sc._f=null;sc._loaded=false;sc.classList.remove('ready')}
  const near=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?mount(e.target):unmount(e.target)),{rootMargin:'140% 0px 140% 0px'});
  const seen=new IntersectionObserver(es=>es.forEach(e=>{const sc=e.target;sc._vis=e.intersectionRatio>=.3;if(e.intersectionRatio>=.12)sc.classList.add('awake');sync(sc)}),{threshold:[0,.12,.3,.6]});
  // a tap on a painting is handed to whatever lies under the finger inside it (couple, lantern, peacock…)
  function tap(sc,e){if(e.target.closest('.gate'))return;const f=sc._f,c=ctl(sc);if(!f||!c)return;
    try{const r=f.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,w=f.contentWindow,t=f.contentDocument.elementFromPoint(x,y),b=t&&t.closest('[data-touch],button');
      if(sc._vis&&!sc._gated)c.play();
      if(b)b.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,view:w}));}catch(err){}}
  scenes.forEach(sc=>{frameFor(sc,0,1.5,5.5);near.observe(sc);seen.observe(sc);sc.querySelector('.scene-box').addEventListener('click',e=>tap(sc,e))});
  // the palace doors over the first painting
  const gate=$('#gate');if(gate){const sc=gate.closest('.scene');sc._gated=true;let timer;
    function open(){if(gate.classList.contains('open'))return;clearTimeout(timer);gate.classList.add('open');sc._gated=false;
      const r=gate.getBoundingClientRect();setTimeout(()=>burst(r.left+r.width/2,r.top+r.height*.45,80),500);
      const c=ctl(sc);if(c)c.restart();else sync(sc);setTimeout(()=>gate.classList.add('gone'),2600)}
    gate.addEventListener('click',open);
    new IntersectionObserver(es=>es.forEach(e=>{clearTimeout(timer);if(e.intersectionRatio>=.75&&!gate.classList.contains('open'))timer=setTimeout(open,4500)}),{threshold:[0,.75]}).observe(gate);}
})();

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
