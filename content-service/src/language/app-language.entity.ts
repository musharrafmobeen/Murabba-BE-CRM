import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TextDirection = 'ltr' | 'rtl';

@Entity('app_languages')
export class AppLanguage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column()
  nativeName: string;

  @Column()
  flag: string;

  @Column({ type: 'varchar' })
  direction: TextDirection;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isEnabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
