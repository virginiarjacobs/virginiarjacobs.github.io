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
  const english = {24: 'Off', 25: 'On', 26: 'Text size increased to ', 27: ' percent of default.', 28: 'Text size reset to default 19 pixels.'};
  let language = 'en';
  let lastAnnouncement = '';
  // Bind individual text nodes, never replace a paragraph containing a link.
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
  bind(31, '.press-release-card > p > strong');
  bind(32, '#release-title');
  const paragraphs = document.querySelectorAll('.press-release-card > p');
  [33, 34, 36, 37, 38, 39, 40, 41, 43].forEach(function (id, i) {
    const element = paragraphs[i + 1];
    const node = Array.from(element.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
    const original = node.textContent;
    english[id] = original.trim().replace(/\s+/g, ' ');
    bindings.push({id, element, node, original});
  });
  bind(35, '.press-release-card blockquote');
  bind(42, '.press-release-card h4:first-of-type');
  bind(44, '.press-release-card h4:last-of-type');
  bind(45, '.press-release-card a[href="#social"]');
  bind(46, '#portrait-heading');
  bind(47, 'figcaption strong');
  bind(48, '#portrait img', 'alt');
  bind(48, 'figcaption');
  bind(49, '#streaming-heading');
  bind(50, '#streaming > p');
  [51, 53, 55, 57, 59, 61, 63].forEach(function (id, i) {
    const selector = '#streaming li:nth-child(' + (i + 1) + ') a';
    bind(id, selector);
    bind(id + 1, selector, 'aria-label');
  });
  bind(65, '#archive-heading');
  bind(66, '#unverified-press > p');
  bind(67, '#unverified-press .unverified-badge');
  bind(68, '#unverified-press .card:first-of-type h3');
  bind(69, '#unverified-press .card:first-of-type p');
  bind(70, '#unverified-press .card:last-of-type h3');
  bind(71, '#unverified-press .card:last-of-type a');
  bind(72, '#unverified-press .card:last-of-type p');
  bind(73, '#social h2');
  bind(74, '#social > p');
  bind(75, '#social li:nth-child(1) strong');
  bind(76, '#social li:nth-child(1) a', 'aria-label');
  bind(77, '#social li:nth-child(2) strong');
  bind(78, '#social li:nth-child(2) a', 'aria-label');
  [79, 80, 81].forEach((id, i) => bind(id, '#social li:nth-child(' + (i + 3) + ') a', 'aria-label'));
  bind(82, '#resources-heading');
  bind(83, '.resource-download');
  bind(84, '.resource-download', 'aria-label');
  bind(85, 'footer p:first-child');
  bind(86, 'footer p:last-child');

  // Recover protected URL/email text from the original accessible labels.
  const channel = english[58].split(' at ')[1].split(' (opens')[0];
  const email = document.querySelector('#social a[href^="mailto:"]').getAttribute('href').slice(7);
  for (const code of ['es', 'fr', 'zh']) {
    for (const id of [58, 76]) {
      translations[code][id] = code === 'zh'
        ? translations[code][id].replace('网址为 ', '网址为 ' + channel + ' ')
        : translations[code][id].replace(' (', ' ' + channel + ' (');
    }
    translations[code][78] += (code === 'zh' ? '' : ' ') + email;
  }
  function text(id) { return language === 'en' ? english[id] : translations[language][id]; }
  const theme = document.getElementById('btn-light-mode');
  const state = document.getElementById('theme-state');
  const live = document.getElementById('font-status-message');
  function updateState() { state.textContent = text(theme.getAttribute('aria-checked') === 'true' ? 25 : 24); }
  function updateAnnouncement() {
    if (lastAnnouncement === 'increase') {
      const percent = Math.round(parseFloat(document.documentElement.style.fontSize) || 100);
      live.textContent = text(26) + percent + text(27);
    } else if (lastAnnouncement === 'reset') live.textContent = text(28);
  }
  theme.addEventListener('click', updateState);
  document.getElementById('btn-increase-font').addEventListener('click', function () {
    lastAnnouncement = 'increase'; updateAnnouncement();
  });
  document.getElementById('btn-reset-font').addEventListener('click', function () {
    lastAnnouncement = 'reset'; updateAnnouncement();
  });

  const style = document.createElement('style');
  style.textContent = `
    .press-release-card > .confirmed-badge { max-width: 100%; overflow-wrap: anywhere; }
    .language-control { position: relative; flex: 0 1 18rem; min-width: 0; max-width: 100%; align-self: flex-start; }
    .language-control .language-trigger { border-color: #79b8ff; color: #79b8ff; max-width: 100%; }
    .language-globe { display: inline-block; width: 1.1em; height: 1.1em; vertical-align: -0.15em; margin-right: 0.3em; }
    .language-menu { position: absolute; top: 100%; left: 0; width: 100%; margin: 0.5rem 0 0; padding: 0.65rem; list-style: none; background: #000; color: #fff; border: 0.125rem solid #79b8ff; border-radius: 0.375rem; z-index: 50; box-shadow: 0 0 0 1px #555; }
    .language-menu[hidden] { display: none; }
    .language-menu li { margin: 0; padding: 0; }
    .language-option { display: block; width: 100%; min-width: 0; font: inherit; font-weight: 700; text-align: left; padding: 0.6rem; color: #fff; background: #000; border: 0.125rem solid transparent; border-radius: 0.2rem; overflow-wrap: anywhere; cursor: pointer; }
    .language-option[aria-checked="true"] { border-color: #79b8ff; color: #79b8ff; }
    .language-option:hover { text-decoration: underline; }
    .light-mode .language-control .language-trigger { border-color: #79b8ff; }
  `;
  document.head.append(style);
  const wrapper = document.createElement('div');
  wrapper.className = 'language-control';
  wrapper.innerHTML = `<button type="button" id="btn-languages" class="accessible-btn language-trigger" lang="en" aria-label="Switch Languages" aria-haspopup="menu" aria-expanded="false" aria-controls="language-menu"><svg class="language-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></svg>Languages</button><ul id="language-menu" class="language-menu" role="menu" aria-labelledby="btn-languages" hidden></ul>`;
  const trigger = wrapper.querySelector('button');
  const menu = wrapper.querySelector('ul');
  const options = [];
  [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['zh', '简体中文']].forEach(function ([code, label]) {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'language-option';
    option.setAttribute('role', 'menuitemradio');
    option.setAttribute('aria-checked', String(code === 'en'));
    option.setAttribute('lang', code);
    option.dataset.language = code;
    option.tabIndex = -1;
    option.textContent = label;
    option.addEventListener('click', function () { selectLanguage(code); closeMenu(true); });
    options.push(option);
    li.append(option);
    menu.append(li);
  });
  document.querySelector('.control-btn-group').append(wrapper);
  function selectLanguage(code) {
    language = code;
    document.documentElement.lang = code;
    bindings.forEach(function (binding) {
      const value = code === 'en' ? binding.original : translations[code][binding.id];
      if (binding.attribute) binding.element.setAttribute(binding.attribute, value);
      else binding.node.textContent = code === 'en' ? value :
        (binding.original.match(/^\s*/)[0] + value + binding.original.match(/\s*$/)[0]);
    });
    options.forEach(option => option.setAttribute('aria-checked', String(option.dataset.language === code)));
    updateState();
    updateAnnouncement();
  }
  function focusOption(index) {
    options.forEach((option, i) => { option.tabIndex = i === index ? 0 : -1; });
    options[index].focus();
  }
  function openMenu(index) {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    focusOption(index);
  }
  function closeMenu(restoreFocus) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    options.forEach(option => { option.tabIndex = -1; });
    if (restoreFocus) trigger.focus();
  }
  trigger.addEventListener('click', function () {
    if (menu.hidden) openMenu(options.findIndex(option => option.dataset.language === language));
    else closeMenu(true);
  });
  trigger.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); openMenu(event.key === 'ArrowDown' ? 0 : options.length - 1);
    }
  });
  menu.addEventListener('keydown', function (event) {
    const index = options.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    if (event.key === 'ArrowUp') next = (index + options.length - 1) % options.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = options.length - 1;
    if (next !== undefined) { event.preventDefault(); focusOption(next); }
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    if (event.key === 'Tab') closeMenu(true);
  });
  document.addEventListener('click', event => { if (!wrapper.contains(event.target)) closeMenu(false); });
  wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) closeMenu(false); });
  window.addEventListener('pageshow', function () { selectLanguage('en'); closeMenu(false); });
  selectLanguage('en');
})().catch(function (error) { console.error('Language menu initialization:', error); });

