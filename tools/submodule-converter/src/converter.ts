import chalk from 'chalk';
import {basename, join} from 'path';
import {GitService} from './git-service.js';
import {GitHubService} from './github-service.js';
import type {ConversionOptions, ConversionResult} from './types.js';

export class SubmoduleConverter {
  private githubService: GitHubService;
  private gitService: GitService;

  constructor(private options: ConversionOptions) {
    this.githubService = new GitHubService(options.githubToken);
    this.gitService = new GitService(
      options.workspaceRoot,
      options.projectPath
    );
  }

  /**
   * Validate the conversion options and project state
   */
  private async validate(): Promise<void> {
    const projectFullPath = join(
      this.options.workspaceRoot,
      this.options.projectPath
    );

    // Check if project directory exists
    const {existsSync} = await import('fs');
    if (!existsSync(projectFullPath)) {
      throw new Error(
        `Project directory not found: ${this.options.projectPath}`
      );
    }

    // Check for uncommitted changes
    if (await this.gitService.hasUncommittedChanges()) {
      throw new Error(
        `Project has uncommitted changes. Please commit or stash them first.`
      );
    }

    // Check if already a git submodule
    const gitmodulesPath = join(this.options.workspaceRoot, '.gitmodules');
    if (existsSync(gitmodulesPath)) {
      const {readFileSync} = await import('fs');
      const gitmodules = readFileSync(gitmodulesPath, 'utf-8');
      if (gitmodules.includes(this.options.projectPath)) {
        throw new Error(`${this.options.projectPath} is already a submodule`);
      }
    }
  }

  /**
   * Generate the repository name
   */
  private getRepoName(): string {
    const projectName =
      this.options.repoName || basename(this.options.projectPath);
    return this.options.namePrefix
      ? `${this.options.namePrefix}${projectName}`
      : projectName;
  }

  /**
   * Convert the project to a submodule
   */
  async convert(): Promise<ConversionResult> {
    try {
      console.log(chalk.bold('\n🔄 Starting submodule conversion...\n'));

      // Validate
      console.log(chalk.blue('Validating project state...'));
      await this.validate();

      const repoName = this.getRepoName();
      const {org, isPrivate = true, defaultBranch = 'main'} = this.options;

      if (this.options.dryRun) {
        console.log(
          chalk.yellow('\n📋 DRY RUN MODE - No changes will be made\n')
        );
        console.log(chalk.gray(`Would create repository: ${org}/${repoName}`));
        console.log(
          chalk.gray(`Would convert ${this.options.projectPath} to submodule`)
        );
        return {success: true, repoName};
      }

      // Check if repository already exists
      console.log(chalk.blue(`Checking if ${org}/${repoName} exists...`));
      const exists = await this.githubService.repositoryExists(org, repoName);
      if (exists) {
        throw new Error(
          `Repository ${org}/${repoName} already exists on GitHub`
        );
      }

      // Create backup branch
      const backupBranch = `backup-before-${repoName}-submodule-${Date.now()}`;
      console.log(chalk.blue(`Creating backup branch: ${backupBranch}...`));
      await this.gitService.createBackupBranch(backupBranch);

      // Create GitHub repository
      console.log(
        chalk.blue(`Creating GitHub repository: ${org}/${repoName}...`)
      );
      const repoInfo = await this.githubService.createRepository(
        org,
        repoName,
        isPrivate,
        `Converted from monorepo: ${this.options.projectPath}`
      );
      console.log(chalk.green(`✓ Repository created: ${repoInfo.htmlUrl}`));

      // Initialize git in project directory
      console.log(chalk.blue('Initializing git repository in project...'));
      await this.gitService.initProjectRepo();
      console.log(chalk.green('✓ Project repository initialized'));

      // Push to GitHub
      console.log(chalk.blue('Pushing project to GitHub...'));
      await this.gitService.pushToRemote(repoInfo.sshUrl, defaultBranch);
      console.log(chalk.green('✓ Project pushed to GitHub'));

      // Remove from main repository
      console.log(chalk.blue('Removing project from main repository...'));
      await this.gitService.removeFromMainRepo();
      console.log(chalk.green('✓ Project removed from main repository'));

      // Add as submodule
      console.log(chalk.blue('Adding project as submodule...'));
      await this.gitService.addSubmodule(
        repoInfo.sshUrl,
        this.options.projectPath
      );
      console.log(chalk.green('✓ Submodule added'));

      // Stage and commit
      console.log(chalk.blue('Committing submodule changes...'));
      await this.gitService.stageSubmoduleChanges();
      await this.gitService.commitSubmodule(repoName, repoInfo.htmlUrl);
      console.log(chalk.green('✓ Changes committed'));

      console.log(
        chalk.bold.green(`\n✨ Successfully converted to submodule!\n`)
      );
      console.log(chalk.gray(`Repository: ${repoInfo.htmlUrl}`));
      console.log(chalk.gray(`Backup branch: ${backupBranch}`));
      console.log(
        chalk.gray(`\nYou can restore the original state by running:`)
      );
      console.log(chalk.cyan(`  git checkout ${backupBranch}\n`));

      return {
        success: true,
        repoUrl: repoInfo.htmlUrl,
        repoName,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`\n❌ Conversion failed: ${message}\n`));
      return {
        success: false,
        error: message,
      };
    }
  }
}
