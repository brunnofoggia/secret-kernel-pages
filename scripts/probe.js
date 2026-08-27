/* The layout checks, in one place.
 *
 * Two harnesses run this: scripts/verify.mjs (Playwright, used by CI and by any
 * machine with a working Linux Chromium) and scripts/verify.py (Windows Chrome,
 * used on this WSL box where Playwright's browser cannot start). Keeping the
 * assertions here means the two harnesses cannot drift apart on *what* they
 * check — only on how they open a browser.
 *
 * Returns a plain object; it never throws, so a harness can report rather than
 * crash. The judgement of pass/fail lives in the harness.
 */
window.__probe = function () {
  var de = document.documentElement;
  var out = { inner: window.innerWidth, overflow: de.scrollWidth - de.clientWidth };

  /* Anything sticking out past the viewport, except containers that are meant
     to scroll internally (code blocks and wide tables). */
  var wide = [];
  document.querySelectorAll('body *').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (!r.width) return;
    if (r.right <= de.clientWidth + 1.5 && r.left >= -1.5) return;
    var cs = getComputedStyle(el);
    if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
    if (el.closest('pre, .table-wrap')) return;
    wide.push(el.tagName.toLowerCase()
      + (el.className ? '.' + String(el.className).split(' ')[0] : '')
      + '[' + Math.round(r.left) + '-' + Math.round(r.right) + ']');
  });
  out.offenders = wide.slice(0, 8);

  function visible(sel) {
    return Array.prototype.filter.call(document.querySelectorAll(sel),
      function (e) { return e.offsetParent !== null; });
  }

  /* Both toggles must actually swap content, not just flip an attribute. */
  var startLang = de.getAttribute('data-lang');
  var startCode = de.getAttribute('data-code');

  var enH1 = document.querySelector('h1').innerText.trim();
  de.setAttribute('data-lang', startLang === 'pt' ? 'en' : 'pt');
  var otherH1 = document.querySelector('h1').innerText.trim();
  out.langSwaps = !!otherH1 && enH1 !== otherH1;
  de.setAttribute('data-lang', startLang);

  var first = visible('.code pre')[0];
  var firstText = first ? first.innerText.slice(0, 60) : '';
  de.setAttribute('data-code', startCode === 'ts' ? 'py' : 'ts');
  var second = visible('.code pre')[0];
  var secondText = second ? second.innerText.slice(0, 60) : '';
  out.codeSwaps = !!secondText && firstText !== secondText;
  de.setAttribute('data-code', startCode);

  /* Smallest font actually rendered for text — the design spec sets 12px as the
     floor for labels. */
  var min = 999, minEl = '';
  document.querySelectorAll('p,li,td,th,span,code,a,button,div,h1,h2,h3,h4').forEach(function (el) {
    if (el.children.length || !el.textContent.trim()) return;
    if (el.offsetParent === null) return;
    var px = parseFloat(getComputedStyle(el).fontSize);
    if (px < min) { min = px; minEl = el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]; }
  });
  out.minFont = Math.round(min * 100) / 100;
  out.minFontEl = minEl;

  /* Interactive targets under 24px tall fail WCAG 2.2 AA (Target Size Minimum). */
  var small = [];
  document.querySelectorAll('button, .masthead nav a, .dist, .footer-col a').forEach(function (el) {
    if (el.offsetParent === null) return;
    var r = el.getBoundingClientRect();
    if (r.height && r.height < 24) {
      small.push((el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase())
        + ':' + Math.round(r.height));
    }
  });
  out.shortTargets = small.slice(0, 8);

  /* The built page must carry the sprite, not the placeholder, and every <use>
     must resolve to a symbol that exists. */
  var symbols = {};
  document.querySelectorAll('symbol[id]').forEach(function (s) { symbols[s.id] = true; });
  var brokenUses = [];
  document.querySelectorAll('use[href^="#"]').forEach(function (u) {
    var id = u.getAttribute('href').slice(1);
    if (!symbols[id]) brokenUses.push(id);
  });
  out.symbols = Object.keys(symbols).length;
  out.brokenUses = brokenUses.slice(0, 8);

  out.copyButtons = document.querySelectorAll('.copy').length;
  return out;
};
