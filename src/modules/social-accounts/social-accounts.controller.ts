import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';
import { UpdateSocialAccountDto } from './dto/update-social-account.dto';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  @Post()
  create(@Body() createSocialAccountDto: CreateSocialAccountDto) {
    return this.socialAccountsService.create(createSocialAccountDto);
  }

  @Get()
  findAll() {
    return this.socialAccountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialAccountsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSocialAccountDto: UpdateSocialAccountDto) {
    return this.socialAccountsService.update(+id, updateSocialAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.socialAccountsService.remove(+id);
  }
}
