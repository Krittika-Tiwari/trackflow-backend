import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialAccount } from '../social-accounts/entities/social-account.entity';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';

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
}
