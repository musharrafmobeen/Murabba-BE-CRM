import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { LanguageChrome } from './language.types.js';

@Entity('language_pages')
export class LanguagePage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  en: LanguageChrome;

  @Column({ type: 'jsonb' })
  ar: LanguageChrome;

  @Column({ default: 'en' })
  fallbackCode: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
