import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../decorators/current-user.decorator';
import { ROLES_METADATA_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../constants/app.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.requiredRolesFor(context);

    if (!requiredRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user.role as RoleName;

    if (requiredRoles.includes(userRole)) {
      return true;
    }

    throw new ForbiddenException('Insufficient role for this action');
  }

  private requiredRolesFor(context: ExecutionContext): RoleName[] {
    return (
      this.reflector.getAllAndOverride<RoleName[]>(ROLES_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? []
    );
  }
}