/* Per-view low-vision palettes; no stored preferences. */
(async function () {
  'use strict';
  const response = await fetch('translations.txt');
  if (!response.ok) throw new Error('Contrast translations unavailable');
  const data = (await response.json()).contrast;
  const root = document.documentElement;
  const theme = document.getElementById('btn-light-mode');
  const schemes = ['default', 'yellow-black', 'black-yellow', 'dark-blue', 'white-black', 'black-white'];
  let selected = 'default';
  let announcement = '';
  const style = document.createElement('style');
  style.textContent = `
    .theme-contrast-controls { display:flex; flex-direction:column; gap:1rem; align-items:flex-start; flex:0 1 20rem; min-width:0; max-width:100%; }
    .contrast-control { position:relative; width:100%; min-width:0; max-width:100%; }
    .contrast-control > button { max-width:100%; }
    .contrast-menu { position:absolute; top:100%; left:0; width:100%; margin:.5rem 0 0; padding:.65rem; list-style:none; background:#000; color:#fff; border:.2rem solid #fff; border-radius:.375rem; z-index:60; box-shadow:0 0 0 1px #555,0 3px 8px #0005; }
    .contrast-menu[hidden] { display:none; }
    .contrast-menu li { margin:0; padding:0; }
    .contrast-option { display:block; width:100%; min-width:0; font:inherit; font-weight:700; text-align:left; padding:.6rem; color:#fff; background:#000; border:.125rem solid transparent; border-radius:.2rem; overflow-wrap:anywhere; cursor:pointer; }
    .contrast-option[aria-checked="true"] { border-color:currentColor; text-decoration:underline; text-decoration-thickness:.12em; }
    .contrast-option:hover { text-decoration:underline; }
    html[data-contrast] { --contrast-glow:none; }
    html[data-contrast="yellow-black"] { --contrast-fg:#e8ff00; --contrast-bg:#000; --contrast-glow:0 0 2px #e8ff0040; }
    html[data-contrast="black-yellow"] { --contrast-fg:#000; --contrast-bg:#e8ff00; }
    html[data-contrast="dark-blue"] { --contrast-fg:#e8ff00; --contrast-bg:#0000aa; --contrast-glow:0 0 2px #e8ff0040; }
    html[data-contrast="white-black"] { --contrast-fg:#fff; --contrast-bg:#000; }
    html[data-contrast="black-white"] { --contrast-fg:#000; --contrast-bg:#fff; }
    html[data-contrast] body, html[data-contrast] body * {
      color:var(--contrast-fg)!important; border-color:var(--contrast-fg)!important;
      background-color:var(--contrast-bg)!important; background-image:none!important;
      text-shadow:var(--contrast-glow)!important; box-shadow:none!important;
    }
    html[data-contrast] a { text-decoration:underline!important; text-underline-offset:.15em; }
    html[data-contrast] button, html[data-contrast] input, html[data-contrast] select, html[data-contrast] textarea, html[data-contrast] .resource-download {
      border: max(4px,.25rem) solid var(--contrast-fg)!important; min-height:44px; min-width:44px; max-width:100%; box-sizing:border-box;
    }
    html[data-contrast] a { display:inline-block; min-height:44px; min-width:44px; max-width:100%; overflow-wrap:anywhere; }
    html[data-contrast] .skip-link { z-index:100; }
    html[data-contrast] body :focus-visible { outline:.25rem solid var(--contrast-fg)!important; outline-offset:.35rem!important; }
    html[data-contrast] [role="menuitemradio"][aria-checked="true"] { border-style:double!important; text-decoration:underline!important; }
    html[data-contrast] .theme-switch-track::after { background:var(--contrast-fg)!important; }

    /* Distinct focus, selection, and menu states without changing names or behavior. */
    html { --highlight-accent:#00ffff; --menu-mark-fg:#000; --menu-mark-bg:#fff; }
    html.light-mode { --highlight-accent:#0000aa; }
    html[data-contrast] { --menu-mark-fg:var(--contrast-bg); --menu-mark-bg:var(--contrast-fg); --highlight-accent:#00ffff; }
    html[data-contrast="black-yellow"], html[data-contrast="black-white"] { --highlight-accent:#0000aa; }
    html body :is(a,button,input,select,textarea,[tabindex]):focus-visible:focus {
      outline:.25rem dashed var(--highlight-accent)!important; outline-offset:.65rem!important;
      box-shadow:0 0 0 .2rem #000,0 0 0 .45rem #fff,0 0 0 .65rem #000!important;
    }
    html body ::selection { color:#fff!important; background:#005fcc!important; text-shadow:none!important; }
    html body :is(.language-option,.contrast-option)[aria-checked="true"],
    html body :is(.language-option,.contrast-option):hover {
      color:var(--menu-mark-fg)!important; background-color:var(--menu-mark-bg)!important;
      text-shadow:none!important; border-color:var(--menu-mark-fg)!important;
    }
    html body :is(.language-option,.contrast-option)[aria-checked="true"] {
      border-style:double!important; text-decoration:underline!important; text-decoration-thickness:.15em;
      box-shadow:inset .3rem 0 0 var(--menu-mark-fg)!important;
    }
    html body :is(.language-option,.contrast-option):hover {
      outline:.15rem dashed var(--menu-mark-fg); outline-offset:-.4rem;
    }
    @media (prefers-reduced-motion:reduce), (prefers-contrast:more) {
      html[data-contrast] { --contrast-glow:none; }
    }
  `;
  document.head.append(style);
  const group = document.createElement('div');
  group.className = 'theme-contrast-controls';
  theme.before(group); group.append(theme);
  const wrapper = document.createElement('div');
  wrapper.className = 'contrast-control';
  wrapper.innerHTML = '<button type="button" id="btn-contrast" class="accessible-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="contrast-menu"></button><ul id="contrast-menu" class="contrast-menu" role="menu" aria-labelledby="btn-contrast" hidden></ul>';
  group.append(wrapper);
  const trigger = wrapper.querySelector('button');
  const menu = wrapper.querySelector('ul');
  const live = document.createElement('div');
  live.id = 'contrast-status'; live.className = 'sr-only'; live.setAttribute('role','status'); live.setAttribute('aria-live','polite'); live.setAttribute('aria-atomic','true');
  group.append(live);
  const options = schemes.map(function (scheme) {
    const li = document.createElement('li'); li.setAttribute('role','none');
    const option = document.createElement('button'); option.type='button'; option.className='contrast-option'; option.dataset.scheme=scheme;
    option.setAttribute('role','menuitemradio'); option.tabIndex=-1;
    option.addEventListener('click',function () { select(scheme); close(true); });
    li.append(option); menu.append(li); return option;
  });
  function words() { return data[root.lang] || data.en; }
  function refresh() {
    const t=words(); trigger.textContent=t.button; trigger.setAttribute('aria-label',t.button);
    options.forEach(function (option,i) { option.textContent=t[schemes[i]]; option.setAttribute('aria-label',t[schemes[i]]+', '+t.descriptions[i]); option.setAttribute('aria-checked',String(schemes[i]===selected)); });
    live.textContent=announcement==='changed' ? t.changed.replace('{scheme}',t[selected]) : (announcement ? t[announcement] : '');
  }
  function select(scheme) {
    selected=scheme;
    if(scheme==='default') root.removeAttribute('data-contrast'); else root.dataset.contrast=scheme;
    announcement='changed'; refresh();
  }
  function focusOption(i) { options.forEach((o,j)=>{o.tabIndex=i===j?0:-1;}); options[i].focus(); }
  function open(i) { menu.hidden=false; trigger.setAttribute('aria-expanded','true'); focusOption(i); }
  function close(restore) { menu.hidden=true; trigger.setAttribute('aria-expanded','false'); options.forEach(o=>{o.tabIndex=-1;}); if(restore) trigger.focus(); }
  trigger.addEventListener('click',()=>menu.hidden?open(schemes.indexOf(selected)):close(true));
  trigger.addEventListener('keydown',function(e) { if(e.key==='ArrowDown'||e.key==='ArrowUp') { e.preventDefault(); open(e.key==='ArrowDown'?0:5); } });
  menu.addEventListener('keydown',function(e) {
    const i=options.indexOf(document.activeElement); let next;
    if(e.key==='ArrowDown') next=(i+1)%6; if(e.key==='ArrowUp') next=(i+5)%6;
    if(e.key==='Home') next=0; if(e.key==='End') next=5;
    if(next!==undefined) { e.preventDefault(); focusOption(next); }
    if(e.key==='Escape') {e.preventDefault(); close(true);} if(e.key==='Tab') close(true);
  });
  document.addEventListener('click',e=>{if(!wrapper.contains(e.target)) close(false);});
  wrapper.addEventListener('focusout',e=>{if(!wrapper.contains(e.relatedTarget)) close(false);});
  let returning=false;
  theme.addEventListener('click',function() { returning=selected!=='default'; if(returning) { selected='default'; root.removeAttribute('data-contrast'); } },true);
  theme.addEventListener('click',function() { if(returning) { announcement=theme.getAttribute('aria-checked')==='true'?'light':'dark'; refresh(); returning=false; } });
  new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('pageshow',function() {selected='default';root.removeAttribute('data-contrast');announcement='';refresh();close(false);});
  root.removeAttribute('data-contrast'); refresh();
})().catch(function(error){console.error('Contrast menu initialization:',error);});

