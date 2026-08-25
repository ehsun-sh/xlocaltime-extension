/* X Localtime - bilingual layer (Persian / English) */
(function (root) {
  'use strict';

  const MESSAGES = {
    fa: {
      dir: 'rtl',
      optionsTitle: 'تنظیمات X Localtime',
      tagline: 'ساعت‌های نوشته‌شده در سایت‌ها را به وقت شهر شما تبدیل می‌کند.',

      langLabel: 'زبان / Language',
      langAuto: 'خودکار (زبان مرورگر)',

      enabledLabel: 'فعال بودن اکستنشن',

      citiesTitle: 'شهرها',
      originalCityLabel: 'Original City — شهر مبدأ (ساعت سایت به وقت این شهر است)',
      originalCityPlaceholder: 'مثلاً تهران / Tehran',
      localCityLabel: 'Local City — شهر من (ساعت به وقت این شهر نمایش داده می‌شود)',
      localCityPlaceholder: 'مثلاً تورنتو / Toronto',
      useSystemTz: 'استفاده از منطقهٔ زمانی سیستم',

      sitesTitle: 'سایت‌ها',
      scopeListLabel: 'فقط در سایت‌های زیر فعال باشد',
      scopeAllLabel: 'در همهٔ سایت‌ها فعال باشد',
      sitesLabel: 'فهرست دامنه‌ها (هر خط یک دامنه)',
      sitesHint: 'زیر‌دامنه‌ها هم شامل می‌شوند؛ مثلاً <code>varzesh3.com</code> شامل <code>www.varzesh3.com</code> است.',

      displayTitle: 'نمایش',
      modeLabel: 'شیوهٔ نمایش',
      modeReplace: 'فقط ساعت محلی: ۱۴:۰۰ (بدون ساعت اصلی)',
      modeBoth: 'هر دو ساعت: ۲۱:۳۰ ۱۴:۰۰ (اصلی کم‌رنگ، محلی هایلایت)',
      modeHint: 'اگر متن‌های سایت روی هم می‌افتند، «فقط ساعت محلی» را انتخاب کنید؛ در این حالت طول متن تغییر نمی‌کند و چیدمان سایت به‌هم نمی‌ریزد. ساعت اصلی همچنان با نگه‌داشتن نشانگر ماوس روی ساعت دیده می‌شود.',
      hour12Label: 'نمایش ۱۲ ساعته (AM/PM)',
      dayShiftLabel: 'نمایش اختلاف روز (مثلاً «−۱ روز»)',
      highlightLabel: 'هایلایت کردن ساعت تبدیل‌شده',
      strictLabel: 'حالت محتاطانه (کاهش تبدیل اشتباه نتیجهٔ بازی مثل «۲:۱»)',
      forceSafeLabel: 'حالت سازگار در همهٔ سایت‌ها',
      forceSafeHint: 'در سایت‌هایی که با React یا Vue ساخته شده‌اند (مثل ورزش سه)، اکستنشن خودکار فقط متن ساعت را عوض می‌کند و هیچ عنصری به صفحه اضافه نمی‌کند تا بخش‌های تعاملی سایت (اسلایدر، منو، تب‌ها) از کار نیفتند. در این حالت هایلایت و نمایش ساعت اصلی با ماوس در دسترس نیست. اگر در سایتی چیزی خراب شد، این گزینه را روشن کنید تا همه‌جا همین رفتار امن اعمال شود.',
      ignoreLabel: 'سلکتورهای CSS که نادیده گرفته شوند (اختیاری)',

      save: 'ذخیره',
      reset: 'بازگشت به پیش‌فرض',
      saved: 'ذخیره شد ✔',
      resetDone: 'به تنظیمات پیش‌فرض برگشت.',
      badOriginal: 'شهر مبدأ معتبر نیست.',
      badLocal: 'شهر محلی معتبر نیست.',

      tzHint: 'منطقهٔ زمانی: {tz} — {offset} — الان: {now}',
      pickCity: 'شهر یا منطقهٔ زمانی معتبر انتخاب کنید.',
      previewPickBoth: 'برای دیدن پیش‌نمایش، هر دو شهر را انتخاب کنید.',
      previewSameTz: 'شهر مبدأ و مقصد یکی هستند؛ تبدیلی انجام نمی‌شود.',
      previewTitle: 'نمونه (مبدأ ← محلی):',

      popupEnabled: 'فعال',
      popupNow: 'الان: {a} / {b}',
      popupOff: 'اکستنشن خاموش است.',
      popupAllSites: 'در همهٔ سایت‌ها فعال است.',
      popupActiveHere: 'در این سایت فعال است.',
      popupInactiveHere: 'در این سایت غیرفعال است.',
      popupAddSite: 'افزودن این سایت به فهرست',
      popupRemoveSite: 'حذف این سایت از فهرست',
      popupOpenOptions: 'تنظیمات کامل…',

      tooltip: 'اصلی: {orig} ({fromTz}) — محلی: {conv} ({toTz})',
      dayUnit: 'روز'
    },

    en: {
      dir: 'ltr',
      optionsTitle: 'X Localtime Settings',
      tagline: 'Shows times written on websites in your own city’s time.',

      langLabel: 'Language / زبان',
      langAuto: 'Automatic (browser language)',

      enabledLabel: 'Enable the extension',

      citiesTitle: 'Cities',
      originalCityLabel: 'Original City — the timezone the site writes its times in',
      originalCityPlaceholder: 'e.g. Tehran / تهران',
      localCityLabel: 'Local City — yours; times are shown in this timezone',
      localCityPlaceholder: 'e.g. Toronto / تورنتو',
      useSystemTz: 'Use system timezone',

      sitesTitle: 'Sites',
      scopeListLabel: 'Run only on the sites listed below',
      scopeAllLabel: 'Run on all sites',
      sitesLabel: 'Domain list (one per line)',
      sitesHint: 'Subdomains are included: <code>varzesh3.com</code> also covers <code>www.varzesh3.com</code>.',

      displayTitle: 'Display',
      modeLabel: 'Display mode',
      modeReplace: 'Local time only: 14:00 (original hidden)',
      modeBoth: 'Both times: 21:30 14:00 (original dimmed, local highlighted)',
      modeHint: 'If the site’s text starts overlapping, choose “Local time only” — it keeps the text the same length so the site’s layout is untouched. The original time is still available on hover.',
      hour12Label: '12-hour clock (AM/PM)',
      dayShiftLabel: 'Show day shift (e.g. “−1 day”)',
      highlightLabel: 'Highlight the converted time',
      strictLabel: 'Cautious mode (avoids converting scores like “2:1”)',
      forceSafeLabel: 'Compatibility mode on all sites',
      forceSafeHint: 'On React or Vue sites the extension automatically rewrites the time text only, without adding any element, so interactive parts (sliders, menus, tabs) keep working. In that mode the highlight and the hover tooltip are unavailable. If a site still misbehaves, turn this on to force the safe behaviour everywhere.',
      ignoreLabel: 'CSS selectors to ignore (optional)',

      save: 'Save',
      reset: 'Reset to defaults',
      saved: 'Saved ✔',
      resetDone: 'Settings restored to defaults.',
      badOriginal: 'Original city is not valid.',
      badLocal: 'Local city is not valid.',

      tzHint: 'Timezone: {tz} — {offset} — now: {now}',
      pickCity: 'Pick a valid city or timezone.',
      previewPickBoth: 'Pick both cities to see a preview.',
      previewSameTz: 'Both cities are in the same timezone; nothing to convert.',
      previewTitle: 'Examples (original → local):',

      popupEnabled: 'Enabled',
      popupNow: 'Now: {a} / {b}',
      popupOff: 'The extension is off.',
      popupAllSites: 'Active on all sites.',
      popupActiveHere: 'Active on this site.',
      popupInactiveHere: 'Not active on this site.',
      popupAddSite: 'Add this site to the list',
      popupRemoveSite: 'Remove this site from the list',
      popupOpenOptions: 'All settings…',

      tooltip: 'Original: {orig} ({fromTz}) — local: {conv} ({toTz})',
      dayUnit: 'day'
    }
  };

  let current = 'fa';

  /** Resolves 'auto' to a concrete language code. */
  function resolve(setting) {
    if (setting === 'fa' || setting === 'en') return setting;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('fa') || nav.startsWith('pe') ? 'fa' : 'en';
  }

  function setLang(setting) {
    current = resolve(setting);
    return current;
  }

  function lang() {
    return current;
  }

  function dir() {
    return MESSAGES[current].dir;
  }

  /** Translated string; {name} placeholders are filled from params. */
  function t(key, params) {
    const table = MESSAGES[current] || MESSAGES.en;
    let s = table[key];
    if (s === undefined) s = MESSAGES.en[key];
    if (s === undefined) return key;
    if (params) {
      s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined ? m : params[k]));
    }
    return s;
  }

  /** Translates every [data-i18n] element in a document. */
  function applyTo(doc) {
    const d = doc || document;
    d.documentElement.setAttribute('lang', current);
    d.documentElement.setAttribute('dir', dir());

    d.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    d.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml); // text comes from our own dictionary only
    });
    d.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.dataset.i18nPh));
    });
    d.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.dataset.i18nTitle));
    });
    const titleEl = d.querySelector('title[data-i18n-title-key]');
    if (titleEl) titleEl.textContent = t(titleEl.dataset.i18nTitleKey);
  }

  root.LTI18N = { t, setLang, resolve, lang, dir, applyTo, MESSAGES };
})(typeof window !== 'undefined' ? window : globalThis);
