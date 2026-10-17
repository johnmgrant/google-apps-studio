#!/usr/bin/env zsh
set -euo pipefail

if (( $# == 0 )); then
  print -u2 'Usage: update-dependencies.zsh <pnpm up arguments>'
  exit 2
fi

repo_root="${0:A:h:h:h:h}"
cd "$repo_root"

pnpm up "$@"
pnpm run typecheck
pnpm run lint
