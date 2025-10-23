import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { PostsModule } from './modules/posts/posts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { TwitterModule } from './modules/integrations/twitter/twitter.module';
import { InstagramModule } from './modules/integrations/instagram/instagram.module';
import { LinkedinModule } from './modules/integrations/linkedin/linkedin.module';
import { FacebookModule } from './modules/integrations/facebook/facebook.module';

@Module({
  imports: [UsersModule, AuthModule, SocialAccountsModule, PostsModule, AnalyticsModule, SchedulerModule, TwitterModule, InstagramModule, LinkedinModule, FacebookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
