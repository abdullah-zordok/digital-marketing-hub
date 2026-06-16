import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

import { UsersRepository } from '../users/users.repository';
import { AuthResponseDto, RefreshTokenPayload, SafeUserDto } from './dto/auth.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.validUserFor(email, password);
    await this.usersRepository.recordLogin(user.id);

    return {
      user: this.usersRepository.safeUserFor(user),
      tokens: await this.tokenService.tokenPairFor(user),
    };
  }

  async currentUser(user: User): Promise<SafeUserDto> {
    return this.usersRepository.safeUserFor(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.validRefreshPayload(refreshToken);
    const user = await this.currentActiveUser(payload.sub);

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    return {
      user: this.usersRepository.safeUserFor(user),
      tokens: await this.tokenService.tokenPairFor(user),
    };
  }

  async logout(user: User): Promise<{ loggedOut: true }> {
    await this.usersRepository.incrementTokenVersion(user.id);
    return { loggedOut: true };
  }

  private async validUserFor(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.activeUserByEmail(email);
    const passwordValid = user
      ? await this.passwordService.passwordMatches(password, user.passwordHash)
      : false;

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async validRefreshPayload(refreshToken: string): Promise<RefreshTokenPayload> {
    const payload = await this.tokenService.refreshPayloadFor(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  private async currentActiveUser(userId: string): Promise<User> {
    const user = await this.usersRepository.activeUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User is not active');
    }

    return user;
  }
}
