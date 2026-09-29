import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './contact.dto.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Get('types')
  types() {
    return this.contact.types();
  }

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contact.create(dto);
  }
}
