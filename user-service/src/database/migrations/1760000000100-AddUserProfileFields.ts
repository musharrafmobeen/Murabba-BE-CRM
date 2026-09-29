import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1760000000100 implements MigrationInterface {
  name = 'AddUserProfileFields1760000000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "displayName" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "photoPath" varchar`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "photoPath"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "bio"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "city"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "displayName"`,
    );
  }
}
