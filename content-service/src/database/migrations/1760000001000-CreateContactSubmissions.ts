import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactSubmissions1760000001000 implements MigrationInterface {
  name = 'CreateContactSubmissions1760000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "phone" varchar,
        "email" varchar,
        "title" varchar NOT NULL,
        "type" varchar NOT NULL,
        "message" varchar NOT NULL,
        "acceptedPrivacyAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_contact_submissions_phone"
      ON "contact_submissions" ("phone")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_contact_submissions_email"
      ON "contact_submissions" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_contact_submissions_createdAt"
      ON "contact_submissions" ("createdAt")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_submissions"`);
  }
}
