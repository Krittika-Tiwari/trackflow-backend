/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialAccount } from '../social-accounts/entities/social-account.entity';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { In, Between } from 'typeorm';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepository: Repository<AnalyticsSnapshot>,
  ) {}

  async getDashboard(userId: string, query?: AnalyticsQueryDto) {
    this.logger.log(`Generating dashboard for user: ${userId}`);

    const { startDate, endDate } = this.getDateRange(query);

    const [
      accounts,
      totalFollowers,
      followerGrowth,
      posts,
      avgEngagement,
      topPosts,
    ] = await Promise.all([
      this.getUserAccounts(userId),
      this.getTotalFollowers(userId),
      this.getFollowerGrowth(userId, startDate, endDate),
      this.getPostsCount(userId, startDate, endDate),
      this.getAverageEngagement(userId, startDate, endDate),
      this.getTopPosts(userId, 5),
    ]);

    // Calculate platform breakdown
    const platformBreakdown = await this.getPlatformBreakdown(userId);

    return {
      overview: {
        totalFollowers,
        followerGrowth,
        totalPosts: posts,
        avgEngagement,
        connectedAccounts: accounts.length,
      },
      topPosts,
      platformBreakdown,
      dateRange: { startDate, endDate },
    };
  }


  async getFollowerGrowth(userId: string, startDate: Date, endDate: Date) {
    // Get daily snapshots from database
    const snapshots = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .leftJoin('snapshot.socialAccount', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('snapshot.snapshotDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('snapshot.snapshotDate', 'ASC')
      .getMany();

    // Group by date and sum followers
    const growthData: { [key: string]: number } = {};

    snapshots.forEach((snapshot) => {
      // Fix: Handle snapshotDate as both string and Date
      const dateStr =
        snapshot.snapshotDate instanceof Date
          ? snapshot.snapshotDate.toISOString().split('T')[0]
          : new Date(snapshot.snapshotDate).toISOString().split('T')[0];

      if (!growthData[dateStr]) {
        growthData[dateStr] = 0;
      }
      growthData[dateStr] += snapshot.followersCount || 0;
    });

    // Convert to array format for charts
    return Object.entries(growthData).map(([date, followers]) => ({
      date,
      followers,
    }));
  }

  async getTopPosts(userId: string, limit: number = 10) {
    const accounts = await this.getUserAccounts(userId);
    const accountIds = accounts.map((acc) => acc.id);

    if (accountIds.length === 0) {
      return [];
    }

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.socialAccountId IN (:...accountIds)', { accountIds })
      .orderBy('post.engagementRate', 'DESC')
      .take(limit)
      .getMany();

    return posts.map((post) => ({
      id: post.id,
      content: post.content?.substring(0, 100) + '...' || '',
      platform: post.socialAccount?.platform || 'unknown',
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      sharesCount: post.sharesCount,
      engagementRate: post.engagementRate,
      publishedAt: post.publishedAt,
    }));
  }

  async getPlatformBreakdown(userId: string) {
    const accounts = await this.getUserAccounts(userId);

    const breakdown: any = {};

    for (const account of accounts) {
      const platform = account.platform;

      if (!breakdown[platform]) {
        breakdown[platform] = {
          platform,
          followers: 0,
          posts: 0,
          avgEngagement: 0,
          totalLikes: 0,
        };
      }

      breakdown[platform].followers += account.followerCount || 0;

      const posts = await this.postRepository.find({
        where: { socialAccountId: account.id },
      });

      breakdown[platform].posts += posts.length;

      const totalEngagement = posts.reduce(
        (sum, post) => sum + (post.engagementRate || 0),
        0,
      );
      breakdown[platform].avgEngagement =
        posts.length > 0
          ? parseFloat((totalEngagement / posts.length).toFixed(2))
          : 0;

      breakdown[platform].totalLikes += posts.reduce(
        (sum, post) => sum + (post.likesCount || 0),
        0,
      );
    }

    return Object.values(breakdown);
  }

  async createDailySnapshot(socialAccountId: string) {
    this.logger.log(`Creating daily snapshot for account: ${socialAccountId}`);

    const account = await this.socialAccountRepository.findOne({
      where: { id: socialAccountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.snapshotRepository.findOne({
      where: {
        socialAccountId,
        snapshotDate: today,
      },
    });

    if (existing) {
      this.logger.log('Snapshot already exists for today');
      return existing;
    }

    const posts = await this.postRepository.find({
      where: { socialAccountId },
    });

    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
    const totalComments = posts.reduce(
      (sum, post) => sum + post.commentsCount,
      0,
    );
    const totalShares = posts.reduce((sum, post) => sum + post.sharesCount, 0);
    const totalViews = posts.reduce((sum, post) => sum + post.viewsCount, 0);
    const avgEngagement =
      posts.length > 0
        ? posts.reduce((sum, post) => sum + post.engagementRate, 0) /
          posts.length
        : 0;

    const snapshot = this.snapshotRepository.create({
      socialAccountId,
      snapshotDate: today,
      followersCount: account.followerCount,
      followingCount: account.followingCount,
      postsCount: posts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalViews,
      avgEngagementRate: parseFloat(avgEngagement.toFixed(2)),
    });

    return await this.snapshotRepository.save(snapshot);
  }

  private async getUserAccounts(userId: string): Promise<SocialAccount[]> {
    return await this.socialAccountRepository.find({
      where: { userId, isActive: true },
    });
  }

  private async getTotalFollowers(userId: string): Promise<number> {
    const accounts = await this.getUserAccounts(userId);
    return accounts.reduce((sum, acc) => sum + (acc.followerCount || 0), 0);
  }

  private async getPostsCount(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const accounts = await this.getUserAccounts(userId);
    const accountIds = accounts.map((acc) => acc.id);

    if (accountIds.length === 0) return 0;

    return await this.postRepository.count({
      where: {
        socialAccountId: In(accountIds),
        publishedAt: Between(startDate, endDate),
      },
    });
  }

  private async getAverageEngagement(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const accounts = await this.getUserAccounts(userId);
    const accountIds = accounts.map((acc) => acc.id);

    if (accountIds.length === 0) return 0;

    const posts = await this.postRepository.find({
      where: {
        socialAccountId: In(accountIds),
        publishedAt: Between(startDate, endDate),
      },
    });

    if (posts.length === 0) return 0;

    const totalEngagement = posts.reduce(
      (sum, post) => sum + (post.engagementRate || 0),
      0,
    );

    return parseFloat((totalEngagement / posts.length).toFixed(2));
  }

  private getDateRange(query?: AnalyticsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = query?.endDate ? new Date(query.endDate) : new Date();
    let startDate: Date;

    if (query?.startDate) {
      startDate = new Date(query.startDate);
    } else if (query?.period) {
      startDate = new Date();
      switch (query.period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'month':
          startDate.setDate(1);
          break;
        case 'year':
          startDate.setMonth(0, 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }
}
