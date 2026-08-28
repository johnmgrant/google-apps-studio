import { cp, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const distDir = join(__dirname, '..', 'dist');
  const configsDir = join(distDir, 'configs');

  const files = ['node.json', 'base.json', 'eslint.json', 'strict-type-checking.json'];

  // Ensure dist exists
  await mkdir(distDir, { recursive: true });

  for (const f of files) {
    const src = join(configsDir, f);
    const dst = join(distDir, f);
    try {
      await stat(src);
      await cp(src, dst, { force: true });
      // eslint-disable-next-line no-console
      console.info(`[tsconfig-configs] Copied ${f} -> dist/${f}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[tsconfig-configs] Skipping ${f} (not found at ${src})`);
    }
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[tsconfig-configs] Failed to copy root JSON configs:', err);
  process.exitCode = 1;
});
