import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FetchPostsQueryDto {
  @IsOptional()
  @IsUUID()
  socialAccountId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['twitter', 'instagram', 'linkedin', 'facebook'])
  platform?: string;
}
