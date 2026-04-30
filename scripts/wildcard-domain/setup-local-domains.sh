#!/usr/bin/env bash
# =============================================================================
# setup-local-domains.sh
#
# One-time setup for wildcard subdomain dev on macOS / Linux.
#
# macOS with Laravel Herd:
#   Uses `herd proxy` — zero config, no port in URL, wildcard subdomains work.
#
# macOS without Herd / Linux:
#   Uses dnsmasq (wildcard DNS) + caddy (port 80 reverse proxy).
#
# Usage:
#   chmod +x scripts/setup-local-domains.sh
#   ./scripts/setup-local-domains.sh
#
# After running:
#   pnpm dev:local
#   http://mngo.test          (no port)
#   http://acme.mngo.test     (acme tenant)
#   http://globex.mngo.test   (globex tenant)
# =============================================================================

set -e

# ── Read DOMAIN from environment ─────────────────────────────────────────────
if [ -z "$DOMAIN" ]; then
  echo "[ERR] Environment variable 'DOMAIN' is not set." >&2
  echo "      Please set it before running this script (e.g. export DOMAIN='mngo.test')." >&2
  exit 1
fi

FULL_DOMAIN="$DOMAIN"
# Strip .test suffix for Herd (it appends .test automatically)
DOMAIN_SHORT="${DOMAIN%.test}"
IP="127.0.0.1"
VITE_PORT=3000

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Local Subdomain Setup — *.${FULL_DOMAIN} → ${IP} (no port)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

OS="$(uname -s)"

# ─────────────────────────────────────────────────────────────────────────────
# macOS
# ─────────────────────────────────────────────────────────────────────────────
if [ "$OS" = "Darwin" ]; then
  info "Detected macOS"

  # ── Laravel Herd (preferred) ───────────────────────────────────────────────
  if command -v herd &>/dev/null; then
    success "Laravel Herd detected — using herd proxy"

    # Register proxy: <domain>.test → localhost:3000
    herd proxy "$DOMAIN_SHORT" "http://localhost:${VITE_PORT}" 2>&1 | grep -v "^$" || true
    success "herd proxy registered: http://${FULL_DOMAIN} → localhost:${VITE_PORT}"
    success "Wildcard subdomains (*.${FULL_DOMAIN}) work automatically via Herd"

  # ── No Herd — use dnsmasq + caddy ─────────────────────────────────────────
  else
    warn "Herd not found — falling back to dnsmasq + caddy"

    if ! command -v brew &>/dev/null; then
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # dnsmasq
    brew list dnsmasq &>/dev/null || brew install dnsmasq
    DNSMASQ_CONF="$(brew --prefix)/etc/dnsmasq.conf"
    RULE="address=/.${FULL_DOMAIN}/${IP}"
    grep -qF "$RULE" "$DNSMASQ_CONF" 2>/dev/null || echo "$RULE" >> "$DNSMASQ_CONF"
    sudo mkdir -p /etc/resolver
    [ -f "/etc/resolver/${FULL_DOMAIN}" ] || echo "nameserver 127.0.0.1" | sudo tee "/etc/resolver/${FULL_DOMAIN}" > /dev/null
    sudo brew services restart dnsmasq
    sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder 2>/dev/null || true
    success "dnsmasq configured"

    # caddy
    brew list caddy &>/dev/null || brew install caddy
    success "caddy installed — run 'pnpm proxy' to start it"
  fi

# ─────────────────────────────────────────────────────────────────────────────
# Linux
# ─────────────────────────────────────────────────────────────────────────────
elif [ "$OS" = "Linux" ]; then
  info "Detected Linux"

  # dnsmasq
  if ! command -v dnsmasq &>/dev/null; then
    if command -v apt-get &>/dev/null; then
      sudo apt-get update -qq && sudo apt-get install -y dnsmasq
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y dnsmasq
    elif command -v pacman &>/dev/null; then
      sudo pacman -S --noconfirm dnsmasq
    else
      error "Cannot install dnsmasq — install manually then re-run."
    fi
  else
    success "dnsmasq already installed"
  fi

  RULE="address=/.${FULL_DOMAIN}/${IP}"
  grep -qF "$RULE" /etc/dnsmasq.conf 2>/dev/null || echo "$RULE" | sudo tee -a /etc/dnsmasq.conf > /dev/null
  success "dnsmasq rule added"

  if systemctl is-active --quiet systemd-resolved 2>/dev/null; then
    sudo mkdir -p /etc/systemd/resolved.conf.d
    cat <<EOF | sudo tee /etc/systemd/resolved.conf.d/mngo-test.conf > /dev/null
