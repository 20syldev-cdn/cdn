# Creating a plugin for mn

A mn plugin is a single Bash file (`mn.sh`) installed in `~/.config/mn/plugins/<name>/mn.sh`.
mn loads it automatically at startup.

---

## Minimal template

Copy this file, replace `mypkg` with your plugin name, and adapt the actions.

```bash
# ─── Metadata ─────────────────────────────────────────────────────────
# Displayed by mn plugin info / mn plugin list

PLUGIN_mypkg_VERSION="1.0.0"
PLUGIN_mypkg_DESCRIPTION="Short description"
PLUGIN_mypkg_AUTHOR="your-username"
PLUGIN_mypkg_REQUIRES="mypkg"           # required binary — mn skips the plugin if absent
PLUGIN_mypkg_INSTALL_CMD="curl -fsSL https://example.com/install.sh | sh"

# ─── Menu registration ────────────────────────────────────────────────
# Registers the plugin in mn's main menu

MOD_mypkg_TYPE="menu"                        # "menu" = free menu | "crud" = CRUD engine
MOD_mypkg_MENU_LABEL="MYPKG - My tool"       # shown in the main menu
MOD_mypkg_TITLE="MYPKG"                      # shown at the top of the sub-menu
MOD_mypkg_CLI_ARGS="mypkg|mp"                # mn mypkg or mn mp for direct access
MOD_mypkg_PRIORITY=55                        # menu order (conn=10 … config=80)

# ─── Menu ─────────────────────────────────────────────────────────────
# show_<name>_menu() — mandatory convention

show_mypkg_menu() {
    CURRENT_MENU="mypkg"
    USE_PAGINATION=false
    MENU_ITEMS=("Run" "Status")
    MENU_ACTIONS=("_mypkg_run" "_mypkg_status")
}

# ─── Actions ──────────────────────────────────────────────────────────

_mypkg_run() {
    show_cursor; clear_screen
    draw_header "MYPKG - RUN"
    mypkg run
    echo -e "\n${DIM}$T_PRESS_KEY${NC}"
    read -n 1 -s; hide_cursor
    show_mypkg_menu
}

_mypkg_status() {
    show_cursor; clear_screen
    draw_header "MYPKG - STATUS"
    mypkg status
    echo -e "\n${DIM}$T_PRESS_KEY${NC}"
    read -n 1 -s; hide_cursor
    show_mypkg_menu
}

# ─── Registration ─────────────────────────────────────────────────────
# Always last — adds the plugin to the active module list

ALL_MODULES="${ALL_MODULES:+$ALL_MODULES }mypkg"
```

---

## Installation

```bash
mn plugin install mypkg /path/to/mn.sh          # local file (dev/test)
mn plugin install mypkg                          # from configured CDN ({MN_CDN}/mypkg@latest/mn.sh)
mn plugin install mypkg https://example.com/...  # custom URL
```

The CDN is configurable via `mn config` → `[C]` (default: `https://cdn.sylvain.sh/bash`).

To uninstall: `mn plugin remove mypkg`

---

## Available API

Everything is accessible from `mn.sh` — the file is sourced into the mn process.

### UI

| Function | Description |
|---|---|
| `draw_header "$title"` | Styled header |
| `select_option "$prompt" "${options[@]}"` | Arrow selector → result in `$_SELECT_VALUE` |
| `toggle_switch "$state" "$on" "$off"` | On/off toggle → returns 0 or 1 |
| `confirm_dialog` | Confirmation dialog → returns 0 (yes) or 1 (no) |
| `clear_screen` | Clear the terminal |
| `hide_cursor` / `show_cursor` | Cursor visibility |
| `spinner_start "$msg"` / `spinner_stop` | Loading spinner |

### Colors and styles

```bash
$RED $GREEN $BLUE $CYAN $YELLOW $MAGENTA $WHITE $GRAY
$BOLD $DIM $RESET $REVERSE $NC
```

### Data (`::`-delimited files)

```bash
dat_parse "$line"               # split a line → array $_DAT_FIELDS
dat_read "$file" "$key"         # read entry by key → $_DAT_FIELDS
dat_join "$f1" "$f2" "$f3"      # join values with :::
dat_delete_entry "$file" "$key" # delete an entry
```

### Global variables

```bash
$MN_DIR     # ~/.config/mn
$MN_EDITOR  # configured editor
$MN_LANG    # active language
$DATA_DIR   # ~/.config/mn/data
```

---

## Generic CRUD engine (optional)

If your plugin manages tabular data, use mn's CRUD engine with no extra code:

```bash
MOD_mypkg_TYPE="crud"
MOD_mypkg_FILE="$DATA_DIR/mypkg.dat"
MOD_mypkg_FIELDS="name value desc"
MOD_mypkg_PAGINATION="true"
MOD_mypkg_MENU_FORMAT_FN="_mypkg_format"
MOD_mypkg_ENTRY_ACTION="_mypkg_run"
# see modules/alias.sh for a complete example

show_mypkg_menu() { generic_show_menu "mypkg"; }
```
