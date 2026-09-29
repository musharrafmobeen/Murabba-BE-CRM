import { Controller, Get } from '@nestjs/common';
import { AboutService } from './about.service.js';

@Controller('about')
export class AboutController {
  constructor(private readonly about: AboutService) {}

  @Get()
  get() {
    return this.about.get();
  }
}
