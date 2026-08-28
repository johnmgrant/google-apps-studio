# @johnmgrant/configs/tsconfig

Reusable TypeScript config presets for mgd projects. Published with root-level JSON files so you can extend using a short, stable path.

## Install

Using pnpm:

```bash
pnpm add -D @johnmgrant/configs/tsconfig
```

## Usage

In your `tsconfig.json`:

```json
{
  "extends": "@johnmgrant/configs/tsconfig/node",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Alternate form (also supported by many tools):

```json
{
  "extends": "@johnmgrant/configs/tsconfig/node/tsconfig.json"
}
```

### Available presets

- `@johnmgrant/configs/tsconfig/node`
- `@johnmgrant/configs/tsconfig/base`
- `@johnmgrant/configs/tsconfig/eslint`
- `@johnmgrant/configs/tsconfig/strict-type-checking`

Each preset is also available as a folder variant, e.g. `.../node/tsconfig.json`.

## How it works

- The package ships JSON configs at the root of the published tarball (e.g., `node.json`).
- Directory variants are also shipped (e.g., `node/tsconfig.json`).
- This enables short extends paths and compatibility across ecosystems.

## Notes

- Package name: `@johnmgrant/configs/tsconfig`.
- For project references/monorepos, set `compilerOptions.composite: true` in leaf packages as needed.
- Built with Vite; declaration files are generated and JSONs are copied to output.
