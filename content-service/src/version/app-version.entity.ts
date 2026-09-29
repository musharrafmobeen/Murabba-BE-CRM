import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { VersionLocale } from './version.types.js';

@Entity('app_versions')
export class AppVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: string;

  @Column()
  build: string;

  @Column({ default: 'production' })
  channel: string;

  @Column({ type: 'jsonb' })
  en: VersionLocale;

  @Column({ type: 'jsonb' })
  ar: VersionLocale;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
