import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PHOTO_MAX_BYTES } from '../common/constants.js';
import { UpdateProfileDto } from '../users/profile.dto.js';
import type { User } from '../users/user.entity.js';
import { AuthService } from './auth.service.js';
import { LoginDto, SignupDto, VerifyOtpDto, SessionDto } from './auth.dto.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('otp/verify')
  verify(@Body() dto: VerifyOtpDto) {
    return this.auth.verify(dto.sessionId, dto.code);
  }

  @Post('otp/resend')
  resend(@Body() dto: SessionDto) {
    return this.auth.resend(dto.sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.auth.me(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user, dto);
  }

  @Post('me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: PHOTO_MAX_BYTES },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: User,
    @UploadedFile() file?: { buffer: Buffer; mimetype: string; size: number },
  ) {
    return this.auth.uploadPhoto(user, file);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: User) {
    return this.auth.logout(user);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: User) {
    return this.auth.deleteAccount(user);
  }
}
