"""Local static server and secure API proxy for LAV Visual Studio."""

from __future__ import annotations

import base64
import binascii
import json
import mimetypes
import os
import re
import secrets
import sys
import threading
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

mimetypes.add_type("image/webp", ".webp")

from visual_studio_backend.prompt_builder import MAX_REFERENCES, build_prompt_plan
from visual_studio_backend.runninghub_provider import (
    MockRunningHubProvider,
    ProviderError,
    RunningHubProvider,
)


ROOT = Path(__file__).resolve().parent
PORT = int(os.getenv("LAV_VISUAL_PORT", "4173"))
MAX_BODY = 64 * 1024 * 1024
MAX_IMAGE = 20 * 1024 * 1024
TASK_TIMEOUT = int(os.getenv("LAV_GENERATION_TIMEOUT_SECONDS", "240"))
DATA_URL = re.compile(r"^data:(image/(?:jpeg|png|webp));base64,(.+)$", re.DOTALL | re.IGNORECASE)
TASKS = {}
RESULTS_DIR = Path(os.getenv("LAV_RESULTS_DIR") or (ROOT / ".lav_results")).resolve()
RESULT_NAME = re.compile(r"^[A-Za-z0-9_-]{1,120}\.(?:png|jpe?g|webp)$")
RESULT_TYPES = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
MAX_RESULT = 30 * 1024 * 1024
MIME_EXT = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp"}
# library references may only be fetched from these hosts (Google Drive thumbnails)
REMOTE_HOSTS = ("drive.google.com", "googleusercontent.com")
MODEL_LABEL = os.getenv("LAV_MODEL_LABEL", "Nano Banana 2 image-to-image (economy)")
GOAL_REFS = ROOT / "visual-studio" / "data" / "goal_references.json"
JOURNAL_LOCK = threading.Lock()
# library style references are fetched smaller than the room photo (room photo stays the dominant image)
REFERENCE_SIDE = int(os.getenv("LAV_REFERENCE_SIDE", "768"))


def make_provider():
    if os.getenv("LAV_GENERATION_PROVIDER", "runninghub").lower() == "mock":
        return MockRunningHubProvider()
    return RunningHubProvider.from_environment()


