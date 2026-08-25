/* X Localtime - shared timezone conversion helpers */
(function (root) {
  'use strict';

  const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

  /** Converts Persian/Arabic-Indic digits to Latin digits. */
  function toEnDigits(str) {
    return String(str).replace(/[۰-۹٠-٩]/g, (ch) => {
      const fa = FA_DIGITS.indexOf(ch);
      if (fa > -1) return String(fa);
      return String(AR_DIGITS.indexOf(ch));
    });
  }

  /** Renders Latin digits in the requested style (fa/ar/en). */
  function toDigitStyle(str, style) {
    if (style === 'fa') return String(str).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
    if (style === 'ar') return String(str).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
    return String(str);
  }

  /** Detects which digit style a string uses. */
  function detectDigitStyle(str) {
    if (/[۰-۹]/.test(str)) return 'fa';
    if (/[٠-٩]/.test(str)) return 'ar';
    return 'en';
  }

  const partsCache = new Map();
  function fmt(tz) {
    let f = partsCache.get(tz);
    if (!f) {
      f = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      partsCache.set(tz, f);
    }
    return f;
  }

  /** Returns the date/time parts of an instant in the given timezone. */
  function partsIn(tz, date) {
    const out = {};
    for (const p of fmt(tz).formatToParts(date)) {
      if (p.type !== 'literal') out[p.type] = p.value;
    }
    return {
      year: +out.year,
      month: +out.month,
      day: +out.day,
      hour: +out.hour % 24,
      minute: +out.minute,
      second: +out.second
    };
  }

  /** Offset from UTC in minutes, honouring DST at that exact instant. */
  function tzOffsetMinutes(tz, date) {
    const p = partsIn(tz, date);
    const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
  }

  /** Turns a wall-clock time in a timezone into an absolute timestamp. */
  function wallToInstant(tz, y, m, d, h, min) {
    const guess = Date.UTC(y, m - 1, d, h, min, 0);
    let off = tzOffsetMinutes(tz, new Date(guess));
    let ts = guess - off * 60000;
    off = tzOffsetMinutes(tz, new Date(ts)); // correct for DST boundaries
    return guess - off * 60000;
  }

  /** Today's date in the given timezone. */
  function todayIn(tz) {
    const p = partsIn(tz, new Date());
    return { year: p.year, month: p.month, day: p.day };
  }

  function daysBetween(a, b) {
    const A = Date.UTC(a.year, a.month - 1, a.day);
    const B = Date.UTC(b.year, b.month - 1, b.day);
    return Math.round((B - A) / 86400000);
  }

  /**
   * Converts a time from the source timezone to the target one.
   * @returns {{hour:number, minute:number, dayShift:number}}
   */
  function convertTime(hour, minute, fromTz, toTz, baseDate) {
    const base = baseDate || todayIn(fromTz);
    const ts = wallToInstant(fromTz, base.year, base.month, base.day, hour, minute);
    const p = partsIn(toTz, new Date(ts));
    return {
      hour: p.hour,
      minute: p.minute,
      dayShift: daysBetween(base, { year: p.year, month: p.month, day: p.day })
    };
  }

  const pad2 = (n) => (n < 10 ? '0' + n : String(n));

  /** Formats a time as 24-hour or 12-hour. */
  function formatTime(hour, minute, opts) {
    const o = opts || {};
    if (o.hour12) {
      const suffix = hour < 12 ? (o.amText || 'AM') : (o.pmText || 'PM');
      let h = hour % 12;
      if (h === 0) h = 12;
      return `${o.padHour ? pad2(h) : h}:${pad2(minute)} ${suffix}`;
    }
    return `${o.padHour === false ? hour : pad2(hour)}:${pad2(minute)}`;
  }

  /** Short timezone label for display, e.g. UTC+3:30. */
  function tzLabel(tz, date) {
    const off = tzOffsetMinutes(tz, date || new Date());
    const sign = off < 0 ? '-' : '+';
    const abs = Math.abs(off);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `UTC${sign}${h}${m ? ':' + pad2(m) : ''}`;
  }

  function isValidTz(tz) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch (e) {
      return false;
    }
  }

  root.LTZ = {
    toEnDigits,
    toDigitStyle,
    detectDigitStyle,
    partsIn,
    tzOffsetMinutes,
    wallToInstant,
    todayIn,
    convertTime,
    formatTime,
    tzLabel,
    isValidTz,
    pad2
  };
})(typeof window !== 'undefined' ? window : globalThis);
