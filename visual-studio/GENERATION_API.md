# LAV Visual Studio — generation API

## Local run

The Visual Studio route now requires the repository server instead of a plain static file server:

```powershell
$env:RUNNINGHUB_API_KEY="your-key"
python lav_visual_server.py
```

Open `http://127.0.0.1:4173/ru/visual-studio/` or `/en/visual-studio/`.

The key is read only by Python from the process environment. It is never returned by the API, written to browser storage or included in frontend source. `.env` files are ignored by Git.

For a non-billable UI/contract check:

```powershell
$env:LAV_GENERATION_PROVIDER="mock"
python lav_visual_server.py
```

Never enable the mock provider in a deployed environment.

## Routes

- `POST /api/generations` prepares local images, submits one RunningHub task and returns `202` with `taskId`.
- `POST /api/generations/preview` builds the exact prompt plan and sanitized payload preview without uploading images or starting a paid task.
- `GET /api/generations/{taskId}` queries RunningHub and returns a sanitized `RUNNING`, `SUCCESS`, `FAILED` or `TIMEOUT` response.
- `GET /api/health` reports the active provider/channel without exposing secrets.

The frontend polls every 3 seconds and stops after 240 seconds. There is no automatic paid retry.

## RunningHub provider

- Channel: Nano Banana 2 image-to-image economy.
- Upload: `POST https://www.runninghub.ai/openapi/v2/media/upload/binary` (the `.cn` host currently responds `method not allowed` for this endpoint).
- Submit: `POST https://www.runninghub.ai/openapi/v2/rhart-image-n-g31-flash/image-to-image`.
- Query: `POST https://www.runninghub.ai/openapi/v2/query`.
- Output resolution: `1k`.
- Aspect ratio: nearest supported value calculated from the source image.
- Inputs: source first, optional selected/user reference second.

The production v1 prompt is built by `visual_studio_backend/prompt_builder.py` as ordered sections: layout preservation, style transfer, allowed transformations, materials/surfaces, décor/atmosphere, goal, descriptive palette, optional special requests and editorial photography finish. The API returns the section plan and final prompt only inside the owner/debug response; secrets are never included.

Both submit and query responses include a sanitized `debug` object with the understood task, applied image order and roles, prompt sections, final prompt and provider payload. Image data URLs are removed from preview requests and never echoed back.

## Environment variables

- `RUNNINGHUB_API_KEY` — required for real generation.
- `LAV_VISUAL_PORT` — optional, defaults to `4173`.
- `LAV_GENERATION_TIMEOUT_SECONDS` — optional, defaults to `240`.
- `RUNNINGHUB_HTTP_TIMEOUT_SECONDS` — optional per-request HTTP timeout, defaults to `60`.
- `RUNNINGHUB_API_BASE` and `RUNNINGHUB_UPLOAD_BASE` — optional testing overrides.
- `LAV_GENERATION_PROVIDER=mock` — local contract/UI testing only.

## Production follow-up

The current server is a local vertical slice. Before public deployment add authentication, per-user authorization, rate limiting, durable project/result storage, output-file copying before RunningHub's temporary URL expires, request size limits at the edge and deployment-specific secret management.
