import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrafficLimited } from '../../common/guards/traffic-limit.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto, RefreshTokenDto, SafeUserDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @TrafficLimited('login')
  @ApiOperation({ summary: 'Authenticate an admin user' })
  async login(@Body() loginDto: LoginDto): Promise<{ message: string; payload: AuthResponseDto }> {
    return {
      message: 'Login successful',
      payload: await this.authService.login(loginDto.email, loginDto.password),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout the current user' })
  async logout(@CurrentUser() user: User): Promise<{ message: string; payload: { loggedOut: true } }> {
    return {
      message: 'Logout successful',
      payload: await this.authService.logout(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read the current user profile' })
  async me(@CurrentUser() user: User): Promise<{ message: string; payload: SafeUserDto }> {
    return {
      message: 'Current user retrieved',
      payload: await this.authService.currentUser(user),
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh an authenticated session' })
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
  ): Promise<{ message: string; payload: AuthResponseDto }> {
    return {
      message: 'Session refreshed',
      payload: await this.authService.refresh(refreshDto.refreshToken),
    };
  }
}
