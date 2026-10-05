import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountRecovery1760000005000 implements MigrationInterface {
  name = 'AddAccountRecovery1760000005000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recovery_otp_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "phone" varchar NOT NULL,
        "codeHash" varchar NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "attemptCount" int NOT NULL DEFAULT 0,
        "resendCount" int NOT NULL DEFAULT 0,
        "lastSentAt" TIMESTAMPTZ NOT NULL,
        "lockedUntil" TIMESTAMPTZ,
        "verifiedAt" TIMESTAMPTZ,
        "consumedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_recovery_otp_sessions_phone"
       ON "recovery_otp_sessions" ("phone")`,
    );

    await queryRunner.query(`
      INSERT INTO "contact_types" ("code", "sortOrder", "labelEn", "labelAr")
      VALUES ('ACCOUNT_RECOVERY', 5, 'Account Recovery', 'استرجاع الحساب')
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "contact_types" WHERE "code" = 'ACCOUNT_RECOVERY'`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "recovery_otp_sessions"`);
  }
}
