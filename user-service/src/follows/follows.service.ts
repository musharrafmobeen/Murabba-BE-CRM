import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppError, ErrorCode } from '../common/errors.js';
import { User } from '../users/user.entity.js';
import { Follow } from './follow.entity.js';

const LIST_DEFAULT = 20;
const LIST_MAX = 50;

export type ProfileViewer = {
  id: string;
};

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly follows: Repository<Follow>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async stats(user: User) {
    const followingCount = await this.countFollowingAdvertisers(user.id);
    const followersCount = user.isAdvertiser
      ? await this.follows.count({ where: { followingId: user.id } })
      : 0;
    return {
      followersCount,
      followingCount,
      showFollowers: user.isAdvertiser,
      canBeFollowed: user.isAdvertiser,
    };
  }

  async profile(targetId: string, viewer: ProfileViewer) {
    const target = await this.requireUser(targetId);
    const followingIds = await this.followingIdSet(viewer.id);
    return this.presentProfile(target, viewer.id, followingIds);
  }

  async follow(viewer: ProfileViewer, targetId: string) {
    if (viewer.id === targetId) {
      throw new AppError(ErrorCode.FOLLOW_SELF, HttpStatus.BAD_REQUEST);
    }
    const target = await this.requireUser(targetId);
    if (!target.isAdvertiser) {
      throw new AppError(ErrorCode.FOLLOW_NOT_ALLOWED, HttpStatus.FORBIDDEN);
    }
    const existing = await this.follows.findOneBy({
      followerId: viewer.id,
      followingId: targetId,
    });
    if (!existing) {
      await this.follows.save(
        this.follows.create({
          followerId: viewer.id,
          followingId: targetId,
        }),
      );
    }
    return this.profile(targetId, viewer);
  }

  async unfollow(viewer: ProfileViewer, targetId: string) {
    await this.follows.delete({
      followerId: viewer.id,
      followingId: targetId,
    });
    return this.profile(targetId, viewer);
  }

  async followers(targetId: string, viewer: ProfileViewer, query: ListQuery) {
    const target = await this.requireUser(targetId);
    const { limit, offset } = page(query);
    if (!target.isAdvertiser) {
      return { items: [], total: 0, showFollowers: false };
    }
    const total = await this.follows.count({ where: { followingId: targetId } });
    const rows = await this.follows.find({
      where: { followingId: targetId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    const items = await this.presentRows(
      rows.map((row) => row.followerId),
      viewer.id,
    );
    return { items, total, showFollowers: true };
  }

  async following(targetId: string, viewer: ProfileViewer, query: ListQuery) {
    await this.requireUser(targetId);
    const { limit, offset } = page(query);
    const qb = this.follows
      .createQueryBuilder('f')
      .innerJoin(User, 'u', 'u.id = f.followingId AND u.isAdvertiser = true')
      .where('f.followerId = :targetId', { targetId });
    const total = await qb.clone().getCount();
    const rows = await qb
      .orderBy('f.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    const items = await this.presentRows(
      rows.map((row) => row.followingId),
      viewer.id,
    );
    return { items, total, showFollowers: false };
  }

  async search(viewer: ProfileViewer, q: string, query: ListQuery) {
    const term = q?.trim() ?? '';
    if (!term) {
      return { items: [], total: 0 };
    }
    const { limit, offset } = page(query);
    const qb = this.users
      .createQueryBuilder('u')
      .where('u.isAdvertiser = true')
      .andWhere('(u.username ILIKE :term OR u.displayName ILIKE :term)', {
        term: `%${term}%`,
      });
    const total = await qb.clone().getCount();
    const rows = await qb
      .orderBy('u.username', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();
    const followingIds = await this.followingIdSet(viewer.id);
    const followingCounts = await this.followingCounts(rows.map((row) => row.id));
    return {
      items: rows.map((row) =>
        this.presentListItem(
          row,
          viewer.id,
          followingIds,
          followingCounts.get(row.id) ?? 0,
        ),
      ),
      total,
    };
  }

  async suggested(viewer: ProfileViewer, query: ListQuery) {
    const { limit, offset } = page(query);
    const followingIds = await this.followingIdSet(viewer.id);
    const qb = this.users
      .createQueryBuilder('u')
      .where('u.isAdvertiser = true')
      .andWhere('u.id != :me', { me: viewer.id });
    if (followingIds.size > 0) {
      qb.andWhere('u.id NOT IN (:...ids)', { ids: [...followingIds] });
    }
    const total = await qb.clone().getCount();
    const rows = await qb
      .orderBy('u.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    const followingCounts = await this.followingCounts(rows.map((row) => row.id));
    return {
      items: rows.map((row) =>
        this.presentListItem(
          row,
          viewer.id,
          followingIds,
          followingCounts.get(row.id) ?? 0,
        ),
      ),
      total,
    };
  }

  private async presentProfile(
    target: User,
    viewerId: string,
    followingIds: Set<string>,
  ) {
    const stats = await this.stats(target);
    return {
      id: target.id,
      username: target.username,
      displayName: target.displayName ?? null,
      city: target.city ?? null,
      bio: target.bio ?? null,
      photoUrl: target.photoPath ? `/uploads/${target.photoPath}` : null,
      isAdvertiser: target.isAdvertiser,
      isSelf: viewerId === target.id,
      isFollowing: followingIds.has(target.id),
      canFollow:
        target.isAdvertiser &&
        viewerId !== target.id &&
        !followingIds.has(target.id),
      ...stats,
    };
  }

  private async presentRows(ids: string[], viewerId: string) {
    if (ids.length === 0) {
      return [];
    }
    const people = await this.users.findBy({ id: In(ids) });
    const byId = new Map(people.map((person) => [person.id, person]));
    const followingIds = await this.followingIdSet(viewerId);
    const followingCounts = await this.followingCounts(ids);
    return ids
      .map((id) => byId.get(id))
      .filter((person): person is User => Boolean(person))
      .map((person) =>
        this.presentListItem(person, viewerId, followingIds, followingCounts.get(person.id) ?? 0),
      );
  }

  private presentListItem(
    person: User,
    viewerId: string,
    followingIds: Set<string>,
    followingCount?: number,
  ) {
    const isFollowing = followingIds.has(person.id);
    return {
      id: person.id,
      username: person.username,
      displayName: person.displayName ?? null,
      photoUrl: person.photoPath ? `/uploads/${person.photoPath}` : null,
      isAdvertiser: person.isAdvertiser,
      followingCount: followingCount ?? 0,
      isFollowing,
      canFollow:
        person.isAdvertiser && viewerId !== person.id && !isFollowing,
    };
  }

  private async followingCounts(userIds: string[]) {
    const map = new Map<string, number>();
    if (userIds.length === 0) {
      return map;
    }
    const rows = await this.follows
      .createQueryBuilder('f')
      .select('f.followerId', 'followerId')
      .addSelect('COUNT(*)', 'count')
      .innerJoin(User, 'u', 'u.id = f.followingId AND u.isAdvertiser = true')
      .where('f.followerId IN (:...userIds)', { userIds })
      .groupBy('f.followerId')
      .getRawMany<{ followerId: string; count: string }>();
    for (const row of rows) {
      map.set(row.followerId, Number(row.count));
    }
    return map;
  }

  private async countFollowingAdvertisers(userId: string) {
    return this.follows
      .createQueryBuilder('f')
      .innerJoin(User, 'u', 'u.id = f.followingId AND u.isAdvertiser = true')
      .where('f.followerId = :userId', { userId })
      .getCount();
  }

  private async followingIdSet(viewerId: string) {
    const rows = await this.follows.find({
      where: { followerId: viewerId },
      select: { followingId: true },
    });
    return new Set(rows.map((row) => row.followingId));
  }

  private async requireUser(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return user;
  }
}

type ListQuery = { limit?: string; offset?: string };

function page(query: ListQuery) {
  const limit = Math.min(
    Math.max(Number(query.limit) || LIST_DEFAULT, 1),
    LIST_MAX,
  );
  const offset = Math.max(Number(query.offset) || 0, 0);
  return { limit, offset };
}
