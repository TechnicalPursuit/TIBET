_tibet_complete() {
  COMPREPLY=()
  local word="${COMP_WORDS[COMP_CWORD]}"
  local prev="${COMP_WORDS[COMP_CWORD-1]}"
  local completions="$(tibet --complete "$prev $word")"
  COMPREPLY=( $(compgen -W "$completions" -- "$word") )
}

complete -F _tibet_complete tibet
