import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { SocialAccount } from '../modules/social-accounts/entities/social-account.entity';
import { Post } from '../modules/posts/entities/post.entity';

import { AnalyticsSnapshot } from '../modules/analytics/entities/analytics-snapshot.entity';
import { ScheduledPost } from 'src/modules/scheduler/entities/scheduler.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'trackflow',
    entities: [User, SocialAccount, Post, ScheduledPost, AnalyticsSnapshot],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
    retryAttempts: 3,
    retryDelay: 3000,
  }),
);
