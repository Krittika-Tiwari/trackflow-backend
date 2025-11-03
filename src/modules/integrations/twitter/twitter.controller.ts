import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('integrations/twitter')
@UseGuards(JwtAuthGuard)
export class TwitterController {
  constructor(private twitterService: TwitterService) {}

  @Get(':accountId/tweets')
  async fetchTweets(@Param('accountId') accountId: string) {
    return this.twitterService.fetchRecentTweets(accountId);
  }

  @Get(':accountId/profile')
  async getProfile(@Param('accountId') accountId: string) {
    return this.twitterService.getUserProfile(accountId);
  }

  @Post(':accountId/tweet')
  async postTweet(
    @Param('accountId') accountId: string,
    @Body('text') text: string,
  ) {
    return this.twitterService.postTweet(accountId, text);
  }

  @Post(':accountId/sync')
  async syncAccount(@Param('accountId') accountId: string) {
    return this.twitterService.syncAccount(accountId);
  }
}
