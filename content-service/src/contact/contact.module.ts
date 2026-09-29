import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminContactTypeController } from './admin-contact-type.controller.js';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';
import { ContactSubmission } from './contact-submission.entity.js';
import { ContactType } from './contact-type.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ContactSubmission, ContactType])],
  controllers: [ContactController, AdminContactTypeController],
  providers: [ContactService],
})
export class ContactModule {}
