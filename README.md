# X Localtime

> See the times written on websites in your own city's time.

A Microsoft Edge extension (Chrome-compatible) that rewrites times found on web pages from the site's timezone into yours — no copying times around, no mental arithmetic, no searching for "what time is it in Tehran right now".

**Example:** on [Varzesh3](https://www.varzesh3.com) a match is listed at `۲۱:۳۰` Tehran time. With X Localtime enabled and Toronto selected, you read `۱۴:۰۰` right there on the page.

| Before | After |
|---|---|
| `پرسپولیس - تراکتور — ۲۱:۳۰` | `پرسپولیس - تراکتور — ۱۴:۰۰` |

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

---

## Features

- **Two cities, that's the whole setup:** the city the site writes its times in, and yours.
- **Persian-aware:** Persian (۰۱۲۳), Arabic-Indic (٠١٢٣) and Latin digits are all recognised, and the output keeps the digit style of the surrounding text.
- **Meridiem detection:** English `am/pm` as well as the Persian equivalents.
- **DST-correct:** conversion goes through `Intl`, so daylight saving in both cities is accounted for.
- **Dynamic content:** anything loaded later by AJAX or infinite scroll is converted too.
- **Framework-safe:** on React/Vue pages nothing is inserted into the DOM, so sliders, tabs and menus keep working.
- **Bilingual UI:** English and Persian, with the page direction switching between LTR and RTL. Follows your browser language by default and can be set explicitly.
- **Offline and private:** no network requests, no analytics, no third-party dependencies. Even the font is bundled.

## Install

Not published to a store yet — install it unpacked.

```bash
git clone https://github.com/ehsun-sh/xlocaltime-extension.git
```

**On Edge:**

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the project folder.
4. Open the extension icon → **All settings…** and pick your two cities.

**On Chrome:** the same steps at `chrome://extensions`.

> After changing any code, hit **Reload** on the extension in that same page.

## Usage

1. Set **Original City** to the timezone the site writes its times in (default: Tehran).
2. Set **Local City** to your own (default: your system timezone).
3. Add the site's domain to the list (`varzesh3.com` is there already), or switch to "all sites".
4. Open the site — the times are converted in place.

In the city fields you can type English (`Toronto`), Persian (`تورنتو`), or an IANA id directly (`America/Toronto`). The options page shows the current time in both cities and a live preview of the conversion.

The toolbar popup lets you toggle the extension and add or remove the current site without opening the options page.

## Settings

| Option | What it does | Default |
|---|---|---|
| Language | UI language: automatic (browser language) / English / Persian | Automatic |
| **Original City** | The timezone the site writes its times in | Tehran |
| **Local City** | Yours; times are displayed in this timezone | System timezone |
| Site scope | Only the listed domains, or every site | List (`varzesh3.com`) |
| Display mode | "Local time only" (`14:00`) or "Both times" (`21:30 14:00`) | Local time only |
| 12-hour clock | Show AM/PM instead of 24-hour | Off |
| Day shift | Append "−1 day" / "+1 day" when the conversion crosses midnight | On |
| Highlight | Mark the converted time with a colour | On |
| Cautious mode | Avoids converting numbers like the score "2:1" | On |
| Compatibility mode everywhere | Never insert elements, rewrite the text only | Off (auto-detected) |
| Ignored selectors | CSS selectors to leave alone, e.g. `.score, .result` | Empty |

Subdomains are covered automatically: `varzesh3.com` also matches `www.varzesh3.com`.

## How it works

1. **Finding times:** a TreeWalker sweeps the page's text nodes and matches `HH:MM` with an optional meridiem suffix. Tags like `script`, `style`, `input` and `code`, plus editable elements, are skipped.
2. **Converting:** the wall-clock time is anchored to **today's date in the source city** to get an absolute instant, which is then formatted in the target timezone. It is all `Intl.DateTimeFormat`, so the browser's own timezone database (DST included) decides — no date library needed.
3. **Replacing:** two paths.
   - *Ordinary sites:* each time is wrapped in a `<span class="lt-time">` that keeps the original text in `data-lt-original`; this path gets the highlight and the hover tooltip.
   - *React/Vue sites (compatibility mode):* nothing is inserted — only the text node's `nodeValue` changes. These frameworks hold references to their own text nodes, and swapping one for a `<span>` corrupts the tree on the next render, which is how a page's slider or tabs end up dead. Detection looks for keys such as `__reactFiber$` on the elements.
4. **Dynamic content:** a `MutationObserver`, batched at 250 ms, handles newly added sections. It is disconnected while we edit the page so our own writes do not wake it.
5. **Timing:** the first sweep waits until after the `load` event (plus 300 ms), so the DOM is never touched mid-hydration.

### A few design decisions

- **"Local time only" is the default** so the text keeps its original length and layouts with narrow cells (a match-schedule table, say) do not break. The original time stays available on hover.
- In "Both times" there is no arrow and both times share the same font size; only the original is dimmed. The space between them gives the line a place to break in tight cells.
- Text injected into web pages deliberately inherits the site's own font. The bundled Vazirmatn font is used only in the extension's own UI.

## Known limitations

- Conversion is anchored to **today's date** in the source city. For a schedule several days out, if daylight saving changes for either city in between, the result can be off by an hour. (Sites rarely put the date next to the time in the same text, so there is nothing more reliable to anchor to.)
- **Cautious mode** prevents mistakes like converting the score "2:1", but it also skips single-digit hours whose minutes are not a multiple of five (`9:23`). If a time is not converted somewhere, turn the option off.
- Time ranges ("from 18:00 to 20:00") are converted as two separate times, which is usually what you want.
- Times inside images, canvas, and cross-origin iframes cannot be converted.
- On React/Vue sites, where compatibility mode kicks in, the colour highlight and the hover tooltip are unavailable — that is the price of leaving the site itself intact.

## Project layout

```
manifest.json          Extension definition (Manifest V3)
src/tz.js              Timezone conversion helpers (no dependencies)
src/content.js         DOM traversal and time replacement
src/content.css        Styling for converted times
src/cities.js          City list for the options page
src/i18n.js            Bilingual dictionary and helpers (en/fa)
_locales/              Extension name and description for the browser (en, fa)
options/               Options page
popup/                 Toolbar popup
fonts/                 Bundled Vazirmatn font (OFL)
icons/                 Extension icons
tests/demo.html        Local test page (works without installing the extension)
```

## Development and testing

There is no build step — it is plain JavaScript. To exercise the conversion logic without installing the extension:

```bash
python -m http.server 8899
```

Then open these (through the server, not `file://`):

- `http://localhost:8899/tests/demo.html` — local-time-only mode
- `http://localhost:8899/tests/demo.html?mode=both` — both-times mode
- `http://localhost:8899/tests/demo.html?safe=1` — compatibility mode
- `http://localhost:8899/tests/demo.html?lang=en` — English UI strings

The test page stubs `chrome.storage` and includes fixtures that must **not** be converted (a score, a date, a version number) plus a narrow table for checking that the layout survives.

### Adding or editing translations

Every UI string lives in [`src/i18n.js`](src/i18n.js) under `MESSAGES.fa` and `MESSAGES.en`, wired to the markup through `data-i18n="key"`. Adding a third language means adding one more object with the same keys. The name and description the browser shows in its extension list come from `_locales/` and follow the browser's own language.

### Adding a city

Cities live in [`src/cities.js`](src/cities.js) as `{ fa, en, tz }` — add a line. Users can always type any valid IANA timezone id directly.

## Contributing

Issues and pull requests are welcome. For anything substantial, open an issue first so we can agree on the approach. Source comments and documentation are English only; Persian appears in the repository solely as data — translation strings, city names, and test fixtures.

## Privacy

No data is collected, and the extension makes no network requests at all. See
[PRIVACY.md](PRIVACY.md) for the full policy.

## License

Code is released under the [MIT License](LICENSE).

The Vazirmatn font is licensed under the [SIL Open Font License 1.1](fonts/OFL.txt) — © The Vazirmatn Project Authors.
