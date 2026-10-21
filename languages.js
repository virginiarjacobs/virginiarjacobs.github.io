/* One shared, idempotent display controller. Translation values are inert text. */
(async function(){
'use strict';
if(window.vrjDisplay)return;
const root=document.documentElement,$=s=>document.querySelector(s),all=s=>Array.from(document.querySelectorAll(s));
const languages=['en','es','fr','zh'],schemes=['default','black-white','white-black','black-yellow','yellow-black','blue-black','black-blue'];
const read=k=>{try{return localStorage.getItem('vrj-'+k)}catch(e){return null}},write=(k,v)=>{try{localStorage.setItem('vrj-'+k,String(v))}catch(e){}};
function saved(){const n=Number(read('text-scale'));return{language:languages.includes(read('language'))?read('language'):'en',scheme:schemes.includes(read('contrast'))?read('contrast'):'default',light:read('theme')==='light',scale:Number.isFinite(n)&&n>=1&&n<=1.5?n:1};}
let state=saved(),data,ready=false;const bindings=[];
window.vrjDisplay={refresh:()=>{if(ready){state=saved();render()}}};
try{const r=await fetch('/translations.txt?v=20261021');if(!r.ok)throw Error('translations');data=await r.json();}catch(e){const s=$('#font-status-message,#player-status');if(s)s.textContent='The display controls could not load. Please refresh the page.';return;}
const t=id=>data[state.language][id],c=()=>data.contrast[state.language];
const say=s=>{const n=$('#font-status-message,#player-status');if(n)n.textContent=s;};
if(!document.body.classList.contains('covers-page')){
const rows=new Map(data.home.map(row=>[row[0],row]));
const walker=document.createTreeWalker(document,NodeFilter.SHOW_TEXT);let node;
while(node=walker.nextNode()){if(node.parentElement.closest('script,style,button,[role=menu]'))continue;const key=node.textContent.trim(),row=rows.get(key);if(row)bindings.push({node,row,prefix:node.textContent.match(/^\s*/)[0],suffix:node.textContent.match(/\s*$/)[0]});}
all('[aria-label],[alt],meta[name=description]').forEach(el=>{for(const attribute of ['aria-label','alt','content']){const value=el.getAttribute(attribute),row=rows.get(value);if(row)bindings.push({el,attribute,row});}});
}
function menu(triggerSelector,listSelector,options,select){
const trigger=$(triggerSelector),list=$(listSelector);if(!trigger||!list)return[];
const items=[];list.replaceChildren();
for(const value of options){const b=document.createElement('button');b.type='button';b.dataset.value=value;b.setAttribute('role','menuitemradio');b.tabIndex=-1;if(list.tagName==='UL'){const li=document.createElement('li');li.setAttribute('role','none');li.append(b);list.append(li)}else list.append(b);items.push(b);b.addEventListener('click',()=>{select(value);close(true)});}
function close(focus=false){list.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus()}
function open(i=0){all('[role=menu]').forEach(m=>{if(m!==list){m.hidden=true;const b=document.querySelector('[aria-controls="'+m.id+'"]');if(b)b.setAttribute('aria-expanded','false')}});list.hidden=false;trigger.setAttribute('aria-expanded','true');items[i].focus()}
trigger.addEventListener('click',()=>list.hidden?open(Math.max(0,items.findIndex(b=>b.getAttribute('aria-checked')==='true'))):close(true));
trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(e.key==='ArrowUp'?items.length-1:0)}});
list.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const b=items.find(x=>x===document.activeElement);if(b){select(b.dataset.value);close(true)}}else if(e.key==='Escape'){e.preventDefault();close(true)}else if(e.key==='Tab'){close()}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();let i=items.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[i].focus()}});
document.addEventListener('pointerdown',e=>{if(!trigger.parentElement.contains(e.target))close()});return items;
}
const languageTrigger=$('#btn-languages,#language-trigger'),contrastTrigger=$('#btn-contrast,#contrast-trigger');
const langItems=menu('#btn-languages,#language-trigger','#language-menu',languages,value=>{state.language=value;write('language',value);render()});
const contrastItems=menu('#btn-contrast,#contrast-trigger','#contrast-menu',schemes,value=>{state.scheme=value;write('contrast',value);render();say(c().changed.replace('{scheme}',c()[value]))});
const increase=$('#btn-increase-font'),reset=$('#btn-reset-font'),toggle=$('#btn-light-mode');
if(increase)increase.addEventListener('click',()=>{state.scale=Math.min(1.5,Math.round((state.scale+.1)*100)/100);write('text-scale',state.scale);render();say(t(26)+Math.round(state.scale*100)+t(27))});
if(reset)reset.addEventListener('click',()=>{state.scale=1;write('text-scale',1);render();say(t(28))});
if(toggle)toggle.addEventListener('click',()=>{state.light=!state.light;state.scheme='default';write('theme',state.light?'light':'dark');write('contrast','default');render();say(state.light?c().light:c().dark)});
function render(){
root.lang=state.language;root.dataset.contrast=state.scheme;root.classList.toggle('light-mode',state.light);root.style.setProperty('--scale',state.scale);root.style.colorScheme=state.light?'light':'dark';
const palette={'black-white':['#fff','#000','#003b96'],'white-black':['#000','#fff','#79b8ff'],'black-yellow':['#ffff00','#000','#002a80'],'yellow-black':['#000','#ffff00','#79b8ff'],'blue-black':['#000','#6eb9ff','#79b8ff'],'black-blue':['#6eb9ff','#000','#00004f']};
const p=palette[state.scheme]||(state.light?palette['black-white']:palette['white-black']);for(const [name,value]of Object.entries({'--bg':p[0],'--fg':p[1],'--accent':p[2],'--control-bg':p[0],'--control-fg':p[1]}))root.style.setProperty(name,value);
const i=languages.indexOf(state.language);for(const b of bindings){if(b.attribute)b.el.setAttribute(b.attribute,b.row[i]);else b.node.textContent=b.prefix+b.row[i]+b.suffix;}
const region=$('#display-controls,.font-control-region');if(region)region.setAttribute('aria-label',t(17));const label=$('#display-label,#display-adjustment-heading');if(label)label.textContent=t(18);
if(increase){increase.textContent=t(19);increase.setAttribute('aria-label',t(20))}if(reset){reset.textContent=t(21);reset.setAttribute('aria-label',t(22))}
if(toggle){toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(state.light));toggle.setAttribute('aria-label',t(23));const label=$('#light-label');if(label)label.textContent=t(23);const status=$('#theme-state');if(status)status.textContent=t(state.light?25:24);}
const names={en:['Languages','Switch Languages'],es:['Idiomas','Cambiar idioma'],fr:['Langues','Changer de langue'],zh:['语言','切换语言']};if(languageTrigger){const label=languageTrigger.querySelector('#language-label,span:not(.globe)');if(label)label.textContent=names[state.language][0];else languageTrigger.textContent=names[state.language][0];languageTrigger.setAttribute('aria-label',names[state.language][1]);$('#language-menu').setAttribute('aria-label',names[state.language][1]);}
langItems.forEach((b,n)=>{b.textContent=['English','Español','Français','简体中文'][n];b.lang=languages[n];b.setAttribute('aria-checked',String(b.dataset.value===state.language))});
if(contrastTrigger){contrastTrigger.textContent=c().button;contrastTrigger.setAttribute('aria-label',c().button);$('#contrast-menu').setAttribute('aria-label',c().button)}contrastItems.forEach((b,n)=>{b.textContent=c()[b.dataset.value];b.setAttribute('aria-label',b.textContent+', '+c().descriptions[n]);b.setAttribute('aria-checked',String(b.dataset.value===state.scheme))});
window.dispatchEvent(new CustomEvent('vrj:display'));
}
ready=true;render();window.addEventListener('pageshow',()=>window.vrjDisplay.refresh());window.addEventListener('storage',()=>window.vrjDisplay.refresh());
})();
