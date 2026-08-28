import {existsSync} from 'fs';
import {join} from 'path';
import simpleGit, {SimpleGit} from 'simple-git';

export class GitService {
  private git: SimpleGit;
  private projectGit: SimpleGit;

  constructor(
    private workspaceRoot: string,
    private projectPath: string
  ) {
    this.git = simpleGit(workspaceRoot);
    this.projectGit = simpleGit(join(workspaceRoot, projectPath));
  }

  /**
   * Check if the project directory has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.git.status();
    const projectFiles = status.files.filter((file) =>
      file.path.startsWith(this.projectPath)
    );
    return projectFiles.length > 0;
  }

  /**
   * Check if the project is already a git repository
   */
  async isGitRepository(path: string): Promise<boolean> {
    return existsSync(join(path, '.git'));
  }

  /**
   * Get the current commit SHA for the project directory
   */
  async getLastCommitForPath(): Promise<string> {
    const log = await this.git.log({file: this.projectPath, maxCount: 1});
    return log.latest?.hash || '';
  }

  /**
   * Remove the project directory from the main repository
   */
  async removeFromMainRepo(): Promise<void> {
    await this.git.rm(['-r', '--cached', this.projectPath]);
  }

  /**
   * Commit the removal of the project directory
   */
  async commitRemoval(projectName: string): Promise<void> {
    await this.git.commit(`Convert ${projectName} to submodule`);
  }

  /**
   * Initialize a new git repository in the project directory
   */
  async initProjectRepo(): Promise<void> {
    await this.projectGit.init();
    await this.projectGit.add('.');
    await this.projectGit.commit('Initial commit from monorepo');
  }

  /**
   * Add remote and push to GitHub
   */
  async pushToRemote(
    remoteUrl: string,
    branch: string = 'main'
  ): Promise<void> {
    await this.projectGit.addRemote('origin', remoteUrl);
    await this.projectGit.branch(['-M', branch]);
    await this.projectGit.push('origin', branch, ['--set-upstream']);
  }

  /**
   * Add the project as a submodule
   */
  async addSubmodule(remoteUrl: string, path: string): Promise<void> {
    await this.git.submoduleAdd(remoteUrl, path);
  }

  /**
   * Stage the .gitmodules file and submodule changes
   */
  async stageSubmoduleChanges(): Promise<void> {
    await this.git.add(['.gitmodules', this.projectPath]);
  }

  /**
   * Commit the submodule addition
   */
  async commitSubmodule(projectName: string, repoUrl: string): Promise<void> {
    await this.git.commit(
      `Add ${projectName} as submodule\n\nRepository: ${repoUrl}`
    );
  }

  /**
   * Create a backup branch before conversion
   */
  async createBackupBranch(branchName: string): Promise<void> {
    await this.git.branch([branchName]);
  }

  /**
   * Get the current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.branch();
    return branch.current;
  }

  /**
   * Check if working directory is clean
   */
  async isWorkingDirectoryClean(): Promise<boolean> {
    const status = await this.git.status();
    return status.isClean();
  }
}
