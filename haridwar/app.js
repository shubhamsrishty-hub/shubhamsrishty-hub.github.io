(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=$('#hero'),vLight=$('#v-light'),vLoop=$('#v-loop'),btn=$('#light-btn');

/* ---------------- music ---------------- */
const music=$('#music'),audio=new Audio('wedding-music.mp3');audio.loop=true;audio.preload='auto';audio.volume=0;
let wanted=true,fadeT=null;
function fade(to,ms,done){clearInterval(fadeT);const s=audio.volume,t0=performance.now();fadeT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);try{audio.volume=s+(to-s)*k}catch(e){}if(k>=1){clearInterval(fadeT);done&&done()}},40)}
function mui(){const on=!audio.paused;music.classList.toggle('playing',on);music.setAttribute('aria-pressed',String(on));music.setAttribute('aria-label',on?'Pause music':'Play music')}
function play(){const p=audio.play();p&&p.then(()=>{fade(.85,1400);mui()}).catch(mui)}
music.addEventListener('click',()=>{wanted=audio.paused;wanted?play():fade(0,500,()=>{audio.pause();mui()})});
audio.addEventListener('play',mui);audio.addEventListener('pause',mui);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!audio.paused){audio.pause();audio._r=1}}else if(audio._r&&wanted){audio._r=0;play()}});

/* ---------------- light the diyas ---------------- */
let lit=false;
function welcome(){hero.classList.add('welcomed');document.body.classList.remove('locked')}
function toLoop(){if(hero.classList.contains('lit'))return;vLoop.currentTime=0;vLoop.play().catch(()=>{});hero.classList.add('lit')}
function light(){
  if(lit)return;lit=true;hero.classList.add('lighting');
  if(wanted)play();music.classList.add('show');
  if(reduce){hero.classList.add('lit');welcome();return}
  vLight.currentTime=0;
  vLight.play().then(()=>{setTimeout(welcome,4200)}).catch(()=>{toLoop();welcome()});
}
vLight.addEventListener('ended',toLoop);
vLight.addEventListener('timeupdate',()=>{if(vLight.duration&&vLight.currentTime>vLight.duration-.12)toLoop()});
btn.addEventListener('click',e=>{e.stopPropagation();light()});
hero.addEventListener('click',()=>{if(!lit)light()});
$('#again').addEventListener('click',()=>{
  lit=false;hero.classList.remove('lit','welcomed','lighting');vLoop.pause();vLight.pause();vLight.currentTime=0;
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>{document.body.classList.add('locked');light()},900);
});

/* ---------------- reveal on scroll ---------------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.reveal').forEach(n=>io.observe(n));
const ghat=$('.ghat-video');
new IntersectionObserver(es=>es.forEach(e=>{e.isIntersecting?ghat.play().catch(()=>{}):ghat.pause()}),{threshold:.1}).observe(ghat);
new IntersectionObserver(es=>es.forEach(e=>{if(!lit)return;e.isIntersecting?(hero.classList.contains('lit')&&vLoop.play().catch(()=>{})):vLoop.pause()}),{threshold:.05}).observe(hero);

/* ---------------- sparkle bursts ---------------- */
const cv=$('#sparkle'),cx=cv.getContext('2d');let parts=[],running=false;
function size(){const d=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*d;cv.height=innerHeight*d;cx.setTransform(d,0,0,d,0,0)}size();addEventListener('resize',size);
function burst(x,y,n=40){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=1.5+Math.random()*4.5;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:1,s:1+Math.random()*2.2,c:['#ffe7a8','#ffd06a','#fff5d8','#f2b544'][i%4]})}if(!running){running=true;requestAnimationFrame(tick)}}
let last=performance.now();
function tick(t){const dt=Math.min(2.5,(t-last)/16.7);last=t;cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>(p.l-=.012*dt)>0);
  for(const p of parts){p.vy+=.06*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;cx.globalAlpha=Math.min(1,p.l*1.6);cx.fillStyle=p.c;cx.shadowBlur=6;cx.shadowColor=p.c;cx.beginPath();cx.arc(p.x,p.y,p.s,0,7);cx.fill()}
  cx.globalAlpha=1;cx.shadowBlur=0;
  if(parts.length)requestAnimationFrame(tick);else running=false}

/* ---------------- scratch cards ---------------- */
const row=$('#scratch-row');let doneCount=0;
$$('.scratch').forEach(card=>{
  const c=card.querySelector('canvas'),g=c.getContext('2d');let ready=false,down=false,lastP=null,checks=0;
  function paint(){const r=c.getBoundingClientRect();if(!r.width)return;const d=Math.min(2,devicePixelRatio||1);c.width=r.width*d;c.height=r.height*d;g.setTransform(d,0,0,d,0,0);
    const w=r.width,h=r.height,gr=g.createLinearGradient(0,0,w,h);
    gr.addColorStop(0,'#b88a3a');gr.addColorStop(.22,'#f6dc97');gr.addColorStop(.45,'#c99a46');gr.addColorStop(.62,'#fff1c4');gr.addColorStop(.82,'#c3923f');gr.addColorStop(1,'#e9c77c');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let i=0;i<260;i++){g.fillStyle=Math.random()<.5?'#ffffff22':'#7a531a1c';g.fillRect(Math.random()*w,Math.random()*h,1.2,1.2)}
    g.strokeStyle='#8a5e1d66';g.lineWidth=1;g.strokeRect(5.5,5.5,w-11,h-11);
    g.fillStyle='#6b4410cc';g.font='600 22px Cinzel, Georgia, serif';g.textAlign='center';g.textBaseline='middle';g.fillText('✦',w/2,h/2-8);
    g.font='600 9px Cinzel, Georgia, serif';g.fillText('SCRATCH',w/2,h/2+16);ready=true}
  requestAnimationFrame(paint);addEventListener('resize',()=>{if(!card.classList.contains('done'))paint()});
  function pos(e){const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  function scratch(p){g.globalCompositeOperation='destination-out';g.lineCap='round';g.lineJoin='round';g.lineWidth=30;g.beginPath();g.moveTo((lastP||p).x,(lastP||p).y);g.lineTo(p.x,p.y);g.stroke();g.beginPath();g.arc(p.x,p.y,15,0,7);g.fill();g.globalCompositeOperation='source-over';lastP=p;
    if(++checks%6===0)check()}
  function check(){if(card.classList.contains('done'))return;const d=g.getImageData(0,0,c.width,c.height).data;let clear=0,n=0;for(let i=3;i<d.length;i+=64){n++;if(d[i]<40)clear++}
    if(clear/n>.45)finish()}
  function finish(){if(card.classList.contains('done'))return;card.classList.add('done');const r=card.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,26);
    if(++doneCount===3){row.parentElement.classList.add('all-done');setTimeout(()=>{const rr=row.getBoundingClientRect();burst(rr.left+rr.width/2,rr.top,90)},250)}}
  c.addEventListener('pointerdown',e=>{if(!ready)return;down=true;lastP=null;c.setPointerCapture(e.pointerId);scratch(pos(e));e.preventDefault()});
  c.addEventListener('pointermove',e=>{if(down)scratch(pos(e))});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>c.addEventListener(t,()=>{down=false;lastP=null;check()}));
});

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
    const u='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(ev.t)+'&dates='+ev.s+'/'+ev.e+'&ctz=Asia/Kolkata&location='+encodeURIComponent(ev.loc)+'&details='+encodeURIComponent(ev.d);
    window.open(u,'_blank','noopener');
  }
}));
})();
