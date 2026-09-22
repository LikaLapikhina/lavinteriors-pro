# -*- coding: utf-8 -*-
"""
Pinterest OAuth + publish (boards + pins).

One-time setup (in Chrome — Google login works there):
1. Open https://developers.pinterest.com/apps/ and create an app.
2. Add redirect URI exactly: http://127.0.0.1:8787/callback
3. Put App ID + App Secret into pinterest/.env (see .env.example)
4. Run:  python pinterest/oauth_login.py
5. Browser opens → Allow → tokens saved to pinterest/secrets/token.json
6. Run:  python pinterest/publish.py

Scopes needed: boards:read,boards:write,pins:read,pins:write,user_accounts:read
Note: Trial access may block pin create until Standard approval — script reports the API error clearly.
"""
from __future__ import annotations

import base64
import json
import os
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SECRETS = ROOT / "secrets"
TOKEN_PATH = SECRETS / "token.json"
ENV_PATH = ROOT / ".env"
REDIRECT = "http://127.0.0.1:8787/callback"
SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read"
API = "https://api.pinterest.com/v5"


def load_env() -> dict:
    data = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            data[k.strip()] = v.strip().strip('"').strip("'")
    # also allow process env
    for k in ("PINTEREST_APP_ID", "PINTEREST_APP_SECRET"):
        if os.environ.get(k):
            data[k] = os.environ[k]
    return data


def api(method: str, path: str, token: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} → HTTP {e.code}: {err}") from e


def save_token(payload: dict) -> None:
    SECRETS.mkdir(parents=True, exist_ok=True)
    payload["saved_at"] = int(time.time())
    TOKEN_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_token() -> dict:
    if not TOKEN_PATH.exists():
        raise SystemExit("No token yet. Run: python pinterest/oauth_login.py")
    return json.loads(TOKEN_PATH.read_text(encoding="utf-8"))


