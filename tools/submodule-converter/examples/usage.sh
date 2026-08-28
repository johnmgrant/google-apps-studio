#!/bin/bash
# Example script showing how to use the submodule converter

# Ensure you're in the workspace root
cd "$(git rev-path --show-toplevel)"

# Set your GitHub token (or use gh CLI auth)
# export GITHUB_TOKEN="your_token_here"

# Example 1: Convert with interactive prompts
pnpm --filter ./tools/submodule-converter exec convert-to-submodule projects/fitness-ingestion

# Example 2: Convert with all options specified
pnpm --filter ./tools/submodule-converter exec convert-to-submodule \
  projects/templatization-lor \
  --org johnmgrant \
  --prefix gas- \
  --branch main

# Example 3: Dry run to see what would happen
pnpm --filter ./tools/submodule-converter exec convert-to-submodule \
  packages/sheets-utility \
  --org johnmgrant \
  --dry-run

# Example 4: Create a public repository
pnpm --filter ./tools/submodule-converter exec convert-to-submodule \
  libraries/lib-fitness-models \
  --org johnmgrant \
  --public
