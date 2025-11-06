/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Query, UseGuards, Post, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@GetUser() user: any, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboard(user.id, query);
  }

  @Get('growth')
  async getGrowth(@GetUser() user: any, @Query() query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);
    return this.analyticsService.getFollowerGrowth(user.id, startDate, endDate);
  }

  @Get('top-posts')
  async getTopPosts(
    @GetUser() user: any,
    @Query('limit') limit: string = '10',
  ) {
    return this.analyticsService.getTopPosts(user.id, parseInt(limit));
  }

  @Get('platforms')
  async getPlatforms(@GetUser() user: any) {
    return this.analyticsService.getPlatformBreakdown(user.id);
  }

  @Post('snapshot/:accountId')
  async createSnapshot(@Param('accountId') accountId: string) {
    return this.analyticsService.createDailySnapshot(accountId);
  }

  private getDateRange(query: AnalyticsQueryDto) {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    let startDate = query.startDate ? new Date(query.startDate) : new Date();

    if (!query.startDate) {
      startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }
}
