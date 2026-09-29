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
import { CreateContactTypeDto, UpdateContactTypeDto } from './contact-type.dto.js';
import { ContactService } from './contact.service.js';

@Controller('admin/contact-types')
@UseGuards(AdminGuard)
export class AdminContactTypeController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list() {
    return this.contact.listTypes();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.contact.getType(id);
  }

  @Post()
  create(@Body() dto: CreateContactTypeDto) {
    return this.contact.createType(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactTypeDto,
  ) {
    return this.contact.updateType(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contact.removeType(id);
  }
}
