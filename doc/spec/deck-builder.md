# Deck Builder — Current Product Specification

This specification supersedes the original brief and records the current deck, approved assumptions, app functionality, and preservation requirements. It describes the implemented product; limitations are identified explicitly rather than presented as completed features.

## 1. Purpose and reference

Deck Builder is Rayana's browser-based presentation studio for an Indonesian food, specialty coffee, and hospitality business. It combines brand context, assets, visual styling, financial planning, presentation, and versioned PDF output.

- Reference deck: `doc/ref/gemini-example-deck.pdf`.
- Current deck: **9 slides**, A4 landscape, with seven content chapters after the cover and contents.
- Frontend: `artifacts/deck-builder` (React, TypeScript, Vite).
- Backend: `artifacts/api-server` (Express, TypeScript), serving source inspection and PDF archives.
- The current deck and subsequent approved edits take precedence over superseded wording, figures, or layouts in the reference PDF.
- Keep changes within the requested scope. Do not redesign a scene, card, or slide when only a local text or image change was requested.

## 2. Studio layout and functionality

The responsive studio has six tabs:

| Tab | Functionality |
| --- | --- |
| Style | Theme, typography, emblem, cover background, header/footer controls, natural-language style settings, and side-by-side cover/contents previews. |
| Website context | Add/remove source URLs, assign roles, inspect supported sources, and retain editable notes and metadata. |
| Files | Drag-and-drop or select images/documents, preview assets, filter and change tags, and remove user-added assets. |
| Pitch intake | Edit presentation title/subtitle, target audience, strategic pitch prompt, presets, and stored chapter labels. |
| Financial model | Edit three dine-in shifts, takeaway orders, tickets, margins, operating days, and growth; show reactive KPIs. |
| Deck preview | Navigate slide thumbnails, jump from contents, present fullscreen, and adjust supported what-if scenarios. |

The studio header provides **Live preview** and **Save & export**. Browser persistence status is visible. Blocked preview pop-ups produce an explicit message.

### Styling and shared slide layout

- A4 landscape: **297 × 210 mm**, rendered on a **1123 × 794 px** logical canvas. Responsive previews scale the canvas without changing slide proportions.
- Palettes: Warm Cream (default), Rayana Bistro Gold, Botanical Green, and Clean Slate.
- Typography: Plus Jakarta Sans, Playfair Display, Inter, Montserrat, and JetBrains Mono. Fraunces is also bundled for app typography.
- Built-in dark/light emblems, uploaded logo options, or no emblem.
- Logo sizing presets: Small 112 px, Medium 176 px, Large Hero 256 px (default), XL 320 px. The current cover renders the chosen base size at 1.95×.
- A selected cover emblem suppresses the duplicate hero title. Preserve transparency and avoid a rectangular logo background.
- All Rayana Bistro logo lettering uses **HAPJES**, not “HAPPJES”; the upper word sits in the inner ring. Remove “Farm Direct” from the emblem itself, not from the approved slogan.
- On every non-cover slide, the top-left emblem is **75% larger** than the former 77 px baseline: **134.75 px wide**. This does not enlarge the cover.
- Controls include brand title, mini-logo visibility, section metadata visibility, footer text, and numbering: “Slide X of Y”, “X / Y”, or none.
- Default slogan/footer: **Indonesian Bites. Farm Direct Specialty Coffee**.
- Style prompt parser and suggestion chips apply supported settings; this is not a general AI design-generation service.

### Website context and assets

- Default sources: `https://www.rayanacoffees.com`, `https://www.rayanaroast.com`, and `https://www.rayanabisto.com`.
- Preserve the user-supplied `rayanabisto.com` spelling unless explicitly asked to change it.
- Roles include Primary Brand, Specialty Roastery, Wholesale, and Menu & Catering.
- Automatic inspection fetches a single public page for status, title, description, and context. It supports HTTPS Rayana Coffees and Rayana Roast hosts only, including their `www` variants; redirects are validated.
- Other URLs, including the bistro source, can be retained with manual notes. Do not imply arbitrary website crawling or automatic bistro inspection.
- Inspection errors retain the URL and support manual context. Inspection uses a timeout and cache.
- Uploads accept images, PDF, DOC/DOCX, TXT, Markdown, and CSV, with a **3 MB per-file limit**. They are stored as browser data URLs.
- Asset tags: Logo, Visual Asset, Context Doc, and Menu Spec.
- Bundled assets include dark/light emblems, founders, Indonesian snacks, pour-over coffee, and bistro meals.
- Documents provide retained context assets; uploading a document does not automatically parse it into a new presentation.

