---
name: Cross-tab preview
description: Why live preview cannot rely only on shared browser storage or BroadcastChannel.
---

Keep a direct, origin-checked editor-to-preview communication path in addition to browser-wide channels. Preview tabs must remain read-only and never overwrite editor storage.

**Why:** The editor can run inside Replit’s embedded preview while the live deck opens as a top-level tab. Browser storage partitioning can separate those contexts even when their app origins match. Depending only on storage events or BroadcastChannel can silently leave the preview stale.

**How to apply:** Preserve opener messaging when changing how preview tabs open, validate both origin and sender, and allow an existing preview to reconnect after an editor reload. Changes must also reach the preview when browser persistence is unavailable.
