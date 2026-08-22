/* Xlocaltime - options page logic */
(function () {
  'use strict';

  const DEFAULTS = {
    lang: 'auto',
    enabled: true,
    originalTz: 'Asia/Tehran',
    originalCity: 'Tehran (Asia/Tehran)',
    localTz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    localCity: '',
    mode: 'replace',
    scope: 'list',
    sites: ['varzesh3.com'],
    hour12: false,
    showDayShift: true,
    highlight: true,
    strict: true,
    forceSafe: false,
    ignoreSelectors: ''
  };

  const $ = (id) => document.getElementById(id);

  const el = {
    lang: $('lang'),
    enabled: $('enabled'),
    originalCity: $('originalCity'),
    localCity: $('localCity'),
    originalHint: $('originalHint'),
    localHint: $('localHint'),
    useSystemTz: $('useSystemTz'),
    preview: $('preview'),
    scopeList: $('scopeList'),
    scopeAll: $('scopeAll'),
    sites: $('sites'),
    mode: $('mode'),
    hour12: $('hour12'),
    showDayShift: $('showDayShift'),
    highlight: $('highlight'),
    strict: $('strict'),
    forceSafe: $('forceSafe'),
    ignoreSelectors: $('ignoreSelectors'),
    save: $('save'),
    reset: $('reset'),
    status: $('status'),
    cityList: $('cityList')
  };

  /* ---------- City list ---------- */

  function cityLabel(c) {
    return c.fa + ' — ' + c.en + ' (' + c.tz + ')';
  }

  function fillCityList() {
    const frag = document.createDocumentFragment();
    const seen = new Set();
    window.LT_CITIES.forEach((c) => {
      const label = cityLabel(c);
      if (seen.has(label)) return;
      seen.add(label);
      const opt = document.createElement('option');
      opt.value = label;
      frag.appendChild(opt);
    });
    // Raw IANA timezone ids should be typeable too
    if (typeof Intl.supportedValuesOf === 'function') {
      Intl.supportedValuesOf('timeZone').forEach((tz) => {
        if (seen.has(tz)) return;
        seen.add(tz);
        const opt = document.createElement('option');
        opt.value = tz;
        frag.appendChild(opt);
      });
    }
    el.cityList.appendChild(frag);
  }

  /** Extracts a timezone from whatever the user typed. */
  function resolveTz(input) {
    const v = (input || '').trim();
    if (!v) return null;

    const paren = v.match(/\(([^)]+)\)\s*$/);
    if (paren && LTZ.isValidTz(paren[1].trim())) return paren[1].trim();

    if (LTZ.isValidTz(v) && v.includes('/')) return v;
    if (/^utc$/i.test(v)) return 'UTC';

    const norm = v.toLowerCase();
    const hit = window.LT_CITIES.find(
      (c) => c.fa === v || c.en.toLowerCase() === norm || c.tz.toLowerCase() === norm
    );
    if (hit) return hit.tz;

    const partial = window.LT_CITIES.find(
      (c) => c.fa.includes(v) || c.en.toLowerCase().includes(norm)
    );
    return partial ? partial.tz : null;
  }

  /* ---------- Preview ---------- */

  function nowIn(tz) {
    return new Intl.DateTimeFormat(LTI18N.lang() === 'fa' ? 'fa-IR' : 'en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  }

  function updateHints() {
    const oTz = resolveTz(el.originalCity.value);
    const lTz = resolveTz(el.localCity.value);

    el.originalHint.textContent = oTz
      ? LTI18N.t('tzHint', { tz: oTz, offset: LTZ.tzLabel(oTz), now: nowIn(oTz) })
      : LTI18N.t('pickCity');
    el.localHint.textContent = lTz
      ? LTI18N.t('tzHint', { tz: lTz, offset: LTZ.tzLabel(lTz), now: nowIn(lTz) })
      : LTI18N.t('pickCity');

    if (!oTz || !lTz) {
      el.preview.textContent = LTI18N.t('previewPickBoth');
      return;
    }
    if (oTz === lTz) {
      el.preview.textContent = LTI18N.t('previewSameTz');
      return;
    }

    const fa = LTI18N.lang() === 'fa';
    const style = fa ? 'fa' : 'en';
    const arrow = fa ? '  ←  ' : '  →  ';
    const samples = [[19, 30], [21, 0], [23, 45], [2, 15]];
    const lines = samples.map(([h, m]) => {
      const r = LTZ.convertTime(h, m, oTz, lTz);
      let out = LTZ.formatTime(r.hour, r.minute, { hour12: el.hour12.checked });
      if (el.showDayShift.checked && r.dayShift !== 0) {
        out += ' (' + (r.dayShift > 0 ? '+' : '−') + Math.abs(r.dayShift) +
          ' ' + LTI18N.t('dayUnit') + ')';
      }
      const src = LTZ.formatTime(h, m, { hour12: el.hour12.checked });
      return LTZ.toDigitStyle(src, style) + arrow + LTZ.toDigitStyle(out, style);
    });
    el.preview.textContent = LTI18N.t('previewTitle') + '\n' + lines.join('\n');
  }

  /* ---------- Load and save ---------- */

  function load() {
    chrome.storage.sync.get(DEFAULTS, (s) => {
      LTI18N.setLang(s.lang);
      LTI18N.applyTo(document);
      el.lang.value = s.lang || 'auto';
      el.enabled.checked = s.enabled;
      el.originalCity.value = s.originalCity || s.originalTz;
      el.localCity.value = s.localCity || s.localTz;
      el.scopeList.checked = s.scope !== 'all';
      el.scopeAll.checked = s.scope === 'all';
      el.sites.value = (s.sites || []).join('\n');
      el.mode.value = s.mode;
      el.hour12.checked = s.hour12;
      el.showDayShift.checked = s.showDayShift;
      el.highlight.checked = s.highlight;
      el.strict.checked = s.strict;
      el.forceSafe.checked = s.forceSafe;
      el.ignoreSelectors.value = s.ignoreSelectors || '';
      updateHints();
    });
  }

  function flash(msg, isError) {
    el.status.textContent = msg;
    el.status.className = 'status' + (isError ? ' error' : '');
    clearTimeout(flash.t);
    flash.t = setTimeout(() => { el.status.textContent = ''; }, 2500);
  }

  function save() {
    const oTz = resolveTz(el.originalCity.value);
    const lTz = resolveTz(el.localCity.value);
    if (!oTz) return flash(LTI18N.t('badOriginal'), true);
    if (!lTz) return flash(LTI18N.t('badLocal'), true);

    const sites = el.sites.value
      .split(/[\n,]+/)
      .map((s) => s.trim().toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/.*$/, ''))
      .filter(Boolean);

    const data = {
      lang: el.lang.value,
      enabled: el.enabled.checked,
      originalTz: oTz,
      originalCity: el.originalCity.value.trim(),
      localTz: lTz,
      localCity: el.localCity.value.trim(),
      mode: el.mode.value,
      scope: el.scopeAll.checked ? 'all' : 'list',
      sites: sites,
      hour12: el.hour12.checked,
      showDayShift: el.showDayShift.checked,
      highlight: el.highlight.checked,
      strict: el.strict.checked,
      forceSafe: el.forceSafe.checked,
      ignoreSelectors: el.ignoreSelectors.value.trim()
    };

    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) flash(chrome.runtime.lastError.message, true);
      else flash(LTI18N.t('saved'));
      updateHints();
    });
  }

  /* ---------- Events ---------- */

  el.save.addEventListener('click', save);

  el.reset.addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      chrome.storage.sync.set(DEFAULTS, () => {
        load();
        flash(LTI18N.t('resetDone'));
      });
    });
  });

  el.lang.addEventListener('change', () => {
    LTI18N.setLang(el.lang.value);
    LTI18N.applyTo(document);
    updateHints();
  });

  el.useSystemTz.addEventListener('click', () => {
    el.localCity.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    updateHints();
  });

  ['originalCity', 'localCity'].forEach((k) => {
    el[k].addEventListener('input', updateHints);
    el[k].addEventListener('change', updateHints);
  });
  ['hour12', 'showDayShift'].forEach((k) => {
    el[k].addEventListener('change', updateHints);
  });

  // Translate up front with the browser language so no label renders empty
  LTI18N.setLang('auto');
  LTI18N.applyTo(document);

  fillCityList();
  load();
  setInterval(updateHints, 30000);
})();
