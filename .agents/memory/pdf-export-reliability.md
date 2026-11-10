---
name: PDF export reliability
description: Why deck exports use bundled fonts and explicit, actionable asset errors.
---

Keep the deck's selectable fonts bundled locally and embed only the slide fonts explicitly during PDF conversion. Do not restore automatic scanning of unrelated remote stylesheets or silently omit fonts to make an export succeed.

**Why:** Save/export failures were browser-dependent, with cross-origin font stylesheet access errors and unhelpful image events. Verification with remote fonts blocked demonstrated that local fonts preserve working nine-page exports without that dependency.

**How to apply:** Preserve local font licenses and test PDF rendering independently of Google Fonts. Missing slide images must fail promptly with an actionable asset-specific message, not be skipped or leave export pending indefinitely. Distinguish verification of the print command from verification of the user's native print dialog.