[Resolve]
DNS=127.0.0.1
Domains=~${FULL_DOMAIN}
EOF
    sudo systemctl restart systemd-resolved
  else
    grep -q "nameserver 127.0.0.1" /etc/resolv.conf || \
      echo "nameserver 127.0.0.1" | sudo tee -a /etc/resolv.conf > /dev/null
  fi

  sudo systemctl enable dnsmasq && sudo systemctl restart dnsmasq
  success "dnsmasq running"

  # caddy
  if ! command -v caddy &>/dev/null; then
    info "Installing caddy..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
      sudo apt-get update && sudo apt-get install -y caddy
    else
      ARCH="$(uname -m)"; [ "$ARCH" = "x86_64" ] && ARCH="amd64"; [ "$ARCH" = "aarch64" ] && ARCH="arm64"
      curl -fsSL "https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_linux_${ARCH}.tar.gz" \
        | sudo tar -xz -C /usr/local/bin caddy
    fi
    sudo setcap cap_net_bind_service=+ep "$(command -v caddy)" 2>/dev/null || true
  else
    success "caddy already installed"
  fi

else
  error "Unsupported OS: $OS — use setup-local-domains.ps1 on Windows"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Verify
# ─────────────────────────────────────────────────────────────────────────────
echo ""
info "Verifying DNS..."
sleep 1
if ping -c 1 -W 1 "acme.${FULL_DOMAIN}" &>/dev/null; then
  success "acme.${FULL_DOMAIN} → ${IP} ✓"
else
  warn "DNS not resolving yet — open a new terminal and try again"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}  Setup complete!${NC}"
echo ""
echo "  Start dev:"
echo "    pnpm dev:local"
echo ""
echo "  Open in browser (no port):"
echo "    http://${FULL_DOMAIN}"
echo "    http://acme.${FULL_DOMAIN}"
echo "    http://globex.${FULL_DOMAIN}"
echo "    http://initech.${FULL_DOMAIN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""


set -e

# DOMAIN is already validated and set from the first block above
FULL_DOMAIN="$DOMAIN"
IP="127.0.0.1"
VITE_PORT=3000

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Local Subdomain Setup — *.${FULL_DOMAIN} → ${IP} (port 80 → ${VITE_PORT})"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

OS="$(uname -s)"

# ─────────────────────────────────────────────────────────────────────────────
# 1. DNS — dnsmasq wildcard
# ─────────────────────────────────────────────────────────────────────────────

if [ "$OS" = "Darwin" ]; then
  info "Detected macOS"

  if ! command -v brew &>/dev/null; then
    info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi

  # dnsmasq
  if ! brew list dnsmasq &>/dev/null; then
    info "Installing dnsmasq..."
    brew install dnsmasq
  else
    success "dnsmasq already installed"
  fi

  DNSMASQ_CONF="$(brew --prefix)/etc/dnsmasq.conf"
  RULE="address=/.${FULL_DOMAIN}/${IP}"
  if ! grep -qF "$RULE" "$DNSMASQ_CONF" 2>/dev/null; then
    echo "$RULE" >> "$DNSMASQ_CONF"
    success "dnsmasq rule added: $RULE"
  else
    success "dnsmasq rule already present"
  fi

  sudo mkdir -p /etc/resolver
  RESOLVER="/etc/resolver/${FULL_DOMAIN}"
  if [ ! -f "$RESOLVER" ]; then
    echo "nameserver 127.0.0.1" | sudo tee "$RESOLVER" > /dev/null
    success "Resolver file created: $RESOLVER"
  else
    success "Resolver file already exists"
  fi

  sudo brew services restart dnsmasq
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder 2>/dev/null || true
  success "dnsmasq restarted, DNS cache flushed"

  # caddy
  if ! brew list caddy &>/dev/null; then
    info "Installing caddy..."
    brew install caddy
  else
    success "caddy already installed"
  fi

