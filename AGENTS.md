# AI Workflow Guidelines

These guidelines define how agents (Copilot/GPT-5) operate in this workspace to keep changes consistent, efficient, and safe.

## Workflow

- **History Check:** Run `Universities: Check Git History` to inspect `projects/templatization-lor/universities.json` without using `cd`.
- **Tests:** Run `Test: fitness-ingestion templatization`.
- **Build:** Run `Build: projects` to verify all project builds.
- **Stage:** Run `Git: Stage root + templatization-lor (script)` or `scripts/git-stage-root-subproject.sh`.
- **Commit:** Use `Commit: pnpm czg preset (root + subproject)` for interactive conventional commits.

## Autosave Requirement

After each step above, trigger autosave via one of these tasks:

- `Git Commit Push: autosave (unstaged)`
- `Git Commit Push: autosave (staged + unstaged)`

Agents should pause on errors, await user fixes, and resume from the last step upon request.

## Command Preferences

- **Shell:** zsh
- **Runner:** jiti for TS utility scripts
- **Package Manager:** pnpm
- **Directory changes:** `cd` is allowed. Use `cd` or `git -C` depending on which keeps scripts simpler and consistent.

### Script Choice

- Use zsh for orchestration/simple shell steps.
- Use jiti+TS when Node libs or maintainability warrant it.

## Scripts

- `scripts/lor-update-workflow.sh`: Orchestrates check → tests → build → stage, and prompts to run `czg` tasks.
- `scripts/git-stage-root-subproject.sh`: Stages root and nested `templatization-lor` repo without `cd`.

## TypeScript Strictness

- Keep `.ts` changes minimal and explicit.
- Do not refactor unrelated code.
- Leave parked TODO comments intact unless in scope for the release.

## Continuation Policy

- Pause on error; do not proceed until resolved.
- Continue where left off on user request.
- Prefer turbo/husky integration where it expedites objectives; propose before enabling.
