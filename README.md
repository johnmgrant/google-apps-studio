# Google Apps Script Development

Collection of Google Apps Scripts with TypeScript support and GitHub Codespaces integration.

## Features

- 🚀 TypeScript support for type-safe development
- 📦 [Clasp](https://github.com/google/clasp) for command-line Apps Script management
- 🎨 ESLint and Prettier for code quality and formatting
- 🔧 GitHub Codespaces ready with pre-configured development environment
- 📝 VS Code extensions for enhanced developer experience

## Prerequisites

- Node.js 20 or higher
- pnpm (v11 or higher)
- Google account with access to Google Apps Script
- (Optional) GitHub Codespaces for cloud-based development

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Login to Google Apps Script

```bash
pnpm clasp login
```

This will open a browser window for Google authentication.

### 3. Create or Link a Google Apps Script Project

You have two options:

**Option A: Create a new standalone script**

```bash
pnpm clasp create --title "My Script" --type standalone
```

**Option B: Link to an existing script**

1. Copy `.clasp.json.template` to `.clasp.json` inside your project directory (e.g. `projects/google-docs-toolkit/.clasp.json`)
2. Add your script ID from the [Google Apps Script editor](https://script.google.com/home?pli=1) (Project Settings → Script ID)

### 4. Build & Push Your Code

```bash
pnpm build
pnpm push
```

## Available Scripts

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `pnpm build`          | Build all workspace projects and tools via Turbo |
| `pnpm build:projects` | Build all Apps Script projects in `projects/*`   |
| `pnpm push`           | Push local compiled code to Google Apps Script   |
| `pnpm pull`           | Pull code from Google Apps Script to local       |
| `pnpm deploy`         | Deploy Apps Script projects                      |
| `pnpm typecheck`      | Run TypeScript type checks across all projects   |
| `pnpm lint`           | Check code for linting errors                    |
| `pnpm lint:fix`       | Automatically fix linting errors                 |
| `pnpm format`         | Format code with Prettier                        |
| `pnpm format:check`   | Check if code is formatted correctly             |

## Development Workflow

1. **Edit code** in a project's `src/` directory (e.g. `projects/google-docs-toolkit/src/`)
2. **Format and lint** your code:

   ```bash
   pnpm format
   pnpm lint
   ```

3. **Build and push to Google Apps Script**:

   ```bash
   pnpm build
   pnpm push
   ```

4. **Test** your script in the Apps Script editor or bound spreadsheet/document

## Portfolio maintenance

The repository has two local agent workflows in `.agents/skills/`:

- [Changelog maintainer](.agents/skills/changelog-maintainer/SKILL.md) drafts release notes from staged changes for review before updating [CHANGELOG.md](CHANGELOG.md).
- [Dependency maintenance](.agents/skills/dependency-maintenance/SKILL.md) guides targeted pnpm updates and runs typecheck and lint after an update.

These workflows were adapted from `.ai/` for this monorepo. They do not require `.ai/` at runtime.

## GitHub Codespaces

This repository is configured for GitHub Codespaces. Click the "Code" button and select "Create codespace on main" to start developing in the cloud with all dependencies pre-installed.

The Codespace includes:

- Node.js 20 & pnpm
- VS Code extensions for TypeScript, ESLint, and Prettier
- Pre-configured formatting, linting, and build tooling

## Project Structure

```
.
├── .devcontainer/           # GitHub Codespaces configuration
├── packages/                # Shared workspace packages
│   ├── fitness-models/      # Fitness & workout data models
│   └── sheets-utility/      # Node.js utility for Google Sheets API
├── projects/                # Individual Apps Script projects
│   ├── google-docs-toolkit/ # Google Docs document & formatting utilities
│   └── templatization-lor/  # Recommendation letter generator
├── tools/                   # Workspace development & build tools
│   ├── build-utils/         # Vite & Apps Script build helpers
│   ├── dev-utils/           # Utility scripts for dev environment
│   ├── doc-utility/         # Documentation generators
│   ├── eslint/              # Shared ESLint configuration
│   ├── submodule-converter/ # CLI tool for submodule management
│   ├── tsconfig/            # Shared TypeScript configurations
│   └── vite-plugins/        # Vite plugins for Apps Script output
├── scripts/                 # Automation scripts
├── eslint.config.ts        # ESLint flat config
├── .prettierrc.json        # Prettier configuration
├── tsconfig.json           # Root TypeScript configuration
├── package.json            # Monorepo root configuration
└── README.md              # This file
```

## Google Sheets Node.js Utility

For running spreadsheet operations outside the Google Apps Script runtime, we provide a Node.js utility in `packages/sheets-utility` that uses the Google Sheets API directly.

**Quick Start:**

```bash
cd packages/sheets-utility
pnpm install
pnpm run auth
pnpm run example:list
```

See [packages/sheets-utility/README.md](packages/sheets-utility/README.md) for full documentation.

## Tips

- **TypeScript compilation**: Clasp automatically transpiles TypeScript to JavaScript when pushing
- **Auto-formatting**: Enable "Format on Save" in VS Code for automatic code formatting
- **Watch mode**: Use `clasp push --watch` to automatically push changes on file save
- **Logs**: Use `npm run logs` to view execution logs and debug issues

## Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [TypeScript for Apps Script](https://developers.google.com/apps-script/guides/typescript)
- [Apps Script Types](https://www.npmjs.com/package/@types/google-apps-script)

## License

Apache 2.0 - See [LICENSE](LICENSE) file in repository root. Copyright 2026 John Mitchell-Grant; all rights reserved except as expressly granted under the license.
