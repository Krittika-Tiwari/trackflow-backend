import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import {
  SocialAccount,
  Platform,
} from '../../modules/social-accounts/entities/social-account.entity';
import { Post, PostType } from '../../modules/posts/entities/post.entity';
import { AnalyticsSnapshot } from '../../modules/analytics/entities/analytics-snapshot.entity';

// EXPLANATION: Generate random number between min and max
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// EXPLANATION: Generate random date in the last N days
function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, daysAgo));
  return date;
}

// EXPLANATION: Calculate engagement rate
function calculateEngagement(
  likes: number,
  comments: number,
  shares: number,
  views: number,
): number {
  if (views === 0) return 0;
  return parseFloat((((likes + comments + shares) / views) * 100).toFixed(2));
}

// EXPLANATION: Sample post content (realistic tweets/posts)
const samplePosts = [
  'Just launched our new feature! Check it out 🚀',
  "Great meeting with the team today. Excited about what's coming!",
  'Tips for better productivity: 1) Focus time 2) Break tasks 3) Stay hydrated',
  'Beautiful sunset today 🌅',
  'Coffee and code - perfect combination ☕💻',
  "Reflecting on this week's achievements. Progress!",
  'New blog post: 10 ways to improve your workflow',
  'Grateful for this amazing community 🙏',
  'Weekend vibes! Time to recharge',
  'Just finished reading an incredible book. Highly recommend!',
  'Pro tip: Always backup your work!',
  'Excited to announce our latest project!',
  'Behind the scenes of our creative process',
  'Thank you for 1000 followers! 🎉',
  'Monday motivation: Start small, think big',
  'Working on something special... Stay tuned!',
  'Best practices for remote work',
  'Celebrating small wins today',
  'Innovation happens when we collaborate',
  'Friday feeling! What are your weekend plans?',
];

