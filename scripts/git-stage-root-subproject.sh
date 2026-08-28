#!/usr/bin/env zsh
set -euo pipefail

# Stage changes in root and nested templatization-lor repo without using cd
REPO_DIR="$(pwd)"
SUB_DIR="$REPO_DIR/projects/templatization-lor"

git add -A
if [[ -d "$SUB_DIR/.git" ]]; then
  git -C "$SUB_DIR" add -A
fi

echo "[Done] Staged: root + templatization-lor (if present)."
