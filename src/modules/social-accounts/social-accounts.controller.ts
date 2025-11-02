import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ConnectAccountDto } from './dto/connect-account.dto';

@Controller('social-accounts')
@UseGuards(JwtAuthGuard)
export class SocialAccountsController {
  constructor(private socialAccountsService: SocialAccountsService) {}

  @Get()
  async findAll(@GetUser() user: any) {
    return await this.socialAccountsService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return await this.socialAccountsService.findOne(id, user.id);
  }

  @Post('connect')
  async connect(@Body() connectDto: ConnectAccountDto, @GetUser() user: any) {
    return await this.socialAccountsService.connect(user.id, connectDto);
  }

  @Delete(':id')
  async disconnect(@Param('id') id: string, @GetUser() user: any) {
    await this.socialAccountsService.disconnect(id, user.id);
    return { message: 'Account disconnected successfully' };
  }

  @Patch(':id/toggle')
  async toggleActive(@Param('id') id: string, @GetUser() user: any) {
    return await this.socialAccountsService.toggleActive(id, user.id);
  }
}
