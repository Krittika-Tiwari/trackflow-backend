import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  likesCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commentsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sharesCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewsCount?: number;

  @IsOptional()
  @IsNumber()
  engagementRate?: number;
}
