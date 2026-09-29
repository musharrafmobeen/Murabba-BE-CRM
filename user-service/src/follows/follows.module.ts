import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { Follow } from './follow.entity.js';
import { FollowsService } from './follows.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User])],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
