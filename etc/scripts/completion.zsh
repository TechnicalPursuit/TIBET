#compdef tibet

_tibet_complete() {
  local completions
  completions="$(tibet --complete "$words")"
  reply=( "${(ps:\n:)completions}" )
}

compctl -K _tibet_complete tibet
