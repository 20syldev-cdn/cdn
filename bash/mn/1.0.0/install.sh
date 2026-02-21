#!/bin/sh

# mn installer
# Usage: curl -fsSL https://cdn.sylvain.pro/bash/mn@latest/install.sh | sh

set -e

VERSION="1.0.0"
CDN="https://cdn.sylvain.pro/bash"
MN_DIR="$HOME/.config/mn"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[1;94m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
NC='\033[0m'

printf "${BLUE}mn %s installer${NC}\n" "$VERSION"
printf "\n"

# ─── Language / Langue ───────────────────────────────────────────────

printf "${BLUE}Language / Langue:${NC}\n"
printf "  1) Français\n"
printf "  2) English (default)\n"
printf "${CYAN}Choix / Choice [2]:${NC} "
read -r LANG_CHOICE < /dev/tty
case "$LANG_CHOICE" in
    1|fr|FR) LANG_SETTING="fr" ;;
    *) LANG_SETTING="en" ;;
esac
printf "\n"

# ─── Create directories ───────────────────────────────────────────────

mkdir -p "$MN_DIR/lib" "$MN_DIR/modules" "$MN_DIR/data" "$MN_DIR/docs" "$MN_DIR/lang"
printf "${BLUE}Config directory:${NC} %s\n" "$MN_DIR"

# ─── Download mn ──────────────────────────────────────────────────────

printf "${BLUE}Downloading mn...${NC}\n"

if curl -fsSL "${CDN}/mn@${VERSION}/mn" -o "$MN_DIR/mn"; then
    chmod +x "$MN_DIR/mn"
    printf "${GREEN}mn downloaded${NC}\n"
else
    printf "${RED}Download failed${NC}\n"
    exit 1
fi

# ─── Download lib/ ────────────────────────────────────────────────────

for lib in core crud dat module ui; do
    if curl -fsSL "${CDN}/mn@${VERSION}/lib/${lib}.sh" -o "$MN_DIR/lib/${lib}.sh" 2>/dev/null; then
        printf "${GREEN}lib/${lib}.sh downloaded${NC}\n"
    fi
done

# ─── Download modules/ ────────────────────────────────────────────────

for mod in alias config connexions docs funcs repos; do
    if curl -fsSL "${CDN}/mn@${VERSION}/modules/${mod}.sh" -o "$MN_DIR/modules/${mod}.sh" 2>/dev/null; then
        printf "${GREEN}modules/${mod}.sh downloaded${NC}\n"
    fi
done

# ─── Download lang/ ───────────────────────────────────────────────────

for lang in fr en; do
    if curl -fsSL "${CDN}/mn@${VERSION}/lang/${lang}.sh" -o "$MN_DIR/lang/${lang}.sh" 2>/dev/null; then
        printf "${GREEN}lang/${lang}.sh downloaded${NC}\n"
    fi
done

# ─── Language setting ─────────────────────────────────────────────────

echo "$LANG_SETTING" > "$MN_DIR/.lang"
printf "${GREEN}Language set to: ${LANG_SETTING}${NC}\n"

# ─── Init data files ──────────────────────────────────────────────────

for dat in aliases connexions functions repos; do
    [ ! -f "$MN_DIR/data/${dat}.dat" ] && touch "$MN_DIR/data/${dat}.dat"
done

# ─── Install directory ───────────────────────────────────────────────

if [ -w "/usr/local/bin" ]; then
    INSTALL_DIR="/usr/local/bin"
elif [ -w "$HOME/.local/bin" ]; then
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
else
    INSTALL_DIR="$HOME/bin"
    mkdir -p "$INSTALL_DIR"
fi

printf "${BLUE}Install directory:${NC} %s\n" "$INSTALL_DIR"

ln -sf "$MN_DIR/mn" "$INSTALL_DIR/mn"
printf "${GREEN}mn installed${NC}\n"

# ─── PATH ────────────────────────────────────────────────────────────

case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *)
        SHELL_CONFIG=""
        if [ -n "${ZSH_VERSION:-}" ]; then
            SHELL_CONFIG="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
            SHELL_CONFIG="$HOME/.bashrc"
        elif [ -f "$HOME/.bash_profile" ]; then
            SHELL_CONFIG="$HOME/.bash_profile"
        elif [ -f "$HOME/.profile" ]; then
            SHELL_CONFIG="$HOME/.profile"
        fi

        if [ -n "$SHELL_CONFIG" ]; then
            printf "\n# Added by mn installer\nexport PATH=\"%s:\$PATH\"\n" "$INSTALL_DIR" >> "$SHELL_CONFIG"
            printf "${YELLOW}PATH updated in %s — reload your shell${NC}\n" "$SHELL_CONFIG"
        else
            printf "${YELLOW}Add to your shell config: export PATH=\"%s:\$PATH\"${NC}\n" "$INSTALL_DIR"
        fi
        ;;
esac

# ─── Done ────────────────────────────────────────────────────────────

printf "\n${GREEN}Done!${NC} Run: ${CYAN}mn${NC}\n"