def refresh_if_needed(tok: dict, env: dict) -> dict:
    # access tokens expire (~30d); refresh when near expiry if we have refresh_token
    expires_at = tok.get("expires_at") or (tok.get("saved_at", 0) + int(tok.get("expires_in", 0)))
    if time.time() < expires_at - 3600:
        return tok
    refresh = tok.get("refresh_token")
    if not refresh:
        raise SystemExit("Access token expired — run oauth_login.py again")
    app_id = env.get("PINTEREST_APP_ID")
    secret = env.get("PINTEREST_APP_SECRET")
    basic = base64.b64encode(f"{app_id}:{secret}".encode()).decode()
    body = urllib.parse.urlencode(
        {"grant_type": "refresh_token", "refresh_token": refresh, "scope": SCOPES}
    ).encode()
    req = urllib.request.Request(
        "https://api.pinterest.com/v5/oauth/token",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        new = json.loads(resp.read().decode())
    new["expires_at"] = int(time.time()) + int(new.get("expires_in", 2592000))
    if "refresh_token" not in new and refresh:
        new["refresh_token"] = refresh
    save_token(new)
    return new


def exchange_code(code: str, env: dict) -> dict:
    app_id = env["PINTEREST_APP_ID"]
    secret = env["PINTEREST_APP_SECRET"]
    basic = base64.b64encode(f"{app_id}:{secret}".encode()).decode()
    body = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT,
            "continuous_refresh": "true",
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.pinterest.com/v5/oauth/token",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        tok = json.loads(resp.read().decode())
    tok["expires_at"] = int(time.time()) + int(tok.get("expires_in", 2592000))
    save_token(tok)
    return tok


def run_oauth() -> None:
    env = load_env()
    if not env.get("PINTEREST_APP_ID") or not env.get("PINTEREST_APP_SECRET"):
        raise SystemExit(
            "Create pinterest/.env with PINTEREST_APP_ID and PINTEREST_APP_SECRET "
            "(from https://developers.pinterest.com/apps/)"
        )
    state = secrets.token_urlsafe(16)
    auth_url = (
        "https://www.pinterest.com/oauth/?"
        + urllib.parse.urlencode(
            {
                "client_id": env["PINTEREST_APP_ID"],
                "redirect_uri": REDIRECT,
                "response_type": "code",
                "scope": SCOPES,
                "state": state,
            }
        )
    )
    result = {"code": None, "error": None}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path != "/callback":
                self.send_response(404)
                self.end_headers()
                return
            q = urllib.parse.parse_qs(parsed.query)
            if q.get("state", [None])[0] != state:
                result["error"] = "state mismatch"
            else:
                result["code"] = q.get("code", [None])[0]
                result["error"] = q.get("error", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            msg = (
                "<h2>LAV Interiors — Pinterest connected</h2><p>You can close this tab.</p>"
                if result["code"] and not result["error"]
                else f"<h2>Auth failed</h2><p>{result['error']}</p>"
            )
            self.wfile.write(msg.encode("utf-8"))

        def log_message(self, *_args):
            return

    server = HTTPServer(("127.0.0.1", 8787), Handler)
    t = threading.Thread(target=server.handle_request, daemon=True)
    t.start()
    print("Opening Chrome for Pinterest Allow…")
    print(auth_url)
    webbrowser.open(auth_url)
    t.join(timeout=300)
    server.server_close()
    if not result["code"]:
        raise SystemExit(f"OAuth failed: {result['error'] or 'no code (timeout?)'}")
    tok = exchange_code(result["code"], env)
    me = api("GET", "/user_account", tok["access_token"])
    print("Connected as:", me.get("username") or me)
    print("Token saved:", TOKEN_PATH)


def list_boards(token: str) -> list[dict]:
    items = []
    bookmark = None
    while True:
        q = "?page_size=100"
        if bookmark:
            q += "&bookmark=" + urllib.parse.quote(bookmark)
        data = api("GET", "/boards" + q, token)
        items.extend(data.get("items") or [])
        bookmark = data.get("bookmark")
        if not bookmark:
            break
    return items


def ensure_board(token: str, name: str, cache: dict[str, str]) -> str:
    if name in cache:
        return cache[name]
    created = api(
        "POST",
        "/boards",
        token,
        {"name": name, "description": f"LAV Interiors — {name}", "privacy": "PUBLIC"},
    )
    bid = created.get("id")
    if not bid:
        raise RuntimeError(f"Board create failed for {name}: {created}")
    cache[name] = bid
    print("Created board:", name, bid)
    return bid


def create_pin(token: str, board_id: str, pin: dict, image_path: Path) -> dict:
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    body = {
        "board_id": board_id,
        "title": pin["pin_title"][:100],
        "description": pin["pin_description"][:800],
        "link": pin["link"],
        "alt_text": pin["pin_title"][:500],
        "media_source": {
            "source_type": "image_base64",
            "content_type": "image/jpeg",
            "data": b64,
        },
    }
    return api("POST", "/pins", token, body)


def publish_batch() -> None:
    env = load_env()
    tok = refresh_if_needed(load_token(), env)
    token = tok["access_token"]
    me = api("GET", "/user_account", token)
    print("Publishing as:", me.get("username"))

    boards = list_boards(token)
    cache = {b.get("name"): b.get("id") for b in boards if b.get("name") and b.get("id")}
    print("Existing boards:", len(cache))

    needed = json.loads((ROOT / "boards.json").read_text(encoding="utf-8"))
    for name in needed:
        if name not in cache:
            ensure_board(token, name, cache)
        else:
            print("Board exists:", name)

    pins = [
        json.loads(line)
        for line in (ROOT / "pins.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    log = []
    for pin in pins:
        img = ROOT.parent / pin["pin_file"]
        if not img.exists():
            print("MISSING", img)
            continue
        for board_name in pin["boards"]:
            bid = cache.get(board_name) or ensure_board(token, board_name, cache)
            try:
                created = create_pin(token, bid, pin, img)
                print("OK", pin["id"], "→", board_name, created.get("id"))
                log.append({"pin_id": pin["id"], "board": board_name, "pinterest_id": created.get("id"), "ok": True})
                time.sleep(1.2)  # gentle rate limit
            except Exception as e:
                print("FAIL", pin["id"], board_name, e)
                log.append({"pin_id": pin["id"], "board": board_name, "ok": False, "error": str(e)})
    (ROOT / "publish_log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done. Log:", ROOT / "publish_log.json")


if __name__ == "__main__":
    import sys

    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"
    if cmd in ("oauth", "login"):
        run_oauth()
    elif cmd == "publish":
        publish_batch()
    else:
        print(__doc__)
