/* Accessible Song Covers player. */
(async function(){
  'use strict';
  const root=document.documentElement;
  const words={en:{heading:'Song Covers',subtitle:'Unreleased covers, shared here for you.',back:'Back to Virginia R. Jacobs',artist:'Original artist: {artist}',play:'Play {title}',pause:'Pause {title}',seek:'Seek in {title}',time:'{elapsed} of {total}',error:'This recording could not be played.',footer:'All covers performed by Virginia R. Jacobs. Original songs belong to their respective rights holders.'}};
  const tr=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replaceAll('{'+k+'}',v),words.en[key]);
  if(!document.body.classList.contains('covers-page')) return;
  const tracks=[
    ['Man in the Mirror','Michael Jackson','man-in-the-mirror.mp3','QWS'],
    ['Faithfully','Journey','faithfully.mp3','MIDI'],
    ['I Can Only Imagine','MercyMe','i-can-only-imagine.mp3','MIDI'],
    ['Believe','Cher','believe.mp3','MIDI'],
    ['Bleeding Love','Leona Lewis','bleeding-love.m4a','MIDI'],
    ['Blank Space','Taylor Swift','blank-space.mp3','MIDI'],
    ['Girl on Fire','Alicia Keys','girl-on-fire.m4a','MIDI'],
    ['Girls Just Want to Have Fun','Cyndi Lauper','girls-just-want-to-have-fun.mp3','MIDI'],
    ['Learning to Fly','Pink Floyd','learning-to-fly.mp3','MIDI'],
    ['Night Moves','Bob Seger','night-moves.mp3','MIDI'],
    ["Summer of '69",'Bryan Adams','summer-of-69.m4a','MIDI'],
    ['We Belong','Pat Benatar','we-belong.mp3','MIDI']
  ];
  const tracksRoot=document.querySelector('#tracks');
  const status=document.querySelector('#player-status');
  const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#39;','"':'&quot;'}[c]));
  tracks.forEach(([title,artist,file,tag],i)=>{
    const article=document.createElement('article');article.className='cover-player';article.setAttribute('aria-labelledby','track-'+i);
    const h=document.createElement('h2');h.id='track-'+i;h.textContent=title+' - '+tag+' cover';article.append(h);
    const credit=document.createElement('p');credit.textContent=tr('artist',{artist});article.append(credit);
    const wave=document.createElement('div');wave.className='wave';
    const seek=document.createElement('input');seek.type='range';seek.min='0';seek.max='1000';seek.value='0';seek.step='1';seek.setAttribute('aria-label',tr('seek',{title}));seek.setAttribute('aria-valuetext',tr('time',{elapsed:'0:00',total:'0:00'}));wave.append(seek);article.append(wave);
    const controls=document.createElement('div');controls.className='playback-controls';
    const rewind=document.createElement('button');rewind.type='button';rewind.textContent='Backward 10 seconds';rewind.setAttribute('aria-label','Backward 10 seconds for '+title);
    const play=document.createElement('button');play.type='button';play.textContent=tr('play',{title});play.setAttribute('aria-label',tr('play',{title}));
    const forward=document.createElement('button');forward.type='button';forward.textContent='Forward 10 seconds';forward.setAttribute('aria-label','Forward 10 seconds for '+title);
    const time=document.createElement('span');time.className='time';time.textContent='0:00 / 0:00';controls.append(rewind,play,forward,time);article.append(controls);
    const audio=document.createElement('audio');audio.preload='metadata';audio.src='audio/'+file;article.append(audio);tracksRoot.append(article);
    const update=()=>{const d=Number.isFinite(audio.duration)?audio.duration:0;const cur=Number.isFinite(audio.currentTime)?audio.currentTime:0;const fmt=x=>Math.floor(x/60)+':'+String(Math.floor(x%60)).padStart(2,'0');time.textContent=fmt(cur)+' / '+fmt(d);seek.value=d?String(Math.round(cur/d*1000)):'0';seek.setAttribute('aria-valuetext',tr('time',{elapsed:fmt(cur),total:fmt(d)}));play.textContent=tr(audio.paused?'play':'pause',{title});play.setAttribute('aria-label',play.textContent);};
    rewind.addEventListener('click',()=>{audio.currentTime=Math.max(0,audio.currentTime-10);update()});forward.addEventListener('click',()=>{audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10);update()});play.addEventListener('click',()=>audio.paused?audio.play().catch(()=>{status.textContent=tr('error')}):audio.pause());audio.addEventListener('loadedmetadata',update);audio.addEventListener('timeupdate',update);audio.addEventListener('play',update);audio.addEventListener('pause',update);seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(seek.value)/1000*audio.duration});
  });
  document.querySelector('#btn-increase-font')?.setAttribute('aria-label','Increase text size for entire website');document.querySelector('#btn-reset-font')?.setAttribute('aria-label','Reset text size to default');document.querySelector('#btn-light-mode')?.setAttribute('aria-label','Light mode');document.querySelector('#language-trigger')?.setAttribute('aria-label','Switch Languages');
})();
