import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
} from 'fs';
import {dirname, join} from 'path';
import {Plugin} from 'vite';

/**
 * A Vite plugin that:
 * 1. Always reuses existing outDir files instead of writing new ones if content hasn't changed.
 * 2. Detects file moves by matching content and base names, then applies them via rename.
 * 3. Persists content hashes across builds to accurately detect unchanged outputs.
 * 4. Only writes/removes files when actual content changes have been made.
 */
export default (): Plugin => {
  // Persist content hashes across builds to detect unchanged outputs
  const prevContent = new Map<string, string>();

  return {
    name: 'reuse-build-files',
    enforce: 'post',
    generateBundle(options, bundle) {
      const outDir = options?.dir ?? null;

      if (!outDir) {
        return;
      }

      // Recursively collect existing files relative to outDir
      const collectFiles = (base: string, prefix = ''): string[] => {
        if (!existsSync(base)) return [];
        const entries = readdirSync(base);
        const result: string[] = [];
        for (const entry of entries) {
          const fullPath = join(base, entry);
          const relPath = prefix ? `${prefix}/${entry}` : entry;
          const stats = statSync(fullPath);
          if (stats.isDirectory()) {
            result.push(...collectFiles(fullPath, relPath));
          } else {
            result.push(relPath);
          }
        }
        return result;
      };
      const existingFiles = new Set(collectFiles(outDir));

      const emitted: string[] = [];
      const skipped: string[] = [];
      const moved: Array<{from: string; to: string}> = [];

      const normalize = (s: unknown): string => {
        const str = typeof s === 'string' ? s : String(s ?? '');
        // Normalize line endings and trim
        const noCR = str.replace(/\r\n?/g, '\n');
        // Drop sourceMappingURL/footer lines which can vary between builds
        const lines = noCR
          .split('\n')
          .filter((l) => !/^\s*\/?\/?#\s*sourceMappingURL=/i.test(l));
        return lines.join('\n').trim();
      };

      // Detect potential file moves by checking if existing file has same content
      const detectMovedFile = (
        newFileName: string,
        newContent: string
      ): string | null => {
        try {
          // Extract the base name without extension for matching
          const newBaseName = newFileName.replace(/\.gs$/, '').split('/').pop();
          const newContentNorm = normalize(newContent);

          // Check existing files for content match
          for (const existingFile of existingFiles) {
            const existingPath = join(outDir, existingFile);
            const existingContent = readFileSync(existingPath, 'utf-8');
            const existingContentNorm = normalize(existingContent);

            // If we find a file with matching content but different path, it's likely a move
            if (existingContentNorm === newContentNorm) {
              const existingBaseName = existingFile
                .replace(/\.gs$/, '')
                .split('/')
                .pop();

              // Only consider it a move if the base names match (e.g., constants -> constants)
              if (newBaseName === existingBaseName) {
                return existingFile;
              }
            }
          }
        } catch {
          // Ignore errors during move detection
        }

        return null;
      };

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const filePath = join(outDir, fileName);
        const existingContent = existsSync(filePath)
          ? readFileSync(filePath, 'utf-8')
          : null;

        let contentToWrite: string | null = null;

        if (chunk.type === 'chunk') {
          contentToWrite = chunk.code;
        } else if (chunk.type === 'asset') {
          contentToWrite =
            typeof chunk.source === 'string'
              ? chunk.source
              : chunk.source.toString();
        }

        if (contentToWrite === null) {
          continue;
        }

        const next = normalize(contentToWrite);
        const prev = prevContent.get(fileName) ?? normalize(existingContent);

        if (prev === next) {
          // No changes, skip writing
          delete bundle[fileName];
          existingFiles.delete(fileName);
          skipped.push(fileName);
        } else {
          // File has changed or is new
          // Check if this is a moved file first
          const movedFromFile = detectMovedFile(fileName, contentToWrite);

          if (movedFromFile && movedFromFile !== fileName) {
            // It's a move - we'll handle this after processing all files
            moved.push({from: movedFromFile, to: fileName});
            existingFiles.delete(movedFromFile);
          }

          existingFiles.delete(fileName);
          emitted.push(fileName);
          prevContent.set(fileName, next);
        }
      }

      // Log the operation summary
      if (emitted.length || skipped.length || moved.length) {
        console.info(
          `[reuse-build-files] Emitted: ${emitted.length} | Skipped (unchanged): ${skipped.length} | Moved: ${moved.length}`
        );
        if (emitted.length)
          console.info(`[reuse-build-files] → Emitted:`, emitted);
        if (skipped.length)
          console.info(`[reuse-build-files] → Skipped:`, skipped);
        if (moved.length)
          console.info(
            `[reuse-build-files] → Moved:`,
            moved.map((m) => `${m.from} → ${m.to}`)
          );
      }

      // Apply file moves before removing obsolete files
      for (const {from, to} of moved) {
        const fromPath = join(outDir, from);
        const toPath = join(outDir, to);

        try {
          if (existsSync(fromPath)) {
            // Ensure target directory exists
            const toDir = dirname(toPath);
            if (!existsSync(toDir)) {
              mkdirSync(toDir, {recursive: true});
            }
            // Move the file
            renameSync(fromPath, toPath);
          }
        } catch (error) {
          console.warn(
            `[reuse-build-files] Failed to move ${from} to ${to}:`,
            error
          );
        }
      }

      // Remove files that are no longer in the bundle
      for (const obsoleteFile of existingFiles) {
        const target = join(outDir, obsoleteFile);
        try {
          const stats = statSync(target);
          if (stats.isFile()) unlinkSync(target);
        } catch {
          // ignore
        }
      }
    },
  };
};
