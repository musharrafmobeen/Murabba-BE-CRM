import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, SignupDto, VerifyOtpDto, SessionDto } from './auth.dto.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { User } from '../users/user.entity.js';

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
