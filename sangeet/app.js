(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=$('#hero'),vLight=$('#v-light'),vLoop=$('#v-loop'),topbar=$('#topbar');

/* optional artwork: used automatically once the files are added to the folder */
function probe(src,ok){const i=new Image();i.onload=()=>ok(i);i.src=src+'?v=1'}
probe('paper.jpg',()=>document.body.classList.add('has-paper'));
probe('ornament.png',()=>document.body.classList.add('has-orn'));
probe('venue-map.jpg',()=>($('#venue-art')||document.body).classList.add('has'));


/* ---------------- music ---------------- */
const music=$('#music'),audio=new Audio('wedding-music.mp3?v=2');audio.loop=true;audio.preload='auto';audio.volume=0;
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
const isLocked=()=>document.body.classList.contains('locked')||document.body.classList.contains('viewing');
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
/* the closing aarti: fetched quietly as the guest nears the end, so it is ready when they arrive */
(()=>{let blobbed=false,fetching=false;const cn=navigator.connection||{},thrifty=cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'');
  function grab(){if(thrifty||fetching||blobbed)return;fetching=true;
    fetch('closing-aarti.mp4?v=1',{priority:'low'}).then(r=>r.ok?r.blob():Promise.reject()).then(b=>{const t=cvid.currentTime,was=!cvid.paused;cvid.src=URL.createObjectURL(b);blobbed=true;try{cvid.currentTime=t}catch(e){}if(was)cvid.play().catch(()=>{})}).catch(()=>{fetching=false})}
  const cd=document.getElementById('countdown')||cvid;new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){o.disconnect();grab()}}),{rootMargin:'120% 0px'}).observe(cd);
  new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){cvid.preload='auto';grab();cvid.play().catch(()=>{})}else cvid.pause()}),{threshold:.1}).observe(cvid);
  // low-power mode can block autoplay: a touch on the closing scene starts it
  const cs=document.getElementById('closing');cs&&cs.addEventListener('touchstart',()=>{if(cvid.paused)cvid.play().catch(()=>{})},{passive:true});
})();

/* ---------------- Shiva–Parvati arch: falling petals ---------------- */
(()=>{const pf=$('#petal-fall');if(!pf||reduce)return;const cols=['#ff9f1c','#ffd23f','#f7a6b4','#fff3d6','#ff7b54'];
  for(let i=0;i<11;i++){const el=document.createElement('i');
    el.style.cssText=`--x:${Math.round(Math.random()*96)}%;--t:${(10+Math.random()*7).toFixed(1)}s;--dl:${(-Math.random()*16).toFixed(1)}s;--c:${cols[i%5]};--sw:${Math.round(Math.random()*44-22)}px;--z:${(7+Math.random()*5).toFixed(1)}px`;pf.appendChild(el)}})();

/* ---------------- gold frames that draw themselves ---------------- */
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
$$('.framed.auto').forEach(el=>{frameFor(el,0,1.5,5.5);
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){el.classList.add('awake');o.disconnect()}}),{threshold:.2}).observe(el)});

/* ---------------- invitation card: gold dust and written names ---------------- */
(()=>{const card=$('#card');if(!card)return;
  frameFor(card,92,3,11);
  card.querySelectorAll('.write').forEach(el=>{const s=+el.dataset.s||0,words=el.textContent.trim().split(/\s+/);el.textContent='';
    words.forEach((w,k)=>{const sp=document.createElement('span');sp.className='w';sp.textContent=w;sp.style.setProperty('--d',(.5+(s+k*1.4)*.2).toFixed(2)+'s');el.appendChild(sp);if(k<words.length-1)el.appendChild(document.createTextNode(' '))})});
  const motes=$('#motes');if(motes&&!reduce)for(let i=0;i<12;i++){const m=document.createElement('i');
    m.style.cssText=`--x:${Math.round(4+Math.random()*92)}%;--t:${(11+Math.random()*9).toFixed(1)}s;--dl:${(-Math.random()*20).toFixed(1)}s;--z:${(2+Math.random()*2.5).toFixed(1)}px;--sw:${Math.round(Math.random()*30-15)}px`;motes.appendChild(m)}
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){card.classList.add('awake');o.disconnect()}}),{threshold:.22}).observe(card);
})();

/* ---------------- the royal invitation, opened by touch ----------------
   The palace doors, each celebration and the map open the matching royal page in a viewer on the
   same blue paper. Inside, guests can turn through all six royal pages. A royal page is its own
   small document (scene/…html); it never takes the finger, so swipes and taps stay ours. */
