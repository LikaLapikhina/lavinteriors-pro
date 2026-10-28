# LAV INTERIORS — 1-Click Laptop Setup (Antigravity Rules/Skills + 3DSky Pro Panel + Port 3033 Cloud Bridge)
$ErrorActionPreference = "Continue"
Write-Host "⚡ Начинаю настройку ноутбука LAV Interiors (Antigravity + 3DSky Pro + Homestyler)..." -ForegroundColor Cyan

$zipUrl = "https://lavinteriors.pro/office/laptop-pack.zip?t=" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$tmpZip = Join-Path $env:TEMP "lav_laptop_pack.zip"
$extractDir = Join-Path $env:TEMP "lav_laptop_extracted"

Write-Host "1/4. Скачиваю пакет правил, скиллов и расширения (0.8 МБ)..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $zipUrl -OutFile $tmpZip -UseBasicParsing
if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue }
Expand-Archive -Path $tmpZip -DestinationPath $extractDir -Force

# 2. Copy .gemini rules, skills, references, mcp_config to current user profile
$targetGemini = Join-Path $env:USERPROFILE ".gemini"
New-Item -ItemType Directory -Force -Path $targetGemini | Out-Null
Copy-Item -Path "$extractDir\.gemini\*" -Destination $targetGemini -Recurse -Force

# Replace C:\Users\Анжелика with actual $env:USERPROFILE if username differs on laptop
Get-ChildItem -Path $targetGemini -Include *.md,*.json -Recurse -File | ForEach-Object {
    $c = Get-Content $_.FullName -Raw -Encoding UTF8
    if ($c -match "C:\\Users\\Анжелика") {
        $c = $c.Replace("C:\Users\Анжелика", $env:USERPROFILE).Replace("C:\\Users\\Анжелика", ($env:USERPROFILE -replace "\\","\\"))
        Set-Content -Path $_.FullName -Value $c -Encoding UTF8
    }
}
Write-Host "✓ Правила lav-design-core и скиллы (homestyler-studio + референсы ручек/фасадов/раковин) установлены в $targetGemini" -ForegroundColor Green

# 3. Install Chrome/Yandex extension & local scripts
$skyDir = "C:\skypro_laptop"
New-Item -ItemType Directory -Force -Path $skyDir | Out-Null
Copy-Item -Path "$extractDir\skypro_glb_studio\*" -Destination $skyDir -Recurse -Force

# 4. Create lightweight local bridge on port 3033 (so 127.0.0.1:3033 works on laptop for Antigravity & Homestyler!)
$bridgePy = @"
import json, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE = Path(r'C:\skypro_laptop\scripts')
EP_URL = 'https://lavinteriors.pro/office/skypro-endpoint.json'

def get_tunnel():
    try:
        req = urllib.request.Request(EP_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as r:
            return json.loads(r.read().decode('utf-8')).get('tunnelUrl', '').rstrip('/')
    except Exception:
        return ''

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_GET(self):
        p = self.path.split('?')[0]
        if p in ('/hs-joinery.js', '/hs_joinery_engine.js'):
            b = (BASE / 'hs_joinery_engine.js').read_bytes()
            self.send_response(200); self._cors(); self.send_header('Content-Type', 'application/javascript; charset=utf-8'); self.end_headers(); self.wfile.write(b); return
        tun = get_tunnel()
        if p == '/homestyler-panel.js':
            raw = (BASE / 'homestyler_panel.js').read_text(encoding='utf-8')
            prefix = f'window.__SKYPRO_SERVER_ORIGIN__ = {json.dumps(tun or "http://127.0.0.1:3033")};\n'
            b = (prefix + raw).encode('utf-8')
            self.send_response(200); self._cors(); self.send_header('Content-Type', 'application/javascript; charset=utf-8'); self.end_headers(); self.wfile.write(b); return
        if tun:
            try:
                req = urllib.request.Request(tun + self.path, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=20) as r:
                    data = r.read()
                    self.send_response(200); self._cors()
                    self.send_header('Content-Type', r.headers.get('Content-Type', 'application/octet-stream'))
                    self.end_headers(); self.wfile.write(data); return
            except Exception as e:
                pass
        self.send_response(404); self._cors(); self.end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 3033), Handler).serve_forever()
"@
$bridgePath = Join-Path $skyDir "laptop_bridge.py"
Set-Content -Path $bridgePath -Value $bridgePy -Encoding UTF8

# Start bridge if python is available
$pyCmd = Get-Command python, python3 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pyCmd) {
    Start-Process -FilePath $pyCmd.Source -ArgumentList "`"$bridgePath`"" -WindowStyle Hidden
    Write-Host "✓ Локальный мост 127.0.0.1:3033 -> Облачный туннель ПК запущен!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "✅ ГОТОВО! Ноутбук полностью настроен для работы с Antigravity и 3DSky Pro!" -ForegroundColor Green
Write-Host "👉 Папка расширения для браузера (browser://extensions -> Загрузить распакованное): C:\skypro_laptop\chrome_extension" -ForegroundColor Yellow
Write-Host "👉 Личный кабинет: https://lavinteriors.pro/office/" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
