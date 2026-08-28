#!/usr/bin/env node

/**
 * Check git history and status for projects/templatization-lor/universities.json
 * - Uses `git -C` to avoid changing directories
 * - Prints working tree status for the file and recent commits touching it
 */

import process from 'node:child_process';
import console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';

function run(cmd) {
  try {
    return process.execSync(cmd, {stdio: 'pipe'}).toString();
  } catch (err) {
    const output = err.stdout ? err.stdout.toString() : '';
    const message = err.message || 'Command failed';
    throw new Error(`${message}\n${output}`);
  }
}

(function main() {
  const workspace = process.cwd();
  const repoDir = path.join(workspace, 'projects', 'templatization-lor');
  const fileRel = 'universities.json';
  const fileAbs = path.join(repoDir, fileRel);

  if (!fs.existsSync(fileAbs)) {
    console.error(`[ERROR] File not found: ${fileAbs}`);
    process.exit(1);
  }

  // Verify repository presence (nested repo or submodule)
  const isGitRepo = fs.existsSync(path.join(repoDir, '.git'));
  if (!isGitRepo) {
    console.warn(
      '[WARN] No .git found in nested project. If this file is in a linked private repo, consider adding it as a submodule for cleaner history checks.'
    );
  }

  console.log(`\n[Info] Checking git status for: ${fileAbs}`);
  try {
    const status = run(
      `git -C "${repoDir}" status --porcelain -- "${fileRel}"`
    );
    console.log(
      status.trim() ? status : '[Clean] No local changes for the file.'
    );
  } catch (e) {
    console.error('[ERROR] Failed to read status.');
    console.error(e.message);
  }

  console.log('\n[Info] Recent commits affecting the file (last 15):');
  try {
    const log = run(
      `git -C "${repoDir}" log --follow --date=iso --pretty=format:"%h | %ad | %an | %s" -- "${fileRel}" | head -n 15`
    );
    console.log(log || '[None] No commit history found for this file.');
  } catch (e) {
    console.error('[ERROR] Failed to read commit history.');
    console.error(e.message);
  }

  console.log('\n[Done] Git history check complete.');
})();
