/* Reviewed translations are local data, not an external translation service. */
(async function () {
  'use strict';
  const response = await fetch('translations.txt');
  if (!response.ok) throw new Error('Translation data could not be loaded');
  const translations = await response.json();
  for (const code of ['es', 'fr', 'zh']) {
    for (let id = 1; id <= 86; id++) {
      if (typeof translations[code][id] !== 'string') throw new Error('Incomplete translations');
    }
  }
  const bindings = [];
  const english = {24: 'Off', 25: 'On', 26: 'Text size increased to ', 27: ' percent of default.', 28: 'Text size reset to default.'};
  let language = 'en';
  let lastAnnouncement = '';
  function bind(id, selector, attribute) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) throw new Error('Missing translation target ' + id);
    elements.forEach(function (element) {
      const node = attribute ? element : Array.from(element.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
      if (!node) throw new Error('Missing text node ' + id);
      const original = attribute ? element.getAttribute(attribute) : node.textContent;
      english[id] = original.trim().replace(/\s+/g, ' ');
      bindings.push({id, element, node, attribute, original});
    });
  }
  bind(1, 'title');
  bind(2, 'meta[name="description"]', 'content');
  bind(3, '.skip-link');
  bind(4, '.subtitle');
  bind(5, 'header nav', 'aria-label');
  [6, 8, 10, 12, 14].forEach(function (id, i) {
    const selector = 'header nav li:nth-child(' + (i + 1) + ') a';
    bind(id, selector);
    bind(id + 1, selector, 'aria-label');
  });
  bind(16, '#name-effect-description');
  bind(17, '.font-control-region', 'aria-label');
  bind(18, '#font-controls-label');
  bind(19, '#btn-increase-font');
  bind(20, '#btn-increase-font', 'aria-label');
  bind(21, '#btn-reset-font');
  bind(22, '#btn-reset-font', 'aria-label');
  bind(23, '#btn-light-mode');
  bind(23, '#btn-light-mode', 'aria-label');
  bind(29, '#release-heading');
  bind(30, '.press-release-card > .confirmed-badge');
  bind(31, '.press-release-card > .unverified-badge');
  bind(32, '.press-release-card > .correction-note');
  bind(33, '#portrait-heading');
  bind(34, '#streaming-heading');
  bind(35, '#archive-heading');
  bind(36, '#social-heading');
  bind(37, '#resources-heading');
  bind(38, '#covers-heading');
  bind(39, '#footer-disclaimer');
  bind(40, '#btn-contrast');
  bind(40, '#btn-contrast', 'aria-label');
  bind(41, '#btn-language');
  bind(41, '#btn-language', 'aria-label');
  bind(42, '#language-menu', 'aria-label');
  bind(43, '#contrast-menu', 'aria-label');
  bind(44, '#contrast-status');
  bind(45, '#language-status');
  bind(46, '#font-status-message');
  bind(47, '#press-release-heading');
  bind(48, '#portrait-title');
  bind(49, '#artist-links-heading');
  bind(50, '#press-archive-heading');
  bind(51, '#contact-heading');
  bind(52, '#resources-title');
  bind(53, '#song-covers-title');
  bind(54, '#language-option-en');
  bind(55, '#language-option-es');
  bind(56, '#language-option-fr');
  bind(57, '#language-option-zh');
  bind(58, '[data-scheme="default"]');
  bind(59, '[data-scheme="yellow-black"]');
  bind(60, '[data-scheme="black-yellow"]');
  bind(61, '[data-scheme="dark-blue"]');
  bind(62, '[data-scheme="white-black"]');
  bind(63, '[data-scheme="black-white"]');
  bind(64, '#theme-state');
  bind(65, '#name-effect-description', 'aria-label');
  bind(66, 'main', 'aria-label');
  bind(67, 'footer', 'aria-label');
  bind(68, '#portrait-image', 'alt');
  bind(69, '#press-release-content');
  bind(70, '#streaming-links');
  bind(71, '#press-archive-content');
  bind(72, '#contact-content');
  bind(73, '#resource-links');
  bind(74, '#song-covers-content');
  bind(75, '#copyright');
  bind(76, '#footer-accessibility-note');
  bind(77, '#language-menu button[data-lang="en"]');
  bind(78, '#language-menu button[data-lang="es"]');
  bind(79, '#language-menu button[data-lang="fr"]');
  bind(80, '#language-menu button[data-lang="zh"]');
  bind(81, '#contrast-menu button[data-scheme="default"]');
  bind(82, '#contrast-menu button[data-scheme="yellow-black"]');
  bind(83, '#contrast-menu button[data-scheme="black-yellow"]');
  bind(84, '#contrast-menu button[data-scheme="dark-blue"]');
  bind(85, '#contrast-menu button[data-scheme="white-black"]');
  bind(86, '#contrast-menu button[data-scheme="black-white"]');

  function announce(text, id) {
    const node = id ? document.getElementById(id) : document.getElementById('font-status-message');
    if (node) node.textContent = text;
    lastAnnouncement = text;
  }
  function translate(code) {
    language = code;
    document.documentElement.lang = code;
    bindings.forEach(function (b) {
      const value = code === 'en' ? (typeof b.original === 'string' ? b.original : '') : translations[code][b.id];
      if (b.attribute) b.element.setAttribute(b.attribute, value);
      else b.node.textContent = value;
    });
    localStorage.setItem('vrj-language', code);
  }

  const root = document.documentElement;
  const pageScheme = {
    'dark': {bg:'#000000', fg:'#ffffff', link:'#79b8ff'},
    'light': {bg:'#ffffff', fg:'#111111', link:'#005fcc'},
    'yellow-black': {bg:'#000000', fg:'#ffff00', link:'#00ffff'},
    'black-yellow': {bg:'#ffff00', fg:'#000000', link:'#0000aa'},
    'dark-blue': {bg:'#000033', fg:'#ffff00', link:'#00ffff'},
    'white-black': {bg:'#000000', fg:'#ffffff', link:'#79b8ff'},
    'black-white': {bg:'#ffffff', fg:'#000000', link:'#0044cc'}
  };
  function applyScheme(name) {
    const scheme = pageScheme[name] || pageScheme.dark;
    root.dataset.vrjContrast = name;
    root.style.setProperty('--vrj-bg', scheme.bg);
    root.style.setProperty('--vrj-fg', scheme.fg);
    root.style.setProperty('--vrj-link', scheme.link);
    document.body.style.setProperty('background-color', scheme.bg, 'important');
    document.body.style.setProperty('color', scheme.fg, 'important');
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.matches('a, a *')) el.style.setProperty('color', scheme.link, 'important');
      else if (!el.matches('button, input, select, textarea, option, svg, path, img, video, audio, canvas')) el.style.setProperty('color', scheme.fg, 'important');
    });
    document.querySelectorAll('header, main, footer, section, article, nav, figure, blockquote, .press-release-card, .font-control-region').forEach(function(el) {
      el.style.setProperty('background-color', scheme.bg, 'important');
    });
    document.querySelectorAll('button, input, select, textarea').forEach(function(el) {
      el.style.setProperty('background-color', scheme.bg, 'important');
      el.style.setProperty('color', scheme.fg, 'important');
      el.style.setProperty('border-color', scheme.fg, 'important');
    });
    document.querySelectorAll('.contrast-option').forEach(function(el) {
      el.style.setProperty('background-color', scheme.bg, 'important');
      el.style.setProperty('color', scheme.fg, 'important');
    });
    const light = document.getElementById('btn-light-mode');
    if (light) {
      const isLight = name === 'light';
      light.setAttribute('aria-checked', isLight ? 'true' : 'false');
      light.setAttribute('aria-label', isLight ? 'Light mode On' : 'Light mode Off');
      const state = document.getElementById('theme-state');
      if (state) state.textContent = isLight ? 'On' : 'Off';
    }
    document.querySelectorAll('.contrast-option').forEach(el => el.setAttribute('aria-checked', el.dataset.scheme === name ? 'true' : 'false'));
    localStorage.setItem('vrj-contrast', name);
    if (name === 'light' || name === 'dark') localStorage.setItem('vrj-theme', name);
  }
  const selectedScheme = localStorage.getItem('vrj-contrast') || localStorage.getItem('vrj-theme') || 'dark';
  applyScheme(selectedScheme);
  const currentLang = ['en','es','fr','zh'].includes(localStorage.getItem('vrj-language')) ? localStorage.getItem('vrj-language') : 'en';
  translate(currentLang);

  document.addEventListener('click', function(event) {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.id === 'btn-light-mode') {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = root.dataset.vrjContrast;
      const next = current === 'light' ? 'dark' : 'light';
      applyScheme(next);
      announce(next === 'light' ? 'Light mode is on.' : 'Light mode is off.');
      return;
    }
    if (target.matches('.contrast-option')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const scheme = target.dataset.scheme;
      applyScheme(scheme);
      const menu = document.getElementById('contrast-menu');
      if (menu) menu.hidden = true;
      const button = document.getElementById('btn-contrast');
      if (button) button.setAttribute('aria-expanded','false');
      announce('Contrast scheme: ' + target.textContent.trim() + '.', 'contrast-status');
      return;
    }
    if (target.id === 'btn-contrast') {
      const menu = document.getElementById('contrast-menu');
      if (menu) menu.hidden = !menu.hidden;
      target.setAttribute('aria-expanded', menu && !menu.hidden ? 'true' : 'false');
    }
    if (target.matches('#language-menu button[data-lang]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      translate(target.dataset.lang);
      const menu = document.getElementById('language-menu');
      if (menu) menu.hidden = true;
      const button = document.getElementById('btn-language');
      if (button) button.setAttribute('aria-expanded','false');
      announce('Language changed to ' + target.textContent.trim() + '.', 'language-status');
    }
    if (target.id === 'btn-increase-font') {
      const old = parseFloat(localStorage.getItem('vrj-text-scale') || '1');
      const size = Math.min(old + 0.1, 2);
      localStorage.setItem('vrj-text-scale', String(size));
      root.style.fontSize = (size * 100) + '%';
      announce('Text size increased to ' + Math.round(size * 100) + ' percent of default.');
    }
    if (target.id === 'btn-reset-font') {
      localStorage.setItem('vrj-text-scale','1');
      root.style.fontSize = '100%';
      announce('Text size reset to default.');
    }
/* Clean site-wide display-control state handling; preserve existing markup and accessibility semantics. */
(function () {
  'use strict';
  const root = document.documentElement;
  const palette = {
    dark: {bg:'#000000', fg:'#ffffff', link:'#79b8ff'},
    light: {bg:'#ffffff', fg:'#111111', link:'#005fcc'},
    'yellow-black': {bg:'#000000', fg:'#ffff00', link:'#00ffff'},
    'black-yellow': {bg:'#ffff00', fg:'#000000', link:'#0000aa'},
    'dark-blue': {bg:'#000033', fg:'#ffff00', link:'#00ffff'},
    'white-black': {bg:'#000000', fg:'#ffffff', link:'#79b8ff'},
    'black-white': {bg:'#ffffff', fg:'#000000', link:'#0044cc'}
  };
  function apply(name) {
    const key = palette[name] ? name : 'dark';
    const p = palette[key];
    root.dataset.vrjContrast = key;
    root.style.setProperty('--vrj-bg', p.bg);
    root.style.setProperty('--vrj-fg', p.fg);
    root.style.setProperty('--vrj-link', p.link);
    document.body.style.setProperty('background-color', p.bg, 'important');
    document.body.style.setProperty('color', p.fg, 'important');
    document.querySelectorAll('body *').forEach(el => {
      if (el.matches('a, a *')) el.style.setProperty('color', p.link, 'important');
      else if (!el.matches('button,input,select,textarea,option,svg,path,img,video,audio,canvas')) el.style.setProperty('color', p.fg, 'important');
    });
    document.querySelectorAll('header,main,footer,section,article,nav,figure,blockquote,.press-release-card,.font-control-region').forEach(el => el.style.setProperty('background-color',p.bg,'important'));
    document.querySelectorAll('button,input,select,textarea').forEach(el => {
      el.style.setProperty('background-color',p.bg,'important');
      el.style.setProperty('color',p.fg,'important');
      el.style.setProperty('border-color',p.fg,'important');
    });
    document.querySelectorAll('.contrast-option').forEach(el => el.setAttribute('aria-checked',el.dataset.scheme===key?'true':'false'));
    const toggle=document.getElementById('btn-light-mode');
    if(toggle){const on=key==='light';toggle.setAttribute('aria-checked',on?'true':'false');toggle.setAttribute('aria-label',on?'Light mode On':'Light mode Off');const state=document.getElementById('theme-state');if(state)state.textContent=on?'On':'Off';}
    localStorage.setItem('vrj-contrast',key);
    localStorage.setItem('vrj-theme',key==='light'?'light':'dark');
  }
  function say(message,id){const s=document.getElementById(id||'font-status-message')||document.querySelector('.font-control-region [role="status"]');if(s)s.textContent=message;}
  const saved=localStorage.getItem('vrj-contrast')||localStorage.getItem('vrj-theme')||'dark';
  apply(palette[saved]?saved:'dark');
  const scale=Math.min(2,Math.max(1,parseFloat(localStorage.getItem('vrj-text-scale')||'1')));
  root.style.fontSize=(scale*100)+'%';
  if(!document.documentElement.dataset.vrjCleanDisplayBound){
    document.documentElement.dataset.vrjCleanDisplayBound='true';
    document.addEventListener('click',function(event){
      const b=event.target.closest('button');if(!b)return;
      if(b.id==='btn-light-mode'){event.preventDefault();event.stopImmediatePropagation();const next=root.dataset.vrjContrast==='light'?'dark':'light';apply(next);say(next==='light'?'Light mode is on.':'Light mode is off.');return;}
      if(b.matches('.contrast-option')){event.preventDefault();event.stopImmediatePropagation();const key=b.dataset.scheme;apply(key);const menu=document.getElementById('contrast-menu'),trigger=document.getElementById('btn-contrast');if(menu)menu.hidden=true;if(trigger)trigger.setAttribute('aria-expanded','false');say('Contrast scheme: '+b.textContent.trim()+'.','contrast-status');return;}
      if(b.id==='btn-contrast'){const menu=document.getElementById('contrast-menu');if(menu){menu.hidden=!menu.hidden;b.setAttribute('aria-expanded',menu.hidden?'false':'true');}return;}
      if(b.id==='btn-increase-font'){const n=Math.min(2,Math.max(1,parseFloat(localStorage.getItem('vrj-text-scale')||'1'))+.1);localStorage.setItem('vrj-text-scale',String(n));root.style.fontSize=(n*100)+'%';say('Text size increased to '+Math.round(n*100)+' percent of default.');return;}
      if(b.id==='btn-reset-font'){localStorage.setItem('vrj-text-scale','1');root.style.fontSize='100%';say('Text size reset to default.');return;}
      if(b.matches('#language-menu button[data-lang]')){event.preventDefault();event.stopImmediatePropagation();const code=b.dataset.lang;localStorage.setItem('vrj-language',code);root.lang=code;const menu=document.getElementById('language-menu');if(menu)menu.hidden=true;const trigger=document.getElementById('btn-language');if(trigger)trigger.setAttribute('aria-expanded','false');say('Language changed to '+b.textContent.trim()+'.','language-status');return;}
    },true);
  }
})();
