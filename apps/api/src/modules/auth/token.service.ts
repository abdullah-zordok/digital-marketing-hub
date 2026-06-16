import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import {
  REFRESH_TOKEN_EXPIRY_FALLBACK,
  TOKEN_EXPIRY_FALLBACK,
} from '../../common/constants/app.constants';
import { AccessTokenPayload, RefreshTokenPayload, TokenPairDto } from './dto/auth.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async tokenPairFor(user: User): Promise<TokenPairDto> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenLifetimeSeconds(),
    };
  }

  async accessPayloadFor(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async refreshPayloadFor(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  private signAccessToken(user: User): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? TOKEN_EXPIRY_FALLBACK,
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  private signRefreshToken(user: User): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        REFRESH_TOKEN_EXPIRY_FALLBACK,
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  private accessTokenLifetimeSeconds(): number {
    const configuredLifetime = this.configService.get<string>('JWT_EXPIRES_IN') ?? '';
    const minuteMatch = configuredLifetime.match(/^(\d+)m$/);
    return minuteMatch ? Number(minuteMatch[1]) * 60 : 900;
  }
}
