import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BlogCategoryWriteDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(120)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
