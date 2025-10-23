import { Injectable } from '@nestjs/common';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';
import { UpdateSocialAccountDto } from './dto/update-social-account.dto';

@Injectable()
export class SocialAccountsService {
  create(createSocialAccountDto: CreateSocialAccountDto) {
    return 'This action adds a new socialAccount';
  }

  findAll() {
    return `This action returns all socialAccounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} socialAccount`;
  }

  update(id: number, updateSocialAccountDto: UpdateSocialAccountDto) {
    return `This action updates a #${id} socialAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} socialAccount`;
  }
}
