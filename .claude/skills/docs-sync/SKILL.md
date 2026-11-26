---
name: docs-sync
description: Update the documentation and screenshots. Use when a visible behavior, a flow, a URL or the architecture changes.
---

# Documentation

Update in the same change, depending on the impact:
- `manual.html`: user manual, in French.
- `README.md`: functional description and table of messages per feature, in French.
- `CLAUDE.md`: rules and architecture, in English.
- `docs/screenshots/{1-home,2-waza,3-attacks,4-techniques,5-technique}.png`: regenerate (puppeteer-core + Chrome, 500×900, `python3 -m http.server` from the project root, URL `#/2eme-kyo`, debug badge hidden) when the UI changes noticeably. Remember `yarn bump` and the `sw.js` precache.

Languages: user documentation and replies to the user in French; code comments in English, only when they clarify something.
Add or adapt tests (`tests/app.test.js`) for any new rule.
