import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersRepository } from '../../modules/users/users.repository';
import { TokenService } from '../../modules/auth/token.service';
import { AuthenticatedRequest } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.bearerTokenFrom(request);
    const payload = await this.verifiedAccessPayloadFor(token);
    const user = await this.usersRepository.activeUserById(payload.sub);

    if (!user || user.tokenVersion !== payload.tokenVersion || payload.type !== 'access') {
      throw new UnauthorizedException('Authentication is required');
    }

    request.user = user;
    return true;
  }

  private bearerTokenFrom(request: Request): string {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required');
    }

    return authorization.slice('Bearer '.length);
  }

  private async verifiedAccessPayloadFor(token: string) {
    try {
      return await this.tokenService.accessPayloadFor(token);
    } catch {
      throw new UnauthorizedException('Authentication is required');
    }
  }
}
