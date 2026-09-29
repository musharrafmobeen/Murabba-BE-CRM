import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from './jwt-auth.guard.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthRequest>().user,
);
