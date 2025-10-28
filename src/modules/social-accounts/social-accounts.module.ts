import { Module } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccountsController } from './social-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from './entities/social-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount])],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService],
  exports: [SocialAccountsService, TypeOrmModule],
})
export class SocialAccountsModule {}
