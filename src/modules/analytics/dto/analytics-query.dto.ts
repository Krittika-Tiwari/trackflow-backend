import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TimePeriod {
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  THIS_MONTH = 'month',
  THIS_YEAR = 'year',
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;

  @IsOptional()
  platform?: string;
}
