# Google Apps Script Codespace Configuration

This document explains the devcontainer setup for Google Apps Script development, optimized for both desktop and mobile/tablet workflows.

## Overview

Our development environment is configured using a `.devcontainer/devcontainer.json` file that defines:

- Base Docker image
- Additional development features
- VS Code extensions
- Editor settings
- Post-creation commands

## Base Image

```jsonc
"image": "mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm"
```

**Why this image?**

- **typescript-node**: Pre-configured with TypeScript and Node.js tooling
- **1-24**: Node.js version 24 (LTS)
- **bookworm**: Latest stable Debian release (vs older "bullseye")

### Alternative Images

If you need different configurations:

| Image                                                           | Use Case                                    |
| --------------------------------------------------------------- | ------------------------------------------- |
| `mcr.microsoft.com/devcontainers/javascript-node:1-24-bookworm` | JavaScript-focused (lighter weight)         |
| `mcr.microsoft.com/devcontainers/universal:2`                   | Multi-language support (Python, Ruby, etc.) |
| `mcr.microsoft.com/devcontainers/base:debian`                   | Minimal base for custom setup               |

## Features

Features are reusable components that add tools to the container.

### Git (`ghcr.io/devcontainers/features/git:1`)

- Version control integration
- Required for clasp and GitHub operations

### GitHub CLI (`ghcr.io/devcontainers/features/github-cli:1`)

- Manage GitHub repos from terminal
- Useful for mobile workflows: `gh pr create`, `gh issue list`
- Enables authentication without browser

### Common Utils (`ghcr.io/devcontainers/features/common-utils:2`)

```jsonc
"installZsh": true,
"installOhMyZsh": true,
"upgradePackages": true
```

- **Zsh**: More powerful shell than bash
- **Oh My Zsh**: Plugin framework with auto-completion
- **Upgrades**: Keeps system packages current

### Node.js (`ghcr.io/devcontainers/features/node:1`)

```jsonc
"nodeGypDependencies": true,
"version": "lts"
```

- **nodeGypDependencies**: Compiles native modules
- **LTS version**: Stable, long-term support Node.js

## Extensions

See [Mobile Optimization Settings](./codespace-config/settings-mobile-optimized-options.md) for detailed extension explanations.

### Core Categories

1. **Core Development**: ESLint, Prettier, EditorConfig
2. **TypeScript/JavaScript**: Intellisense, spell checker, formatters
3. **Git & GitHub**: Pull requests, GitLens, .gitignore templates
4. **Google Apps Script**: Schema validation for `appsscript.json`
5. **AI & Productivity**: GitHub Copilot
6. **Mobile/Tablet**: Voice input, remote server optimization
7. **UI & Navigation**: Icons, error highlighting, project management
8. **Code Quality**: Import cost analysis

## Settings

Key settings are documented in:

- [Mobile-Optimized Options](./codespace-config/settings-mobile-optimized-options.md)
- [Additional Recommendations](./codespace-config/clipboard-text-extensions.md)

## Post-Creation Setup

```jsonc
"postCreateCommand": "pnpm install && npx clasp login --no-localhost || echo 'Remember to run: npx clasp login'"
```

This runs automatically when the container is created:

1. Installs all npm packages via pnpm
2. Attempts clasp authentication
3. Falls back to reminder message if auth fails

### Manual Clasp Login

If automatic login fails (common on mobile):

```bash
npx clasp login --no-localhost
```

Then paste the authorization code from the browser.

## Port Forwarding

```jsonc
"forwardPorts": [8080, 3000],
"portsAttributes": {
  "8080": {
    "label": "Dev Server",
    "onAutoForward": "notify"
  }
}
```

Exposes local development servers to your device:

- **8080**: Vite dev server
- **3000**: Alternative dev port

## Remote User

```jsonc
"remoteUser": "node"
```

Runs commands as the `node` user (non-root) for better security.

## Mobile Access Methods

### 1. GitHub Codespaces (Recommended for Mobile)

**Via Browser:**

- Navigate to github.com/johnmgrant/google-apps-studio
- Press `.` for quick github.dev editor
- Press `>` then select "Create Codespace" for full environment

**Via GitHub Mobile App:**

- Open repository in GitHub app
- Tap "Code" → "Codespaces" → "Create codespace"

### 2. VS Code for iPad/Tablet

**Using Safari:**

1. Open vscode.dev or github.dev
2. Connect to your Codespace
3. Use external keyboard for best experience

**VS Code App (iPad):**

- Install "Code - OSS" or use official VS Code preview
- Connect via Remote - SSH or GitHub Codespaces

### 3. iPhone Quick Edits

Best for:

- Small bug fixes
- Configuration changes
- Quick commits

Limitations:

- Smaller screen = harder navigation
- Touch keyboard = slower typing
- Use voice input extension when possible

## Updating the Configuration

1. Edit `.devcontainer/devcontainer.json`
2. Commit and push changes
3. Rebuild container:
   - Command Palette: "Codespaces: Rebuild Container"
   - Or delete and recreate the Codespace

## Troubleshooting

### Extensions Not Loading

- Check extension ID spelling in `devcontainer.json`
- Some extensions don't support web/remote environments
- Check extension marketplace for "Remote" compatibility

### Clasp Authentication Fails

- Use `--no-localhost` flag
- Ensure you're logged into correct Google account
- Check OAuth credentials in Google Cloud Console

### Port Forwarding Not Working

- Ensure process is actually listening on the port
- Check Codespace port visibility settings
- May need to make port "Public" for mobile access

## Further Reading

- [Dev Containers Documentation](https://containers.dev)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [Clasp Documentation](https://github.com/google/clasp)
- [Mobile-Optimized Settings](./codespace-config/settings-mobile-optimized-options.md)
