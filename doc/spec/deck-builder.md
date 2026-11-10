es high-fidelity brand storytelling with rigorous multi-shift hospitality unit economics. Users can ingest brand source URLs (rayanacoffees.com, rayanaroast.com), manage brand file assets, formulate investor prompts, dynamically calculate 3-shift daily/monthly/quarterly financial models, configure visual themes with dual A4 mini-previews, and present or export a pitch deck tailored for commercial landlords (e.g., in Den Haag) and hospitality investors.
2. User Experience & Visual Design
6-Tab Studio Navigation
🎨 0. Styling Studio:
Dual Live A4 Mini-Previews: Real-time rendering of Cover Slide (A4) and Inner TOC Slide (A4) side-by-side with exact 297:210 proportions.
Curated Palettes: Warm Cream (Default), Rayana Bistro Gold, Botanical Green, and Clean Slate.
Logo System: Embedded high-resolution vector brand emblems (builtin:rayana-dark, builtin:rayana-light) with 4 sizing presets (Small 112px, Medium 176px, Large Hero 256px default, XL 320px) and hero title suppression when the emblem is active.
Typography Engine: Modern Sans (Plus Jakarta Sans), Luxury Editorial Serif (Playfair Display), Clean Interface (Inter), Geometric (Montserrat), and Monospace (SFMono/JetBrains Mono).
Header & Footer Controls: Brand title, mini-logo icon toggle, section metadata toggle, slide numbering format (Slide X of Y), and custom footer descriptors.
Natural Language Style Prompt Parser: Live text parser with 1-click suggestion chips (theme: warm cream, cover bg #..., cover logo size: lg, font: sans, etc.).
🌐 1. Website URLs:
Ingestion list with default Rayana domains (www.rayanacoffees.com, www.rayanaroast.com), role assignment tags (Primary Brand, Specialty Roastery, Wholesale, Menu & Catering), HTTP status indicators, and summary notes.
📁 2. File Assets:
Drag-and-drop uploader supporting images and documents with instant Base64 thumbnail generation.
Asset tagging (Logo, Visual Asset, Context Doc, Menu Spec).
Pre-loaded authentic Rayana sample assets (Dark Emblem, Light Emblem, Specialty Pour-Over Coffee, Indonesian Snack Sampler).
✍️ 3. Intake Prompt:
Presentation Title, Target Audience selector (Investors & Commercial Landlords, Franchise Partners, Municipal Authorities), and strategic pitch prompt with quick-apply presets (Den Haag Flagship, Multi-Unit Expansion, Roastery-Bistro Hybrid).
📊 4. Revenue Model:
Interactive 3-shift configuration: Morning (Breakfast), Lunch, and Dinner.
Parameters: Guests per day (
), Average check (
), Operating days per week (1–7), Shared margins (Coffee/Retail 65%, Food/Kitchen 30%), and Annual growth rate (0%–50%).
Live KPI calculation cards and reactive input sliders.
🖥️ 5. Build / Preview Deck:
Interactive slide thumbnail strip (9 slides) with jump-to-slide navigation.
Scalable live A4 canvas (aspect-ratio 297:210) with synchronized header and footer.
Live in-slide scenario slider toggles for rapid what-if modeling.
Fullscreen Presentation Mode (keyboard arrows, Escape to exit) and Clean Print/PDF export.
9-Slide Deck Breakdown
Slide 1 — Cover Page: Hero emblem (256px), unmixed subtitle, and 4 KPI cards (Daily Guests, Daily Revenue, Year 1 Revenue, Year 1 Profit Range).
Slide 2 — Table of Contents: Single-column editorial layout, clean numbered titles (01. Brand & Sources, etc.), dotted leader lines, and pure numeric page targets with click-to-jump direct navigation.
Slide 3 — Brand & Sources: Ecosystem links to rayanacoffees.com and rayanaroast.com, brand philosophy, and visual showcase.
Slide 4 — Offerings & Pillars: 4 operational pillars with clear margin tags: Specialty Coffee Bar (65%), Roasted Beans Retail (65%), Snacks & Desserts (30%), Bistro Meals (30%).
Slide 5 — Shift Revenue Architecture: Morning, Lunch, and Dinner cards with guest counts, check sizes, daily turnover, and annual contributions.
Slide 6 — Daily Unit Economics: Structured comparison matrix displaying guest distribution, average ticket, daily turnover, and profit ranges per shift.
Slide 7 — Year 1 Monthly Projection: 12-month calendar model factoring operating days per month, rounded guest volumes, gross revenue, and low/high profit bounds.
Slide 8 — Three-Year Quarterly Projection: 12-quarter roadmap detailing compounding revenue trajectories with configurable growth rates (0%–50%).
Slide 9 — Commercial & Investor Case: 6 high-conviction highlights addressing commercial landlord viability in Den Haag, foot traffic resilience, multi-daypart revenue capture, and healthy profit margins.
3. Key Product Decisions & Trade-Offs
A4 Landscape Precision: Slides and previews strictly adopt aspect-ratio: 297 / 210 with responsive scaling (transform: scale(...) container math) so presentation proportions remain identical whether viewed on mobile, 1080p, 4K monitors, or printed to physical A4 paper.
Multi-Tier Persistence (localStorage['deckBuilder.state.v4']): All user edits, revenue parameters, styling overrides, uploaded files, and custom prompt inputs persist instantly to localStorage with failover to sessionStorage and window.name.
Auto-Migration Engine: Automatically sanitizes legacy state keys (v1, v2, v3), purges obsolete pipe characters from TOC items, ensures modern typography defaults, and upgrades logo dimensions to the Large Hero Emblem (256px).
Zero-Latency In-Browser PDF/Print: Implements CSS @page { size: 297mm 210mm; margin: 0; } with automated UI stripping, ensuring clicking "Export PDF / Print Deck" launches the native print dialog with pixel-perfect A4 Landscape presentation slides.
4. Technical Architecture & Data Strategy
Code
┌────────────────────────────────────────────────────────────────────────┐
│                        Rayana's Presentation Studio                    │
├────────────────────────────────┬───────────────────────────────────────┤
│          Studio Nav & Tabs     │         Presentation & Export Toolbar │
│  [0.Style] [1.URLs] [2.Files]  │  [Present Fullscreen] [Print to PDF]  │
│  [3.Prompt] [4.Model] [5.Deck] │  [Reset Defaults] [Export/Import JSON]│
└────────────────────────────────┴───────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│          Active Tab View        │        │       Live A4 Deck Canvas        │
│ • Styling & Dual Mini-Previews  │◄──────►│ • 297mm × 210mm Scaled Container │
│ • Brand URL Context Manager     │ (Sync) │ • 9 Interactive A4 Slides        │
│ • Asset Uploader & Base64 Store │        │ • Dotted TOC Jump Links          │
│ • Strategic Pitch Prompt        │        │ • Live In-Slide Parameter Sliders│
│ • Multi-Shift Financial Inputs  │        │ • Slide Thumbnail Strip (1-9)    │
└─────────────────────────────────┘        └──────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Multi-Tier State & Persistence                    │
│ • Primary: localStorage['deckBuilder.state.v4']                        │
│ • Fallback: sessionStorage + window.name ('DECK_STATE:...')            │
│ • Auto-Migrator: Cleans v1-v3 legacy formats & applies clean defaults  │
└────────────────────────────────────────────────────────────────────────┘
Financial Calculation Engine Formulas
\begin{aligned}
R_{\text{day}} &= \sum_{s \in {b,l,d}} (V_s \times P_s) = (40 \times 10) + (40 \times 15) + (40 \times 22) = €1,880.00 \
R_{\text{year}} &= R_{\text{day}} \times (\text{days} \times 52) = €1,880 \times 260 = €488,800.00 \
\text{Profit}{\text{low}} &= R{\text{day}} \times \text{Margin}{\text{food}} (30%) = €564.00/\text{day} \quad (€146,640.00/\text{year}) \
\text{Profit}{\text{high}} &= R_{\text{day}} \times \text{Margin}{\text{coffee}} (65%) = €1,222.00/\text{day} \quad (€317,720.00/\text{year}) \
\text{Guests}{\text{year}} &= \operatorname{round}\left(\sum V_s \times (\text{days} \times 52)\right) = 31,200 \text{ guests/year}
\end{aligned}

Compounded Growth for Years 2 and 3:
5. Implementation Sequence
Brand Assets & Types: Prepare vector emblems (builtin:rayana-dark, builtin:rayana-light), sample coffee/snack photography, and TypeScript interfaces for styling, financial parameters, URLs, assets, and presentation slides.
State Store & Migration Engine: Build robust multi-tier persistence (localStorage.v4, sessionStorage, window.name) with legacy upgrade sanitization.
Core Calculation Engine: Implement accurate daily, monthly, and 3-year financial formulas with tabular number formatting.
Studio Tabs (0 to 4): Build Styling Studio (with Dual Live A4 Mini-Previews & Natural Language Parser), URLs Manager, File Assets Uploader, Intake Prompt Editor, and Revenue Model Controls.
Live Deck & Slide Renderer (Tab 5): Implement 9 complete A4 slides with interactive thumbnail strip, live in-slide scenario sliders, jump links, and Fullscreen presentation mode.
Print & PDF Engine: Apply strict @media print A4 Landscape layout rules and verify zero-defect compilation.