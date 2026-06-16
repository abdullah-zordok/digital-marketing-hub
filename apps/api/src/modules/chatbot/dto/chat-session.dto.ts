import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourcePage?: string;
}

export class SendChatMessageDto {
  @IsString()
  @MaxLength(120)
  visitorId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4_000)
  content: string;
}

export class ChatMessagesQueryDto {
  @IsString()
  @MaxLength(120)
  visitorId: string;
}
