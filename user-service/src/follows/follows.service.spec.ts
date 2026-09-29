import { HttpStatus } from '@nestjs/common';
import { FollowsService } from './follows.service.js';
import { ErrorCode } from '../common/errors.js';

describe('FollowsService', () => {
  const follows = {
    findOneBy: vi.fn(),
    find: vi.fn(),
    count: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (row) => ({ id: 'f1', ...row })),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const users = {
    findOneBy: vi.fn(),
    findBy: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const service = new FollowsService(follows as never, users as never);

  const viewer = { id: 'me' };
  const advertiser = {
    id: 'adv-1',
    username: 'agent',
    displayName: 'Ali Ahmed',
    city: 'Riyadh',
    bio: null,
    photoPath: null,
    isAdvertiser: true,
  };
  const normal = {
    id: 'user-1',
    username: 'normal',
    displayName: 'Sara',
    city: null,
    bio: null,
    photoPath: null,
    isAdvertiser: false,
  };

  function countQb(count: number) {
    return {
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      clone: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(count),
      getMany: vi.fn().mockResolvedValue([]),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    follows.find.mockResolvedValue([]);
    follows.count.mockResolvedValue(0);
    follows.createQueryBuilder.mockReturnValue(countQb(0));
  });

  it('lets a user follow an advertiser', async () => {
    users.findOneBy.mockResolvedValue(advertiser);
    follows.findOneBy.mockResolvedValue(null);

    const result = await service.follow(viewer, advertiser.id);

    expect(follows.save).toHaveBeenCalled();
    expect(result.isAdvertiser).toBe(true);
    expect(result.showFollowers).toBe(true);
    expect(result.canBeFollowed).toBe(true);
  });

  it('blocks following a normal user', async () => {
    users.findOneBy.mockResolvedValue(normal);

    await expect(service.follow(viewer, normal.id)).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
      response: { error: ErrorCode.FOLLOW_NOT_ALLOWED },
    });
    expect(follows.save).not.toHaveBeenCalled();
  });

  it('returns an empty followers list for a normal user', async () => {
    users.findOneBy.mockResolvedValue(normal);

    await expect(
      service.followers(normal.id, viewer, {}),
    ).resolves.toEqual({
      items: [],
      total: 0,
      showFollowers: false,
    });
  });

  it('reports follower count 0 for a normal user', async () => {
    const stats = await service.stats(normal as never);
    expect(stats).toEqual({
      followersCount: 0,
      followingCount: 0,
      showFollowers: false,
      canBeFollowed: false,
    });
    expect(follows.count).not.toHaveBeenCalled();
  });
});
