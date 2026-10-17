---
name: dependency-maintenance
description: Update pnpm dependencies in this Google Apps Script monorepo and verify affected packages. Use for requested upgrades or dependency fixes, not routine feature edits.
---

# Dependency Maintenance

The `.ai` dependency workflow was written for different workspace names and a missing changelog command. This version uses the packages and checks that exist here.

1. Inspect the requested package and affected `package.json` files before changing versions. Keep upgrades targeted unless a broad update was requested.
2. Run `zsh .agents/skills/dependency-maintenance/scripts/update-dependencies.zsh <pnpm up arguments>`. For example, `zsh .agents/skills/dependency-maintenance/scripts/update-dependencies.zsh --filter ./projects/google-docs-toolkit typescript@latest`.
3. Review manifest and lockfile changes. Explain major-version migrations and visible behavior in the relevant project README or `CHANGELOG.md` when applicable.
4. Run the affected project's tests and build. The script runs root typecheck and lint checks after the update; resolve failures before calling the update complete.

The script does not push, deploy, or commit. It exits on the first failing command.
