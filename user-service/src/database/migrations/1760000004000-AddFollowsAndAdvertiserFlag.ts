import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowsAndAdvertiserFlag1760000004000 implements MigrationInterface {
  name = 'AddFollowsAndAdvertiserFlag1760000004000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isAdvertiser" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "follows" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "followerId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "followingId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_follows_pair" UNIQUE ("followerId", "followingId")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_follows_followerId" ON "follows" ("followerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_follows_followingId" ON "follows" ("followingId")`,
    );

    await queryRunner.query(`
      DELETE FROM "follows" f
      USING "users" u
      WHERE f."followingId" = u."id" AND u."isAdvertiser" = false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "follows"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "isAdvertiser"`,
    );
  }
}
