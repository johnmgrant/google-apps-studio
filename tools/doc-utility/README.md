# Documentation Utility

CLI tool for managing project documentation with consistent structure, metadata, and formatting.

## Features

- **Create**: Generate new documentation from templates with frontmatter
- **Update**: Automatically update modified dates in documentation
- **Validate**: Ensure all documentation has required metadata

## Installation

```bash
cd tools/doc-utility
pnpm install
pnpm build
```

## Usage

### Create New Documentation

```bash
pnpm doc-utility create <type> <name> [options]
```

**Types:**

- `guide` - Step-by-step guides and tutorials
- `adr` - Architecture Decision Records
- `api` - API reference documentation

**Examples:**

```bash
# Create a new guide
pnpm doc-utility create guide "Getting Started"
# Creates: docs/guides/getting-started.md

# Create an ADR
pnpm doc-utility create adr "Use Playwright for E2E Testing"
# Creates: docs/architecture/use-playwright-for-e2e-testing.md

# Create API documentation
pnpm doc-utility create api "Playwright Extensions"
# Creates: docs/api/playwright-extensions.md
```

### Update Modified Dates

```bash
pnpm doc-utility update [paths...]
```

Updates the `modified` field in frontmatter for all markdown files.

**Examples:**

```bash
# Update all docs
pnpm doc-utility update docs

# Update specific directory
pnpm doc-utility update docs/guides

# Update specific file
pnpm doc-utility update docs/guides/setup.md
```

### Validate Documentation

```bash
pnpm doc-utility validate [paths...] [--fix]
```

Checks that all documentation has required frontmatter fields.

**Examples:**

```bash
# Validate all docs
pnpm doc-utility validate docs

# Validate and fix issues automatically
pnpm doc-utility validate docs --fix
```

## Frontmatter Format

All documentation should include YAML frontmatter:

```yaml
---
title: Document Title
created: 2025-01-15
modified: 2025-01-15
status: draft
tags: [e2e, playwright]
---
```

**Required Fields:**

- `title` - Document title
- `created` - Creation date (YYYY-MM-DD)
- `modified` - Last modified date (YYYY-MM-DD)
- `status` - One of: `draft`, `review`, `final`

**Optional Fields:**

- `tags` - Array of relevant tags

## Templates

### Guide Template

Includes sections for:

- Overview
- Prerequisites
- Steps
- Troubleshooting
- Next Steps

### ADR Template

Includes sections for:

- Status
- Context
- Decision
- Consequences
- Alternatives Considered
- References

### API Template

Includes sections for:

- Overview
- Usage
- API Reference
- Types
- See Also

## Development

```bash
# Watch mode
pnpm dev

# Build
pnpm build
```
