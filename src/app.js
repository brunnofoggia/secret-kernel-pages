/* Secret Kernel — page behaviour.
 *
 * Four small things, no framework: the two toggles, their persistence, a copy
 * button per code block, and nav highlighting. The toggles themselves are pure
 * CSS (see styles.css); this only flips an attribute on <html>, so the page is
 * fully readable with JavaScript disabled — it simply stays on the defaults.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  var TOGGLES = {
    lang: { attr: 'data-lang', key: 'sk.lang', prop: 'setLang', valid: ['en', 'pt'] },
    code: { attr: 'data-code', key: 'sk.code', prop: 'setCode', valid: ['py', 'ts'] }
  };

  var LOCALE = { en: 'en', pt: 'pt-BR' };

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* private mode, blocked storage — the toggle still works for this visit */
    }
  }

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function apply(name, value) {
    var t = TOGGLES[name];
    if (!t || t.valid.indexOf(value) === -1) return;

    root.setAttribute(t.attr, value);
    if (name === 'lang') root.lang = LOCALE[value];

    var buttons = document.querySelectorAll('[' + attrSelector(t.prop) + ']');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].dataset[t.prop] === value));
    }
    store(t.key, value);
  }

  function attrSelector(prop) {
    return 'data-' + prop.replace(/[A-Z]/g, function (c) {
      return '-' + c.toLowerCase();
    });
  }

  Object.keys(TOGGLES).forEach(function (name) {
    var t = TOGGLES[name];
    var selector = '[' + attrSelector(t.prop) + ']';

    document.querySelectorAll(selector).forEach(function (button) {
      button.addEventListener('click', function () {
        apply(name, button.dataset[t.prop]);
      });
    });

    /* Reconcile from storage when there is a stored choice, otherwise from the
     * attribute already on <html>. Without the fallback, a page shipped with a
     * different default would render that default while the buttons still
     * claimed the old one. */
    var saved = read(t.key);
    apply(name, saved && t.valid.indexOf(saved) !== -1 ? saved : root.getAttribute(t.attr));
  });

  /* ── copy buttons ──────────────────────────────────────────────────────
   * Added from script rather than markup: without a clipboard there is
   * nothing for the button to do, so it should not be in the document.
   */
  var canCopy = navigator.clipboard && typeof navigator.clipboard.writeText === 'function';

  if (canCopy) {
    document.querySelectorAll('.code').forEach(function (block) {
      var bar = block.querySelector('.code-bar');
      if (!bar) return;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy';
      button.textContent = copyLabel();
      button.setAttribute('aria-label', copyLabel());

      bar.appendChild(button);

      button.addEventListener('click', function () {
        /* Only the sample currently shown by the code toggle. */
        var visible = Array.prototype.filter.call(block.querySelectorAll('pre'), function (pre) {
          return pre.offsetParent !== null;
        })[0];
        if (!visible) return;

        navigator.clipboard.writeText(visible.innerText.trim()).then(function () {
          button.dataset.copied = 'true';
          button.textContent = doneLabel();
          setTimeout(function () {
            delete button.dataset.copied;
            button.textContent = copyLabel();
          }, 1600);
        }).catch(function () {
          button.textContent = failLabel();
          setTimeout(function () { button.textContent = copyLabel(); }, 1600);
        });
      });
    });
  }

  function copyLabel() { return root.getAttribute('data-lang') === 'pt' ? 'copiar' : 'copy'; }
  function doneLabel() { return root.getAttribute('data-lang') === 'pt' ? 'copiado' : 'copied'; }
  function failLabel() { return root.getAttribute('data-lang') === 'pt' ? 'falhou' : 'failed'; }

  /* ── nav highlighting ─────────────────────────────────────────────────── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.masthead nav a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (targets.length && 'IntersectionObserver' in window) {
    var current = null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (current === entry.target.id) return;
        current = entry.target.id;

        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + current;
          if (on) {
            a.setAttribute('aria-current', 'true');
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    targets.forEach(function (t) { observer.observe(t); });
  }
})();
