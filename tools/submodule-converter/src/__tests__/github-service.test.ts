import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubService } from '../github-service';

// Mock Octokit
vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn().mockImplementation(function (this: unknown) {
      return {
        repos: {
          createInOrg: vi.fn(),
          createForAuthenticatedUser: vi.fn(),
          get: vi.fn(),
        },
        users: {
          getAuthenticated: vi.fn(),
        },
      };
    }),
  };
});

describe('GitHubService', () => {
  type MockOctokit = Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  let service: GitHubService;
  let mockOctokit: MockOctokit;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GitHubService('fake-token');
    mockOctokit = (service as unknown as {octokit: MockOctokit}).octokit;
  });

  describe('createRepository', () => {
    it('should create an org repository', async () => {
      const mockRepo = {
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        html_url: 'https://github.com/test-org/test-repo',
        ssh_url: 'git@github.com:test-org/test-repo.git',
        clone_url: 'https://github.com/test-org/test-repo.git',
      };

      mockOctokit.repos.createInOrg.mockResolvedValue({data: mockRepo});

      const result = await service.createRepository('test-org', 'test-repo');

      expect(result).toEqual({
        name: 'test-repo',
        fullName: 'test-org/test-repo',
        htmlUrl: 'https://github.com/test-org/test-repo',
        sshUrl: 'git@github.com:test-org/test-repo.git',
        cloneUrl: 'https://github.com/test-org/test-repo.git',
      });

      expect(mockOctokit.repos.createInOrg).toHaveBeenCalledWith({
        org: 'test-org',
        name: 'test-repo',
        private: true,
        auto_init: false,
        description: undefined,
      });
    });

    it('should fall back to user repository if org creation fails', async () => {
      const mockRepo = {
        name: 'test-repo',
        full_name: 'test-user/test-repo',
        html_url: 'https://github.com/test-user/test-repo',
        ssh_url: 'git@github.com:test-user/test-repo.git',
        clone_url: 'https://github.com/test-user/test-repo.git',
      };

      mockOctokit.repos.createInOrg.mockRejectedValue({status: 404});
      mockOctokit.repos.createForAuthenticatedUser.mockResolvedValue({
        data: mockRepo,
      });

      const result = await service.createRepository('test-org', 'test-repo');

      expect(result.fullName).toBe('test-user/test-repo');
      expect(mockOctokit.repos.createForAuthenticatedUser).toHaveBeenCalled();
    });

    it('should create a public repository when specified', async () => {
      const mockRepo = {
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        html_url: 'https://github.com/test-org/test-repo',
        ssh_url: 'git@github.com:test-org/test-repo.git',
        clone_url: 'https://github.com/test-org/test-repo.git',
      };

      mockOctokit.repos.createInOrg.mockResolvedValue({data: mockRepo});

      await service.createRepository('test-org', 'test-repo', false);

      expect(mockOctokit.repos.createInOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          private: false,
        })
      );
    });
  });

  describe('repositoryExists', () => {
    it('should return true if repository exists', async () => {
      mockOctokit.repos.get.mockResolvedValue({data: {}});

      const exists = await service.repositoryExists('test-org', 'test-repo');

      expect(exists).toBe(true);
      expect(mockOctokit.repos.get).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo',
      });
    });

    it('should return false if repository does not exist', async () => {
      mockOctokit.repos.get.mockRejectedValue({status: 404});

      const exists = await service.repositoryExists('test-org', 'test-repo');

      expect(exists).toBe(false);
    });

    it('should throw error for non-404 errors', async () => {
      mockOctokit.repos.get.mockRejectedValue({status: 500});

      await expect(
        service.repositoryExists('test-org', 'test-repo')
      ).rejects.toThrow();
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return authenticated user data', async () => {
      const mockUser = {
        login: 'test-user',
        id: 123,
        name: 'Test User',
      };

      mockOctokit.users.getAuthenticated.mockResolvedValue({
        data: mockUser,
      });

      const user = await service.getAuthenticatedUser();

      expect(user).toEqual(mockUser);
    });
  });
});
