# Chrome Web Store submission

Everything the Developer Dashboard asks for, ready to paste.
Upload package: `dist/x-localtime-<version>.zip` (built by `python tools/package.py`).

---

## Store listing

**Name** (45 char limit — this one is 43)

```
X Localtime - Site Times In Your Local Time
```

**Summary** (132 char limit — this one is 108)

```
Rewrites the times written on websites into your own city's time, right on the page. No copying, no time math.
```

**Category:** Productivity
**Language:** English (a Persian listing can be added later under Localizations)

**Detailed description**

```
X Localtime rewrites the times you find on web pages into your own timezone, in place, as you read.

Sports schedules, TV listings, event pages and forum posts are almost always written in the site's local time. If you live somewhere else, every single time on the page needs converting in your head. X Localtime does it for you: pick the city the site writes its times in, pick your own city, and the page shows your time instead.

HOW TO USE
1. Open the options page and set "Original City" - the timezone the site writes its times in.
2. Set "Local City" - your own. It defaults to your system timezone.
3. Add the site's domain to the list, or switch to all sites.
That's it. Open the site and the times read correctly.

FEATURES
• Two display modes: show only your local time, or both the original and the converted one
• Persian, Arabic-Indic and Latin digits, with the output written in the same digit style as the page
• Recognises am/pm and Persian meridiem words
• Daylight saving is handled correctly for both cities, using your browser's own timezone data
• Times loaded later by the page - AJAX, infinite scroll, live tickers - are converted too
• Runs only on the sites you list, or on every site, whichever you prefer
• Optional 12-hour clock, a day-shift marker when the conversion crosses midnight, and a highlight on the converted time
• Bilingual interface, English and Persian, with automatic right-to-left layout
• Compatibility mode keeps sites built with React or Vue fully functional

PRIVACY
X Localtime makes no network requests at all. It has no analytics, no accounts, no external libraries, and no server. Your two chosen cities and your preferences are the only things it stores, through Chrome's own settings sync. Nothing about the pages you visit ever leaves your browser.

Open source, MIT licensed: https://github.com/ehsun-sh/xlocaltime-extension
```

---

## Privacy practices tab

**Single purpose description**

```
The extension has one purpose: to display the times written on a web page in the
user's own timezone. It finds time strings in the page text and rewrites them
from a source timezone the user configures into the user's local timezone.
```

**Permission justifications**

| Permission | Justification to paste |
|---|---|
| `storage` | Stores the user's settings: the two chosen cities, the display mode, the site list, and the interface language. Nothing else is stored, and the data never leaves the browser. |
| `activeTab` | The toolbar popup shows the current site's domain and lets the user add or remove it from the list of sites the extension runs on. It reads only the active tab's hostname, and only when the user clicks the extension icon. |
| Host access (content script on all sites) | Times can appear on any website, and the user chooses which sites the extension runs on. The content script reads the page's text to find time strings and rewrites them in place. It never sends page content anywhere; all processing happens locally in the page. |

**Remote code:** No, the extension does not use remote code. All JavaScript is included in the package, and the font is bundled as a local file.

**Data collection disclosure:** Select nothing. The extension does not collect or transmit any user data. Then tick all three certification checkboxes:
- Does not sell or transfer user data to third parties outside of approved use cases
- Does not use or transfer user data for purposes unrelated to the item's single purpose
- Does not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** not required while no data is collected. If the dashboard asks for one anyway, publish the PRIVACY section of the description as a page (a GitHub Pages file or a Gist works) and link it.

---

## Graphic assets

| Asset | Requirement | Status |
|---|---|---|
| Store icon | 128×128 PNG | `icons/icon128.png` |
| Screenshots | 1280×800 or 640×400 PNG/JPEG, 1 to 5, no transparency | three ready in `store/screenshots/` |
| Small promo tile | 440×280 PNG/JPEG | optional |
| Marquee promo tile | 1400×560 | optional, only for featuring |

Screenshots are composed by `python tools/make_screenshots.py`, which lays the raw
captures from `Screenshot/` onto the 1280x800 canvas the store requires:

1. `01-persian-schedule.png` - an Iranian league table read in Toronto time
2. `02-premier-league.png` - Premier League fixtures, Latin digits
3. `03-nba-schedule.png` - an NBA schedule

Two more would round the set out, if you want the full five:

4. The options page with both cities filled in and the live preview visible
5. The toolbar popup showing both clocks and the current site

Capture them at any size and drop them into `Screenshot/`, then add an entry to
the `SHOTS` list in the script.

---

## Submission steps

1. Register as a developer at https://chrome.google.com/webstore/devconsole (a one-time 5 USD fee).
2. **Add new item** → upload `dist/x-localtime-<version>.zip`.
3. Fill the **Store listing** tab from the copy above and upload the screenshots.
4. Fill the **Privacy practices** tab from the section above.
5. Under **Distribution**, choose Public and the countries to publish in.
6. **Submit for review.** A first submission that requests access to all sites is
   usually reviewed by hand, so expect several days rather than hours.

## Publishing an update later

1. Raise `version` in `manifest.json` (Chrome compares it numerically; it can never go down).
2. `python tools/package.py`
3. Upload the new zip to the same item and submit again.
