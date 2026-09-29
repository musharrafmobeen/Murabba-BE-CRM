import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminHelpCategoriesController,
  AdminHelpItemsController,
  AdminHelpPagesController,
} from './admin-help.controller.js';
import { HelpController } from './help.controller.js';
import { HelpCategory } from './help-category.entity.js';
import { HelpItem } from './help-item.entity.js';
import { HelpPage } from './help-page.entity.js';
import { HelpService } from './help.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([HelpPage, HelpCategory, HelpItem])],
  controllers: [
    HelpController,
    AdminHelpPagesController,
    AdminHelpCategoriesController,
    AdminHelpItemsController,
  ],
  providers: [HelpService],
})
export class HelpModule {}
