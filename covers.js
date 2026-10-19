/* Shared Song Covers translations and accessible audio players. */
(async function () {
'use strict';
const root=document.documentElement;
const words={
en:{heading:'Song Covers',subtitle:'Unreleased covers, shared here for you.',visit:'Listen to the song covers',back:'Back to Virginia R. Jacobs',artist:'Original artist: {artist}',play:'Play {title}',pause:'Pause {title}',seek:'Seek in {title}',time:'{elapsed} of {total}',error:'This recording could not be played. Please try again.',footer:'All covers performed by Virginia R. Jacobs. Original songs belong to their respective rights holders.',languages:'Languages',switchLanguages:'Switch Languages'},
es:{heading:'Versiones de canciones',subtitle:'Versiones inéditas, compartidas aquí para ti.',visit:'Escuchar las versiones',back:'Volver a Virginia R. Jacobs',artist:'Artista original: {artist}',play:'Reproducir {title}',pause:'Pausar {title}',seek:'Cambiar la posición en {title}',time:'{elapsed} de {total}',error:'No se pudo reproducir esta grabación. Inténtalo de nuevo.',footer:'Todas las versiones están interpretadas por Virginia R. Jacobs. Las canciones originales pertenecen a sus respectivos titulares de derechos.',languages:'Idiomas',switchLanguages:'Cambiar idioma'},
fr:{heading:'Reprises de chansons',subtitle:'Des reprises inédites, partagées ici pour vous.',visit:'Écouter les reprises',back:'Retour à Virginia R. Jacobs',artist:'Artiste d’origine : {artist}',play:'Écouter {title}',pause:'Mettre {title} en pause',seek:'Se déplacer dans {title}',time:'{elapsed} sur {total}',error:'Impossible de lire cet enregistrement. Veuillez réessayer.',footer:'Toutes les reprises sont interprétées par Virginia R. Jacobs. Les chansons originales appartiennent à leurs ayants droit respectifs.',languages:'Langues',switchLanguages:'Changer de langue'},
zh:{heading:'翻唱作品',subtitle:'在这里与你分享尚未发行的翻唱作品。',visit:'聆听翻唱作品',back:'返回 Virginia R. Jacobs 主页',artist:'原唱：{artist}',play:'播放 {title}',pause:'暂停 {title}',seek:'调整 {title} 的播放进度',time:'{elapsed}，共 {total}',error:'无法播放此录音，请重试。',footer:'所有翻唱均由 Virginia R. Jacobs 演绎。原作版权归各自的权利人所有。',languages:'语言',switchLanguages:'切换语言'}
};
const language=()=>words[root.lang]?root.lang:'en';
const tr=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replaceAll('{'+k+'}',v),words[language()][key]);
const $=(s)=>document.querySelector(s);
const all=(s)=>Array.from(document.querySelectorAll(s));
const isCovers=document.body.classList.contains('covers-page');
if(!isCovers){
 const section=document.createElement('section');section.id='song-covers';section.className='resources';section.setAttribute('aria-labelledby','covers-link-heading');
 section.innerHTML='<h2 id="covers-link-heading" data-cover-text="heading"></h2><p data-cover-text="subtitle"></p><a class="resource-download" href="covers.html" data-cover-text="visit"></a>';
 $('#resources').after(section);
 const translate=()=>all('[data-cover-text]').forEach(e=>e.textContent=tr(e.dataset.coverText));translate();
 new MutationObserver(translate).observe(root,{attributes:true,attributeFilter:['lang']});return;
}
const tracks=[
['Man in the Mirror','Michael Jackson','man-in-the-mirror.mp3','QWS'],['Faithfully','Journey','faithfully.mp3','MIDI'],['Believe','Cher','believe.mp3','MIDI'],['Bleeding Love','Leona Lewis','bleeding-love.m4a','MIDI'],['Blank Space','Taylor Swift','blank-space.mp3','MIDI'],['Girl on Fire','Alicia Keys','girl-on-fire.m4a','MIDI'],['Girls Just Want to Have Fun','Cyndi Lauper','girls-just-want-to-have-fun.mp3','MIDI'],['Learning to Fly','Pink Floyd','learning-to-fly.mp3','MIDI'],['Night Moves','Bob Seger','night-moves.mp3','MIDI'],["Summer of '69",'Bryan Adams','summer-of-69.m4a','MIDI'],['We Belong','Pat Benatar','we-belong.mp3','MIDI']
];
const en={17:'Font Size Display Controls',18:'Display Adjustment:',19:'Increase Text Size',20:'Increase text size for entire website',21:'Reset Text Size',22:'Reset text size to default',23:'Light mode',24:'Off',25:'On',26:'Text size increased to ',27:' percent of default.',28:'Text size reset to default.'};
let data;
try {const r=await fetch('translations.txt?v=5');if(!r.ok)throw Error(r.status);data=await r.json();}
catch(e){$('#player-status').textContent='The display controls could not load. Please refresh the page.';return;}
let scale=1,light=false,scheme='default',context;
const schemes=['default','yellow-black','black-yellow','dark-blue','white-black','black-white'];
const palettes={'yellow-black':['#e8ff00','#000000'],'black-yellow':['#000000','#e8ff00'],'dark-blue':['#e8ff00','#0000aa'],'white-black':['#ffffff','#000000'],'black-white':['#000000','#ffffff']};
const standard=(n)=>language()==='en'?en[n]:data[language()][n];
const contrast=()=>data.contrast[language()];
const say=(s)=>{$('#player-status').textContent=s;};
function applyTheme(){
 const [fg,bg]=palettes[scheme]||(light?['#111111','#ffffff']:['#ffffff','#000000']);
 root.style.setProperty('--fg',fg);root.style.setProperty('--bg',bg);
 root.style.setProperty('--control-fg',scheme==='default'?'#ffffff':fg);
 root.style.setProperty('--control-bg',scheme==='default'?'#000000':bg);
 root.style.setProperty('--accent',scheme==='default'?(light?'#004b87':'#79b8ff'):fg);
 root.dataset.contrast=scheme;root.classList.toggle('light-mode',light);$('#btn-light-mode').setAttribute('aria-checked',String(light));
 players.forEach(p=>p.draw());
}
function applyScale(){root.style.setProperty('--scale',scale);}
function menu(trigger,box,options,onSelect){
 const btn=$(trigger),list=$(box);let index=0;
 options.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitemradio');b.tabIndex=-1;b.dataset.value=o.value;b.textContent=o.label;b.addEventListener('click',()=>{onSelect(o.value);close(true);});list.append(b);});
 const items=Array.from(list.children);
 function close(focus=false){list.hidden=true;btn.setAttribute('aria-expanded','false');if(focus)btn.focus();}
 function open(i=0){all('.menu').filter(e=>e!==list).forEach(e=>{e.hidden=true;document.querySelector('[aria-controls="'+e.id+'"]').setAttribute('aria-expanded','false');});list.hidden=false;btn.setAttribute('aria-expanded','true');index=i;items[i].focus();}
 btn.addEventListener('click',()=>list.hidden?open():close(true));
 btn.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(e.key==='ArrowUp'?items.length-1:0);}});
 list.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(true);}else if(e.key==='Tab')close();else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();index=e.key==='Home'?0:e.key==='End'?items.length-1:(items.indexOf(document.activeElement)+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[index].focus();}});
 document.addEventListener('pointerdown',e=>{if(!btn.parentElement.contains(e.target))close();});
 return items;
}
const langItems=menu('#language-trigger','#language-menu',[{value:'en',label:'English'},{value:'es',label:'Español'},{value:'fr',label:'Français'},{value:'zh',label:'简体中文'}],v=>{root.lang=v;translate();});
const contrastItems=menu('#contrast-trigger','#contrast-menu',schemes.map(value=>({value,label:data.contrast.en[value]})),v=>{scheme=v;applyTheme();translate();say(contrast().changed.replace('{scheme}',contrast()[v]));});
$('#btn-increase-font').addEventListener('click',()=>{scale=Math.min(1.6,Math.round((scale+.15)*100)/100);applyScale();say(standard(26)+Math.round(scale*100)+standard(27));});
$('#btn-reset-font').addEventListener('click',()=>{scale=1;applyScale();say(standard(28));});
$('#btn-light-mode').addEventListener('click',()=>{const changed=scheme!=='default';scheme='default';light=!light;applyTheme();translate();if(changed)say(contrast()[light?'light':'dark']);});
const clock=s=>{s=Number.isFinite(s)?Math.max(0,Math.floor(s)):0;return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const players=tracks.map(([title,artist,file,tag],i)=>{
 const article=document.createElement('article');article.className='cover-player';article.setAttribute('aria-labelledby','track-'+i);
 const h=document.createElement('h2');h.id='track-'+i;h.textContent=title+' - '+tag+' cover';article.append(h);
 const credit=document.createElement('p');article.append(credit);
 const wave=document.createElement('div');wave.className='wave';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');wave.append(canvas);
 const seek=document.createElement('input');seek.type='range';seek.min='0';seek.max='1000';seek.step='1';seek.value='0';seek.className='seek';wave.append(seek);article.append(wave);
 const controls=document.createElement('div');controls.className='playback-controls';
 const button=document.createElement('button');button.type='button';button.className='play-button';controls.append(button);
 const time=document.createElement('span');time.className='time';controls.append(time);article.append(controls);
 const audio=document.createElement('audio');audio.preload='metadata';audio.src='audio/'+file;article.append(audio);$('#tracks').append(article);
 let analyser,source,bins,raf=0,level=Array(64).fill(.15),last=0;
 function update(){button.textContent=tr(audio.paused?'play':'pause',{title});button.setAttribute('aria-label',button.textContent);seek.setAttribute('aria-label',tr('seek',{title}));credit.textContent=tr('artist',{artist});time.textContent=clock(audio.currentTime)+' / '+clock(audio.duration);seek.setAttribute('aria-valuetext',tr('time',{elapsed:clock(audio.currentTime),total:clock(audio.duration)}));if(Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round(audio.currentTime/audio.duration*1000));}
 function draw(t=0){
 const rect=canvas.getBoundingClientRect();if(!rect.width)return;const d=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(rect.width*d)||canvas.height!==Math.round(rect.height*d)){canvas.width=Math.round(rect.width*d);canvas.height=Math.round(rect.height*d);}const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);const w=rect.width,h=rect.height;
 const fg=getComputedStyle(root).getPropertyValue('--fg').trim(),bg=getComputedStyle(root).getPropertyValue('--bg').trim();c.fillStyle=bg;c.fillRect(0,0,w,h);
 const progress=Number.isFinite(audio.duration)&&audio.duration>0?audio.currentTime/audio.duration:0;
 if(analyser&&!audio.paused)analyser.getByteFrequencyData(bins);
 for(let j=0;j<64;j++){const x=j*w/64,bw=Math.max(1,w/64-3),base=.2+.55*Math.abs(Math.sin(j*1.73)*Math.cos(j*.37));const played=x<w*progress;const target=analyser&&!audio.paused?Math.max(.12,bins[j]/255):base;level[j]+=(target-level[j])*.14;const amplitude=played&&!audio.paused?level[j]:base;const bh=Math.max(5,amplitude*(h-12));c.fillStyle=played?'hsl('+((j*5+t*.015)%360)+' 80% 78%)':fg;c.globalAlpha=played?1:.42;c.fillRect(x,(h-bh)/2,bw,bh);c.globalAlpha=1;if(played){c.strokeStyle=fg;c.lineWidth=1;c.strokeRect(x+.5,(h-bh)/2+.5,bw-1,bh-1);}}
 if(progress>0){const x=Math.min(w-3,w*progress);c.fillStyle='#000';c.fillRect(x-3,0,6,h);c.fillStyle='#fff';c.fillRect(x-1,0,2,h);}last=t;
 }
 function frame(t){draw(t);if(!audio.paused)raf=requestAnimationFrame(frame);}
 button.addEventListener('click',async()=>{if(!audio.paused){audio.pause();return;}players.forEach(p=>{if(p.audio!==audio)p.audio.pause();});try{
  try{if(!context)context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();if(!source){source=context.createMediaElementSource(audio);source.connect(context.destination);try{analyser=context.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.8;bins=new Uint8Array(analyser.frequencyBinCount);source.connect(analyser);}catch(e){analyser=null;}}article.dataset.visualizer=analyser?'audio-reactive':'shimmer-only';}catch(e){article.dataset.visualizer='shimmer-only';}
  await audio.play();
 }catch(e){say(tr('error'));}});
 audio.addEventListener('play',()=>{update();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);});audio.addEventListener('pause',()=>{cancelAnimationFrame(raf);update();draw(last);});audio.addEventListener('ended',update);audio.addEventListener('loadedmetadata',()=>{update();draw();});audio.addEventListener('timeupdate',update);audio.addEventListener('error',()=>{article.dataset.mediaError=String(audio.error?.code||'unknown');});
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(seek.value)/1000*audio.duration;update();draw(last);}});
 new ResizeObserver(()=>draw(last)).observe(wave);return {audio,update,draw,article};
});
function translate(){
 all('[data-cover-text]').forEach(e=>e.textContent=tr(e.dataset.coverText));document.title=tr('heading')+' — Virginia R. Jacobs';
 $('#display-controls').setAttribute('aria-label',standard(17));$('#display-label').textContent=standard(18);
 $('#btn-increase-font').textContent=standard(19);$('#btn-increase-font').setAttribute('aria-label',standard(20));$('#btn-reset-font').textContent=standard(21);$('#btn-reset-font').setAttribute('aria-label',standard(22));$('#btn-light-mode').setAttribute('aria-label',standard(23));$('#light-label').textContent=standard(23);$('#theme-state').textContent=standard(light?25:24);
 $('#language-label').textContent=tr('languages');$('#language-trigger').setAttribute('aria-label',tr('switchLanguages'));
 $('#contrast-trigger').textContent=contrast().button;$('#contrast-trigger').setAttribute('aria-label',contrast().button);
 $('#language-menu').setAttribute('aria-label',tr('switchLanguages'));$('#contrast-menu').setAttribute('aria-label',contrast().button);
 langItems.forEach(e=>e.setAttribute('aria-checked',String(e.dataset.value===language())));
 contrastItems.forEach((e,i)=>{e.textContent=contrast()[e.dataset.value];e.setAttribute('aria-label',e.textContent+', '+contrast().descriptions[i]);e.setAttribute('aria-checked',String(e.dataset.value===scheme));});players.forEach(p=>p.update());
}
function defaults(){root.lang='en';light=false;scheme='default';scale=1;applyScale();applyTheme();translate();}
defaults();window.addEventListener('pageshow',defaults);
})();
