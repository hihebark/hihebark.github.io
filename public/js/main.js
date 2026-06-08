'use strict';

const GH = 'hihebark';
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Avatar pixel-block dissolve ─────────────────────
(function initAvatarPixels() {
  const wrap = document.querySelector('.avatar-wrap');
  if (!wrap) return;
  const imgEl = wrap.querySelector('.avatar-original');
  if (!imgEl) return;

  const COLS = 8, ROWS = 8;
  const BW = 160 / COLS, BH = 160 / ROWS;

  const overlay = document.createElement('div');
  overlay.className = 'avatar-pixel-overlay';
  wrap.appendChild(overlay);

  const blocks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const el = document.createElement('div');
      el.className = 'pxb';
      el.style.left  = (c * BW) + 'px';
      el.style.top   = (r * BH) + 'px';
      el.style.width  = BW + 'px';
      el.style.height = BH + 'px';
      overlay.appendChild(el);
      blocks.push({ el, delay: (Math.random() * 0.42).toFixed(3) + 's' });
    }
  }

  function applyColors(src) {
    const canvas = document.createElement('canvas');
    canvas.width = COLS; canvas.height = ROWS;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, COLS, ROWS);
      const mix = 0.55; // blend toward #00ff7e
      blocks.forEach(({ el }, i) => {
        const [rv, g, b] = ctx.getImageData(i % COLS, Math.floor(i / COLS), 1, 1).data;
        const r2 = Math.round(rv * (1 - mix));
        const g2 = Math.round(g  * (1 - mix) + 255 * mix);
        const b2 = Math.round(b  * (1 - mix) + 126 * mix);
        el.style.setProperty('--c', `rgb(${r2},${g2},${b2})`);
      });
      overlay.style.opacity = '1';
    };
    img.src = src;
  }

  if (imgEl.complete && imgEl.naturalWidth) applyColors(imgEl.src);
  else imgEl.addEventListener('load', () => applyColors(imgEl.src), { once: true });

  const logo = wrap.closest('.logo');
  logo.addEventListener('mouseenter', () => {
    blocks.forEach(({ el, delay }) => {
      el.style.transitionDelay = delay;
      el.style.opacity   = '0';
      el.style.transform = 'scale(0)';
    });
  });
  logo.addEventListener('mouseleave', () => {
    blocks.forEach(({ el }) => {
      el.style.transitionDelay = '0s';
      el.style.opacity   = '1';
      el.style.transform = 'scale(1)';
    });
  });
})();

// ── Static green smear decoration ─────────────────────
function mkRand(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000; };
}

function drawSmear(canvas, fromTop = false, seed = 1, fromRight = false) {
  const BLOCK = 10;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const maxRows = Math.ceil(H / BLOCK);
  const rand = mkRand(seed);

  let x = fromRight ? W : 0;
  const done = () => fromRight ? x <= 0 : x >= W;
  while (!done()) {
    const wBlocks = Math.floor(rand() * 5);
    if (wBlocks > 0) {
      const w = fromRight ? Math.min(wBlocks * BLOCK, x) : Math.min(wBlocks * BLOCK, W - x);
      const rows = Math.max(1, Math.floor(Math.pow(rand(), 0.45) * maxRows));
      const opacity = 0.2 + rand() * 0.35;
      const drawX = fromRight ? x - w : x;
      ctx.fillStyle = `rgba(0,255,126,${opacity})`;
      ctx.fillRect(drawX, fromTop ? 0 : H - rows * BLOCK, w, rows * BLOCK);
      if (rand() < 0.35) {
        ctx.fillStyle = `rgba(0,255,126,${opacity * 0.35})`;
        ctx.fillRect(drawX, fromTop ? rows * BLOCK : H - (rows + 1) * BLOCK, w, BLOCK);
      }
      x += fromRight ? -w : w;
    } else {
      x += fromRight ? -BLOCK : BLOCK;
    }
  }
}

