/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { SocialAccount } from '../social-accounts/entities/social-account.entity';
import { UpdatePostDto } from './dto/update-post.dto';

export interface FetchPostsQuery {
  socialAccountId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  platform?: string;
}

export interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(SocialAccount)
    private readonly socialAccountRepository: Repository<SocialAccount>,
  ) {}

  /**
   * Get all posts with filters and pagination
   */
  async findAll(
    userId: string,
    query: FetchPostsQuery,
  ): Promise<PostsResponse> {
    const {
      socialAccountId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      platform,
    } = query;

    this.logger.log(`Fetching posts for user: ${userId}`);

    // Get user's social account IDs
    const userAccountIds = await this.getUserSocialAccountIds(userId, platform);

    if (userAccountIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Build where clause
    const where: any = {};

    if (socialAccountId) {
      // Verify this account belongs to user
      if (!userAccountIds.includes(socialAccountId)) {
        throw new NotFoundException('Social account not found');
      }
      where.socialAccountId = socialAccountId;
    } else {
      where.socialAccountId = In(userAccountIds);
    }

    // Date range filter
    if (startDate && endDate) {
      where.publishedAt = Between(startDate, endDate);
    }

    // Get total count
    const total = await this.postRepository.count({ where });

    // Get paginated posts
    const posts = await this.postRepository.find({
      where,
      relations: ['socialAccount'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    this.logger.log(`Found ${posts.length} posts`);

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single post by ID
   */
  async findOne(id: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['socialAccount'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Verify post belongs to user
    if (post.socialAccount.userId !== userId) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   * Get top performing posts
   */
  async getTopPosts(
    userId: string,
    limit: number = 10,
    socialAccountId?: string,
  ): Promise<Post[]> {
    const userAccountIds = await this.getUserSocialAccountIds(userId);

    if (userAccountIds.length === 0) {
      return [];
    }

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.socialAccount', 'socialAccount')
      .where('post.socialAccountId IN (:...accountIds)', {
        accountIds: userAccountIds,
      })
      .orderBy('post.engagementRate', 'DESC')
      .limit(limit);

    if (socialAccountId) {
      query.andWhere('post.socialAccountId = :socialAccountId', {
        socialAccountId,
      });
    }

    return query.getMany();
  }

  /**
   * Get post analytics summary
   */
  async getPostAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    this.logger.log(`Getting post analytics for user: ${userId}`);

    const userAccountIds = await this.getUserSocialAccountIds(userId);

    if (userAccountIds.length === 0) {
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgEngagementRate: 0,
      };
    }

    const query = this.postRepository
      .createQueryBuilder('post')
      .select('COUNT(post.id)', 'totalPosts')
      .addSelect('COALESCE(SUM(post.likesCount), 0)', 'totalLikes')
      .addSelect('COALESCE(SUM(post.commentsCount), 0)', 'totalComments')
      .addSelect('COALESCE(SUM(post.sharesCount), 0)', 'totalShares')
      .addSelect('COALESCE(SUM(post.viewsCount), 0)', 'totalViews')
      .addSelect('COALESCE(AVG(post.engagementRate), 0)', 'avgEngagementRate')
      .where('post.socialAccountId IN (:...accountIds)', {
        accountIds: userAccountIds,
      });

    if (startDate && endDate) {
      query.andWhere('post.publishedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await query.getRawOne();

    return {
      totalPosts: parseInt(result.totalPosts) || 0,
      totalLikes: parseInt(result.totalLikes) || 0,
      totalComments: parseInt(result.totalComments) || 0,
      totalShares: parseInt(result.totalShares) || 0,
      totalViews: parseInt(result.totalViews) || 0,
      avgEngagementRate: parseFloat(result.avgEngagementRate).toFixed(2),
    };
  }

  /**
   * Get posts by platform
   */
  async getPostsByPlatform(userId: string, platform: string): Promise<Post[]> {
    const accounts = await this.socialAccountRepository.find({
      where: { userId, platform, isActive: true },
      select: ['id'],
    });

    if (accounts.length === 0) {
      return [];
    }

    const accountIds = accounts.map((acc) => acc.id);

    return this.postRepository.find({
      where: { socialAccountId: In(accountIds) },
      relations: ['socialAccount'],
      order: { publishedAt: 'DESC' },
    });
  }

  /**
   * Update post metrics manually (if needed)
   */
  async updateMetrics(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.findOne(id, userId);

    // Recalculate engagement rate if metrics updated
    if (
      updatePostDto.likesCount !== undefined ||
      updatePostDto.commentsCount !== undefined ||
      updatePostDto.sharesCount !== undefined
    ) {
      const totalEngagement =
        (updatePostDto.likesCount ?? post.likesCount) +
        (updatePostDto.commentsCount ?? post.commentsCount) +
        (updatePostDto.sharesCount ?? post.sharesCount);

      const followerCount = post.socialAccount.followerCount || 1;
      updatePostDto.engagementRate = this.calculateEngagementRate(
        totalEngagement,
        followerCount,
      );
    }

    await this.postRepository.update(id, updatePostDto);

    return this.findOne(id, userId);
  }

  /**
   * Delete a post from database (not from social media)
   */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id, userId);
    await this.postRepository.remove(post);
    this.logger.log(`Post ${id} deleted`);
  }

  /**
   * Helper: Calculate engagement rate
   */
  private calculateEngagementRate(
    totalEngagements: number,
    followerCount: number,
  ): number {
    if (followerCount === 0) return 0;
    return parseFloat(((totalEngagements / followerCount) * 100).toFixed(2));
  }

  /**
   * Helper: Get user's social account IDs
   */
  private async getUserSocialAccountIds(
    userId: string,
    platform?: string,
  ): Promise<string[]> {
    const where: any = { userId, isActive: true };
    if (platform) {
      where.platform = platform;
    }

    const accounts = await this.socialAccountRepository.find({
      where,
      select: ['id'],
    });

    return accounts.map((acc) => acc.id);
  }
}