### Intake and presentation

- Audiences: Investors & Commercial Landlords, Franchise Partners, Municipal Authorities.
- Presets: Bistro Launch, Multi-Unit Expansion, Roastery-Bistro Hybrid.
- The deck is template-driven with reactive figures and audience-specific closing titles; do not describe intake prompts as an implemented free-form AI deck generator.
- Thumbnail navigation and contents jumps use the current nine-slide order.
- Fullscreen presenter supports previous/next controls, keyboard arrows, and Escape.
- What-if controls are available on slides 5–8 for shift guests, days/week, and growth. They are excluded from exported/printed slides.
- Slide 5 also exposes food/drinks spending and shift-cost assumptions for editing.

## 3. Current slide-by-slide content

### Slide 1 — Cover

- Rayana's Bistro emblem, audience/year, and subtitle; no duplicate title when the emblem is active.
- Four KPI cards, with **all card text centered**:
  1. Daily Dine-in Guests, with takeaway orders/day.
  2. Daily Revenue, with average transaction value.
  3. Year 1 Revenue, with operating days.
  4. **Year 1 Profit Estimate**, showing only the conservative value.
- Never label this a profit range.

### Slide 2 — Contents

- Main subject: Rayana's Bistro.
- Slogan: **Indonesian Bites. Farm Direct Specialty Coffee**; not “Den Haag Flagship”.
- Remove “Prepared for investors & commercial landlords. Seven chapters from brand origin to the commercial case.”
- Seven numbered chapter rows with dotted leaders and numeric page targets 3–9.
- Contents must use the revised main titles listed below, including the audience-specific final title, and jump to the corresponding slides.

### Slide 3 — Great Indonesian Food, Coffee & Culture

Three brand cards, using names as titles rather than URLs:

1. **Rayana Coffees** — `www.rayanacoffees.com`.
   - Description: “Farm-direct coffee import and Trading from small artisen farms across Indonesia.”
2. **Rayana Roast** — `www.rayanaroast.com`.
   - Description: “Small-batch roasting, wholesale supply and barista training.”
3. **Rayana Bistro** — `www.rayanabisto.com`.
   - Badge: **Yana's Kitchen**; not “Coming soon” or “Authentic Indo Flavors”.
   - Description: “Original Indonesia Recipies hand crafted served with a smile like the warm tropical sun”.

Retain the user-approved copy above, including its supplied spelling, unless asked to proofread it.

- Philosophy: “Great food and great coffee become a great love. Every Cup can be traced to a named highland farm; every snack carries a family recipe from Java and Sumatra.”
- Four-image grid: **top left Ray & Yana; top right snacks; bottom left coffee pour-over; bottom right bistro meals**.
- This slide currently provides the founders/brand introduction. There is no separate “Who is Rayana” slide in the nine-slide deck.

### Slide 4 — Taste, Discover & Enjoy

Use **only the illustrated version**. The original text-only duplicate was removed. Do not restore “Six Operational Pillars”, “Gather”, or “at Rayana's”.

Six image cards in a **three-column, two-row grid**:

| Position | Category | Default gross margin | Content |
| --- | --- | --- | --- |
| Top left | Specialty Coffee Bar | 55% | Single-origin pour-overs, espresso, iced pandan lattes, and craft drinks. |
| Top middle | Roasted Beans Retail | 55% | 250 g/1 kg Indonesian coffee bags and brewing gear; retail shelf and web. |
| Top right | Coffee Wisdom | 80% | Cupping sessions, barista workshops, and latte art workshops. |
| Bottom left | Snacks & Desserts | 45% | Indonesian snacks and desserts. |
| Bottom middle | Bistro Meals | 45% | Indonesian lunch/evening meals. |
| Bottom right | Events and Catering | 55% | Office, private party, and special events. |

- Events and Catering teaser: **“Bring people together over unforgettable Indonesian flavours.”**
- Each category has a generated illustration/photo. All margin badges use the same strong badge styling as the top-left card.
- Coffee/retail and food margins react to their shared financial inputs. Workshop 80% and catering 55% badges are fixed.
- Do not display the removed “Blended margin spread: 30% – 65%” or “Average basket €15.67” strip.

**Retail image preservation requirement**

