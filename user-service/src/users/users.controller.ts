import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AppError, ErrorCode } from '../common/errors.js';
import { isValidUsername } from '../common/utils.js';
import { FollowsService } from '../follows/follows.service.js';
import type { User } from './user.entity.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly follows: FollowsService,
  ) {}

  @Get('username/available')
  async usernameAvailable(@Query('username') username?: string) {
    const value = username?.trim() ?? '';
    if (!isValidUsername(value)) {
      throw new AppError(ErrorCode.USERNAME_INVALID, HttpStatus.BAD_REQUEST);
    }

    const taken = await this.users.findByUsername(value);
    return { available: !taken };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(
    @CurrentUser() viewer: User,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.follows.search(viewer, q ?? '', { limit, offset });
  }

  @Get('suggested')
  @UseGuards(JwtAuthGuard)
  suggested(
    @CurrentUser() viewer: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.follows.suggested(viewer, { limit, offset });
  }

  @Get(':id/followers')
  @UseGuards(JwtAuthGuard)
  followers(
    @CurrentUser() viewer: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.follows.followers(id, viewer, { limit, offset });
  }

  @Get(':id/following')
  @UseGuards(JwtAuthGuard)
  following(
    @CurrentUser() viewer: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.follows.following(id, viewer, { limit, offset });
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(
    @CurrentUser() viewer: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.follows.follow(viewer, id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @CurrentUser() viewer: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.follows.unfollow(viewer, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  profile(
    @CurrentUser() viewer: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.follows.profile(id, viewer);
  }
}
