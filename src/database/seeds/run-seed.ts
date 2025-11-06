import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { SocialAccount } from '../../modules/social-accounts/entities/social-account.entity';
import { Post } from '../../modules/posts/entities/post.entity';
import { AnalyticsSnapshot } from '../../modules/analytics/entities/analytics-snapshot.entity';

import { seedData } from './seed-data';
import { ScheduledPost } from 'src/modules/scheduler/entities/scheduler.entity';

// EXPLANATION: This creates database connection and runs seed
async function runSeed() {
  console.log('🚀 Starting seed process...\n');

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'trackflow',
    entities: [User, SocialAccount, Post, ScheduledPost, AnalyticsSnapshot],
    synchronize: false, // Don't auto-create tables
    logging: false,
  });

  try {
    // Connect to database
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Run seed
    await seedData(dataSource);

    console.log('✅ Seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close connection
    await dataSource.destroy();
  }
}

// Run the seed
runSeed();