- Retain the original generated café still-life: grinder, brass scoop, beans, table, plants, background, and overall composition.
- Replace **only the coffee bags**, using actual Rayana Roast packaging references from `www.rayanaroast.com`.
- **Srikandi's Kiss in front; Macan Guardian behind.**
- Do not replace the entire scene with an isolated product photograph or shrink it into a centered contain-fit image.
- Preserve the original full-width card treatment: 96 px-high image region with `object-fit: cover`.
- Original image: `attached_assets/generated_images/offerings-roasted-beans.jpg`.
- Current edited image: `attached_assets/generated_images/retail-original-scene-rayana-bags.jpg`.
- Current app image: `artifacts/deck-builder/public/samples/offerings-roasted-beans-rayana-scene.jpg`.

### Slide 5 — Shift Revenue Overview

Four cards: **Morning**, **Lunch**, **Dinner**, **Takeaway Orders / Catering**.

- Morning 07:30–11:30; lunch 11:30–16:30; dinner 17:00–22:00; takeaway all day.
- Each shows guests/orders per day, average check, daily turnover, annual revenue, and share of daily revenue.
- Dine-in cards additionally show the per-ticket **food + coffee/drinks breakdown**, estimated break-even guests versus expected guests, and guest buffer/shortfall.
- The fourth card shows combined food/coffee margin and daily gross profit estimate. State explicitly: **catering revenue is not yet forecast**.
- Footer states rent/utilities, staffing, margin assumptions, VAT-exclusive basis, and excluded expenses. Break-even is not a net-profit forecast.

### Slide 6 — Daily Performance, Yearly Outlook

- This replaces “Daily Unit Economics” / “Daily Unit Economies”.
- Table rows: morning, lunch, dinner, **takeaway after dinner**, then daily totals.
- Columns: shift/channel, hours, guests/orders, average ticket, daily turnover, **Profit estimate**, and share.
- Takeaway uses a **55% margin on food and coffee** by default.
- Below the table, three vertically expanded cards use **bulleted lists**, not single-line summaries:
  1. Annualisation basis: days/week, **48 weeks/year**, operating days/year.
  2. Year 1 gross revenue: annual revenue, annual dine-in guests plus takeaway orders, daily revenue.
  3. Year 1 profit estimate: estimated annual gross profit, channel margins, and costs excluded.
- Show a single conservative gross profit estimate, never a low/high range.

### Slide 7 — Twelve-Month Operating Forecast

- Twelve monthly rows and a Year 1 total.
- Columns: month, calendar days, operating days, dine-in guests, gross revenue, and **Profit estimate**.
- Allocate the 48-week annual trading-day budget across the projection year's calendar by weekday availability; closure dates are unspecified.
- Monthly operating days are whole numbers and sum exactly to annual operating days.
- Sales include takeaway; guest counts remain dine-in only.
- Gross profit is before staffing, rent, and other operating costs. No profit ranges.

### Slide 8 — Three-Year Quarterly Roadmap

- Three annual summary cards and twelve quarterly revenue bars.
- Apply the selected annual growth rate by year, preserving Year 1's quarterly calendar distribution.
- Annual cards show revenue, dine-in guests, and one **Profit Estimate**.
- Bars use full euro labels; shaded portions represent estimated gross profit before operating costs.
- Growth is an illustrative scenario, not a guaranteed result.

### Slide 9 — A Place to Remember. An Experience to Share

- Default title replaces “A Place to Return To. A Business to Grow.” and “Why Rayana Is a Bankable Tenant”.
- Eyebrow: **Indonesian Hospitality · Commercial Potential**.
- Subtitle: “Indonesian food, farm-direct coffee and shared experiences—with more than one reason to visit.”
- Nine cards in a **3 × 3 grid**:
  1. A Clear Revenue Model.
  2. Balanced Trading.
  3. From First Coffee to Dinner.
  4. Transparent Assumptions.
  5. Coffee with a Direct Connection.
  6. Room to Grow.
  7. Coffee Wisdom.
  8. Events and Catering.
  9. Take Rayana Home.
- Do not use “multi-daypart” as a card title.
- Franchise Partners closing title: **A Distinctive Concept. Room to Grow.**
- Municipal Authorities closing title: **A Welcoming Place for the Neighbourhood.**
- Slide 2 uses the matching audience-specific title.

## 4. Approved financial baseline

These are planning assumptions, not verified trading results. Preserve subsequent manual edits and explicit JSON imports.

| Input | Morning | Lunch | Dinner | Takeaway |
| --- | ---: | ---: | ---: | ---: |
| Guests/orders per day | 50 guests | 50 guests | 50 guests | 20 orders |
| Average ticket | €8.00 | €14.00 | €18.00 | €18.00 |
| Food spending per ticket | €4.00 | €10.00 | €16.00 | Not separately modelled |
| Coffee/drinks spending per ticket | €4.00 | €4.00 | €2.00 | Not separately modelled |
| Staffing per operating day | €144 | €240 | €240 | No separate staffing input |
| Daily revenue | €400 | €700 | €900 | €360 |
| Annual revenue at 240 days | €96,000 | €168,000 | €216,000 | €86,400 |

