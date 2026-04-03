#!/bin/bash
# =========================================================
# MN - Module: Configuration
# =========================================================

show_config_menu() {
    CURRENT_MENU="config"
    SELECTED_INDEX=0
    USE_PAGINATION=false

    MENU_ITEMS=(
        "${MAGENTA}[M]${NC} $T_CONFIG_EDIT_MN"
        "${BLUE}[B]${NC} $T_CONFIG_EDIT_ALIASES"
        "${BLUE}[F]${NC} $T_CONFIG_EDIT_FUNCS"
        "${BLUE}[R]${NC} $T_CONFIG_EDIT_BASHRC"
        "${GREEN}[S]${NC} $T_CONFIG_SOURCE"
        "${CYAN}[L]${NC} $T_CONFIG_LANG"
    )
    MENU_ACTIONS=(
        "config_edit_mn"
        "config_edit_aliases"
        "config_edit_functions"
        "config_edit_bashrc"
        "config_source_all"
        "config_change_lang"
    )
}

config_edit_mn() {
    show_cursor
    code -n "$MN_DIR"
    hide_cursor
    show_config_menu
}

config_edit_aliases() {
    show_cursor
    ${EDITOR:-vi} "$BASH_ALIASES"
    hide_cursor
    show_config_menu
}

config_edit_functions() {
    show_cursor
    ${EDITOR:-vi} "$BASH_FUNCTIONS"
    hide_cursor
    show_config_menu
}

config_edit_bashrc() {
    show_cursor
    ${EDITOR:-vi} "$HOME/.bashrc"
    hide_cursor
    show_config_menu
}

config_source_all() {
    clear_screen
    draw_header "$T_CONFIG_REGEN_TITLE"

    echo -e "${CYAN}$T_CONFIG_REGEN_MSG${NC}\n"

    regenerate_bash_files

    echo -e "  ${GREEN}✓${NC} ~/.bash_aliases"
    echo -e "  ${GREEN}✓${NC} ~/.bash_functions"
    echo -e "\n${GREEN}$T_CONFIG_REGEN_DONE${NC}"

    sleep 1
    hide_cursor
    show_config_menu
}

config_change_lang() {
    clear_screen
    draw_header "$T_CONFIG_LANG_TITLE"
    show_cursor

    echo -e "${WHITE}$T_CONFIG_LANG_CURRENT:${NC} ${CYAN}$MN_LANG${NC}\n"
    echo -e "  ${WHITE}1)${NC} Français"
    echo -e "  ${WHITE}2)${NC} English"
    echo -ne "\n${CYAN}${T_CHOICE}:${NC} "
    read -r lang_input

    local new_lang="$MN_LANG"
    case "$lang_input" in
        1|fr|FR) new_lang="fr" ;;
        2|en|EN) new_lang="en" ;;
    esac

    if [[ "$new_lang" != "$MN_LANG" ]]; then
        echo "$new_lang" > "$MN_LANG_FILE"
        echo -e "\n${GREEN}✓ $T_CONFIG_LANG_CHANGED${NC}"
        sleep 2
        cleanup
    fi

    hide_cursor
    show_config_menu
}
