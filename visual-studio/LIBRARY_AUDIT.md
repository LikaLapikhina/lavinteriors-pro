# LAV Visual Studio — reference library audit

Audit date: 2026-10-06.

## What is connected

- `data/references_manifest.json` contains 2,143 classified assets.
- Every asset has a Google Drive file ID in `sourceKey` and a logical `drivePath`.
- The browser loads the manifest through `ManifestReferenceProvider`.
- Public thumbnails are rendered through `https://drive.google.com/thumbnail?id={sourceKey}&sz=w900`.
- A live check confirmed that Drive redirects these links to viewable `googleusercontent.com` images.

This is a real library connection for reading and selecting public reference images. It is not a Google Drive API integration: there is no token, API key, folder sync, upload, mutation or private-file access in the frontend.

## Available metadata

Each record includes stable fields:

- `id`, `sourceProvider`, `sourceKey`, `drivePath`, `active`;
- `category`;
- multi-value `spaceTypes`, `styles`, `colors`;
- `metadata.filename`, `primary_direction`, `quality_score`, `source_type`;
- quality flags: `has_watermark`, `has_people`, `has_text`, `has_ui_elements`, `is_collage`;
- `creative_dna` and `visual_description`.

The existing classification is consumed as-is. The UI does not rewrite or re-sort the source taxonomy.

## Current UI behavior

- category and room filter the pool;
- optional style and color narrow it when matching assets exist;
- the selected goal ranks existing assets using `creative_dna`, style and color metadata;
- clean, high-quality assets are prioritized;
- eight real references are shown and one can be selected;
- a user can upload their own reference instead;
- source image, goal, change level, room, style, color, reference and special requests are shown in the summary;
- Generate opens a structured request preview only. No AI/model request, production prompt, key, payment or credit charge exists.

## What is still missing for production

- an automated manifest export/sync process when Drive changes;
- a stable image delivery layer or backend proxy if public Drive thumbnail URLs become rate-limited or permissions change;
- backend authorization if the library becomes private;
- generation API and production prompt composition (intentionally excluded from this stage).

