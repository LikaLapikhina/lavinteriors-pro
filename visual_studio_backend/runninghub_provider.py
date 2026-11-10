"""RunningHub provider. The API key never crosses this server boundary."""

from __future__ import annotations

import json
import mimetypes
import os
import time
import uuid
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class ProviderError(RuntimeError):
    def __init__(self, code: str, message: str, *, status: int = 502):
        super().__init__(message)
        self.code = code
        self.status = status


@dataclass(frozen=True)
class ProviderConfig:
    api_key: str
    api_base: str = "https://www.runninghub.ai"
    upload_base: str = "https://www.runninghub.ai"
    generation_path: str = "/openapi/v2/rhart-image-n-g31-flash/image-to-image"
    query_path: str = "/openapi/v2/query"
    upload_path: str = "/openapi/v2/media/upload/binary"
    timeout_seconds: int = 60


class RunningHubProvider:
    name = "runninghub"
    channel = "economy"

    def __init__(self, config: ProviderConfig):
        if not config.api_key:
            raise ProviderError("provider_not_configured", "RUNNINGHUB_API_KEY is not configured", status=503)
        self.config = config

    @classmethod
    def from_environment(cls):
        return cls(
            ProviderConfig(
                api_key=os.getenv("RUNNINGHUB_API_KEY", "").strip(),
                api_base=os.getenv("RUNNINGHUB_API_BASE", "https://www.runninghub.ai").rstrip("/"),
                upload_base=os.getenv("RUNNINGHUB_UPLOAD_BASE", "https://www.runninghub.ai").rstrip("/"),
                timeout_seconds=int(os.getenv("RUNNINGHUB_HTTP_TIMEOUT_SECONDS", "60")),
                generation_path=os.getenv("RUNNINGHUB_GENERATION_PATH", "").strip()
                or "/openapi/v2/rhart-image-n-g31-flash/image-to-image",
            )
        )

    def upload_image(self, content: bytes, filename: str, content_type: str) -> str:
        boundary = f"----lav-{uuid.uuid4().hex}"
        safe_name = os.path.basename(filename or "image.jpg").replace('"', "")
        mime = content_type or mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{safe_name}"\r\n'
            f"Content-Type: {mime}\r\n\r\n"
        ).encode("utf-8") + content + f"\r\n--{boundary}--\r\n".encode("utf-8")
        response = self._request(
            f"{self.config.upload_base}{self.config.upload_path}",
            body,
            f"multipart/form-data; boundary={boundary}",
        )
        data = response.get("data") or {}
        url = data.get("download_url") or data.get("downloadUrl") or data.get("fileUrl") or data.get("url")
        if response.get("code") not in (0, "0", None) or not url:
            code = response.get("code")
            message = response.get("message") or response.get("msg") or "no message"
            fields = ",".join(sorted(data.keys())) if isinstance(data, dict) else type(data).__name__
            raise ProviderError("upload_failed", f"RunningHub upload code={code} message={message} data_fields={fields}")
        return url

    def submit(self, *, image_urls, prompt, aspect_ratio, resolution="1k"):
        response = self._json_request(
            f"{self.config.api_base}{self.config.generation_path}",
            {
                "imageUrls": image_urls,
                "prompt": prompt,
                "aspectRatio": aspect_ratio,
                "resolution": resolution,
            },
        )
        task_id = response.get("taskId")
        if not task_id:
            raise ProviderError("submit_failed", "RunningHub did not return a task ID")
        return response

    def query(self, task_id: str):
        return self._json_request(
            f"{self.config.api_base}{self.config.query_path}",
            {"taskId": task_id},
        )

    def _json_request(self, url, payload):
        return self._request(url, json.dumps(payload).encode("utf-8"), "application/json")

    def _request(self, url, body, content_type):
        request = Request(
            url,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.config.api_key}",
                "Content-Type": content_type,
                "Accept": "application/json",
                "User-Agent": "LAV-Visual-Studio/0.1",
            },
        )
        try:
            with urlopen(request, timeout=self.config.timeout_seconds) as response:
                raw = response.read()
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:1000]
            raise ProviderError("provider_http_error", f"RunningHub HTTP {exc.code}: {detail}") from exc
        except (URLError, TimeoutError) as exc:
            raise ProviderError("provider_unavailable", "RunningHub is temporarily unavailable") from exc
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ProviderError("provider_bad_response", "RunningHub returned an invalid response") from exc


class MockRunningHubProvider:
    """Opt-in local provider used only for UI and contract tests."""

    name = "mock-runninghub"
    channel = "mock"

    def __init__(self):
        self.tasks = {}

    def upload_image(self, content: bytes, filename: str, content_type: str) -> str:
        if not content:
            raise ProviderError("upload_failed", "Empty upload")
        return f"mock://upload/{uuid.uuid4().hex}/{os.path.basename(filename)}"

    def submit(self, *, image_urls, prompt, aspect_ratio, resolution="1k"):
        task_id = f"mock-{uuid.uuid4().hex}"
        self.tasks[task_id] = {"created": time.monotonic(), "queries": 0}
        return {"taskId": task_id, "status": "RUNNING", "results": None}

    def query(self, task_id: str):
        task = self.tasks.get(task_id)
        if not task:
            return {"taskId": task_id, "status": "FAILED", "errorCode": "not_found"}
        task["queries"] += 1
        delay = float(os.getenv("LAV_MOCK_DELAY_SECONDS", "0") or 0)
        if task["queries"] < 2 or time.monotonic() - task["created"] < delay:
            return {"taskId": task_id, "status": "RUNNING", "results": None}
        if os.getenv("LAV_MOCK_FAIL") == "1":
            return {"taskId": task_id, "status": "FAILED", "errorCode": "mock_failure"}
        return {
            "taskId": task_id,
            "status": "SUCCESS",
            "results": [{"url": "/images/living2.webp", "outputType": "webp"}],
            "usage": {"consumeMoney": "0", "taskCostTime": "1"},
        }
