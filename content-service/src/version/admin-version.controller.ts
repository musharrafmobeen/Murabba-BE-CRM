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
import { CreateVersionDto, UpdateVersionDto } from './version.dto.js';
import { VersionService } from './version.service.js';

@Controller('admin/versions')
@UseGuards(AdminGuard)
export class AdminVersionController {
  constructor(private readonly version: VersionService) {}

  @Get()
  list() {
    return this.version.list();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.version.getById(id);
  }

  @Post()
  create(@Body() dto: CreateVersionDto) {
    return this.version.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.version.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.version.remove(id);
  }
}
