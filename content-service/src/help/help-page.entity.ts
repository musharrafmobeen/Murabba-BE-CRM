import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type HelpChrome = {
  menuLabel: string;
  title: string;
  intro: string;
  emptyFallback: string;
  contactCta: string;
};

@Entity('help_pages')
export class HelpPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  en: HelpChrome;

  @Column({ type: 'jsonb' })
  ar: HelpChrome;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
