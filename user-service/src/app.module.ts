import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { validate } from './config/env.validation.js';
import { typeormOptions } from './database/typeorm.options.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';

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
    HealthModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
