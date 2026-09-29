import { Controller, Get } from '@nestjs/common';
import { VersionService } from './version.service.js';

@Controller('version')
export class VersionController {
  constructor(private readonly version: VersionService) {}

  @Get()
  get() {
    return this.version.get();
  }
}
