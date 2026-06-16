import { LeadSource, LeadStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class PublicLeadCreateDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  serviceInterest?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  budgetRange?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4_000)
  message?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}

export class AdminLeadUpdateDto extends PublicLeadCreateDto {
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class AdminLeadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}

export class LeadStatusDto {
  @IsEnum(LeadStatus)
  status: LeadStatus;
}
