import { Controller, Get } from '@nestjs/common';
import { LanguageService } from './language.service.js';

@Controller('languages')
export class LanguageController {
  constructor(private readonly language: LanguageService) {}

  @Get()
  get() {
    return this.language.get();
  }
}
