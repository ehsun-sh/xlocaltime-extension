/* X Localtime - rewrites times on a page into the local timezone */
(function () {
  'use strict';

  if (window.__localTimeLoaded) return;
  window.__localTimeLoaded = true;

  const DEFAULTS = {
    lang: 'auto',
    enabled: true,
    originalTz: 'Asia/Tehran',
    localTz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC',
    mode: 'replace',         // 'replace' = local time only | 'both' = original + converted
    scope: 'list',           // 'list' = listed sites only | 'all' = every site
    sites: ['varzesh3.com'],
    hour12: false,
    showDayShift: true,
    highlight: true,
    strict: true,            // only likelier patterns, so scores are left alone
    forceSafe: false,        // always compatibility mode (never add elements)
    ignoreSelectors: ''
  };

  const DIGIT = '0-9\\u06F0-\\u06F9\\u0660-\\u0669';
  // A time: HH:MM in Latin/Persian/Arabic digits, with an optional meridiem
  const TIME_RE = new RegExp(
    '(?<![' + DIGIT + ':.\\u066B/-])' +
    '([' + DIGIT + ']{1,2})\\s*[:\\u066B]\\s*([' + DIGIT + ']{2})' +
    '(?![' + DIGIT + ':.\\u066B/-])' +
    '(\\s*(?:am|pm|a\\.m\\.|p\\.m\\.|صبح|ظهر|عصر|شب|بعدازظهر|بعد از ظهر))?',
    'gi'
  );

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
    'CODE', 'PRE', 'SVG', 'CANVAS', 'IFRAME', 'TITLE', 'HEAD'
  ]);

  /*
   * Keys frameworks attach to DOM elements.
   * The DOM structure under such elements must not change: the framework
   * keeps a reference to the very same text node, so replacing it with a
   * <span> corrupts the tree on the next render - which is how a slider
   * ends up dead.
   */
  const FRAMEWORK_KEY = /^(__reactFiber\$|__reactProps\$|__reactContainer\$|__reactInternalInstance\$|_reactRootContainer$|__vue__$|__vue_app__$|__vueParentComponent$|__svelte)/;

  let cfg = Object.assign({}, DEFAULTS);
  let active = false;
  let observer = null;
  let pending = null;

  // State of text nodes rewritten in place by compatibility mode
  let textState = new WeakMap();   // Text -> { original, converted }
  let textRecords = [];            // used to restore the originals

  /* ---------- Helpers ---------- */

  function hostMatches(list) {
    const host = location.hostname.toLowerCase().replace(/^www\./, '');
    return (list || []).some((raw) => {
      const s = String(raw).trim().toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/.*$/, '');
      if (!s) return false;
      return host === s || host.endsWith('.' + s);
    });
  }

  function shouldRun() {
    if (!cfg.enabled) return false;
    if (!LTZ.isValidTz(cfg.originalTz) || !LTZ.isValidTz(cfg.localTz)) return false;
    if (cfg.originalTz === cfg.localTz) return false;
    if (cfg.scope === 'all') return true;
    return hostMatches(cfg.sites);
  }

  function isInsideIgnored(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.isContentEditable) return true;
      if (el.dataset && el.dataset.ltDone === '1') return true;
      if (el.classList && el.classList.contains('lt-time')) return true;
    }
    const sel = (cfg.ignoreSelectors || '').trim();
    if (sel) {
      try {
        if (node.parentElement && node.parentElement.closest(sel)) return true;
      } catch (e) { /* invalid selector - ignore */ }
    }
    return false;
  }

  /* ---------- Detecting framework-managed elements ---------- */

  const managedCache = new WeakMap();

  function hasFrameworkKey(el) {
    const keys = Object.keys(el);
    for (let i = 0; i < keys.length; i++) {
      if (FRAMEWORK_KEY.test(keys[i])) return true;
    }
    return false;
  }

  function isManaged(el) {
    if (!el) return false;
    const cached = managedCache.get(el);
    if (cached !== undefined) return cached;

    let found = false;
    let depth = 0;
    for (let e = el; e && depth < 25; e = e.parentElement, depth++) {
      if (hasFrameworkKey(e)) { found = true; break; }
    }
    managedCache.set(el, found);
    return found;
  }

  /* ---------- Conversion ---------- */

  function buildReplacement(match, hourRaw, minRaw, suffixRaw) {
    const style = LTZ.detectDigitStyle(hourRaw + minRaw);
    let h = parseInt(LTZ.toEnDigits(hourRaw), 10);
    const m = parseInt(LTZ.toEnDigits(minRaw), 10);
    if (!isFinite(h) || !isFinite(m) || m > 59) return null;

    const suffix = (suffixRaw || '').trim().toLowerCase();
    const isPm = /^(pm|p\.m\.|عصر|شب|بعدازظهر|بعد از ظهر)$/.test(suffix);
    const isAm = /^(am|a\.m\.|صبح)$/.test(suffix);

    if (isPm || isAm) {
      if (h < 1 || h > 12) return null;
      if (isPm && h !== 12) h += 12;
      if (isAm && h === 12) h = 0;
    } else if (h > 23) {
      return null;
    }

    // Strict mode: keeps things like the score "2:1" from being converted
    if (cfg.strict && !suffix) {
      const twoDigitHour = LTZ.toEnDigits(hourRaw).length === 2;
      const roundMinute = m % 5 === 0;
      if (!twoDigitHour && !roundMinute) return null;
      if (!twoDigitHour && h > 9) return null;
    }

    const r = LTZ.convertTime(h, m, cfg.originalTz, cfg.localTz);
    let out = LTZ.formatTime(r.hour, r.minute, {
      hour12: cfg.hour12,
      amText: 'AM',
      pmText: 'PM'
    });
    out = LTZ.toDigitStyle(out, style);

    if (cfg.showDayShift && r.dayShift !== 0) {
      const sign = r.dayShift > 0 ? '+' : '−';
      out += ' (' + sign + LTZ.toDigitStyle(Math.abs(r.dayShift), style) +
        ' ' + LTI18N.t('dayUnit') + ')';
    }
    return { text: out, original: match.trim() };
  }

  /* ---------- Compatibility mode: rewrite in place, no structural change ---------- */

  function convertString(text) {
    TIME_RE.lastIndex = 0;
    let out = '';
    let last = 0;
    let changed = false;
    let match;

    while ((match = TIME_RE.exec(text)) !== null) {
      const res = buildReplacement(match[0], match[1], match[2], match[3]);
      if (!res) continue;
      out += text.slice(last, match.index);
      out += cfg.mode === 'both' ? res.original + ' ' + res.text : res.text;
      last = match.index + match[0].length;
      changed = true;
    }
    if (!changed) return null;
    return out + text.slice(last);
  }

  function rewriteInPlace(node) {
    const original = node.nodeValue;
    const converted = convertString(original);
    if (converted === null || converted === original) return;
    node.nodeValue = converted;
    const rec = { node: node, original: original, converted: converted };
    textState.set(node, rec);
    textRecords.push(rec);
  }

  /* ---------- Normal mode: wrap the time in a span ---------- */

  function rewriteWithSpans(node) {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    let changed = false;
    let match;

    TIME_RE.lastIndex = 0;
    while ((match = TIME_RE.exec(text)) !== null) {
      const res = buildReplacement(match[0], match[1], match[2], match[3]);
      if (!res) continue;

      if (match.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      }

      const span = document.createElement('span');
      span.className = 'lt-time' + (cfg.highlight ? ' lt-highlight' : '');
      span.dataset.ltDone = '1';
      span.dataset.ltOriginal = match[0];
      span.setAttribute('translate', 'no');
      span.title = LTI18N.t('tooltip', {
        orig: res.original, fromTz: cfg.originalTz,
        conv: res.text, toTz: cfg.localTz
      });

      // The converted time always lives in .lt-conv so styling matches in both modes
      const conv = document.createElement('span');
      conv.className = 'lt-conv';
      conv.textContent = res.text;

      if (cfg.mode === 'both') {
        const orig = document.createElement('span');
        orig.className = 'lt-orig';
        orig.textContent = res.original;
        // A plain space (no arrow); it also offers a line-break opportunity
        span.append(orig, document.createTextNode(' '), conv);
      } else {
        span.appendChild(conv);
      }

      frag.appendChild(span);
      last = match.index + match[0].length;
      changed = true;
    }

    if (!changed) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (node.parentNode) node.parentNode.replaceChild(frag, node);
  }

  function processTextNode(node) {
    const text = node.nodeValue;
    if (!text || text.length > 4000) return;

    // If we wrote this text ourselves, do not convert it again
    const prev = textState.get(node);
    if (prev && prev.converted === text) return;

    TIME_RE.lastIndex = 0;
    if (!TIME_RE.test(text)) return;

    if (cfg.forceSafe || isManaged(node.parentElement)) rewriteInPlace(node);
    else rewriteWithSpans(node);
  }

  function scan(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (isInsideIgnored(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    if (!nodes.length) return;

    // Do not listen to our own changes while editing the page
    withObserverPaused(() => nodes.forEach(processTextNode));
  }

  function revertAll() {
    withObserverPaused(() => {
      document.querySelectorAll('span.lt-time[data-lt-original]').forEach((span) => {
        span.replaceWith(document.createTextNode(span.dataset.ltOriginal));
      });
      textRecords.forEach((rec) => {
        if (rec.node.isConnected && rec.node.nodeValue === rec.converted) {
          rec.node.nodeValue = rec.original;
        }
      });
    });
    textRecords = [];
    textState = new WeakMap();
  }

  /* ---------- Watching page changes ---------- */

  function queue(nodes) {
    if (!pending) pending = new Set();
    nodes.forEach((x) => pending.add(x));
    if (queue.timer) return;
    queue.timer = setTimeout(() => {
      queue.timer = null;
      const batch = pending;
      pending = null;
      if (!batch) return;
      batch.forEach((node) => {
        if (node.isConnected) scan(node);
      });
    }, 250);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      const roots = [];
      for (const mu of mutations) {
        if (mu.type === 'characterData') {
          if (mu.target.parentElement) roots.push(mu.target.parentElement);
        } else {
          mu.addedNodes.forEach((node) => {
            if (node.nodeType === 1) roots.push(node);
            else if (node.nodeType === 3 && node.parentElement) roots.push(node.parentElement);
          });
        }
      }
      if (roots.length) queue(roots);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /** Our own edits must not wake the observer again. */
  function withObserverPaused(fn) {
    const wasOn = !!observer;
    if (wasOn) stopObserver();
    try {
      fn();
    } finally {
      if (wasOn) startObserver();
    }
  }

  /* ---------- Startup ---------- */

  /*
   * Do not touch the DOM until the page (and any framework on it) has
   * settled: editing during hydration leaves the site's own event
   * handlers unattached.
   */
  function whenSettled(cb) {
    const go = () => setTimeout(cb, 300);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }

  function apply() {
    const want = shouldRun();
    if (want) {
      revertAll();          // clear the result of the previous settings
      scan(document.body);
      startObserver();
      active = true;
    } else if (active || document.querySelector('span.lt-time') || textRecords.length) {
      stopObserver();
      revertAll();
      active = false;
    }
  }

  function load() {
    chrome.storage.sync.get(DEFAULTS, (stored) => {
      cfg = Object.assign({}, DEFAULTS, stored);
      LTI18N.setLang(cfg.lang);
      apply();
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const k of Object.keys(changes)) cfg[k] = changes[k].newValue;
    LTI18N.setLang(cfg.lang);
    apply();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'LT_STATUS') {
      sendResponse({
        active: active,
        host: location.hostname,
        count: document.querySelectorAll('span.lt-time').length + textRecords.length
      });
    }
    return false;
  });

  whenSettled(load);
})();
