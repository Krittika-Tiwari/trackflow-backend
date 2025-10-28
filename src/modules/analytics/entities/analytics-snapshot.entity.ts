import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SocialAccount } from '../../social-accounts/entities/social-account.entity';

@Entity('analytics_snapshots')
@Index(['socialAccountId', 'snapshotDate'], { unique: true })
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'social_account_id', type: 'uuid' })
  socialAccountId: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  @Index()
  snapshotDate: Date;

  @Column({ name: 'followers_count', type: 'integer', nullable: true })
  followersCount: number;

  @Column({ name: 'following_count', type: 'integer', nullable: true })
  followingCount: number;

  @Column({ name: 'posts_count', type: 'integer', nullable: true })
  postsCount: number;

  @Column({ name: 'total_likes', type: 'integer', nullable: true })
  totalLikes: number;

  @Column({ name: 'total_comments', type: 'integer', nullable: true })
  totalComments: number;

  @Column({ name: 'total_shares', type: 'integer', nullable: true })
  totalShares: number;

  @Column({ name: 'total_views', type: 'integer', nullable: true })
  totalViews: number;

  @Column({
    name: 'avg_engagement_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  avgEngagementRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(
    () => SocialAccount,
    (socialAccount) => socialAccount.analyticsSnapshots,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'social_account_id' })
  socialAccount: SocialAccount;
}
