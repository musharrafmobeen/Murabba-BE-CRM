import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndOtpSessions1760000000000 implements MigrationInterface {
  name = 'CreateUsersAndOtpSessions1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" varchar NOT NULL UNIQUE,
        "phone" varchar NOT NULL UNIQUE,
        "tokenVersion" integer NOT NULL DEFAULT 0,
        "termsAcceptedAt" TIMESTAMPTZ,
        "lastLoginAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otp_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "purpose" varchar NOT NULL,
        "phone" varchar NOT NULL,
        "username" varchar,
        "codeHash" varchar NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "attemptCount" integer NOT NULL DEFAULT 0,
        "resendCount" integer NOT NULL DEFAULT 0,
        "lastSentAt" TIMESTAMPTZ NOT NULL,
        "lockedUntil" TIMESTAMPTZ,
        "consumedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_otp_sessions_phone"
      ON "otp_sessions" ("phone")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "otp_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
