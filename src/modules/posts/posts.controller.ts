import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update-post.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { FetchPostsQueryDto } from './dto/fetch-posts-query.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Get all posts with filters
   * GET /posts?socialAccountId=xxx&startDate=xxx&page=1&limit=20
   */
  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @Query() query: FetchPostsQueryDto,
  ) {
    const filters = {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return this.postsService.findAll(userId, filters);
  }

  /**
   * Get top performing posts
   * GET /posts/top?limit=10&socialAccountId=xxx
   */
  @Get('top')
  async getTopPosts(
    @GetUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('socialAccountId', new ParseUUIDPipe({ optional: true }))
    socialAccountId?: string,
  ) {
    return this.postsService.getTopPosts(userId, limit || 10, socialAccountId);
  }

  /**
   * Get posts analytics summary
   * GET /posts/analytics?startDate=xxx&endDate=xxx
   */
  @Get('analytics')
  async getAnalytics(
    @GetUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.postsService.getPostAnalytics(
      userId,
      filters.startDate,
      filters.endDate,
    );
  }

  /**
   * Get single post
   * GET /posts/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.findOne(id, userId);
  }

  /**
   * Update post metrics
   * PATCH /posts/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.updateMetrics(id, userId, updatePostDto);
  }

  /**
   * Delete post from database
   * DELETE /posts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    await this.postsService.remove(id, userId);
  }
}
