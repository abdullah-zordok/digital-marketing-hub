import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto, RefreshTokenDto, SafeUserDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ message: string; payload: AuthResponseDto }> {
    return {
      message: 'Login successful',
      payload: await this.authService.login(loginDto.email, loginDto.password),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: User): Promise<{ message: string; payload: { loggedOut: true } }> {
    return {
      message: 'Logout successful',
      payload: await this.authService.logout(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User): Promise<{ message: string; payload: SafeUserDto }> {
    return {
      message: 'Current user retrieved',
      payload: await this.authService.currentUser(user),
    };
  }

  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
  ): Promise<{ message: string; payload: AuthResponseDto }> {
    return {
      message: 'Session refreshed',
      payload: await this.authService.refresh(refreshDto.refreshToken),
    };
  }
}