(function initSidebarPixels() {
  const container = document.querySelector('.sidebar-left');
  if (!container) return;
  container.style.position = 'relative';

  const W = container.offsetWidth;
  const H = container.offsetHeight;
  if (H < 20) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;bottom:0;left:0;pointer-events:none;';
  canvas.width  = W;
  canvas.height = 65;
  container.appendChild(canvas);
  drawSmear(canvas, false, 73);

  const dp = document.querySelector('.sidebar-pixels');
  if (dp) {
    const dpCanvas = document.createElement('canvas');
    dpCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
    dpCanvas.width  = dp.offsetWidth;
    dpCanvas.height = 55;
    dp.appendChild(dpCanvas);
    drawSmear(dpCanvas, true, 157);
  }
})();

(function initSectionSmear() {
  const container = document.querySelector('.content-col');
  if (!container) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;bottom:0;left:0;pointer-events:none;';
  canvas.width  = container.offsetWidth;
  canvas.height = 65;
  container.insertBefore(canvas, container.firstChild);
  drawSmear(canvas, false, 241);
})();

(function initSectionTopSmear() {
  const container = document.querySelector('.content-col');
  if (!container) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;right:0;pointer-events:none;';
  canvas.width  = 200;
  canvas.height = 60;
  container.insertBefore(canvas, container.firstChild);
  drawSmear(canvas, true, 389, true);
})();

// ── Pixel-block hover (nav + sidebar) ───────────────
function pixelLinks(selector) {
  const BLOCK = 8;
  document.querySelectorAll(selector).forEach(link => {
    link.innerHTML = `<span class="nav-text">${link.innerHTML}</span>`;
    const overlay = document.createElement('div');
    overlay.className = 'nav-pixel-overlay';
    link.appendChild(overlay);
    link.classList.add('px-ready');

    const W = link.offsetWidth || 80;
    const H = link.offsetHeight || 34;
    const cols = Math.ceil(W / BLOCK);
    const rows = Math.ceil(H / BLOCK);

    const blocks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'nav-pxb';
        el.style.left   = (c * BLOCK) + 'px';
        el.style.top    = (r * BLOCK) + 'px';
        el.style.width  = BLOCK + 'px';
        el.style.height = BLOCK + 'px';
        overlay.appendChild(el);
        blocks.push({ el, delay: (Math.random() * 0.18).toFixed(3) + 's' });
      }
    }

    link.addEventListener('mouseenter', () => {
      blocks.forEach(({ el, delay }) => {
        el.style.transitionDelay = delay;
        el.style.opacity   = '1';
        el.style.transform = 'scale(1)';
      });
    });
    link.addEventListener('mouseleave', () => {
      blocks.forEach(({ el }) => {
        el.style.transitionDelay = '0s';
        el.style.opacity   = '0';
        el.style.transform = 'scale(0)';
      });
    });
  });
}
pixelLinks('nav a:not(.active)');
pixelLinks('.sidebar-social a');

// ── Interactive dots on mouse move ──────────────────
const overlay = document.createElement('div');
overlay.className = 'dot-overlay';
document.body.insertBefore(overlay, document.body.firstChild);

let rafPending = false;
document.addEventListener('mousemove', (e) => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    overlay.style.setProperty('--mx', e.clientX + 'px');
    overlay.style.setProperty('--my', e.clientY + 'px');
    rafPending = false;
  });
}, { passive: true });

// ── Scroll fade indicator ───────────────────────────
const mainEl = document.querySelector('main');
if (mainEl) {
  const contentCol = mainEl.closest('.content-col');
  const checkFade = () => {
    const hasMore = mainEl.scrollTop < mainEl.scrollHeight - mainEl.clientHeight - 4;
    contentCol?.classList.toggle('has-overflow', hasMore);
  };
  mainEl.addEventListener('scroll', checkFade, { passive: true });
  checkFade();
}

// ── Status clock ────────────────────────────────────
const clockEl = document.getElementById('status-clock');
if (clockEl) {
  const tick = () => {
    clockEl.textContent = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Africa/Algiers',
    });
  };
  tick();
  setInterval(tick, 1000);
}

