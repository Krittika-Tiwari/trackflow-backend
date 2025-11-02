import { IsString, IsEnum } from 'class-validator';

export enum Platform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
}

export class ConnectAccountDto {
  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  accessToken: string;

  @IsString()
  accountId: string;

  @IsString()
  accountName: string;

  @IsString()
  accountUsername: string;
}
