import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.users.findOne({ where: { phone } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.users.findOne({ where: { username: ILike(username) } });
  }

  async create(username: string, phone: string): Promise<User> {
    const now = new Date();
    const user = this.users.create({
      username,
      phone,
      termsAcceptedAt: now,
      lastLoginAt: now,
    });
    return this.users.save(user);
  }

  async markLogin(user: User): Promise<User> {
    user.lastLoginAt = new Date();
    return this.users.save(user);
  }

  async bumpTokenVersion(user: User): Promise<void> {
    user.tokenVersion += 1;
    await this.users.save(user);
  }

  async remove(user: User): Promise<void> {
    await this.users.remove(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
    };
  }
}
