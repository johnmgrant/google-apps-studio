#!/usr/bin/env ts-node

/*
  Robust clasp push watcher (TypeScript):
  - Watches build/ for stable changes
  - On debounce, runs `clasp push`
  - Keeps running regardless of clasp exit
  Usage:
    - With explicit path: `pnpm exec node -r jiti/register tools/dev-utils/watch-clasp.ts /abs/or/relative/project/path`
    - Auto scope: run from within a project dir and it will detect CWD
*/
import chokidar from 'chokidar';
import {spawn} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function resolveProjectRoot(arg?: string): string {
  if (arg) {
    return path.resolve(arg);
  }
  // Default to current working directory
  return process.cwd();
}

const argPath = process.argv[2];
const ROOT = resolveProjectRoot(argPath);
const BUILD_DIR = path.join(ROOT, 'build');
const DEBOUNCE_MS = parseInt(process.env.CLASP_DEBOUNCE_MS || '800', 10);

let timer: NodeJS.Timeout | null = null;
let pushing = false;

function runClaspPush() {
  if (pushing) return;
  pushing = true;
  const child = spawn('clasp', ['push'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', () => {
    pushing = false;
  });
}

const watcher = chokidar.watch(BUILD_DIR, {
  ignoreInitial: true,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: DEBOUNCE_MS,
    pollInterval: 100,
  },
});

watcher.on('all', () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    runClaspPush();
  }, DEBOUNCE_MS);
});

console.log(`[watch-clasp] Root: ${ROOT}`);
console.log(`[watch-clasp] Watching ${BUILD_DIR} (debounce ${DEBOUNCE_MS}ms)`);