- Rent plus utilities: **€3,000/month**, charged across twelve months.
- Shared food margin: **45%**. Coffee/retail margin: **55%**.
- Takeaway combined food/coffee margin: **55%**.
- Workshops: **80%** margin; catering: **55%** margin. These offering badges do not create additional forecast revenue.
- Operating schedule: **5 days/week × 48 weeks/year = 240 operating days**.
- Annual growth default: **15%**, adjustable from 0% to 50%.
- Projection Year 1 is the next calendar year relative to runtime.
- Daily dine-in guests: **150**; takeaway orders: **20**; total transactions: **170**.
- Daily revenue: **€2,360**; Year 1 revenue: **€566,400**.
- Annual dine-in guests: **36,000**; annual takeaway orders: **4,800**.
- Display monetary values in full with separators, such as **€387,500**, never “387.5k”, “€387.5k”, or “€0.39M”. Average tickets retain two decimals.
- Display only the conservative **estimate**; do not expose low/high profit ranges.

### Revenue and forecast formulas

```text
shift daily revenue = shift guests × shift average ticket
takeaway daily revenue = orders/day × takeaway average ticket
total daily revenue = sum(dine-in shift revenue) + takeaway daily revenue
annual operating days = days/week × 48
annual revenue = total daily revenue × annual operating days
average transaction value = total daily revenue / (dine-in guests + takeaway orders)
```

Monthly operating days use calendar weekday availability as weights, with cumulative rounding so the twelve months reconcile to the annual budget. Quarter totals sum their constituent months. Year 2 and Year 3 multiply the Year 1 revenue/profit pattern by `(1 + growth)` and `(1 + growth)^2`.

### Gross profit estimate: current implementation

The displayed conservative forecast deliberately retains the existing calculation:

```text
dine-in gross profit estimate = total dine-in revenue × food margin
takeaway gross profit estimate = takeaway revenue × takeaway margin
total gross profit estimate = dine-in estimate + takeaway estimate
```

At the approved baseline:

- Dine-in: €2,000 × 45% = **€900/day**.
- Takeaway: €360 × 55% = **€198/day**.
- Total: **€1,098/day**, or **€263,520/year**.

This is **gross profit before staffing, rent, utilities, and other operating costs**, not net profit. The engine retains higher-margin values internally for compatibility, but deck profit displays use the conservative value only.

**Important distinction:** the forecast currently applies 45% to all dine-in revenue. The break-even calculation below uses the weighted food/drinks mix at 45%/55%. These are different calculation bases; do not claim they are already unified or silently change the forecast when updating this document.

### Break-even assumptions and formula

```text
contribution/guest = food spending × food margin + drinks spending × coffee margin
daily rent/utilities = monthly rent/utilities × 12 / annual operating days
shift rent/utilities = daily rent/utilities × shift hours / 14
shift covered costs = shift staffing + allocated shift rent/utilities
break-even guests = ceiling(shift covered costs / contribution per guest)
guest buffer = expected guests − break-even guests
```

- Rent/utilities allocation uses **4 / 5 / 5 hours** for morning/lunch/dinner.
- At 240 days, annual rent/utilities is €36,000, equivalent to **€150 per operating day**.
- Contribution/guest: morning €4.00; lunch €6.70; dinner €8.30.
- Break-even: **47 / 44 / 36 guests**, respectively; expected buffers **3 / 6 / 14 guests**.
- Missing required assumptions show “—” / an awaiting-input message, not invented costs. Zero contribution cannot yield a finite break-even for positive costs.
- Food spending is bounded by the total ticket; coffee/drinks spending is the remainder.
- The model supports a legacy direct shift-cost input when staffing/rent inputs are unavailable.
- Excludes insurance, administration, maintenance, financing, and tax; no separate takeaway cost allocation is forecast.

## 5. Persistence, migration, and live preview