PROVIDER = None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("[lav-visual] " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._json(200, {
                "ok": True,
                "provider": PROVIDER.name,
                "channel": PROVIDER.channel,
                "configured": not isinstance(PROVIDER, MockRunningHubProvider),
            })
            return
        if parsed.path == "/api/owner/journal":
            self._owner_journal()
            return
        if parsed.path == "/api/reference-scores":
            self._reference_scores()
            return
        if parsed.path.startswith("/api/results/"):
            self._serve_result(parsed.path.rsplit("/", 1)[-1])
            return
        if parsed.path.startswith("/api/generations/"):
            self._query_generation(parsed.path.rsplit("/", 1)[-1])
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/generations/preview":
            self._preview_generation()
            return
        if path == "/api/owner/goal-references":
            self._owner_goal_references()
            return
        if path == "/api/feedback":
            self._feedback()
            return
        if path == "/api/generations":
            self._create_generation()
            return
        self.send_error(404)

    def _is_owner(self):
        return self.client_address[0] in {"127.0.0.1", "::1", "localhost"}

    def _owner_request(self, request):
        """Owner-only knobs are ignored unless the request comes from this machine."""
        if not self._is_owner():
            request.pop("promptOverride", None)
            request.pop("noReference", None)
        request["_noReference"] = bool(request.get("noReference"))
        refs = request.get("references")
        refs = [r for r in refs if isinstance(r, dict)] if isinstance(refs, list) else []
        if not refs and isinstance(request.get("reference"), dict):
            refs = [request["reference"]]
        if request["_noReference"]:
            refs = []
        request["references"] = refs[:MAX_REFERENCES]
        request["reference"] = request["references"][0] if request["references"] else None
        return request

    def _build_plan(self, request, names):
        plan = build_prompt_plan(request, names)
        override = str(request.get("promptOverride") or "").strip()
        if override:
            if names:
                override = re.sub(r"ROOM_TO_REDESIGN_preview\.\w+", names[0], override)
                for index, name in enumerate(names[1:], start=1):
                    override = re.sub(rf"STYLE_REFERENCE_{index}_preview\.\w+", name, override)
            plan = dict(plan)
            plan["sections"] = [{"id": "owner_override", "title": "Owner prompt override", "text": override, "driver": "owner"}]
            plan["finalPrompt"] = override
            plan["overridden"] = True
        return plan

    def _preview_generation(self):
        try:
            request = self._owner_request(self._read_json())
            code = "preview"
            names = [f"ROOM_TO_REDESIGN_{code}.jpg"] + [f"STYLE_REFERENCE_{i}_{code}.jpg" for i in range(1, len(request["references"]) + 1)]
            plan = self._build_plan(request, names)
            self._json(200, {"debug": self._generation_debug(request, plan, None, names)})
        except (ValueError, KeyError) as exc:
            self.log_message("invalid preview request: %s", str(exc))
            self._json(400, {"error": {"code": "invalid_request"}})

    def _create_generation(self):
        try:
            request = self._owner_request(self._read_json())
            code = secrets.token_hex(3)
            source_url, room_name, source_bytes = self._prepare_image(request.get("sourceImage"), "source", f"ROOM_TO_REDESIGN_{code}")
            image_urls, names = [source_url], [room_name]
            for index, reference in enumerate(request["references"], start=1):
                ref_url, ref_name, _ = self._prepare_image(reference, "reference", f"STYLE_REFERENCE_{index}_{code}")
                image_urls.append(ref_url)
                names.append(ref_name)

            plan = self._build_plan(request, names)
            prompt = plan["finalPrompt"]
            aspect_ratio = request.get("aspectRatio") or "1:1"
            resolution = request.get("resolution") or "1k"
            submitted = PROVIDER.submit(
                image_urls=image_urls,
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                resolution=resolution,
            )
            task_id = str(submitted["taskId"])
            debug = self._generation_debug(request, plan, image_urls, names)
            TASKS[task_id] = {
                "created": time.monotonic(),
                "aspectRatio": aspect_ratio,
                "resolution": resolution,
                "imageCount": len(image_urls),
                "userPrice": (request.get("pricing") or {}).get("userPrice"),
                "currency": (request.get("pricing") or {}).get("currency", "RUB"),
                "debug": debug,
            }
            self._journal_submit(task_id, code, request, debug, source_bytes)
            self.log_message("submitted task=%s images=%s ratio=%s", task_id, len(image_urls), aspect_ratio)
            self._json(202, {
                "taskId": task_id,
                "status": submitted.get("status", "RUNNING"),
                "provider": PROVIDER.name,
                "channel": PROVIDER.channel,
                "pricing": {
                    "providerCost": None,
                    "userPrice": TASKS[task_id]["userPrice"],
                    "currency": TASKS[task_id]["currency"],
                },
                "debug": debug,
            })
        except ProviderError as exc:
            self.log_message("provider error code=%s detail=%s", exc.code, str(exc))
            self._json(exc.status, {"error": {"code": exc.code}})
        except (ValueError, KeyError) as exc:
            self.log_message("invalid generation request: %s", str(exc))
            self._json(400, {"error": {"code": "invalid_request"}})
        except Exception as exc:
            self.log_message("unexpected generation error: %r", exc)
            self._json(500, {"error": {"code": "internal_error"}})

    # --- owner test journal -------------------------------------------------------------
    def _journal_submit(self, task_id, code, request, debug, source_bytes):
        try:
            RESULTS_DIR.mkdir(parents=True, exist_ok=True)
            safe_id = re.sub(r"[^A-Za-z0-9_-]", "", task_id)[:80] or code
            source_file = None
            if source_bytes:
                ext = Path((debug.get("imageNames") or ["x.jpg"])[0]).suffix.lower() or ".jpg"
                source_file = f"{safe_id}_source{ext}"
                (RESULTS_DIR / source_file).write_bytes(source_bytes)
            entry = {
                "event": "submit",
                "taskId": task_id,
                "time": time.strftime("%Y-%m-%d %H:%M:%S"),
                "provider": PROVIDER.name,
                "settings": debug.get("understoodTask"),
                "references": debug.get("references"),
                "imageNames": debug.get("imageNames"),
                "finalPrompt": debug.get("finalPrompt"),
                "promptVersion": debug.get("promptVersion"),
                "overridden": bool(debug.get("overridden")),
                "source": f"/api/results/{source_file}" if source_file else None,
            }
            with JOURNAL_LOCK, open(RESULTS_DIR / "journal.jsonl", "a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception as exc:
            self.log_message("journal write failed: %r", exc)

    def _journal_result(self, task_id, status, results, cost):
        try:
            entry = {"event": "result", "taskId": task_id, "time": time.strftime("%Y-%m-%d %H:%M:%S"),
                     "status": status, "results": [item.get("url") for item in results], "providerCost": cost}
            with JOURNAL_LOCK, open(RESULTS_DIR / "journal.jsonl", "a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception as exc:
            self.log_message("journal write failed: %r", exc)

    def _read_runs(self):
        runs = {}
        path = RESULTS_DIR / "journal.jsonl"
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                try:
                    item = json.loads(line)
                except json.JSONDecodeError:
                    continue
                run = runs.setdefault(item.get("taskId"), {"taskId": item.get("taskId")})
                event = item.get("event")
                if event == "submit":
                    run.update({key: value for key, value in item.items() if key != "event"})
                elif event == "feedback":
                    if "rating" in item:
                        run["rating"] = item.get("rating")
                    if "favorite" in item:
                        run["favorite"] = item.get("favorite")
                else:
                    run.update({"status": item.get("status"), "results": item.get("results"),
                                "providerCost": item.get("providerCost"), "finished": item.get("time")})
        return runs

    def _owner_journal(self):
        if not self._is_owner():
            self.send_error(404)
            return
        items = sorted(self._read_runs().values(), key=lambda run: run.get("time") or "", reverse=True)
        self._json(200, {"runs": items[:200]})

    def _feedback(self):
        """Like / dislike / favourite for one result. Stored in the journal; used to rank library references."""
        try:
            body = self._read_json()
            task_id = str(body.get("taskId") or "")
            if not re.match(r"^[A-Za-z0-9_-]{1,120}$", task_id):
                raise ValueError("invalid task id")
            entry = {"event": "feedback", "taskId": task_id, "time": time.strftime("%Y-%m-%d %H:%M:%S")}
            if "rating" in body:
                rating = int(body.get("rating") or 0)
                if rating not in (-1, 0, 1):
                    raise ValueError("invalid rating")
                entry["rating"] = rating
            if "favorite" in body:
                entry["favorite"] = bool(body.get("favorite"))
            RESULTS_DIR.mkdir(parents=True, exist_ok=True)
            with JOURNAL_LOCK, open(RESULTS_DIR / "journal.jsonl", "a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
            self._json(200, {"ok": True})
        except (ValueError, TypeError) as exc:
            self.log_message("feedback rejected: %s", str(exc))
            self._json(400, {"error": {"code": "invalid_request"}})

    def _reference_scores(self):
        """{referenceId: score}: +1 per like / favourite, -1 per dislike of a result that used the reference."""
        scores = {}
        for run in self._read_runs().values():
            value = int(run.get("rating") or 0) + (1 if run.get("favorite") else 0)
            if not value:
                continue
            for ref in run.get("references") or []:
                ref_id = ref.get("id") if isinstance(ref, dict) else None
                if ref_id and ref.get("role") == "style_reference":
                    scores[ref_id] = scores.get(ref_id, 0) + value
        self._json(200, {"scores": scores})

    def _owner_goal_references(self):
        if not self._is_owner():
            self.send_error(404)
            return
        try:
            body = self._read_json()
            goal = str(body.get("goal") or "")
            ref_id = str(body.get("referenceId") or "")
            if not re.match(r"^[a-z_]{2,40}$", goal) or not re.match(r"^[A-Za-z0-9_.:-]{1,120}$", ref_id):
                raise ValueError("invalid goal or reference")
            data = {"version": 1, "goals": {}}
            if GOAL_REFS.is_file():
                data = json.loads(GOAL_REFS.read_text(encoding="utf-8"))
            pinned = data.setdefault("goals", {}).setdefault(goal, [])
            if body.get("remove"):
                pinned[:] = [item for item in pinned if item != ref_id]
            elif ref_id not in pinned:
                pinned.append(ref_id)
            GOAL_REFS.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            self._json(200, data)
        except (ValueError, KeyError, json.JSONDecodeError) as exc:
            self.log_message("goal reference update failed: %s", str(exc))
            self._json(400, {"error": {"code": "invalid_request"}})

    def _query_generation(self, task_id):
        task = TASKS.get(task_id)
        if not task:
            self._json(404, {"error": {"code": "task_not_found"}})
            return
        if time.monotonic() - task["created"] > TASK_TIMEOUT:
            self._json(200, {"taskId": task_id, "status": "TIMEOUT", "results": []})
            return
        try:
            result = PROVIDER.query(task_id)
            status = str(result.get("status") or "RUNNING").upper()
            safe_results = [
                {"url": item.get("url"), "outputType": item.get("outputType")}
                for item in (result.get("results") or [])
                if item.get("url")
            ]
            if status == "SUCCESS" and safe_results:
                if "cachedResults" not in task:
                    task["cachedResults"] = self._cache_results(task_id, safe_results)
                safe_results = task["cachedResults"]
            response = {
                "taskId": task_id,
                "status": status,
                "results": safe_results,
                "pricing": {
                    "providerCost": (result.get("usage") or {}).get("thirdPartyConsumeMoney")
                    or (result.get("usage") or {}).get("consumeMoney"),
                    "userPrice": task["userPrice"],
                    "currency": task["currency"],
                },
                "debug": task.get("debug"),
            }
            if status == "FAILED":
                response["error"] = {"code": "generation_failed"}
            if status in {"SUCCESS", "FAILED"}:
                elapsed = round(time.monotonic() - task["created"], 1)
                self.log_message("completed task=%s status=%s elapsed=%ss", task_id, status, elapsed)
                if not task.get("journaled"):
                    task["journaled"] = True
                    self._journal_result(task_id, status, safe_results, response["pricing"]["providerCost"])
            self._json(200, response)
        except ProviderError as exc:
            self.log_message("query error task=%s code=%s detail=%s", task_id, exc.code, str(exc))
            self._json(exc.status, {"error": {"code": exc.code}})

    def _cache_results(self, task_id, results):
        safe_id = re.sub(r"[^A-Za-z0-9_-]", "", task_id)[:80] or "task"
        cached = []
        for index, item in enumerate(results):
            url = str(item.get("url") or "")
            if not url.startswith("https://"):
                cached.append(item)
                continue
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "LAV-Visual-Studio"}), timeout=60) as response:
                    content = response.read(MAX_RESULT + 1)
                    content_type = (response.headers.get("Content-Type") or "").split(";")[0].strip().lower()
                if not content or len(content) > MAX_RESULT:
                    raise ValueError("invalid result size")
                ext = {"image/png": "png", "image/webp": "webp", "image/jpeg": "jpg"}.get(content_type)
                if not ext:
                    suffix = Path(urlparse(url).path).suffix.lower().lstrip(".")
                    ext = suffix if suffix in RESULT_TYPES else "png"
                RESULTS_DIR.mkdir(parents=True, exist_ok=True)
                name = f"{safe_id}_{index}.{ext}"
                (RESULTS_DIR / name).write_bytes(content)
                cached.append({"url": f"/api/results/{name}", "outputType": ext})
            except Exception as exc:  # keep the temporary provider URL as a fallback
                self.log_message("result cache failed task=%s: %r", task_id, exc)
                cached.append(item)
        return cached

    def _serve_result(self, name):
        if not RESULT_NAME.match(name):
            self.send_error(404)
            return
        path = (RESULTS_DIR / name).resolve()
        if path.parent != RESULTS_DIR or not path.is_file():
            self.send_error(404)
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", RESULT_TYPES[name.rsplit(".", 1)[-1].lower()])
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        if "download" in self.path:
            self.send_header("Content-Disposition", f'attachment; filename="{name}"')
        self.end_headers()
        self.wfile.write(body)

    def _prepare_image(self, item, role, base_name):
        """Upload an image under a descriptive name. Returns (provider_url, filename, raw_bytes_or_None)."""
        if not isinstance(item, dict):
            raise ValueError(f"{role} image is required")
        data_url = item.get("dataUrl")
        if data_url:
            match = DATA_URL.match(data_url)
            if not match:
                raise ValueError(f"invalid {role} image")
            try:
                content = base64.b64decode(match.group(2), validate=True)
            except (binascii.Error, ValueError) as exc:
                raise ValueError(f"invalid {role} image encoding") from exc
            if not content or len(content) > MAX_IMAGE:
                raise ValueError(f"invalid {role} image size")
            mime = match.group(1).lower()
            name = f"{base_name}.{MIME_EXT.get(mime, 'jpg')}"
            return PROVIDER.upload_image(content, name, mime), name, content

        url = str(item.get("url") or "")
        if url.startswith("https://"):
            host = (urlparse(url).hostname or "").lower()
            if not any(host == allowed or host.endswith("." + allowed) for allowed in REMOTE_HOSTS):
                raise ValueError(f"{role} host is not allowed")
            name = f"{base_name}.jpg"
            if role == "reference" and "drive.google.com/thumbnail" in url:
                url = re.sub(r"sz=w\d+", f"sz=w{REFERENCE_SIDE}", url)
            if isinstance(PROVIDER, MockRunningHubProvider):
                return url, name, None  # free mode: never download
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 LAV-Visual-Studio"})
            with urllib.request.urlopen(request, timeout=40) as response:
                content = response.read(MAX_IMAGE + 1)
                mime = (response.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            if not content or len(content) > MAX_IMAGE or not mime.startswith("image/"):
                raise ValueError(f"invalid {role} remote image")
            name = f"{base_name}.{MIME_EXT.get(mime, 'jpg')}"
            return PROVIDER.upload_image(content, name, mime), name, None
        if url.startswith("/"):
            local = (ROOT / url.lstrip("/")).resolve()
            if ROOT not in local.parents or not local.is_file():
                raise ValueError(f"invalid {role} asset")
            content = local.read_bytes()
            if len(content) > MAX_IMAGE:
                raise ValueError(f"invalid {role} image size")
            suffix = local.suffix.lower().lstrip(".")
            mime = {"webp": "image/webp", "png": "image/png"}.get(suffix, "image/jpeg")
            name = f"{base_name}.{MIME_EXT[mime]}"
            return PROVIDER.upload_image(content, name, mime), name, content
        raise ValueError(f"invalid {role} image")

    def _generation_debug(self, request, plan, image_urls=None, names=None):
        names = names or []
        source = request.get("sourceImage") or {}
        references = [{
            "position": 1,
            "role": "source",
            "name": source.get("name") or Path(str(source.get("url") or "source image")).name,
            "sentAs": names[0] if names else None,
            "source": source.get("source") or ("user_upload" if source.get("dataUrl") else "project_asset"),
            "reason": ["primary layout", "camera", "geometry", "object placement"],
        }]
        for index, reference in enumerate(request.get("references") or [], start=1):
            references.append({
                "position": index + 1,
                "role": "style_reference",
                "name": reference.get("name") or reference.get("id") or "style reference",
                "sentAs": names[index] if len(names) > index else None,
                "id": reference.get("id"),
                "source": reference.get("source") or "library",
                "selection": reference.get("selection") or ("user" if reference.get("dataUrl") else "library"),
                "previewUrl": reference.get("preview") or (reference.get("url") if str(reference.get("url") or "").startswith("https://") else None),
                "reason": reference.get("matchedBy") or ["explicit user selection"],
            })

        urls = image_urls or [
            f"[Image {item['position']}: {item['role']} — {item.get('sentAs') or item['name']}]" for item in references
        ]
        return {
            "promptVersion": plan["version"],
            "overridden": bool(plan.get("overridden")),
            "noReference": bool(request.get("_noReference")),
            "imageNames": names,
            "understoodTask": {
                "room": request.get("room"),
                "goal": request.get("goal"),
                "style": request.get("style"),
                "color": request.get("color"),
                "changeLevel": plan.get("changeLevel") or request.get("changeLevel"),
                "specialRequests": request.get("specialRequests"),
            },
            "references": references,
            "promptSections": plan["sections"],
            "finalPrompt": plan["finalPrompt"],
            "payload": {
                "imageUrls": [url if not str(url).startswith("data:") else "[inline image]" for url in urls],
                "aspectRatio": request.get("aspectRatio") or "1:1",
                "resolution": request.get("resolution") or "1k",
                "provider": PROVIDER.name,
                "channel": PROVIDER.channel,
                "model": MODEL_LABEL,
                "endpoint": getattr(getattr(PROVIDER, "config", None), "generation_path", "mock"),
            },
        }

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > MAX_BODY:
            raise ValueError("invalid request size")
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("invalid JSON") from exc

    def _json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    global PROVIDER
    try:
        PROVIDER = make_provider()
    except ProviderError as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        print("Set RUNNINGHUB_API_KEY or use LAV_GENERATION_PROVIDER=mock for local UI testing.", file=sys.stderr)
        raise SystemExit(2)

    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"LAV Visual Studio: http://127.0.0.1:{PORT}/ru/visual-studio/")
    print(f"Generation provider: {PROVIDER.name} ({PROVIDER.channel})")
    server.serve_forever()


if __name__ == "__main__":
    main()
