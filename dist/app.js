/* Each beat preserves Ian's words. Interface labels are separate from the excerpt. */
'use strict';
const beats = [
  {name:'Snow on my boots',tag:'01 / OUTSIDE',phase:'outside',lines:[{kind:'intro',text:'There’s snow on my boots.'}],action:'Knock on the door'},
  {name:'The knock',tag:'02 / A KNOCK',phase:'outside',lines:[{kind:'sound',text:'‘Knock-knock!’'},{kind:'thought',text:'…'},{kind:'sound',text:'‘Tap-tap!’'}],sfx:'Knock-knock!\nTap-tap!',action:'Call for Mom',sound:'knock'},
  {name:'Mom',tag:'03 / THROUGH THE DOOR',phase:'outside',lines:[{kind:'child loud',who:'THE GIRL',text:'“MOM! It’s COLD!”'},{kind:'mother',who:'MOTHER',text:'“Coming sweetie…sorry!”'}],action:'Open the door'},
  {name:'The door opens',tag:'04 / THE DOORWAY',phase:'opening',lines:[{kind:'sound',text:'‘Click...creeeak!’'},{kind:'mother',who:'MOTHER',text:'“Sorry—”'}],sfx:'Click...\ncreeeak!',action:'Step inside',sound:'creak'},
  {name:'The door closes',tag:'05 / THE DOOR CLOSES',phase:'inside',lines:[{kind:'sound',text:'‘Clk-thmp!’'},{kind:'child',who:'THE GIRL',text:'“Mom why are you closing the door?”'},{kind:'narration',text:'I asked.'}],sfx:'Clk-thmp!',action:'Listen',sound:'close'},
  {name:'Because it’s snowing',tag:'06 / INSIDE',phase:'inside',lines:[{kind:'mother',who:'MOTHER',text:'“Because honey it’s snowing.”'},{kind:'child',who:'THE GIRL',text:'“Where’s dad?”'}],action:'Continue'},
  {name:'Any minute',tag:'07 / ANY MINUTE',phase:'inside',lines:[{kind:'mother',who:'MOTHER',text:'“He’ll be home any minute with your stuff—”'},{kind:'child loud',who:'THE GIRL',text:'“YAY!”'},{kind:'narration',text:'I cut in.'}],action:'Continue'},
  {name:'Supper',tag:'08 / SUPPER',phase:'inside',lines:[{kind:'mother',who:'MOTHER',text:'“Yeah, ‘Yay!’ so, go to your room and get ready for supper.”'},{kind:'child',who:'THE GIRL',text:'“Okay!”'}],action:'Let the moment pass'},
  {name:'Snow between the words',tag:'09 / BETWEEN THE WORDS',phase:'outside',lines:[{kind:'pause',text:'❅ ◦ ❆\n˚ ❄ ·\n❆ ∘ ❅'}],action:'Hear the door again'},
  {name:'Father comes home',tag:'10 / HOME',phase:'home',lines:[{kind:'sound',text:'‘Click...creeeak!’'},{kind:'sound-small',text:'‘Clk-thmp!’'},{kind:'father',who:'FATHER',text:'“Lillian, I got more than enough for tomorrow.”'},{kind:'narration',text:'My father said.'}],sfx:'Click...creeeak!\nClk-thmp!',action:'Replay the scene',sound:'creak'}
];

