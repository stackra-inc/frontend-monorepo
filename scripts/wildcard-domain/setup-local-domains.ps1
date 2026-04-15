# =============================================================================
# setup-local-domains.ps1
#
# One-time setup for subdomain dev on Windows.
#
# What it does:
#   1. Adds explicit hosts entries for known subdomains (*.mngo.test → 127.0.0.1)
#   2. Installs caddy via winget/choco — reverse proxy port 80 → Vite :3000
#
# Run as Administrator:
#   .\scripts\setup-local-domains.ps1
#
# After running, start dev with:
#   pnpm dev:local
#
# Then open (no port needed):
#   http://mngo.test
#   http://acme.mngo.test
# =============================================================================

$Domain    = "mngo.test"
$IP        = "127.0.0.1"
$HostsFile = "C:\Windows\System32\drivers\etc\hosts"

$Subdomains = @("acme", "globex", "initech", "demo", "dev", "staging")

# ── Admin check ───────────────────────────────────────────────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "[ERR] Run as Administrator." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Local Subdomain Setup — *.$Domain → $IP (port 80 → 3000)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. Hosts file entries
# ─────────────────────────────────────────────────────────────────────────────
$HostsContent = Get-Content $HostsFile -Raw
$AllHosts = @($Domain) + ($Subdomains | ForEach-Object { "$_.$Domain" })

foreach ($h in $AllHosts) {
  if ($HostsContent -notmatch [regex]::Escape($h)) {
    Add-Content -Path $HostsFile -Value "$IP`t$h"
    Write-Host "[OK]  Added: $IP  $h" -ForegroundColor Green
  } else {
    Write-Host "[--]  Already present: $h" -ForegroundColor DarkGray
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. Install Caddy
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
if (-not (Get-Command caddy -ErrorAction SilentlyContinue)) {
  Write-Host "[INFO] Installing Caddy..." -ForegroundColor Blue

  # Try winget first
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    winget install --id Caddy.Caddy -e --silent
  }
  # Try chocolatey
  elseif (Get-Command choco -ErrorAction SilentlyContinue) {
    choco install caddy -y
  }
  # Fallback: download binary
  else {
    Write-Host "[INFO] Downloading Caddy binary..." -ForegroundColor Blue
    $CaddyVersion = "2.8.4"
    $Arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }
    $Url = "https://github.com/caddyserver/caddy/releases/download/v$CaddyVersion/caddy_${CaddyVersion}_windows_${Arch}.zip"
    $Zip = "$env:TEMP\caddy.zip"
    Invoke-WebRequest -Uri $Url -OutFile $Zip
    Expand-Archive -Path $Zip -DestinationPath "C:\caddy" -Force
    # Add to PATH
    $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if ($CurrentPath -notlike "*C:\caddy*") {
      [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;C:\caddy", "Machine")
    }
    Write-Host "[OK]  Caddy installed to C:\caddy" -ForegroundColor Green
  }
} else {
  Write-Host "[OK]  Caddy already installed" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Flush DNS
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[INFO] Flushing DNS cache..." -ForegroundColor Blue
ipconfig /flushdns | Out-Null
Write-Host "[OK]  DNS cache flushed" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Start dev (Vite + Caddy proxy):"
Write-Host "    pnpm dev:local"
Write-Host ""
Write-Host "  Open in browser (no port needed):"
Write-Host "    http://$Domain"
Write-Host "    http://acme.$Domain"
Write-Host "    http://globex.$Domain"
Write-Host "    http://initech.$Domain"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
