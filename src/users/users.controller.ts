import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { AppError, ErrorCode } from '../common/errors.js';
import { isValidUsername } from '../common/utils.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('username/available')
  async usernameAvailable(@Query('username') username?: string) {
    const value = username?.trim() ?? '';
    if (!isValidUsername(value)) {
      throw new AppError(
        ErrorCode.USERNAME_INVALID,
        'Username must be 3-20 characters: letters, numbers, underscores, or hyphens.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const taken = await this.users.findByUsername(value);
    return { available: !taken };
  }
}
