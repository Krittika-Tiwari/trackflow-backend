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

export enum PostType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  TEXT = 'text',
}

@Entity('posts')
@Index(['socialAccountId', 'postId'], { unique: true })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'social_account_id', type: 'uuid' })
  @Index()
  socialAccountId: string;

  @Column({ name: 'post_id', length: 255 })
  postId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'media_urls', type: 'text', array: true, nullable: true })
  mediaUrls: string[];

  @Column({
    name: 'post_type',
    type: 'enum',
    enum: PostType,
    nullable: true,
  })
  postType: PostType;

  @Column({ name: 'post_url', length: 500, nullable: true })
  postUrl: string;

  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'integer', default: 0 })
  commentsCount: number;

  @Column({ name: 'shares_count', type: 'integer', default: 0 })
  sharesCount: number;

  @Column({ name: 'views_count', type: 'integer', default: 0 })
  viewsCount: number;

  @Column({
    name: 'engagement_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  engagementRate: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  @Index()
  publishedAt: Date;

  @Column({
    name: 'fetched_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fetchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SocialAccount, (socialAccount) => socialAccount.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'social_account_id' })
  socialAccount: SocialAccount;
}
