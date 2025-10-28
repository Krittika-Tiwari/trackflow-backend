import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SocialAccount } from '../../social-accounts/entities/social-account.entity';

export enum ScheduledPostStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('scheduled_posts')
export class ScheduledPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'social_account_id', type: 'uuid' })
  socialAccountId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'media_urls', type: 'text', array: true, nullable: true })
  mediaUrls: string[];

  @Column({ name: 'scheduled_for', type: 'timestamp' })
  @Index()
  scheduledFor: Date;

  @Column({
    type: 'enum',
    enum: ScheduledPostStatus,
    default: ScheduledPostStatus.PENDING,
  })
  status: ScheduledPostStatus;

  @Column({ name: 'published_post_id', length: 255, nullable: true })
  publishedPostId: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => SocialAccount,
    (socialAccount) => socialAccount.scheduledPosts,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'social_account_id' })
  socialAccount: SocialAccount;
}
