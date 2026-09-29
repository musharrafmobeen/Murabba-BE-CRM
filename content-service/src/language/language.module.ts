import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminLanguagePagesController,
  AdminLanguagesController,
} from './admin-language.controller.js';
import { AppLanguage } from './app-language.entity.js';
import { LanguageController } from './language.controller.js';
import { LanguagePage } from './language-page.entity.js';
import { LanguageService } from './language.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LanguagePage, AppLanguage])],
  controllers: [
    LanguageController,
    AdminLanguagePagesController,
    AdminLanguagesController,
  ],
  providers: [LanguageService],
})
export class LanguageModule {}