// Keep the display panel in the same compact vertical layout at every width.
(function () {
  const panelLayout = document.createElement('style');
  panelLayout.textContent = `
.font-control-region { width: fit-content; max-width: 100%; box-sizing: border-box; }
.font-control-region .control-btn-group { display: flex; flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: 1rem; width: 22rem; max-width: 100%; }
.font-control-region .theme-contrast-controls { flex: none; width: 100%; align-items: stretch; gap: 1rem; }
.font-control-region .language-control { flex: none; width: 100%; align-self: stretch; }
.font-control-region .control-btn-group > button,
.font-control-region .theme-contrast-controls > button,
.font-control-region .contrast-control > button,
.font-control-region .language-control > button { width: 100%; box-sizing: border-box; }
`;
  document.head.appendChild(panelLayout);
})();
// Larger desktop reading column; phone layout and user scale steps stay unchanged.
(function () {
  const root = document.documentElement;
  const desktopLayout = document.createElement('style');
  desktopLayout.textContent = `
@media (min-width: 768px) {
  html { font-size: calc(125% * var(--desktop-text-scale, 1)) !important; }
  .container { width: 84%; max-width: 1200px; }
}
`;
  function syncDesktopScale() {
    const scale = (parseFloat(root.style.fontSize) || 100) / 100;
    const value = String(scale);
    if (root.style.getPropertyValue('--desktop-text-scale') !== value) {
      root.style.setProperty('--desktop-text-scale', value);
    }
  }
  syncDesktopScale();
  new MutationObserver(syncDesktopScale).observe(root, { attributes: true, attributeFilter: ['style'] });
  document.head.appendChild(desktopLayout);
})();
