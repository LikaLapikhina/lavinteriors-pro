# LAV Visual Studio — Stage 1 architecture

This directory is an isolated frontend product route at `/visual-studio/`. It does not replace the existing `/visual/` service page or change the main portfolio site.

## Current flow

Upload or demo image → transformation goal → change level → room → optional style/color → LAV library or user reference → special requests → prompt preview → generation.

The Generate action calls a same-origin server route. The server uploads local source/reference images, submits one RunningHub economy task and exposes sanitized task status to the browser. The API key and temporary prompt remain server-side.

The generator is a single-viewport creative workspace: canvas in the main area, a fixed composer below it, parameters in composer-anchored non-modal popovers on desktop, Project Brief in a right drawer and Projects/history in a left drawer. On mobile the parameter panels become modal bottom sheets. The document itself does not scroll on desktop or mobile; only galleries and drawers can scroll.

The empty canvas is intentionally neutral. Original appears after a source is added; Results and Compare remain hidden until a generated result exists. The current generation-price placeholder is a configurable `10 ₽` UI value shown separately from the Generate action.

## Localized routes

- `/ru/visual-studio/`
- `/en/visual-studio/`
- `/visual-studio/` remains an English-compatible entry point.

The language switch uses the History API so the URL changes while the current in-memory source image and selected parameters remain intact. Non-file settings are also retained in local storage for the prototype.

## Modules

- `index.html` plus localized route entry files — minimal application mounts.
- `styles.css` — single-viewport responsive workspace, composer, drawers and bottom sheets.
- `app.js` — localized shell, view state, projects prototype and UI orchestration.
- `data/catalog.js` — stable IDs, display labels and temporary local covers/results.
- `services/ai-provider.js` — browser client for the same-origin generation API and bounded polling lifecycle.
- `services/reference-provider.js` — manifest-backed filtering and public Google Drive thumbnail resolution, with a local fallback.
- `../visual_studio_backend/prompt_builder.py` — active modular production prompt builder; the browser only renders its sanitized debug plan.
- `services/storage-provider.js` — browser mock storage and append-only credit ledger.
- `services/payment-provider.js` — disabled mock checkout contract for future Prodamus integration.
- `services/analytics.js` — consent-aware Yandex Metrika goal adapter.

## Reference matching

References are modeled as tagged assets rather than physical folders:

`category + space_type + optional style + optional color → goal-aware metadata ranking → show 12 suitable assets`

The current `ManifestReferenceProvider` reads 2,143 pre-classified Google Drive records. See `LIBRARY_AUDIT.md`.

Stable IDs are separate from localized labels, for example `living_room`, `quiet_luxury`, `light_wood`.

## Provider boundaries

Production secrets remain server-side. The frontend calls one application backend endpoint; that backend invokes the provider and prompt builder.

```text
UI
 └─ POST /api/generations
     ├─ ReferenceProvider.getReferences(filters)
     ├─ ProductionPromptBuilder.build_prompt_plan(input)
     ├─ RunningHubProvider.upload_image(input)
     └─ RunningHubProvider.submit/query(input)
```

## Planned data model

- `users`: identity and profile metadata.
- `projects`: category, space type and current source image.
- `uploads`: source assets, aspect ratio, storage key and owner.
- `generations`: project, selected tags, provider status, output asset and timestamps.
- `styles`: stable ID, localized label, cover, prompts, active state and order.
- `reference_assets`: provider key plus multi-value category/space/style/color tags.
- `credit_transactions`: append-only purchase, charge, refund, adjustment and bonus entries.
- `purchases`: package, amount, currency, payment provider and status.
- `generated_assets`: output storage and download metadata.

Balance is derived from `credit_transactions`; it is not stored as the only source of truth.

## Prototype boundaries

- User uploads are kept only as browser object URLs.
- Drive references are read-only public thumbnails; no Drive API credentials are present.
- Real generation is enabled only when `RUNNINGHUB_API_KEY` is present on the server.
- Authentication, database and payments are intentionally absent. Production prompt v1 is active, but prompt versioning, evaluation datasets and provider-specific variants remain future work.
- RunningHub result URLs are temporary; durable output storage is a required production follow-up.

## Analytics in this prototype

The consent-aware adapter remains available for page open, upload completion and generation success/failure events. The localized Visual Studio entry files do not currently load the site-wide analytics bootstrap, which keeps the RU and EN prototype surfaces free of a cross-locale cookie banner. Payment and download events are not emitted at this stage.
