# Uruchamia grę online przez darmowe tunele cloudflared (bez konta).
# Po uruchomieniu wyświetla link do gry — wystarczy go wysłać znajomym.
# Uwaga: adresy tuneli zmieniają się po każdym restarcie tego skryptu.
#
# Użycie:  powershell -ExecutionPolicy Bypass -File tools\start-online.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$exe = "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"

if (-not (Test-Path $exe)) {
    Write-Host "Pobieram cloudflared..."
    New-Item -ItemType Directory -Force -Path (Split-Path $exe) | Out-Null
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $exe
}

# 1. Serwer sygnalizacyjny PeerJS
$peerProc = Start-Process node -ArgumentList "server.js" -WorkingDirectory $root -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

# 2. Tunel dla brokera
$peerLog = Join-Path $env:TEMP "statki-peer.log"
$peerTun = Start-Process $exe -ArgumentList "tunnel", "--url", "http://localhost:9000", "--no-autoupdate" `
    -RedirectStandardError "$peerLog.err" -RedirectStandardOutput $peerLog -PassThru -WindowStyle Hidden

# 3. Serwer statyczny gry
$staticProc = Start-Process node -ArgumentList (Join-Path $PSScriptRoot "online-server.js") -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1

# 4. Tunel dla gry
$gameLog = Join-Path $env:TEMP "statki-game.log"
$gameTun = Start-Process $exe -ArgumentList "tunnel", "--url", "http://localhost:8000", "--no-autoupdate" `
    -RedirectStandardError "$gameLog.err" -RedirectStandardOutput $gameLog -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 8
$peerUrl = [regex]::Match((Get-Content -Raw "$peerLog.err" -ErrorAction SilentlyContinue), 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com').Value
$gameUrl = [regex]::Match((Get-Content -Raw "$gameLog.err" -ErrorAction SilentlyContinue), 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com').Value

Write-Host ""
Write-Host "======================================================"
Write-Host " LINK DO GRY (wyślij znajomym):"
Write-Host "   $gameUrl/statki.html?peer=$($peerUrl -replace 'https://','')"
Write-Host "======================================================"
Write-Host ""
Write-Host "Procesy: PeerServer=$($peerProc.Id), tunel broker=$($peerTun.Id), statyczny=$($staticProc.Id), tunel gra=$($gameTun.Id)"
Write-Host "Zatrzymanie: zamknij te procesy w Menedzerze zadan."