// EXPLANATION: Main seed function
export async function seedData(dataSource: DataSource) {
  console.log('🌱 Starting data seeding...\n');

  // Get repositories
  const userRepository = dataSource.getRepository(User);
  const socialAccountRepository = dataSource.getRepository(SocialAccount);
  const postRepository = dataSource.getRepository(Post);
  const snapshotRepository = dataSource.getRepository(AnalyticsSnapshot);

  // ==========================================
  // STEP 1: Create test user
  // ==========================================
  console.log('📝 Creating test user...');

  let testUser = await userRepository.findOne({
    where: { email: 'demo@trackflow.com' },
  });

  if (!testUser) {
    const hashedPassword = await bcrypt.hash('Demo1234!', 10);
    testUser = userRepository.create({
      email: 'demo@trackflow.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      isEmailVerified: true,
    });
    testUser = await userRepository.save(testUser);
    console.log('✅ Test user created: demo@trackflow.com / Demo1234!');
  } else {
    console.log('✅ Test user already exists');
  }

  // ==========================================
  // STEP 2: Create social accounts
  // ==========================================
  console.log('\n🔗 Creating social accounts...');

  const accountsData = [
    {
      platform: Platform.TWITTER,
      accountId: 'twitter_123456',
      accountName: 'Demo User',
      accountUsername: '@demouser',
      followerCount: 3500,
      followingCount: 250,
      accessToken: 'fake_twitter_token_for_demo',
    },
    {
      platform: Platform.INSTAGRAM,
      accountId: 'instagram_789012',
      accountName: 'Demo User',
      accountUsername: '@demouser_ig',
      followerCount: 1200,
      followingCount: 180,
      accessToken: 'fake_instagram_token_for_demo',
    },
    {
      platform: Platform.LINKEDIN,
      accountId: 'linkedin_345678',
      accountName: 'Demo User',
      accountUsername: 'demo-user',
      followerCount: 530,
      followingCount: 420,
      accessToken: 'fake_linkedin_token_for_demo',
    },
  ];

  const createdAccounts: SocialAccount[] = [];

  for (const accountData of accountsData) {
    let account = await socialAccountRepository.findOne({
      where: {
        userId: testUser.id,
        platform: accountData.platform,
      },
    });

    if (!account) {
      account = socialAccountRepository.create({
        userId: testUser.id,
        ...accountData,
        isActive: true,
      });
      account = await socialAccountRepository.save(account);
      console.log(`✅ Created ${accountData.platform} account`);
    } else {
      console.log(`✅ ${accountData.platform} account already exists`);
    }

    createdAccounts.push(account);
  }

  // ==========================================
  // STEP 3: Create posts for each account
  // ==========================================
  console.log('\n📄 Creating posts...');

  const postTypes = [PostType.TEXT, PostType.IMAGE, PostType.VIDEO];
  let totalPostsCreated = 0;

  for (const account of createdAccounts) {
    // Create 15-20 posts per account
    const numPosts = randomBetween(15, 20);

    for (let i = 0; i < numPosts; i++) {
      const views = randomBetween(1000, 10000);
      const likes = randomBetween(50, Math.floor(views * 0.15));
      const comments = randomBetween(5, Math.floor(likes * 0.2));
      const shares = randomBetween(2, Math.floor(likes * 0.1));
      const engagement = calculateEngagement(likes, comments, shares, views);

      // Check if post already exists (avoid duplicates)
      const postId = `${account.platform}_post_${i}_${Date.now()}`;
      const existingPost = await postRepository.findOne({
        where: { postId },
      });

      if (!existingPost) {
        const post = postRepository.create({
          socialAccountId: account.id,
          postId,
          content: samplePosts[randomBetween(0, samplePosts.length - 1)],
          postType: postTypes[randomBetween(0, postTypes.length - 1)],
          postUrl: `https://${account.platform}.com/post/${postId}`,
          likesCount: likes,
          commentsCount: comments,
          sharesCount: shares,
          viewsCount: views,
          engagementRate: engagement,
          publishedAt: randomDate(30), // Random date in last 30 days
          fetchedAt: new Date(),
        });

        await postRepository.save(post);
        totalPostsCreated++;
      }
    }

    console.log(`✅ Created posts for ${account.platform}`);
  }

  console.log(`✅ Total posts created: ${totalPostsCreated}`);

  // ==========================================
  // STEP 4: Create daily snapshots (last 30 days)
  // ==========================================
  console.log('\n📊 Creating daily snapshots...');

  for (const account of createdAccounts) {
    // Create snapshots for last 30 days
    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const snapshotDate = new Date();
      snapshotDate.setDate(snapshotDate.getDate() - daysAgo);
      snapshotDate.setHours(0, 0, 0, 0);

      // Check if snapshot exists
      const existing = await snapshotRepository.findOne({
        where: {
          socialAccountId: account.id,
          snapshotDate,
        },
      });

      if (!existing) {
        // Simulate follower growth over time
        const baseFollowers =
          account.followerCount - (29 - daysAgo) * randomBetween(5, 15);

        // Get posts count for that day
        const postsUpToDate = await postRepository.count({
          where: {
            socialAccountId: account.id,
          },
        });

        // Create snapshot
        const snapshot = snapshotRepository.create({
          socialAccountId: account.id,
          snapshotDate,
          followersCount: Math.max(baseFollowers, 100), // At least 100
          followingCount: account.followingCount,
          postsCount: Math.max(postsUpToDate - randomBetween(0, 5), 0),
          totalLikes: randomBetween(500, 2000),
          totalComments: randomBetween(50, 300),
          totalShares: randomBetween(20, 150),
          totalViews: randomBetween(5000, 20000),
          avgEngagementRate: parseFloat(
            (randomBetween(25, 55) / 10).toFixed(2),
          ),
        });

        await snapshotRepository.save(snapshot);
      }
    }

    console.log(`✅ Created snapshots for ${account.platform}`);
  }

  console.log('\n✅ Data seeding completed!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Test User: demo@trackflow.com`);
  console.log(`🔑 Password: Demo1234!`);
  console.log(`🔗 Social Accounts: ${createdAccounts.length}`);
  console.log(`📄 Posts Created: ${totalPostsCreated}`);
  console.log(`📊 Daily Snapshots: ${createdAccounts.length * 30}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🚀 You can now:');
  console.log('   1. Login with demo@trackflow.com / Demo1234!');
  console.log('   2. View analytics dashboard');
  console.log('   3. See charts and graphs');
  console.log('   4. Test all endpoints\n');
}
