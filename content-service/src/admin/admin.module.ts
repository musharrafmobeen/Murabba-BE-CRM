import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';

@Global()
@Module({
  providers: [AdminGuard],
  exports: [AdminGuard],
})
export class AdminModule {}
