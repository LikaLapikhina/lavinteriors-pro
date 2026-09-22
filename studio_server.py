# -*- coding: utf-8 -*-
"""Local preview + image save for LAV Image Studio."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import sys
import time

ROOT = Path(__file__).resolve().parent
IMAGES = ROOT / "images"
ALLOWED = {".jpg", ".jpeg", ".png", ".webp"}
PORT = 8775
BUST_FILE = IMAGES / "_cache_bust.txt"


def current_bust():
    if BUST_FILE.exists():
        return BUST_FILE.read_text(encoding="utf-8").strip() or str(int(time.time() * 1000))
    return str(int(time.time() * 1000))


def bump_bust():
    version = str(int(time.time() * 1000))
    IMAGES.mkdir(parents=True, exist_ok=True)
    BUST_FILE.write_text(version, encoding="utf-8")
    return version


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("[studio] " + (fmt % args) + "\n")

    def end_headers(self):
        # Never cache images/HTML during local editing
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/ping":
            self._json(200, {"ok": True, "images": str(IMAGES), "v": current_bust()})
            return
        if parsed.path == "/api/cache-bust":
            self._json(200, {"ok": True, "v": current_bust()})
            return
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/reorder":
            self._reorder()
            return
        if parsed.path != "/api/save":
            self.send_error(404)
            return

        qs = parse_qs(parsed.query)
        name = Path(qs.get("name", [""])[0]).name
        ext = Path(name).suffix.lower()
        if not name or ext not in ALLOWED:
            self._json(400, {"ok": False, "error": "bad filename"})
            return

        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > 40 * 1024 * 1024:
            self._json(400, {"ok": False, "error": "bad size"})
            return

        data = self.rfile.read(length)
        IMAGES.mkdir(parents=True, exist_ok=True)
        target = IMAGES / name
        # Re-encode with Pillow for progressive optimized JPEG when possible
        try:
            from PIL import Image
            import io
            im = Image.open(io.BytesIO(data))
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            elif im.mode == "L":
                im = im.convert("RGB")
            # soft size cap by long edge
            max_edge = 2200
            w, h = im.size
            long_edge = max(w, h)
            if long_edge > max_edge:
                scale = max_edge / long_edge
                im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=80, optimize=True, progressive=True)
            data = buf.getvalue()
        except Exception as e:
            sys.stderr.write(f"[studio] pillow optimize skipped: {e}\n")
        target.write_bytes(data)
        version = bump_bust()
        self._json(200, {"ok": True, "file": name, "bytes": len(data), "v": version})

    def _reorder(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > 2 * 1024 * 1024:
            self._json(400, {"ok": False, "error": "bad body"})
            return
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            self._json(400, {"ok": False, "error": "bad json"})
            return

        order = body.get("order") or []
        destinations = body.get("destinations") or []
        if not isinstance(order, list) or not isinstance(destinations, list):
            self._json(400, {"ok": False, "error": "order/destinations must be lists"})
            return
        if len(order) != len(destinations) or not order:
            self._json(400, {"ok": False, "error": "length mismatch"})
            return

        src_names = [Path(str(n)).name for n in order]
        dst_names = [Path(str(n)).name for n in destinations]
        for n in src_names + dst_names:
            if Path(n).suffix.lower() not in ALLOWED:
                self._json(400, {"ok": False, "error": f"bad file: {n}"})
                return

        IMAGES.mkdir(parents=True, exist_ok=True)
        # Read all sources first so overwrite is safe
        blobs = []
        for name in src_names:
            path = IMAGES / name
            blobs.append(path.read_bytes() if path.exists() else b"")

        for name, data in zip(dst_names, blobs):
            (IMAGES / name).write_bytes(data)

        version = bump_bust()
        self._json(200, {"ok": True, "v": version, "count": len(dst_names)})

    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    bump_bust()
    # Prevent a second process from silently sharing the port (Windows SO_REUSEADDR).
    ThreadingHTTPServer.allow_reuse_address = False
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError as e:
        print(f"Port {PORT} is busy. Close the old server and try again.")
        print(e)
        sys.exit(1)

    print("=" * 56)
    print(" LAV Image Studio")
    print(f" Open: http://127.0.0.1:{PORT}/image-studio.html")
    print(f" Saves into: {IMAGES}")
    print("=" * 56)
    server.serve_forever()


if __name__ == "__main__":
    main()