const $ = (id) => document.getElementById(id);
const scene=$('scene'), copy=$('beat-copy'), next=$('next-btn'), prev=$('prev-btn'), begin=$('begin-btn'), soundBtn=$('sound-btn'), motionBtn=$('motion-btn');
let current=0;
let motion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let sound=false, audioContext, windGain, windSource;
const dots=beats.map((beat,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Beat ${i+1}: ${beat.name}`);b.title=`${i+1}. ${beat.name}`;b.addEventListener('click',()=>showBeat(i));$('timeline').append(b);return b;});

function showBeat(index, initial=false){
  if(index<0||index>=beats.length)return;
  current=index;const beat=beats[index];scene.dataset.beat=String(index);scene.dataset.phase=beat.phase;
  copy.replaceChildren();
  beat.lines.forEach(line=>{
    if(line.kind==='intro'){
      const h=document.createElement('h1');h.append('There’s snow');const em=document.createElement('em');em.textContent='on my boots.';h.append(em);copy.append(h);
      const p=document.createElement('p');p.className='intro-caption';p.textContent='Click through this scene from my story.';copy.append(p);return;
    }
    const wrapper=document.createElement('div');
    if(line.who){wrapper.className=`speech ${line.kind}`;const s=document.createElement('span');s.className='speaker';s.textContent=line.who;wrapper.append(s);}
    const p=document.createElement('p');p.className=line.kind==='narration'?'narration':line.kind==='pause'?'pause-symbol':`line ${line.who?'':line.kind}`;p.textContent=line.text;wrapper.append(p);copy.append(wrapper);
  });
  copy.classList.remove('enter');void copy.offsetWidth;if(motion&&!initial)copy.classList.add('enter');
  $('scene-tag').textContent=beat.tag;$('beat-number').textContent=String(index+1).padStart(2,'0');prev.disabled=index===0;next.disabled=index===beats.length-1;
  begin.replaceChildren(document.createTextNode(beat.action+' '));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent=index===9?'↺':'↗';begin.append(arrow);
  $('door-hit').setAttribute('aria-label',`${beat.action} — ${index===9?'restart':'next beat'}`);
  $('hint').textContent=index===9?'End of excerpt. Replay, or read the words on their own.':'Click the door or use the arrows. Take your time.';
  dots.forEach((d,i)=>{d.classList.toggle('active',i===index);d.classList.toggle('seen',i<index);d.setAttribute('aria-pressed',String(i===index));});
  const sfx=$('sfx');sfx.textContent=beat.sfx||'';sfx.classList.remove('play');void sfx.offsetWidth;if(motion&&beat.sfx)sfx.classList.add('play');
  if(sound&&beat.sound)playCue(beat.sound);
  if(windGain&&audioContext)windGain.gain.setTargetAtTime(sound ? (['inside','home'].includes(beat.phase) ? .006 : .025) : 0,audioContext.currentTime,.5);
}
function advance(){showBeat(current===beats.length-1?0:current+1);}
begin.addEventListener('click',advance);$('door-hit').addEventListener('click',advance);next.addEventListener('click',()=>showBeat(current+1));prev.addEventListener('click',()=>showBeat(current-1));
document.querySelector('.wordmark').addEventListener('click',()=>showBeat(0));
document.addEventListener('keydown',e=>{if($('excerpt-dialog').open||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.altKey||e.metaKey||e.ctrlKey)return;if(e.key==='ArrowRight'){e.preventDefault();showBeat(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();showBeat(current-1);}});

// Gentle snowfall uses the manuscript's own characters, never hail-like streaks.
const canvas=$('snow'), ctx=canvas.getContext('2d');let width=0,height=0,particles=[],lastTime=0,frameId=0;
function random(seed){let v=seed;return()=>{v=(v*16807)%2147483647;return(v-1)/2147483646;};}
function resizeSnow(){const box=scene.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);width=box.width;height=box.height;canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);const rng=random(43);const symbols=['❅','❆','❄','·','˚','◦'];particles=Array.from({length:width<700?85:150},()=>({x:rng()*width,y:rng()*height,size:5+rng()*15,speed:6+rng()*15,phase:rng()*6.28,alpha:.25+rng()*.55,symbol:symbols[Math.floor(rng()*symbols.length)]}));drawSnow(0);}
function drawSnow(dt){ctx.clearRect(0,0,width,height);for(const p of particles){if(motion){p.y+=p.speed*dt;p.x+=Math.sin(p.phase+p.y*.006)*dt*5;if(p.y>height+25)p.y=-25;}ctx.globalAlpha=p.alpha;ctx.fillStyle='#faf5e9';ctx.font=`${p.size}px "Arial Unicode MS", Georgia, serif`;ctx.fillText(p.symbol,p.x,p.y);}ctx.globalAlpha=1;}
function tick(time){const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;drawSnow(dt);if(motion&&!document.hidden)frameId=requestAnimationFrame(tick);else frameId=0;}
function startSnow(){if(motion&&!frameId&&!document.hidden){lastTime=0;frameId=requestAnimationFrame(tick);}}
function setMotion(value){motion=value;document.body.classList.toggle('still',!motion);motionBtn.setAttribute('aria-pressed',String(motion));motionBtn.innerHTML=`<span aria-hidden="true">≈</span> Motion ${motion?'on':'off'}`;if(!motion){cancelAnimationFrame(frameId);frameId=0;scene.style.removeProperty('--px');scene.style.removeProperty('--py');drawSnow(0);}else startSnow();}
motionBtn.addEventListener('click',()=>setMotion(!motion));new ResizeObserver(resizeSnow).observe(scene);
scene.addEventListener('pointermove',e=>{if(!motion||e.pointerType==='touch')return;const r=scene.getBoundingClientRect();scene.style.setProperty('--px',`${((e.clientX-r.left)/r.width-.5)*5}px`);scene.style.setProperty('--py',`${((e.clientY-r.top)/r.height-.5)*3}px`);});
scene.addEventListener('pointerleave',()=>{scene.style.removeProperty('--px');scene.style.removeProperty('--py');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;if(audioContext)audioContext.suspend();}else{startSnow();if(sound&&audioContext)audioContext.resume();}});

// Original synthesized ambience: no recordings, music files, or external requests.
async function enableAudio(){
  if(!audioContext){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('Audio unavailable');audioContext=new AudioCtx();const buf=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate);const data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;windSource=audioContext.createBufferSource();windSource.buffer=buf;windSource.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;windGain=audioContext.createGain();windGain.gain.value=0;windSource.connect(filter).connect(windGain).connect(audioContext.destination);windSource.start();}
  await audioContext.resume();
}
function tone(time,freq,duration,volume,type='sine'){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,time);osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.55),time+duration);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.connect(gain).connect(audioContext.destination);osc.start(time);osc.stop(time+duration+.02);}
function playCue(kind){if(!audioContext)return;const t=audioContext.currentTime;if(kind==='knock'){[0,.22,.82,1.02].forEach((d,i)=>tone(t+d,i<2?170:235,.11,.08));}else if(kind==='close'){tone(t,100,.22,.1);}else{tone(t,270,.48,.023,'triangle');tone(t+.2,180,.58,.018,'triangle');}}
soundBtn.addEventListener('click',async()=>{try{await enableAudio();sound=!sound;soundBtn.setAttribute('aria-pressed',String(sound));soundBtn.innerHTML=`<span aria-hidden="true">♫</span> Sound ${sound?'on':'off'}`;const indoor=['inside','home'].includes(beats[current].phase);windGain.gain.setTargetAtTime(sound ? (indoor ? .006 : .025) : 0,audioContext.currentTime,.3);}catch{sound=false;soundBtn.textContent='Sound unavailable';soundBtn.disabled=true;}});

const original=`❅ ◦ ∘ ❆ · · · ˚ ◦ . ° · ❆ ∘ ˚ ❅ . ˚ ∘ ˚ ❆ · · ❄
There’s snow on my boots.
‘Knock-knock!’ … ‘Tap-tap!’
❅ ˚ ∘ · ˚ ❅ · . · ˚ . ∘ · ❄ ❅ ❅ ° ° ∙ · ◦ · ❄
“MOM! It’s COLD!”
“Coming sweetie…sorry!”
‘Click...creeeak!’
“Sorry—”
‘Clk-thmp!’
“Mom why are you closing the door?” I asked.
“Because honey it’s snowing.”
“Where’s dad?”
“He’ll be home any minute with your stuff—”“YAY!” I cut in.
“Yeah, ‘Yay!’ so, go to your room and get ready for supper.”
“Okay!”
❅ ◦ ∘ ❆ · · · ˚ ◦ . ° · ❆ ∘ ˚ ❅ . ˚ ∘ ˚ ❆ · · ❄
‘Click...creeeak!’
‘Clk-thmp!’
“Lillian, I got more than enough for tomorrow.” My father said.`;
original.split('\n').forEach(text=>{const p=document.createElement('p');p.textContent=text;if(text.startsWith('❅'))p.className='snow-line';$('transcript').append(p);});
const dialog=$('excerpt-dialog');let opener;
function openExcerpt(e){opener=e.currentTarget;dialog.showModal();$('close-dialog').focus();}
$('read-btn').addEventListener('click',openExcerpt);$('close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
showBeat(0,true);setMotion(motion);
