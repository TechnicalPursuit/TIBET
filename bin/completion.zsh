#compdef tibet

_tibet_complete() {
  local completions
  completions="$(tibet --completion "$words")"
  reply=( "${(ps:\n:)completions}" )
}

compctl -K _tibet_complete tibet
