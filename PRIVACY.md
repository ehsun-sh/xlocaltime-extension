# Privacy Policy — X Localtime

_Last updated: 25 August 2026_

X Localtime is a browser extension that rewrites the times written on web pages
into the timezone you choose. This policy explains, in full, what it does with
data.

## Summary

**X Localtime does not collect, transmit, store on any server, or sell any user
data.** It makes no network requests of any kind.

## What the extension stores

Only your own settings, and only on your own machine:

- the two cities you pick (the site's timezone and yours)
- the display mode, the 12-hour toggle, the day-shift, highlight, cautious and
  compatibility options
- the list of sites you want it to run on
- the interface language

These are saved through the browser's own settings storage
(`chrome.storage.sync`). If you have browser sync switched on, your browser may
sync them between your own signed-in devices, exactly as it does your other
browser settings. That transfer is handled by the browser, not by this
extension, and the author has no access to it.

## What the extension reads

To do its job, the extension reads the **text of the pages you have allowed it
to run on**, looking for times such as `21:30`. It rewrites those times in the
page you are viewing.

This reading happens entirely inside your browser, as the page is displayed.
Page content is never copied, logged, transmitted, or retained. When the
extension is switched off, the original text is restored.

By default the extension runs only on the sites listed in its options. You may
choose to let it run on all sites; that choice is yours and can be reversed at
any time.

## What the extension does not do

- No analytics, telemetry, crash reporting, or usage statistics
- No accounts, sign-in, or identifiers of any kind
- No advertising and no advertising networks
- No third-party libraries, services, or servers
- No remote code: every line of JavaScript it runs ships inside the package
- No cookies, no tracking, no fingerprinting
- No selling or sharing of data with anyone, because there is no data to sell

## Permissions and why they exist

| Permission | Why it is needed |
|---|---|
| `storage` | To save the settings listed above on your device. |
| `activeTab` | So the toolbar popup can show the current site's domain and let you add or remove it from your list. It reads only that tab's hostname, only when you click the extension icon. |
| Access to websites | The content script reads page text to find times and rewrites them in place. Times can appear on any site, and you decide which sites are included. |

## Children

The extension is not directed at children and collects no data from anyone,
including children.

## Changes to this policy

Any change will be published in this file, in the extension's public
repository, with the date above updated.

## Contact and source code

The complete source code is public and MIT licensed:
https://github.com/ehsun-sh/xlocaltime-extension

Questions or concerns can be raised as an issue in that repository.
