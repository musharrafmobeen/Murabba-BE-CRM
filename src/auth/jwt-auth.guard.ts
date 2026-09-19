import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';

export type AuthRequest = Request & { user: User };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        tokenVersion: number;
      }>(token);
      const user = await this.users.findById(payload.sub);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException();
      }
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
