# Bash completion for mn
# Source this file or install to ~/.local/share/bash-completion/completions/mn

_mn_complete() {
    local cur prev
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    if [[ $COMP_CWORD -eq 1 ]]; then
        local words="help update uninstall plugin -v --version"
        local f args
        for f in ~/.config/mn/modules/*.sh ~/.config/mn/plugins/*/mn.sh; do
            [[ -f "$f" ]] || continue
            args=$(grep -oP 'CLI_ARGS="\K[^"]*' "$f" 2>/dev/null | head -1 | tr '|' ' ')
            words="$words $args"
        done
        COMPREPLY=($(compgen -W "$words" -- "$cur"))
        return 0
    fi

    if [[ "${COMP_WORDS[1]}" == "plugin" ]]; then
        if [[ $COMP_CWORD -eq 2 ]]; then
            COMPREPLY=($(compgen -W "list install update remove info" -- "$cur"))
            return 0
        elif [[ $COMP_CWORD -eq 3 && ( "$prev" == "remove" || "$prev" == "update" || "$prev" == "info" ) ]]; then
            local plugins="" d
            for d in ~/.config/mn/plugins/*/; do
                [[ -f "${d}mn.sh" ]] && plugins="$plugins $(basename "$d")"
            done
            COMPREPLY=($(compgen -W "$plugins" -- "$cur"))
            return 0
        elif [[ $COMP_CWORD -eq 4 && ( "${COMP_WORDS[2]}" == "install" || "${COMP_WORDS[2]}" == "update" ) ]]; then
            compopt -o filenames
            COMPREPLY=($(compgen -f -- "$cur"))
            return 0
        fi
    fi
}

complete -F _mn_complete mn
