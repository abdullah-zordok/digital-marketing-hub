import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { OperationalLoggerService } from '../../common/services/operational-logger.service';
import { AdminProbeController } from './admin-probe.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController, AdminProbeController],
  providers: [AuthService, PasswordService, TokenService, JwtAuthGuard, RolesGuard, OperationalLoggerService],
  exports: [AuthService, PasswordService, TokenService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
