import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module.js';
import { AboutModule } from './about/about.module.js';
import { ContactModule } from './contact/contact.module.js';
import { HelpModule } from './help/help.module.js';
import { LanguageModule } from './language/language.module.js';
import { VersionModule } from './version/version.module.js';
import { validate } from './config/env.validation.js';
import { typeormOptions } from './database/typeorm.options.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => typeormOptions(),
    }),
    AdminModule,
    HealthModule,
    AboutModule,
    HelpModule,
    VersionModule,
    LanguageModule,
    ContactModule,
  ],
})
export class AppModule {}
