import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GitService} from '../git-service';

// Mock simple-git
vi.mock('simple-git', () => {
  const mockGit = {
    status: vi.fn(),
    log: vi.fn(),
    rm: vi.fn(),
    commit: vi.fn(),
    init: vi.fn(),
    add: vi.fn(),
    addRemote: vi.fn(),
    branch: vi.fn(),
    push: vi.fn(),
    submoduleAdd: vi.fn(),
  };

  return {
    default: vi.fn(() => mockGit),
  };
});

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

describe('GitService', () => {
  type MockGit = Record<string, ReturnType<typeof vi.fn>>;

  let service: GitService;
  let mockGit: MockGit;

  beforeEach(async () => {
    vi.clearAllMocks();
    const simpleGit = (await import('simple-git')).default;
    service = new GitService('/workspace', 'projects/test-project');
    mockGit = simpleGit() as unknown as MockGit;
  });

  describe('hasUncommittedChanges', () => {
    it('should return true if project has uncommitted changes', async () => {
      mockGit.status.mockResolvedValue({
        files: [
          {path: 'projects/test-project/file.ts'},
          {path: 'other/file.ts'},
        ],
      });

      const result = await service.hasUncommittedChanges();

      expect(result).toBe(true);
    });

    it('should return false if project has no uncommitted changes', async () => {
      mockGit.status.mockResolvedValue({
        files: [{path: 'other/file.ts'}],
      });

      const result = await service.hasUncommittedChanges();

      expect(result).toBe(false);
    });
  });

  describe('getLastCommitForPath', () => {
    it('should return the last commit hash for the project', async () => {
      mockGit.log.mockResolvedValue({
        latest: {hash: 'abc123'},
      });

      const result = await service.getLastCommitForPath();

      expect(result).toBe('abc123');
      expect(mockGit.log).toHaveBeenCalledWith({
        file: 'projects/test-project',
        maxCount: 1,
      });
    });

    it('should return empty string if no commits found', async () => {
      mockGit.log.mockResolvedValue({latest: null});

      const result = await service.getLastCommitForPath();

      expect(result).toBe('');
    });
  });

  describe('removeFromMainRepo', () => {
    it('should remove project directory from git', async () => {
      await service.removeFromMainRepo();

      expect(mockGit.rm).toHaveBeenCalledWith([
        '-r',
        '--cached',
        'projects/test-project',
      ]);
    });
  });

  describe('commitRemoval', () => {
    it('should commit the removal', async () => {
      await service.commitRemoval('test-project');

      expect(mockGit.commit).toHaveBeenCalledWith(
        'Convert test-project to submodule'
      );
    });
  });

  describe('pushToRemote', () => {
    it('should add remote and push to specified branch', async () => {
      const projectGit = (service as unknown as {projectGit: MockGit})
        .projectGit;

      await service.pushToRemote('git@github.com:org/repo.git', 'main');

      expect(projectGit.addRemote).toHaveBeenCalledWith(
        'origin',
        'git@github.com:org/repo.git'
      );
      expect(projectGit.branch).toHaveBeenCalledWith(['-M', 'main']);
      expect(projectGit.push).toHaveBeenCalledWith('origin', 'main', [
        '--set-upstream',
      ]);
    });
  });

  describe('addSubmodule', () => {
    it('should add submodule with correct parameters', async () => {
      await service.addSubmodule(
        'git@github.com:org/repo.git',
        'projects/test-project'
      );

      expect(mockGit.submoduleAdd).toHaveBeenCalledWith(
        'git@github.com:org/repo.git',
        'projects/test-project'
      );
    });
  });

  describe('createBackupBranch', () => {
    it('should create a backup branch', async () => {
      await service.createBackupBranch('backup-test');

      expect(mockGit.branch).toHaveBeenCalledWith(['backup-test']);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      mockGit.branch.mockResolvedValue({current: 'main'});

      const result = await service.getCurrentBranch();

      expect(result).toBe('main');
    });
  });

  describe('isWorkingDirectoryClean', () => {
    it('should return true if working directory is clean', async () => {
      mockGit.status.mockResolvedValue({isClean: () => true});

      const result = await service.isWorkingDirectoryClean();

      expect(result).toBe(true);
    });

    it('should return false if working directory has changes', async () => {
      mockGit.status.mockResolvedValue({isClean: () => false});

      const result = await service.isWorkingDirectoryClean();

      expect(result).toBe(false);
    });
  });
});
