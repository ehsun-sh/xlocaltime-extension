/* X Localtime - toolbar popup */
(function () {
  'use strict';

  const DEFAULTS = {
    lang: 'auto',
    enabled: true,
    originalTz: 'Asia/Tehran',
    originalCity: '',
    localTz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    localCity: '',
    scope: 'list',
    sites: ['varzesh3.com']
  };

  const $ = (id) => document.getElementById(id);
  let cfg = null;
  let host = '';

  function baseHost(h) {
    return (h || '').toLowerCase().replace(/^www\./, '');
  }

  function inList() {
    return (cfg.sites || []).some((s) => host === s || host.endsWith('.' + s));
  }

  function shortName(city, tz) {
    if (!city) return tz;
    const name = city.split('—')[0].replace(/\([^)]*\)\s*$/, '').trim();
    return name || tz;
  }

  function nowIn(tz) {
    try {
      return new Intl.DateTimeFormat(LTI18N.lang() === 'fa' ? 'fa-IR' : 'en-GB', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date());
    } catch (e) {
      return '—';
    }
  }

  function render() {
    $('enabled').checked = !!cfg.enabled;
    $('route').textContent = shortName(cfg.originalCity, cfg.originalTz) +
      (LTI18N.lang() === 'fa' ? ' ← ' : ' → ') + shortName(cfg.localCity, cfg.localTz);
    $('clocks').textContent =
      LTI18N.t('popupNow', { a: nowIn(cfg.originalTz), b: nowIn(cfg.localTz) });
    $('host').textContent = host || '—';

    if (!cfg.enabled) {
      $('state').textContent = LTI18N.t('popupOff');
    } else if (cfg.scope === 'all') {
      $('state').textContent = LTI18N.t('popupAllSites');
    } else {
      $('state').textContent = LTI18N.t(inList() ? 'popupActiveHere' : 'popupInactiveHere');
    }

    const btn = $('toggleSite');
    btn.style.display = cfg.scope === 'all' || !host ? 'none' : 'block';
    btn.textContent = LTI18N.t(inList() ? 'popupRemoveSite' : 'popupAddSite');
  }

  $('enabled').addEventListener('change', (e) => {
    cfg.enabled = e.target.checked;
    chrome.storage.sync.set({ enabled: cfg.enabled }, render);
  });

  $('toggleSite').addEventListener('click', () => {
    let sites = (cfg.sites || []).slice();
    if (inList()) {
      sites = sites.filter((s) => !(host === s || host.endsWith('.' + s)));
    } else {
      sites.push(host);
    }
    cfg.sites = sites;
    chrome.storage.sync.set({ sites: sites }, render);
  });

  $('openOptions').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open(chrome.runtime.getURL('options/options.html'));
  });

  LTI18N.setLang('auto');
  LTI18N.applyTo(document);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    try {
      host = baseHost(new URL(tabs[0].url).hostname);
    } catch (e) {
      host = '';
    }
    chrome.storage.sync.get(DEFAULTS, (s) => {
      cfg = s;
      LTI18N.setLang(s.lang);
      LTI18N.applyTo(document);
      render();
    });
  });
})();