// ── Copy email ──────────────────────────────────────
document.querySelectorAll('.copy-email').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.email).then(() => {
      const orig = btn.textContent;
      btn.textContent = '[copied]';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
      const orig = btn.textContent;
      btn.textContent = '[failed]';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });
});

// ── Scroll Reveal ──────────────────────────────────
document.querySelectorAll('.cards, .bento-grid').forEach(grid => {
  grid.querySelectorAll('.card').forEach((card, i) => {
    card.classList.add('reveal');
    card.dataset.delay = `${i * 0.06}s`;
  });
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
if (termEl) {
  const body    = termEl.querySelector('.terminal-body');
  const mainEl  = termEl.closest('main');
  let ghData    = null;
  let contribs  = null;
  let ghErr     = null;
  let contribErr = null;
  let inputWrap = null;
  let inputEl   = null;
  const hist    = [];
  let histIdx   = -1;

  const scroll = () => {
    if (mainEl) mainEl.scrollTop = mainEl.scrollHeight;
  };

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

  // ── Fetch with 5 s timeout ──────────────────────
  function fetchWithTimeout(url, ms = 5000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
  }

  // ── GitHub user fetch ───────────────────────────
  async function fetchGH() {
    try {
      const res = await fetchWithTimeout(`https://api.github.com/users/${GH}`);
      const d = await res.json();
      if (!d.message) ghData = d;
    } catch (e) {
      ghErr = e.name === 'AbortError' ? 'timeout' : 'unavailable';
    }
  }

  // ── Contributions fetch ─────────────────────────
  async function fetchContribs() {
    try {
      const res = await fetchWithTimeout(`https://github-contributions-api.jogruber.de/v4/${GH}?y=last`);
      const d = await res.json();
      contribs = d;
    } catch (e) {
      contribErr = e.name === 'AbortError' ? 'timeout' : 'unavailable';
    }
  }

  // ── Sparkline renderer ──────────────────────────
  function sparkline(weeks = 16) {
    if (!contribs?.contributions) return null;
    const w = Math.min(weeks, Math.floor(contribs.contributions.length / 7));
    if (w === 0) return null;
    const days = contribs.contributions.slice(-(w * 7));
    const totals = [];
    for (let i = 0; i < w; i++) {
      totals.push(days.slice(i * 7, i * 7 + 7).reduce((s, d) => s + d.count, 0));
    }
    const max = Math.max(...totals, 1);
    const bars = ' ▁▂▃▄▅▆▇█';
    return { graph: totals.map(v => bars[Math.round((v / max) * 8)]).join(''), weeks: w };
  }

  function contribLines() {
    const result = sparkline();
    if (!result) return null;
    const total = contribs.total?.lastYear ?? Object.values(contribs.total ?? {})[0] ?? '?';
    return [
      `last ${result.weeks}w  <span style="letter-spacing:2px">${result.graph}</span>`,
      `total     ${total} contributions this year`,
    ];
  }

  // ── Input ───────────────────────────────────────
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

  // ── Commands ────────────────────────────────────
  const cmds = {
    help: () => out([
      'commands:',
      '&nbsp; whoami   &mdash; about me',
      '&nbsp; skills   &mdash; tech stack',
      '&nbsp; projects &mdash; open source work',
      '&nbsp; contact  &mdash; get in touch',
      '&nbsp; github   &mdash; stats &amp; contributions',
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
      'more &rarr; <a href="/projects">~/Projects</a>',
    ]),
    contact: () => out([
      'email    <a href="mailto:n.amara@protonmail.ch">n.amara@protonmail.ch</a>',
      'github   <a href="https://github.com/hihebark">github.com/hihebark</a>',
      'linkedin <a href="https://www.linkedin.com/in/nezliamara/">linkedin.com/in/nezliamara</a>',
      'x        <a href="https://twitter.com/virtualstruct">@virtualstruct</a>',
    ]),
    github: () => {
      const lines = [];
      if (ghData) {
        lines.push(
          `public_repos  ${ghData.public_repos}`,
          `followers     ${ghData.followers}`,
          `following     ${ghData.following}`,
          `member since  ${new Date(ghData.created_at).getFullYear()}`,
        );
      } else if (ghErr) {
        lines.push(`github api: ${ghErr}`);
      }
      const cl = contribLines();
      if (cl) { lines.push('', ...cl); }
      else if (contribErr) { lines.push(`contributions: ${contribErr}`); }
      if (!lines.length) lines.push(`<a href="https://github.com/${GH}">github.com/${GH}</a>`);
      else lines.push('', `<a href="https://github.com/${GH}">github.com/${GH}</a>`);
      return out(lines);
    },
    clear: () => {
      Array.from(body.children).forEach(el => { if (el !== inputWrap) el.remove(); });
    },
  };

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function handle(cmd) {
    const fn = cmds[cmd];
    fn ? fn() : out([`command not found: ${esc(cmd)} &mdash; type <span class="g">help</span>`]);
  }

  let _slashHandler = null;

  // ── Autoplay ────────────────────────────────────
  async function autoplay() {
    const allFetches = Promise.all([fetchGH(), fetchContribs()]);
    await delay(500);
    await typeLine('whoami');
    hist.unshift('whoami');
    await cmds.whoami();
    line('', 'tdim');
    await typeLine('github');
    hist.unshift('github');
    await allFetches;
    await cmds.github();
    line('', 'tdim');
    line('// interactive &mdash; type <span class="g">help</span> to explore', 'tdim');
    enableInput();

    if (_slashHandler) document.removeEventListener('keydown', _slashHandler);
    _slashHandler = e => {
      if (e.key === '/' && document.activeElement !== inputEl) {
        e.preventDefault();
        inputEl.focus();
      }
    };
    document.addEventListener('keydown', _slashHandler);
  }

  autoplay();
}

// ── Status line clock ─────────────────────────────────
(function initStatusClock() {
  const el = document.getElementById('status-time');
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  };
  tick();
  setInterval(tick, 10000);
})();

// ── Sidebar hex address decoration ────────────────────
(function initSidebarHex() {
  const container = document.querySelector('.sidebar-pixels');
  if (!container) return;

  const lines = [
    '0xFF7E00', '0xDEADC0', '0xBEEF42', '0xC0DE99',
    '0x00FF7E', '0xCAFE01', '0xF00D3E', '0xBADC0D',
    '0xACE1AF', '0x1337FF',
  ];

  const el = document.createElement('div');
  el.style.cssText = [
    'position:absolute',
    'top:60px',
    'left:0',
    'right:0',
    'bottom:70px',
    'display:flex',
    'flex-direction:column',
    'justify-content:center',
    'align-items:center',
    'gap:6px',
    'pointer-events:none',
    'overflow:hidden',
  ].join(';');

  lines.forEach((addr, i) => {
    const row = document.createElement('div');
    row.textContent = addr;
    row.style.cssText = [
      'font-family:monospace',
      'font-size:9px',
      'letter-spacing:1px',
      `color:rgba(0,255,126,${0.08 + (i % 3) * 0.04})`,
      'white-space:nowrap',
    ].join(';');
    el.appendChild(row);
  });

  container.appendChild(el);
})();

// ── Custom block cursor ────────────────────────────────
(function initCursor() {
  const el = document.getElementById('crt-cursor');
  if (!el) return;
  document.addEventListener('mousemove', e => {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', () => el.style.opacity = '0');
  document.addEventListener('mouseenter', () => el.style.opacity = '');
})();

// ── Page transitions ───────────────────────────────────
(function initPageTransitions() {
  const col = document.querySelector('.content-col');
  if (!col) return;
  col.classList.add('page-enter');
  col.addEventListener('animationend', () => col.classList.remove('page-enter'), { once: true });

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
      if (link.classList.contains('active')) return;
      e.preventDefault();
      const href = link.href;
      col.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      col.style.opacity    = '0';
      col.style.transform  = 'translateY(-4px)';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
})();
