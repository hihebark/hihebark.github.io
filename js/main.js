'use strict';

const GH = 'hihebark';
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Scroll Reveal ──────────────────────────────────
document.querySelectorAll('.cards .card').forEach((card, i) => {
  card.classList.add('reveal');
  card.dataset.delay = `${i * 0.06}s`;
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = e.target.dataset.delay || '0s';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Terminal ────────────────────────────────────────
const termEl = document.querySelector('.terminal');
if (!termEl) { /* no terminal on this page */ }
else {
  const body   = termEl.querySelector('.terminal-body');
  let ghData   = null;
  let inputWrap = null;
  let inputEl  = null;
  const hist   = [];
  let histIdx  = -1;

  const scroll = () => { body.scrollTop = body.scrollHeight; };

  function line(html = '', cls = '') {
    const p = document.createElement('p');
    p.innerHTML = html;
    if (cls) p.className = cls;
    inputWrap ? body.insertBefore(p, inputWrap) : body.appendChild(p);
    scroll();
    return p;
  }

  async function typeInto(el, text, speed = 36) {
    for (const ch of text) {
      el.textContent += ch;
      await delay(speed + Math.random() * 14);
    }
  }

  async function typeLine(text) {
    const p = line('', 'tline');
    p.textContent = '$ ';
    await typeInto(p, text);
    await delay(140);
  }

  async function out(lines, gap = 45) {
    for (const l of lines) { await delay(gap); line(l, 'tout'); }
    await delay(90);
  }

  async function fetchGH() {
    try {
      const res = await fetch(`https://api.github.com/users/${GH}`);
      const d = await res.json();
      if (!d.message) ghData = d;
    } catch { /* network error */ }
  }

  function enableInput() {
    const wrap = document.createElement('div');
    wrap.className = 'input-line';
    wrap.innerHTML = `<span class="ps">$&nbsp;</span><input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">`;
    body.appendChild(wrap);
    inputWrap = wrap;
    inputEl   = wrap.querySelector('input');
    scroll();

    inputEl.addEventListener('keydown', onKey);
    termEl.addEventListener('click', () => inputEl.focus());
    setTimeout(() => inputEl.focus(), 50);
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      const cmd = inputEl.value.trim();
      inputEl.value = '';
      histIdx = -1;
      if (!cmd) return;
      hist.unshift(cmd);
      line(`$ ${cmd}`, 'tline');
      handle(cmd.toLowerCase());
      scroll();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < hist.length - 1) inputEl.value = hist[++histIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx > 0 ? (inputEl.value = hist[--histIdx]) : (histIdx = -1, inputEl.value = '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = inputEl.value.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(cmds).find(k => k.startsWith(partial));
      if (match) inputEl.value = match;
    }
  }

  const cmds = {
    help:  () => out([
      'commands:',
      '&nbsp; whoami   &mdash; about me',
      '&nbsp; skills   &mdash; tech stack',
      '&nbsp; projects &mdash; open source work',
      '&nbsp; contact  &mdash; get in touch',
      '&nbsp; github   &mdash; stats',
      '&nbsp; clear    &mdash; clear screen',
    ]),
    whoami: () => out([
      'amara nezli &mdash; backend developer',
      'nestjs &middot; laravel &middot; node.js &middot; go',
      '5+ years building production systems',
    ]),
    skills: () => out([
      'languages:  php, node.js, typescript, python, go',
      'databases:  mysql, postgresql, mongodb, redis',
      'devops:     docker, linux, aws, gcp, ci/cd',
      'other:      rest apis, websockets, agile',
    ]),
    projects: () => out([
      '<a href="https://github.com/hihebark/bevor">bevor</a>       &mdash; http request validator         [go]',
      '<a href="https://hihebark.github.io/vimd/">vimd</a>        &mdash; in-browser markdown previewer  [js]',
      '<a href="https://github.com/hihebark/horcrux-js">horcrux-js</a>  &mdash; shamir secret sharing cli      [node]',
      '<a href="https://github.com/hihebark/godirsearch">godirsearch</a> &mdash; web path enumeration tool      [go]',
      '<a href="https://github.com/hihebark/Duxe">duxe</a>        &mdash; recon &amp; info gathering        [go]',
      '',
      'more &rarr; <a href="/projects.html">~/Projects</a>',
    ]),
    contact: () => out([
      'email    <a href="mailto:n.amara@protonmail.ch">n.amara@protonmail.ch</a>',
      'github   <a href="https://github.com/hihebark">github.com/hihebark</a>',
      'linkedin <a href="https://www.linkedin.com/in/nezliamara/">linkedin.com/in/nezliamara</a>',
      'x        <a href="https://twitter.com/virtualstruct">@virtualstruct</a>',
    ]),
    github: () => {
      if (ghData) return out([
        `public_repos  ${ghData.public_repos}`,
        `followers     ${ghData.followers}`,
        `following     ${ghData.following}`,
        `member since  ${new Date(ghData.created_at).getFullYear()}`,
        '',
        `<a href="https://github.com/${GH}">github.com/${GH}</a>`,
      ]);
      return out([`<a href="https://github.com/${GH}">github.com/${GH}</a>`]);
    },
    clear: () => {
      Array.from(body.children).forEach(el => { if (el !== inputWrap) el.remove(); });
    },
  };

  function handle(cmd) {
    const fn = cmds[cmd];
    fn ? fn() : out([`command not found: ${cmd} &mdash; type <span class="g">help</span>`]);
  }

  async function autoplay() {
    const ghFetch = fetchGH();

    await delay(500);
    await typeLine('whoami');
    await out([
      'amara nezli &mdash; backend developer',
      'nestjs &middot; laravel &middot; node.js &middot; go',
    ]);

    await typeLine(`curl -s api.github.com/users/${GH}`);
    const loading = line('<span class="tdim">fetching...</span>');
    await ghFetch;
    loading.remove();
    if (ghData) {
      await out([
        `public_repos  ${ghData.public_repos}`,
        `followers     ${ghData.followers}`,
        `member since  ${new Date(ghData.created_at).getFullYear()}`,
      ], 60);
    } else {
      await out([`<a href="https://github.com/${GH}">github.com/${GH}</a>`]);
    }

    await typeLine('echo $STATUS');
    await out(['&#9679; available for collaboration']);

    enableInput();
  }

  autoplay();
}