(()=>{const rv=$('#rv');if(!rv)return;
  const ORDER=['opening', 'family', 'bhaat'];
  const INFO={opening:['clip-page-1','Touch the couple to shower them with petals','Wedding invitation'],family:['clip-page-2','Touch a hanging lantern to light it','Together with our families'],
    bhaat:['clip-page-bhaat','Touch the celebration to shower petals','Bhaat and Sangeet'],haldi:['clip-page-haldi','Touch the celebration to shower petals','Haldi'],
    dinner:['clip-page-3','Touch the groom, the sky or the elephants','Wedding dinner'],venue:['clip-page-4','Touch the couple or the lotus pools','The venue']};
  const W0=400,H0=710,card=$('#rv-card'),box=$('#rv-box'),hint=$('#rv-hint'),dots=$('#rv-dots'),gate=$('#gate');
  let hint0='',watchT=null,savedY=0,cur=0,frame=null,ready=false,origin=null,isOpen=false,pushed=false,busy=false,k=1,swiped=false;
  frameFor(card,0,1.5,5.5);
  ORDER.forEach(()=>dots.appendChild(document.createElement('i')));
  const ctl=()=>{try{return frame&&ready&&frame.contentWindow.sceneCtl||null}catch(e){return null}};
  function size(){const vv=window.visualViewport,vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;
    const w=Math.max(200,Math.min(vw-30,470,(vh-104)*476/845));k=w/W0;
    box.style.width=w+'px';box.style.height=(w*845/476)+'px';if(frame)frame.style.transform=`scale(${k})`;}
  size();addEventListener('resize',size);if(window.visualViewport)visualViewport.addEventListener('resize',size);
  // while a page's clip is still arriving, a soft gold shimmer shows; if the phone refuses to autoplay
  // (low-power mode, data saver) the hint asks for one tap, which starts it
  function watch(){clearInterval(watchT);if(reduce)return;box.classList.add('loading');const t0=Date.now();
    watchT=setInterval(()=>{const c=ctl(),st=c&&c.state&&c.state();
      if(!isOpen||Date.now()-t0>25000){clearInterval(watchT);box.classList.remove('loading');return}
      if(st&&st.playing){clearInterval(watchT);box.classList.remove('loading');hint.textContent=hint0;return}
      if(st&&st.ready>=2&&Date.now()-t0>2600){box.classList.remove('loading');hint.textContent='✦ Tap the picture to bring it to life ✦'}},350)}
  function load(i,dir){cur=(i+ORDER.length)%ORDER.length;const key=ORDER[cur],[poster,h,title]=INFO[key];
    if(frame){frame.remove();frame=null}ready=false;box.classList.remove('ready');
    box.style.backgroundImage=`url('scene/${poster}.jpg')`;hint.textContent='✦ '+h+' ✦';hint0=hint.textContent;
    [...dots.children].forEach((d,n)=>d.classList.toggle('on',n===cur));
    box.classList.remove('turn-l','turn-r');if(dir&&!reduce){void box.offsetWidth;box.classList.add(dir>0?'turn-l':'turn-r')}
    const f=document.createElement('iframe');f.title=title;f.setAttribute('scrolling','no');f.setAttribute('allow','autoplay');f.setAttribute('tabindex','-1');
    f.style.transform=`scale(${k})`;f.src='scene/'+key+'.html?v=2';
    f.addEventListener('load',()=>{if(frame!==f)return;ready=true;box.classList.add('ready');const c=ctl();if(c&&isOpen)c.play()});
    box.prepend(f);frame=f;watch()}
  function flip(opening){if(reduce||!origin||!card.animate)return null;
    card.getAnimations().forEach(a=>a.cancel());
    const r=origin.getBoundingClientRect(),c=card.getBoundingClientRect();if(!c.width||!r.width)return null;
    const s=Math.max(.08,Math.min(r.width/c.width,r.height/c.height)),dx=r.left+r.width/2-(c.left+c.width/2),dy=r.top+r.height/2-(c.top+c.height/2);
    const from={transform:`translate(${dx}px,${dy}px) scale(${s})`,opacity:0},to={transform:'none',opacity:1};
    return card.animate(opening?[from,to]:[to,from],{duration:opening?800:520,easing:opening?'cubic-bezier(.2,.75,.2,1)':'cubic-bezier(.5,0,.75,.45)',fill:'both'})}
  function open(key,el){if(isOpen)return;isOpen=true;savedY=window.scrollY;origin=el||null;rv.hidden=false;void rv.offsetWidth;size();load(ORDER.indexOf(key),0);
    rv.classList.add('on');document.body.classList.add('viewing');
    card.classList.remove('awake');void card.offsetWidth;card.classList.add('awake');flip(true);
    if(!pushed){try{history.pushState({royal:1},'');pushed=true}catch(e){}}}
  function shut(){if(!isOpen)return;isOpen=false;const c=ctl();c&&c.pause();
    const a=flip(false);rv.classList.remove('on');document.body.classList.remove('viewing');
    const back=()=>{if(Math.abs(window.scrollY-savedY)>1)window.scrollTo(0,savedY)};
    const done=()=>{if(isOpen)return;rv.hidden=true;back();if(frame){frame.remove();frame=null}ready=false;box.classList.remove('ready');card.getAnimations&&card.getAnimations().forEach(x=>x.cancel());
      if(gate)gate.classList.remove('open')};
    setTimeout(done,a?600:560);back();[60,200,450].forEach(t=>setTimeout(()=>{if(!isOpen)back()},t))}
  function close(){if(pushed){pushed=false;try{history.back();return}catch(e){}}shut()}
  try{history.scrollRestoration='manual'}catch(e){}
  addEventListener('popstate',()=>{if(isOpen){pushed=false;shut()}});
  rv.addEventListener('touchmove',e=>{e.preventDefault()},{passive:false});
  function go(d){if(!isOpen||busy)return;busy=true;const c=ctl();c&&c.pause();load(cur+d,d);setTimeout(()=>busy=false,500)}
  $('#rv-close').addEventListener('click',close);$('#rv-back').addEventListener('click',close);
  $('#rv-prev').addEventListener('click',()=>go(-1));$('#rv-next').addEventListener('click',()=>go(1));
  document.addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='Escape')close();if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});
  // swipe sideways to turn the page, swipe down to close
  let t0=null;
  rv.addEventListener('touchstart',e=>{const t=e.touches[0];t0={x:t.clientX,y:t.clientY};swiped=false},{passive:true});
  rv.addEventListener('touchend',e=>{if(!t0)return;const t=e.changedTouches[0],dx=t.clientX-t0.x,dy=t.clientY-t0.y;t0=null;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;go(dx<0?1:-1)}
    else if(dy>95&&dy>Math.abs(dx)*1.4){swiped=true;close()}},{passive:true});
  // a tap on the painting is handed to whatever lies under the finger inside it (couple, lantern, sky…)
  box.addEventListener('click',e=>{if(swiped){swiped=false;return}const c=ctl();if(!isOpen||!frame||!c)return;
    try{const r=box.getBoundingClientRect(),x=(e.clientX-r.left)/k,y=(e.clientY-r.top)/k,w=frame.contentWindow,t=frame.contentDocument.elementFromPoint(x,y),b=t&&t.closest('[data-touch],button');
      c.play();if(b)b.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,view:w}));}catch(err){}});
  // touch points on the invitation
  $$('[data-open]').forEach(el=>{const key=el.dataset.open,from=()=>el.querySelector('.pic img')||el;
    el.addEventListener('click',e=>{if(e.target.closest('.cal,a'))return;open(key,from())});
    el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===el){e.preventDefault();open(key,from())}})});
  if(gate)gate.addEventListener('click',()=>{if(gate.classList.contains('open'))return;gate.classList.add('open');
    const r=gate.getBoundingClientRect();setTimeout(()=>burst(r.left+r.width/2,r.top+r.height*.45,60),450);
    setTimeout(()=>open('opening',$('#palace-box')),reduce?0:1150)});
  // ---- warm the royal pages in the background, a few at a time, so they open at once ----
  // Clips are fetched whole and handed to the page as local blobs. Skipped on data saver / very slow links.
  const cn=navigator.connection||{},thrifty=cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'');
  window.__clips=window.__clips||{};
  const CLIPFILE={opening:'clip-page-1',family:'clip-page-2',bhaat:'clip-page-bhaat',haldi:'clip-page-haldi',dinner:'clip-page-3',venue:'clip-page-4'};
  const queue=[];let pfBusy=false;
  function pump(){if(pfBusy||!queue.length)return;pfBusy=true;const key=queue.shift();
    fetch('scene/'+CLIPFILE[key]+'.mp4',{priority:'low'}).then(r=>r.ok?r.blob():Promise.reject()).then(b=>{window.__clips[key]=URL.createObjectURL(b)}).catch(()=>{}).finally(()=>{pfBusy=false;setTimeout(pump,120)});
    fetch('scene/'+key+'.html').catch(()=>{});}
  function want(keys){if(thrifty)return;keys.filter(k=>ORDER.includes(k)&&!queue.includes(k)&&!window.__clips[k]).forEach(k=>queue.push(k));pump()}
  const lit=()=>!document.body.classList.contains('locked');
  const litT=setInterval(()=>{if(lit()){clearInterval(litT);setTimeout(()=>want(['opening','family']),3500)}},500);
  [['#celebrations',['bhaat','haldi','dinner']],['#location',['venue']]].forEach(([sel,keys])=>{const el=$(sel);if(el)new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){o.disconnect();want(keys)}}),{rootMargin:'160% 0px'}).observe(el)});
  // have the paintings' first frames ready before anyone asks for them
  const sec=$('#royal');if(sec)new IntersectionObserver((es,o)=>es.forEach(e=>{if(!e.isIntersecting)return;o.disconnect();
    ORDER.forEach(key=>{const im=new Image();im.src='scene/'+INFO[key][0]+'.jpg'})}),{rootMargin:'100% 0px'}).observe(sec);
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
const EVENTS=[['the Bhaat & Sangeet, on Saturday, 5 December','2026-12-05T20:00:00+05:30']];
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
  bhaat:{t:'Bhaat & Sangeet · Srishty & Shubham',s:'20261205T200000',e:'20261205T233000',loc:'Drive Inn 24, Shahnai Hall',d:'Dinner & Sangeet at 8:00 PM.'},
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
