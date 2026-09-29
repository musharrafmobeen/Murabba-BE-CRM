import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type OtpPurpose = 'signup' | 'login';

@Entity('otp_sessions')
export class OtpSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  purpose: OtpPurpose;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column()
  codeHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: 0 })
  attemptCount: number;

  @Column({ default: 0 })
  resendCount: number;

  @Column({ type: 'timestamptz' })
  lastSentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
