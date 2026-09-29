import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('contact_submissions')
export class ContactSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column()
  title: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column()
  message: string;

  @Column({ type: 'timestamptz' })
  acceptedPrivacyAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
