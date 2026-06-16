import { ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ServiceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class ServiceReorderItemDto {
  @IsUUID()
  id: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ServiceReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceReorderItemDto)
  items: ServiceReorderItemDto[];
}
