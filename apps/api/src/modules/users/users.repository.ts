import { Injectable } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';

import { RoleName } from '../../common/constants/app.constants';
import { PrismaService } from '../../database/prisma.service';
import { SafeUserDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async activeUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { email: email.toLowerCase(), status: UserStatus.ACTIVE, deletedAt: null },
    });
  }

  async activeUserById(userId: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { id: userId, status: UserStatus.ACTIVE, deletedAt: null },
    });
  }

  async recordLogin(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  safeUserFor(user: User): SafeUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as RoleName,
      status: user.status,
    };
  }
}
