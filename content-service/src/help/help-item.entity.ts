import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('help_items')
export class HelpItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column()
  questionEn: string;

  @Column({ type: 'text' })
  answerEn: string;

  @Column()
  questionAr: string;

  @Column({ type: 'text' })
  answerAr: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
