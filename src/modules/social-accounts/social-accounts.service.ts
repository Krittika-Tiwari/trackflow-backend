import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { Repository } from 'typeorm';
import { ConnectAccountDto } from './dto/connect-account.dto';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
  ) {}

  async findAllByUser(userId: string): Promise<SocialAccount[]> {
    return await this.socialAccountRepository.find({
      where: { userId: userId },
      select: [
        'id',
        'platform',
        'accountName',
        'accountUsername',
        'profilePictureUrl',
        'followerCount',
        'followingCount',
        'isActive',
        'createdAt',
      ],
    });
  }

  async findOne(id: string, userId: string): Promise<SocialAccount> {
    const account = await this.socialAccountRepository.findOne({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }
    return account;
  }

  async connect(
    userId: string,
    connectDto: ConnectAccountDto,
  ): Promise<SocialAccount> {
    const existing = await this.socialAccountRepository.findOne({
      where: {
        userId,
        platform: connectDto.platform,
        accountId: connectDto.accountId,
      },
    });

    if (!existing) {
      throw new ConflictException('This account is already connected');
    }

    const socialAccount = this.socialAccountRepository.create({
      userId,
      platform: connectDto.platform,
      accountId: connectDto.accountId,
      accountName: connectDto.accountName,
      accountUsername: connectDto.accountUsername,
      accessToken: connectDto.accessToken,
      isActive: true,
    });

    return await this.socialAccountRepository.save(socialAccount);
  }

  async disconnect(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.socialAccountRepository.remove(account);
  }

  async updateAccountInfo(
    id: string,
    userId: string,
    updates: Partial<SocialAccount>,
  ): Promise<SocialAccount> {
    const account = await this.findOne(id, userId);

    Object.assign(account, updates);

    return await this.socialAccountRepository.save(account);
  }

  async toggleActive(id: string, userId: string): Promise<SocialAccount> {
    const account = await this.findOne(id, userId);

    account.isActive = !account.isActive;

    return await this.socialAccountRepository.save(account);
  }
}
