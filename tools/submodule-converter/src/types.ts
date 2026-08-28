export interface ConversionOptions {
  /**
   * Path to the project directory to convert (relative to workspace root)
   */
  projectPath: string;

  /**
   * GitHub organization name
   */
  org: string;

  /**
   * GitHub repository name (defaults to project directory name)
   */
  repoName?: string;

  /**
   * Optional prefix for the repository name
   */
  namePrefix?: string;

  /**
   * GitHub personal access token (required for repository creation)
   */
  githubToken: string;

  /**
   * Workspace root directory
   */
  workspaceRoot: string;

  /**
   * Branch name to use for the new repository (defaults to 'main')
   */
  defaultBranch?: string;

  /**
   * Whether to make the repository private (defaults to true)
   */
  isPrivate?: boolean;

  /**
   * Dry run mode - show what would happen without actually doing it
   */
  dryRun?: boolean;
}

export interface ConversionResult {
  success: boolean;
  repoUrl?: string;
  repoName?: string;
  error?: string;
}

export interface GitHubRepoInfo {
  name: string;
  fullName: string;
  htmlUrl: string;
  sshUrl: string;
  cloneUrl: string;
}
