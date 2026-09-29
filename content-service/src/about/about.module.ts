import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutController } from './about.controller.js';
import { AboutPage } from './about-page.entity.js';
import { AboutService } from './about.service.js';
import { AdminAboutController } from './admin-about.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([AboutPage])],
  controllers: [AboutController, AdminAboutController],
  providers: [AboutService],
})
export class AboutModule {}
