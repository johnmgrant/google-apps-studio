#!/usr/bin/env zsh
set -euo pipefail

# Run czg in root and nested templatization-lor repo.
# If no args provided, use a sensible preset.
if (( $# == 0 )); then
  set -- --emoji --scope templatization-lor --breaking
fi

REPO_DIR="$(pwd)"
SUB_DIR="$REPO_DIR/projects/templatization-lor"

print "[czg] Root commit"
pnpm czg "$@"

if [[ -d "$SUB_DIR/.git" ]]; then
  print "[czg] Subproject commit (templatization-lor)"
  (
    cd "$SUB_DIR"
    pnpm czg "$@"
  )
else
  print "[czg] Skipped subproject: no nested git repo detected"
fi
