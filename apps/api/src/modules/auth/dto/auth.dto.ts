import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { RoleName } from '../../../common/constants/app.constants';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export interface SafeUserDto {
  id: string;
  email: string;
  name: string | null;
  role: RoleName;
  status: 'ACTIVE' | 'DISABLED';
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponseDto {
  user: SafeUserDto;
  tokens: TokenPairDto;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: RoleName;
  tokenVersion: number;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  type: 'refresh';
}