elif [ "$OS" = "Linux" ]; then
  info "Detected Linux"

  # dnsmasq
  if ! command -v dnsmasq &>/dev/null; then
    if command -v apt-get &>/dev/null; then
      sudo apt-get update -qq && sudo apt-get install -y dnsmasq
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y dnsmasq
    elif command -v pacman &>/dev/null; then
      sudo pacman -S --noconfirm dnsmasq
    else
      error "Cannot install dnsmasq — install it manually then re-run."
    fi
  else
    success "dnsmasq already installed"
  fi

  DNSMASQ_CONF="/etc/dnsmasq.conf"
  RULE="address=/.${FULL_DOMAIN}/${IP}"
  if ! grep -qF "$RULE" "$DNSMASQ_CONF" 2>/dev/null; then
    echo "$RULE" | sudo tee -a "$DNSMASQ_CONF" > /dev/null
    success "dnsmasq rule added"
  else
    success "dnsmasq rule already present"
  fi

  if systemctl is-active --quiet systemd-resolved 2>/dev/null; then
    sudo mkdir -p /etc/systemd/resolved.conf.d
    cat <<EOF | sudo tee /etc/systemd/resolved.conf.d/mngo-test.conf > /dev/null
[Resolve]
DNS=127.0.0.1
Domains=~${FULL_DOMAIN}
EOF
    sudo systemctl restart systemd-resolved
    success "systemd-resolved configured"
  else
    grep -q "nameserver 127.0.0.1" /etc/resolv.conf || \
      echo "nameserver 127.0.0.1" | sudo tee -a /etc/resolv.conf > /dev/null
  fi

  sudo systemctl enable dnsmasq
  sudo systemctl restart dnsmasq
  success "dnsmasq running"

  # caddy
  if ! command -v caddy &>/dev/null; then
    info "Installing caddy..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
      sudo apt-get update && sudo apt-get install -y caddy
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y 'dnf-command(copr)'
      sudo dnf copr enable @caddy/caddy
      sudo dnf install -y caddy
    else
      # Fallback: download binary
      CADDY_VERSION="2.8.4"
      ARCH="$(uname -m)"
      [ "$ARCH" = "x86_64" ] && ARCH="amd64"
      [ "$ARCH" = "aarch64" ] && ARCH="arm64"
      curl -fsSL "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_${ARCH}.tar.gz" \
        | sudo tar -xz -C /usr/local/bin caddy
      sudo chmod +x /usr/local/bin/caddy
    fi
  else
    success "caddy already installed"
  fi

  # Allow caddy to bind port 80 without root
  sudo setcap cap_net_bind_service=+ep "$(command -v caddy)" 2>/dev/null || \
    warn "Could not set cap_net_bind_service — caddy may need sudo to bind port 80"

else
  error "Unsupported OS: $OS — use setup-local-domains.ps1 on Windows"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Verify DNS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
info "Verifying DNS..."
sleep 1
if ping -c 1 -W 1 "acme.${FULL_DOMAIN}" &>/dev/null; then
  success "acme.${FULL_DOMAIN} → ${IP} ✓"
else
  warn "DNS not resolving yet — open a new terminal and try again"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}  Setup complete!${NC}"
echo ""
echo "  Start dev (Vite + Caddy proxy):"
echo "    pnpm dev:local"
echo ""
echo "  Open in browser (no port needed):"
echo "    http://${FULL_DOMAIN}"
echo "    http://acme.${FULL_DOMAIN}"
echo "    http://globex.${FULL_DOMAIN}"
echo "    http://initech.${FULL_DOMAIN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
