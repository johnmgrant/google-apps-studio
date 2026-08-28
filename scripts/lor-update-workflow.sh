#!/usr/bin/env zsh
set -euo pipefail

# LOR update workflow: check history, run tests, build, stage; no cd operations.
REPO_DIR="$(pwd)"

print "[1/5] Check universities.json git history"
jiti "$REPO_DIR/tools/dev-utils/check-universities-history.ts" || true

print "[Autosave] Consider running VS Code Task: Git Commit Push: autosave (unstaged)"

print "[2/5] Run templatization tests (fitness-ingestion)"
pnpm --filter ./projects/fitness-ingestion run test:templatization

print "[Autosave] Consider running VS Code Task: Git Commit Push: autosave (unstaged)"

print "[3/5] Build all projects"
pnpm run build:projects

print "[Autosave] Consider running VS Code Task: Git Commit Push: autosave (unstaged)"

print "[4/5] Stage root + templatization-lor"
"$REPO_DIR/scripts/git-stage-root-subproject.sh"

print "[Autosave] Consider running VS Code Task: Git Commit Push: autosave (staged + unstaged)"

print "[5/5] Prompt: Run czg commit tasks via VS Code"
print "Use: 'Commit: pnpm czg preset (root + subproject)' in tasks.json"
print "Workflow complete; awaiting interactive czg commit."
