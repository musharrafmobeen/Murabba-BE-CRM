import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminVersionController } from './admin-version.controller.js';
import { AppVersion } from './app-version.entity.js';
import { VersionController } from './version.controller.js';
import { VersionService } from './version.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion])],
  controllers: [VersionController, AdminVersionController],
  providers: [VersionService],
})
export class VersionModule {}
