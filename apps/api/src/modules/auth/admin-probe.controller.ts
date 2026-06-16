import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';

@Controller('admin/probe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProbeController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get()
  @Roles('ADMIN', 'EDITOR', 'VIEWER')
  probe(@CurrentUser() user: User) {
    return {
      message: 'Protected admin access confirmed',
      payload: {
        authenticated: true,
        user: this.usersRepository.safeUserFor(user),
      },
    };
  }
}
