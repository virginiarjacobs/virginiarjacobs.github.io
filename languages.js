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
