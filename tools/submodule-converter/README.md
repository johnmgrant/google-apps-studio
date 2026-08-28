# Submodule Converter

A CLI tool to convert workspace projects into git submodules with automatic GitHub repository creation.

## Features

- 🔄 Converts existing projects in a monorepo to git submodules
- 🐙 Automatically creates GitHub repositories
- 🔐 Supports both organization and user repositories
- 🛡️ Creates backup branches before conversion
- 🎯 Interactive CLI with sensible defaults
- 🌲 Dry-run mode to preview changes
- 🔑 Multiple authentication methods (token, gh CLI, environment variables)

## Installation

From the workspace root:

```bash
pnpm install
pnpm --filter ./tools/submodule-converter run build
```

Or install globally:

```bash
cd tools/submodule-converter
pnpm install
pnpm build
pnpm link --global
```

## Usage

### Basic Usage

```bash
# Run from workspace root
pnpm --filter ./tools/submodule-converter exec convert-to-submodule <project-path>

# Or if installed globally
convert-to-submodule <project-path>
```

### Examples

#### Convert a project with interactive prompts

```bash
convert-to-submodule projects/fitness-ingestion
```

The tool will prompt for:

- GitHub organization (defaults to workspace org)
- Repository name (defaults to project directory name)
- GitHub token (if not in environment)
- Confirmation

#### Convert with all options specified

```bash
convert-to-submodule projects/fitness-ingestion \
  --org johnmgrant \
  --repo fitness-ingestion \
  --prefix gas- \
  --branch main \
  --public
```

#### Dry run to preview changes

```bash
convert-to-submodule projects/fitness-ingestion --dry-run
```

### Options

- `-o, --org <org>` - GitHub organization or username
- `-r, --repo <name>` - Repository name (defaults to project directory name)
- `-p, --prefix <prefix>` - Prefix for repository name
- `-t, --token <token>` - GitHub personal access token
- `-b, --branch <branch>` - Default branch name (default: "main")
- `--public` - Make repository public (default is private)
- `--dry-run` - Preview changes without executing them

## Authentication

The tool supports multiple authentication methods (in order of priority):

1. `--token` CLI option
2. `GITHUB_TOKEN` environment variable
3. `GH_TOKEN` environment variable
4. GitHub CLI (`gh auth token`)

### Setting up GitHub Token

Create a personal access token with the following scopes:

- `repo` (full control of private repositories)
- `delete_repo` (if you need to clean up)

```bash
# Using environment variable
export GITHUB_TOKEN=ghp_your_token_here

# Or use GitHub CLI
gh auth login
```

## How It Works

1. **Validation**: Checks project exists and has no uncommitted changes
2. **Backup**: Creates a backup branch
3. **GitHub Repo**: Creates a new repository on GitHub
4. **Initialize**: Initializes git in the project directory
5. **Push**: Pushes project history to the new repository
6. **Remove**: Removes project from main repository
7. **Submodule**: Adds project back as a submodule
8. **Commit**: Commits the submodule changes

## Rollback

If something goes wrong, you can restore the original state:

```bash
# The tool creates a backup branch like:
# backup-before-<project>-submodule-<timestamp>

git checkout backup-before-fitness-ingestion-submodule-1704153600000
```

## Safety Features

- ✅ Checks for uncommitted changes before conversion
- ✅ Creates backup branch automatically
- ✅ Validates repository doesn't already exist
- ✅ Dry-run mode for testing
- ✅ Clear error messages and rollback instructions

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

## Requirements

- Node.js 18+
- Git
- GitHub account with repository creation permissions
- SSH keys configured for GitHub (for pushing)

## Troubleshooting

### "Repository already exists"

The target repository already exists on GitHub. Choose a different name or use the `--prefix` option.

### "Permission denied (publickey)"

Your SSH keys aren't configured for GitHub. Set them up:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub
```

### "Project has uncommitted changes"

Commit or stash your changes first:

```bash
git add .
git commit -m "Save changes before conversion"
```

## License

Apache 2.0 - See [LICENSE](../../LICENSE) file in repository root. Copyright 2026 John Mitchell-Grant; all rights reserved except as expressly granted under the license.
