#!/usr/bin/env node

import chalk from 'chalk';
import {Command} from 'commander';
import {existsSync} from 'fs';
import {basename, resolve} from 'path';
import prompts from 'prompts';
import {SubmoduleConverter} from './converter.js';
import type {ConversionOptions} from './types.js';

interface CliOptions {
  org?: string;
  repo?: string;
  prefix?: string;
  token?: string;
  branch?: string;
  public?: boolean;
  dryRun?: boolean;
}

async function getDefaultOrg(workspaceRoot: string): Promise<string> {
  try {
    const {simpleGit} = await import('simple-git');
    const git = simpleGit(workspaceRoot);
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');

    if (origin?.refs.fetch) {
      // Extract org from git URL
      const match = origin.refs.fetch.match(/github\.com[:/]([^/]+)\//);
      if (match) {
        return match[1];
      }
    }
  } catch (_error) {
    // Ignore errors
  }

  return '';
}

async function getGitHubToken(): Promise<string> {
  // Try to get token from environment
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Try to get token from gh CLI
  try {
    const {execSync} = await import('child_process');
    const token = execSync('gh auth token', {encoding: 'utf-8'}).trim();
    if (token) {
      return token;
    }
  } catch (_error) {
    // Ignore errors
  }

  return '';
}

async function main() {
  const program = new Command();

  program
    .name('convert-to-submodule')
    .description('Convert a workspace project to a git submodule')
    .version('1.0.0')
    .argument(
      '<project-path>',
      'Path to the project directory (relative to workspace root)'
    )
    .option('-o, --org <org>', 'GitHub organization name')
    .option(
      '-r, --repo <name>',
      'Repository name (defaults to project directory name)'
    )
    .option('-p, --prefix <prefix>', 'Repository name prefix')
    .option('-t, --token <token>', 'GitHub personal access token')
    .option('-b, --branch <branch>', 'Default branch name', 'main')
    .option('--public', 'Make the repository public (default is private)')
    .option('--dry-run', 'Show what would happen without making changes')
    .action(async (projectPath: string, options: CliOptions) => {
      try {
        // Determine workspace root
        const workspaceRoot = process.cwd();

        // Resolve project path
        const fullProjectPath = resolve(workspaceRoot, projectPath);
        if (!existsSync(fullProjectPath)) {
          console.error(
            chalk.red(`Error: Project directory not found: ${projectPath}`)
          );
          process.exit(1);
        }

        // Get default org
        const defaultOrg = await getDefaultOrg(workspaceRoot);

        // Get GitHub token
        let token = options.token || (await getGitHubToken());

        // Interactive prompts for missing information
        const answers = await prompts([
          {
            type: options.org ? null : 'text',
            name: 'org',
            message: 'GitHub organization/username:',
            initial: defaultOrg,
            validate: (value) =>
              value.trim() !== '' || 'Organization is required',
          },
          {
            type: options.repo ? null : 'text',
            name: 'repo',
            message: 'Repository name:',
            initial: options.prefix
              ? `${options.prefix}${basename(projectPath)}`
              : basename(projectPath),
          },
          {
            type: !token ? 'password' : null,
            name: 'token',
            message: 'GitHub personal access token:',
            validate: (value) => value.trim() !== '' || 'Token is required',
          },
          {
            type: options.dryRun ? null : 'confirm',
            name: 'confirm',
            message: `Convert ${projectPath} to a submodule?`,
            initial: false,
          },
        ]);

        if (answers.confirm === false && !options.dryRun) {
          console.log(chalk.yellow('Conversion cancelled.'));
          process.exit(0);
        }

        // Merge options
        const org = options.org || answers.org;
        const repo = options.repo || answers.repo;
        token = token || answers.token;

        if (!org || !token) {
          console.error(chalk.red('Error: Missing required information'));
          process.exit(1);
        }

        // Create conversion options
        const conversionOptions: ConversionOptions = {
          projectPath,
          org,
          repoName: repo,
          namePrefix: options.prefix,
          githubToken: token,
          workspaceRoot,
          defaultBranch: options.branch,
          isPrivate: !options.public,
          dryRun: options.dryRun,
        };

        // Execute conversion
        const converter = new SubmoduleConverter(conversionOptions);
        const result = await converter.convert();

        if (!result.success) {
          process.exit(1);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
      }
    });

  program.parse();
}

main().catch((error) => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
});
