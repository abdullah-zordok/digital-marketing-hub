import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export enum BlogSortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  POPULAR = 'popular',
}

export class BlogDiscoveryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tag?: string;

  @IsOptional()
  @IsEnum(BlogSortOption)
  sort: BlogSortOption = BlogSortOption.NEWEST;
}
