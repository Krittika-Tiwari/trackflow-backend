import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { ScheduledPost } from 'src/modules/scheduler/entities/scheduler.entity';
import { AnalyticsSnapshot } from 'src/modules/analytics/entities/analytics-snapshot.entity';

export enum Platform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
}

@Entity('social_accounts')
@Index(['userId', 'platform', 'accountId'], { unique: true })
export class SocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: Platform,
  })
  platform: Platform;

  @Column({ name: 'account_id', length: 255 })
  accountId: string;

  @Column({ name: 'account_name', length: 255, nullable: true })
  accountName: string;

  @Column({ name: 'account_username', length: 255, nullable: true })
  accountUsername: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @Column({ name: 'token_expires_at', type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ name: 'profile_picture_url', length: 500, nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'follower_count', type: 'integer', default: 0 })
  followerCount: number;

  @Column({ name: 'following_count', type: 'integer', default: 0 })
  followingCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.socialAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Post, (post) => post.socialAccount)
  posts: Post[];

  @OneToMany(
    () => ScheduledPost,
    (scheduledPost) => scheduledPost.socialAccount,
  )
  scheduledPosts: ScheduledPost[];

  @OneToMany(() => AnalyticsSnapshot, (snapshot) => snapshot.socialAccount)
  analyticsSnapshots: AnalyticsSnapshot[];
}
