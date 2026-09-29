import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard.js';
import {
  CreateLanguageDto,
  CreateLanguagePageDto,
  UpdateLanguageDto,
  UpdateLanguagePageDto,
} from './language.dto.js';
import { LanguageService } from './language.service.js';

@Controller('admin/language-pages')
@UseGuards(AdminGuard)
export class AdminLanguagePagesController {
  constructor(private readonly language: LanguageService) {}

  @Get()
  list() {
    return this.language.listPages();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.language.getPage(id);
  }

  @Post()
  create(@Body() dto: CreateLanguagePageDto) {
    return this.language.createPage(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLanguagePageDto,
  ) {
    return this.language.updatePage(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.language.removePage(id);
  }
}

@Controller('admin/languages')
@UseGuards(AdminGuard)
export class AdminLanguagesController {
  constructor(private readonly language: LanguageService) {}

  @Get()
  list() {
    return this.language.listLanguages();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.language.getLanguage(id);
  }

  @Post()
  create(@Body() dto: CreateLanguageDto) {
    return this.language.createLanguage(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.language.updateLanguage(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.language.removeLanguage(id);
  }
}
