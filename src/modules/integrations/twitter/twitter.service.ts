/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/modules/posts/entities/post.entity';
import { SocialAccount } from 'src/modules/social-accounts/entities/social-account.entity';
import { TwitterApi } from 'twitter-api-v2';
import { Repository } from 'typeorm';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  private async getTwitterClient(socialAccountId: string): Promise<TwitterApi> {
    const account = await this.socialAccountRepository.findOne({
      where: { id: socialAccountId },
    });

    if (!account) {
      throw new BadRequestException(
        'Twitter account not found or not connected',
      );
    }
    return new TwitterApi(account.accessToken);
  }

  async fetchRecentTweets(socialAccountId: string, maxResults: number = 10) {
    try {
      this.logger.log(`Fetching recent tweets for account: ${socialAccountId}`);

      const client = await this.getTwitterClient(socialAccountId);

      const account = await this.socialAccountRepository.findOne({
        where: { id: socialAccountId },
      });

      if (!account) {
        throw new BadRequestException('Account not found');
      }

      const tweets = await client.v2.userTimeline(account.accountId, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'public_metrics', 'entities'],
        'media.fields': ['url', 'preview_image_url'],
        expansions: ['attachments.media_keys'],
      });

      this.logger.log(`Fetched ${tweets.data.data?.length || 0} tweets`);

      for (const tweet of tweets.data.data || []) {
        await this.saveTweet(socialAccountId, tweet);
      }

      return tweets.data.data;
    } catch (error) {
      this.logger.error(`Error fetching tweets: ${error.message}`);
      throw error;
    }
  }

  private async saveTweet(socialAccountId: string, tweetData: any) {
    try {
      // Check if tweet already exists
      const existing = await this.postRepository.findOne({
        where: {
          socialAccountId,
          postId: tweetData.id,
        },
      });

      if (existing) {
        // Update existing tweet with new metrics
        existing.likesCount = tweetData.public_metrics?.like_count || 0;
        existing.commentsCount = tweetData.public_metrics?.reply_count || 0;
        existing.sharesCount = tweetData.public_metrics?.retweet_count || 0;
        existing.viewsCount = tweetData.public_metrics?.impression_count || 0;
        existing.engagementRate = this.calculateEngagementRate(
          tweetData.public_metrics,
        );

        await this.postRepository.save(existing);
        return existing;
      }

      // Create new post record
      const post = this.postRepository.create({
        socialAccountId,
        postId: tweetData.id,
        content: tweetData.text,
        postType: this.getPostType(tweetData),
        postUrl: `https://twitter.com/i/web/status/${tweetData.id}`,
        likesCount: tweetData.public_metrics?.like_count || 0,
        commentsCount: tweetData.public_metrics?.reply_count || 0,
        sharesCount: tweetData.public_metrics?.retweet_count || 0,
        viewsCount: tweetData.public_metrics?.impression_count || 0,
        publishedAt: new Date(tweetData.created_at),
        engagementRate: this.calculateEngagementRate(tweetData.public_metrics),
      });

      return await this.postRepository.save(post);
    } catch (error) {
      this.logger.error(`Error saving tweet: ${error.message}`);
    }
  }

  // ==========================================
  // EXPLANATION: Calculate engagement rate
  // Engagement Rate = (Likes + Comments + Shares) / Impressions * 100
  // ==========================================
  private calculateEngagementRate(metrics: any): number {
    if (
      !metrics ||
      !metrics.impression_count ||
      metrics.impression_count === 0
    ) {
      return 0;
    }

    const totalEngagement =
      (metrics.like_count || 0) +
      (metrics.reply_count || 0) +
      (metrics.retweet_count || 0);

    return parseFloat(
      ((totalEngagement / metrics.impression_count) * 100).toFixed(2),
    );
  }

  private getPostType(tweetData: any): string {
    if (
      tweetData.entities?.urls?.some((url: any) =>
        url.expanded_url?.includes('video'),
      )
    ) {
      return 'video';
    }
    if (tweetData.attachments?.media_keys?.length > 0) {
      return 'image';
    }
    return 'text';
  }

  async getUserProfile(socialAccountId: string) {
    try {
      const client = await this.getTwitterClient(socialAccountId);

      const account = await this.socialAccountRepository.findOne({
        where: { id: socialAccountId },
      });

      if (!account) {
        throw new BadRequestException('Account not found');
      }
      // Fetch user info from Twitter
      const user = await client.v2.user(account.accountId, {
        'user.fields': ['public_metrics', 'profile_image_url', 'description'],
      });

      // Update our database with latest info
      account.followerCount = user.data.public_metrics?.followers_count || 0;
      account.followingCount = user.data.public_metrics?.following_count || 0;
      account.profilePictureUrl = user.data.profile_image_url || null;

      await this.socialAccountRepository.save(account);

      return user.data;
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${error.message}`);
      throw error;
    }
  }

  // ==========================================
  // EXPLANATION: Post a new tweet
  // ==========================================
  async postTweet(socialAccountId: string, text: string) {
    try {
      this.logger.log(`Posting tweet for account: ${socialAccountId}`);

      const client = await this.getTwitterClient(socialAccountId);

      // Post tweet to Twitter
      const tweet = await client.v2.tweet(text);

      this.logger.log(`Tweet posted successfully: ${tweet.data.id}`);

      // Save to our database
      await this.saveTweet(socialAccountId, {
        id: tweet.data.id,
        text: tweet.data.text,
        created_at: new Date().toISOString(),
        public_metrics: {
          like_count: 0,
          reply_count: 0,
          retweet_count: 0,
          impression_count: 0,
        },
      });

      return tweet.data;
    } catch (error) {
      this.logger.error(`Error posting tweet: ${error.message}`);
      throw error;
    }
  }

  async syncAccount(socialAccountId: string) {
    try {
      this.logger.log(`Starting sync for account: ${socialAccountId}`);

      // Fetch latest tweets
      await this.fetchRecentTweets(socialAccountId, 20);

      // Update profile info
      await this.getUserProfile(socialAccountId);

      this.logger.log(`Sync completed for account: ${socialAccountId}`);

      return { success: true, message: 'Account synced successfully' };
    } catch (error) {
      this.logger.error(`Sync failed: ${error.message}`);
      throw error;
    }
  }
}