- Primary key: `localStorage['deckBuilder.state.v4']`.
- Fallback order: sessionStorage, `window.name` with `DECK_STATE:` prefix, then memory-only state with an unsaved warning.
- Browser state includes styling, URLs/notes, uploaded assets, intake, financial inputs, and stored chapter labels.
- Migrate v1–v3 legacy state, sanitise values, remove obsolete TOC pipe characters, refresh built-in assets, retain the bistro source, and replace legacy “Den Haag Flagship” intake wording.
- Approved planning, margin, takeaway, and €8/€14/€18 ticket scenarios are applied once through migration markers; subsequent edits remain intact.
- The state layer supports explicit JSON import, preserving imported financial values rather than reapplying the approved baseline over them, and reset to defaults.
- JSON import/reset are not currently exposed as studio controls, and there is no visible JSON export action. Do not describe them as an available user-facing backup workflow. State reset does not delete archived PDFs.
- `/live-preview` presents all nine slides in a clean, read-only view.
- Editor-to-preview updates use BroadcastChannel and a same-origin opener/postMessage fallback to account for embedded-editor/top-level-tab storage partitioning. Storage events and focus refresh also update preview state.
- Only the editor writes state; preview tabs do not overwrite the editor's browser storage. A connection indicator reports whether updates are being received.

## 6. Save, download, print, and version history

The **Save & export** dialog provides:

1. **Local PDF download** — render all nine slides, archive the next project version, then download the same generated PDF using its allocated filename.
2. **Save in project** — render and archive only; no local download.
3. **Native print** — render and archive first, then open the browser print dialog with the versioned document title. The user may choose Save as PDF.

### Versioning contract

- Directory: **`doc/decks/`**.
- Filename: **`replit-example-deck-vNN.pdf`**, beginning with `replit-example-deck-v01.pdf` when no matching files exist.
- Every successful save/export action allocates **highest existing matching version + 1**. Do not derive the version from file count, client state, or a counter that resets on refresh.
- Pad to at least two digits; continue beyond v99 without resetting.
- Never overwrite an existing output. Publish completed temporary files atomically and exclusively; concurrent collisions re-scan and retry.
- Failures must be explicit; do not report an archive as saved before the server confirms it.
- A native print cancellation does not remove the PDF already archived. The browser controls the final local filename/folder, and the app cannot determine whether the user completed or cancelled printing.
- Previously archived PDFs remain historical snapshots; later deck edits do not rewrite them.

### Rendering and error handling

- Render the hidden print deck using `html-to-image` and jsPDF, with one A4 landscape page per slide.
- Current PDF rendering uses 2× pixel ratio and JPEG slide images; do not describe the PDF as a fully editable vector deck.
- Bundle local WOFF2 fonts and embed only the fonts used by slides. Do not rely on remote Google Fonts stylesheets or scan unrelated cross-origin stylesheet rules during export.
- Wait for fonts/images; fail with the affected asset/slide and a readable message if loading or rendering fails.
- Report progress while rendering and archiving. Prevent duplicate in-flight saves and disable competing export actions while busy.
- Errors include their stage, are dismissible, and must not display raw `[object Event]`.
- Version history lists newest first, with filename, version, timestamp, file size, download action, refresh, and retry on failure.

### Backend API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/healthz` | Health check. |
| `POST /api/brand-sources/inspect` | Inspect an allowed brand source. |
| `GET /api/deck-exports` | List archived PDF metadata. |
| `POST /api/deck-exports` | Validate and archive a base64 PDF, allocating its version server-side. |
| `GET /api/deck-exports/:filename` | Download a validated archive filename. |

The archive validates encoding, PDF signature/readability, maximum **30 MB** PDF size, and page count of **1–100**; it rejects cross-site saves and rate-limits repeated requests. The Deck Builder UI itself exports nine pages.

### Storage boundary

App edits/uploads are browser-local, not a shared user account or cloud document service. Project PDF history uses the server filesystem; the app explicitly warns that this is **not durable shared production storage**. Download important PDFs to keep a copy. Do not imply a local computer download is stored inside the project, or that browser autosave creates a PDF.

## 7. Implementation boundaries and consistency checks

- The current illustrated slide replaces the original; the deck, navigation, presenter, print portal, exports, and numbering all use **nine slides**.
- Main slide headings and the displayed contents share revised title definitions. Stored chapter labels remain separately editable and currently drive section-header/thumbnail metadata; those may retain older chapter wording. Do not claim those labels are fully unified with the displayed main titles.
- The slide 3 showcase currently selects its four named built-in asset slots. It is not an arbitrary uploaded-image gallery, despite older Files-tab helper wording.
- There is no separate catering sales forecast, workshop booking engine, authentication system, or automatic document-to-deck generation implemented.
- Verify that financial totals reconcile across cover, shift cards, daily table, monthly projection, quarterly roadmap, and closing case.
- Preserve full euro formatting and single conservative profit estimates across every deck output.
- For functional code changes, run the appropriate type/build checks and proportionate verification. For specification-only changes, verify the document against implementation without changing or restarting the app.
