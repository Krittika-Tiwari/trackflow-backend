import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';

import { User } from './modules/users/entities/user.entity';
import { SocialAccount } from './modules/social-accounts/entities/social-account.entity';
import { Post } from './modules/posts/entities/post.entity';

import { AnalyticsSnapshot } from './modules/analytics/entities/analytics-snapshot.entity';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ScheduledPost } from './modules/scheduler/entities/scheduler.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'trackflow',
      entities: [User, SocialAccount, Post, ScheduledPost, AnalyticsSnapshot],
      synchronize: process.env.NODE_ENV === 'development',
      logging: true,
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
