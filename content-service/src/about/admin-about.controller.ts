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
import { AboutService } from './about.service.js';
import { CreateAboutDto, UpdateAboutDto } from './about.dto.js';

@Controller('admin/about')
@UseGuards(AdminGuard)
export class AdminAboutController {
  constructor(private readonly about: AboutService) {}

  @Get()
  list() {
    return this.about.list();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.about.getById(id);
  }

  @Post()
  create(@Body() dto: CreateAboutDto) {
    return this.about.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAboutDto,
  ) {
    return this.about.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.about.remove(id);
  }
}
