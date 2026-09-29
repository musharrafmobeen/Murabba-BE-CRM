import { Controller, Get } from '@nestjs/common';
import { HelpService } from './help.service.js';

@Controller('help')
export class HelpController {
  constructor(private readonly help: HelpService) {}

  @Get()
  get() {
    return this.help.get();
  }
}
