import type { MigrationInterface, QueryRunner } from 'typeorm';

const PAGE_EN = { menuLabel: 'Language', title: 'Choose language' };
const PAGE_AR = { menuLabel: 'اللغة', title: 'اختر اللغة' };

export class CreateLanguages1760000003000 implements MigrationInterface {
  name = 'CreateLanguages1760000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "language_pages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "en" jsonb NOT NULL,
        "ar" jsonb NOT NULL,
        "fallbackCode" varchar NOT NULL DEFAULT 'en',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_languages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL UNIQUE,
        "nameEn" varchar NOT NULL,
        "nameAr" varchar NOT NULL,
        "nativeName" varchar NOT NULL,
        "flag" varchar NOT NULL,
        "direction" varchar NOT NULL,
        "sortOrder" int NOT NULL DEFAULT 0,
        "isEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `INSERT INTO "language_pages" ("en", "ar", "fallbackCode", "isActive")
       VALUES ($1::jsonb, $2::jsonb, 'en', true)`,
      [JSON.stringify(PAGE_EN), JSON.stringify(PAGE_AR)],
    );

    await queryRunner.query(`
      INSERT INTO "app_languages"
        ("code", "nameEn", "nameAr", "nativeName", "flag", "direction", "sortOrder", "isEnabled")
      VALUES
        ('ar', 'Arabic', 'العربية', 'العربية', '🇸🇦', 'rtl', 0, true),
        ('en', 'English', 'الإنجليزية', 'English', '🇺🇸', 'ltr', 1, true)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_languages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "language_pages"`);
  }
}
