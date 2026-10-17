---
name: changelog-maintainer
description: Draft and curate release notes for this Google Apps Script monorepo from staged changes. Use when preparing a portfolio-visible release or updating CHANGELOG.md.
---

# Changelog Maintainer

Keep `CHANGELOG.md` useful to a reader evaluating the projects. Describe behavior, user impact, and migration needs rather than listing filenames as the final notes.

## Draft a release

1. Stage only the changes intended for the release.
2. Run `python3 .agents/skills/changelog-maintainer/scripts/draft_release.py <version>` to inspect a draft built from staged paths.
3. Edit `CHANGELOG.md` under `## [Unreleased]` with concise, accurate `Added`, `Changed`, `Fixed`, or `Removed` entries. Use a dated `## [version] - YYYY-MM-DD` heading when cutting a release.
4. Verify each claim against the diff and project documentation. Do not publish placeholder path bullets.

The draft script is read-only. It uses the root Git index and does not include untracked or unstaged files. A nested project with its own Git index needs a separate review.
