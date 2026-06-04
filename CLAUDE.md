# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A buildless React 18 SPA cloning the AnHuy(An Huy) e-commerce storefront. The UI is Vietnamese. There is **no bundler, no transpile step, and no npm dependencies** — React, ReactDOM, and Babel Standalone are loaded from `unpkg` CDN in `index.html`, and `.jsx` files are transpiled in the browser at runtime via `<script type="text/babel" data-presets="react">`.

## Commands

```
npm run dev        # start static server at http://127.0.0.1:5173 (PORT env overrides)
npm run preview    # identical to dev
```

`server.mjs` is a ~30-line Node static file server (no framework). There is no build, lint, or test setup — verify changes by running the server and loading the page in a browser.

## Critical conventions

These are dictated by the buildless setup and must be followed or the app breaks at runtime:

- **No ES modules / no import-export.** Every `src/**` file is an IIFE (`(function () { ... })()`) that reads dependencies off `window` and assigns its own exports back to `window` (e.g. `window.Header = Header`, `window.AppHooks = {...}`). React hooks are destructured from the global `React` inside each IIFE.
- **Load order is manual and significant.** Scripts are listed one-by-one in `index.html` in dependency order: config → data → services → icons → hooks → components → `App.jsx` → `main.jsx`. A new component/service/file is invisible until you add a `<script>` tag for it in `index.html`, placed after everything it depends on.
- **`.jsx` files need `type="text/babel" data-presets="react"`** in their script tag; plain `.js` files (config, data, services, hooks) use a normal `<script>` tag.
- Components reference each other via the `window.` prefix in JSX (e.g. `<window.Header />`, `<window.ProductDetail route={route} />`), not via imports.
- Because all files share one global scope after transpile, some components alias hooks to avoid collisions (e.g. `const { useState: categoryUseState } = React`). Keep this pattern when adding files that share names.

## Architecture

**Routing** is hash-based (`useHashRoute` in `src/hooks/app-hooks.js`). `src/App.jsx` switches on `window.location.hash`: `#passion`, `#category/khay`, `#product/<slug>`, else the home page. Navigation happens through `<a href="#...">` links; there is no router library.

**Data layer** — the site reads from a **Supabase** Postgres backend via the PostgREST endpoint (`/rest/v1/...`), called with plain `fetch` (no Supabase JS client). Configure the project in `src/config/app-config.js` (`supabaseUrl`, `supabasePublishableKey`, `cdnBaseUrl`). The three services in `src/services/` (`navigation-service.js`, `category-service.js`, `product-service.js`) each duplicate the same `hasSupabaseConfig` / `getSupabaseHeaders` / `fetchJson` / `buildAssetUrl` helpers — when changing fetch behavior, update all three. If Supabase config is absent, services return `null`/`[]` and components fall back to static content in `src/data/site-data.js`.

- Auth header quirk: legacy anon JWT keys (start with `eyJ`) are sent as `Authorization: Bearer`; new `sb_publishable_*` keys are sent only as the `apikey` header.
- Images: `buildAssetUrl` prefers an image row's `public_url`, else joins `cdnBaseUrl` + `storage_key`. Static fallback assets come from the CloudFront `cdn`/`productCdn` bases defined in `site-data.js`.

**Database** — `database/schema.sql` is the full Supabase schema: catalog (`categories`, `products`, `product_categories`, `product_images`), homepage content (`hero_slides`, `featured_sections`, `content_pages`, `page_steps`, `navigation_groups`/`navigation_items`, `partners`), and cart tables. All public-facing tables have **RLS enabled** with anon read policies gated on `is_active = true` or `status = 'published'` — products/categories not meeting those flags will silently not appear in the UI. The `database/seed-*.sql` files populate navigation, the "khay" category, and fake products for local data.

**Styling** — `src/styles.css` is only a list of `@import`s; real CSS lives in `src/styles/*.css`, split per feature (header, hero, category-listing, product-detail, etc.). Scroll-in animations use the `.reveal` class observed by `useScrollReveal`, which adds `.is-visible` on intersection.

## When adding a feature

1. Create the `.jsx`/`.js` file as an IIFE that assigns to `window`.
2. Add its `<script>` tag to `index.html` in the correct dependency position (with `type="text/babel" data-presets="react"` if JSX).
3. If it has its own styles, add a CSS file under `src/styles/` and `@import` it from `src/styles.css`.
4. For new data, add a Supabase query (mirroring the existing service helpers) and a static fallback in `site-data.js`; remember RLS read policies must allow anon access.
