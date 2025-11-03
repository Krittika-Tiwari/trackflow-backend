import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { SocialAccount } from 'src/modules/social-accounts/entities/social-account.entity';
import { Post } from 'src/modules/posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount, Post])],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
