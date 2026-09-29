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
  CreateHelpCategoryDto,
  CreateHelpItemDto,
  CreateHelpPageDto,
  UpdateHelpCategoryDto,
  UpdateHelpItemDto,
  UpdateHelpPageDto,
} from './help.dto.js';
import { HelpService } from './help.service.js';

@Controller('admin/help-pages')
@UseGuards(AdminGuard)
export class AdminHelpPagesController {
  constructor(private readonly help: HelpService) {}

  @Get()
  list() {
    return this.help.listPages();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.getPage(id);
  }

  @Post()
  create(@Body() dto: CreateHelpPageDto) {
    return this.help.createPage(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHelpPageDto,
  ) {
    return this.help.updatePage(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.removePage(id);
  }
}

@Controller('admin/help-categories')
@UseGuards(AdminGuard)
export class AdminHelpCategoriesController {
  constructor(private readonly help: HelpService) {}

  @Get()
  list() {
    return this.help.listCategories();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.getCategory(id);
  }

  @Post()
  create(@Body() dto: CreateHelpCategoryDto) {
    return this.help.createCategory(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHelpCategoryDto,
  ) {
    return this.help.updateCategory(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.removeCategory(id);
  }
}

@Controller('admin/help-items')
@UseGuards(AdminGuard)
export class AdminHelpItemsController {
  constructor(private readonly help: HelpService) {}

  @Get()
  list() {
    return this.help.listItems();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.getItem(id);
  }

  @Post()
  create(@Body() dto: CreateHelpItemDto) {
    return this.help.createItem(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHelpItemDto,
  ) {
    return this.help.updateItem(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.help.removeItem(id);
  }
}
