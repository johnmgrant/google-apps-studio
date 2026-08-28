import {Octokit} from '@octokit/rest';
import type {GitHubRepoInfo} from './types.js';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({auth: token});
  }

  /**
   * Create a new GitHub repository
   */
  async createRepository(
    org: string,
    name: string,
    isPrivate: boolean = true,
    description?: string
  ): Promise<GitHubRepoInfo> {
    try {
      const {data} = await this.octokit.repos.createInOrg({
        org,
        name,
        private: isPrivate,
        description,
        auto_init: false,
      });

      return {
        name: data.name,
        fullName: data.full_name,
        htmlUrl: data.html_url,
        sshUrl: data.ssh_url,
        cloneUrl: data.clone_url,
      };
    } catch (error: unknown) {
      // If org repos don't work, try creating under user
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error.status === 404 || error.status === 403)
      ) {
        const {data} = await this.octokit.repos.createForAuthenticatedUser({
          name,
          private: isPrivate,
          description,
          auto_init: false,
        });

        return {
          name: data.name,
          fullName: data.full_name,
          htmlUrl: data.html_url,
          sshUrl: data.ssh_url,
          cloneUrl: data.clone_url,
        };
      }
      throw error;
    }
  }

  /**
   * Check if a repository already exists
   */
  async repositoryExists(org: string, name: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({owner: org, repo: name});
      return true;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser() {
    const {data} = await this.octokit.users.getAuthenticated();
    return data;
  }
}
