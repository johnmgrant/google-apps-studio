#!/usr/bin/env ts-node
import {execSync} from 'child_process';
import fs from 'fs';
import {globSync} from 'glob';
import path from 'path';

interface SubmoduleConfig {
  path: string;
  url: string;
  branch?: string;
}

const args = process.argv.slice(2);

const pwd = process.cwd();

if (args.length < 2) {
  console.error('Usage: move-submodule.ts <pattern-or-path> <destination>');
  console.error('Examples:');
  console.error(
    '  move-submodule.ts submodules/Web-TagEngine web/Web-TagEngine'
  );
  console.error('  move-submodule.ts "submodules/*" submodules');
  process.exit(1);
}

const patternOrPath = args[0];
const destination = args[1];
const gitmodulesPath = path.join(pwd, '.gitmodules');
const gitConfigPath = path.join(pwd, '.git', 'config');
// Note: .git/modules/<name>/ is keyed by submodule name, not path. Since the submodule name
// doesn't change when moving a submodule, .git/modules entries don't need to be updated.
// Only .gitmodules and .git/config need path updates.
const gitModulesDir = path.join(pwd, '.git', 'modules');

// Detect if pattern contains glob characters
const isGlobPattern = /[*?[\]]/.test(patternOrPath);

// Resolve paths to move
let pathsToMove: string[] = [];

if (isGlobPattern) {
  // Expand glob pattern
  pathsToMove = globSync(patternOrPath);

  if (pathsToMove.length === 0) {
    console.error(`Error: No paths matched the pattern: ${patternOrPath}`);
    process.exit(1);
  }
} else {
  // Single path
  if (!fs.existsSync(patternOrPath)) {
    console.error(`Error: Current path does not exist: ${patternOrPath}`);
    process.exit(1);
  }
  pathsToMove = [patternOrPath];
}

// Ensure destination is a directory (will create subdirectories for each move)
if (fs.existsSync(destination) && !fs.statSync(destination).isDirectory()) {
  console.error(
    `Error: Destination exists but is not a directory: ${destination}`
  );
  process.exit(1);
}

if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, {recursive: true});
  console.log(`✓ Created destination directory: ${destination}`);
}

try {
  // Read and parse .gitmodules once
  if (!fs.existsSync(gitmodulesPath)) {
    console.error('Error: .gitmodules file not found');
    process.exit(1);
  }

  let gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
  let gitConfigContent = fs.readFileSync(gitConfigPath, 'utf8');
  let changes = 0;

  console.log(`Processing ${pathsToMove.length} submodule(s)...\n`);

  for (const currentPath of pathsToMove) {
    console.log(
      `Moving submodule from "${currentPath}" to destination "${destination}"...`
    );

    // Find the submodule name in .gitmodules
    const submoduleMatch = gitmodulesContent.match(
      new RegExp(
        `\\[submodule "([^"]+)"\\]\\s+path = ${currentPath.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        )}`
      )
    );

    if (!submoduleMatch) {
      console.warn(
        `⚠️  Submodule not found in .gitmodules for path: ${currentPath}`
      );
      continue;
    }

    const submoduleName = submoduleMatch[1];
    const submoduleBaseName = path.basename(currentPath);
    const newPath = path.join(destination, submoduleBaseName);

    console.log(`  Submodule name: "${submoduleName}"`);
    console.log(`  New path: "${newPath}"`);

    // Update .gitmodules
    gitmodulesContent = gitmodulesContent.replace(
      new RegExp(
        `path = ${currentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'g'
      ),
      `path = ${newPath}`
    );
    console.log('  ✓ Updated .gitmodules');

    // Update .git/config
    gitConfigContent = gitConfigContent.replace(
      new RegExp(
        `submodule\\.${submoduleName.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        )}\\.path = ${currentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'g'
      ),
      `submodule.${submoduleName}.path = ${newPath}`
    );
    console.log('  ✓ Updated .git/config');

    // Move the submodule directory
    if (fs.existsSync(currentPath)) {
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, {recursive: true});
        console.log(`  ✓ Created directory: ${newDir}`);
      }

      execSync(`mv "${currentPath}" "${newPath}"`);
      console.log(`  ✓ Moved directory from "${currentPath}" to "${newPath}"`);
    } else {
      console.warn(`  ⚠️  Directory not found: ${currentPath}`);
    }

    changes++;
    console.log('');
  }

  // Write updated config files if changes were made
  if (changes > 0) {
    fs.writeFileSync(gitmodulesPath, gitmodulesContent, 'utf8');
    fs.writeFileSync(gitConfigPath, gitConfigContent, 'utf8');

    // Update git index: stage all changes (moves, deletions, additions)
    execSync('git add -A');
    console.log('✓ Updated git index');

    console.log(
      `\n✅ Successfully moved ${changes} submodule(s) to "${destination}"`
    );
    console.log('\nNext steps:');
    console.log(`1. Review the changes: git status`);
    console.log(
      `2. Commit the changes: git commit -m "chore: move submodules to ${destination}"`
    );
  } else {
    console.log('⚠️  No submodules were moved.');
    process.exit(1);
  }
} catch (error) {
  console.error(
    'Error during submodule move:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}
