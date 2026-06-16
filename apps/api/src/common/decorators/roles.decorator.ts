import { SetMetadata } from '@nestjs/common';

import { RoleName } from '../constants/app.constants';

export const ROLES_METADATA_KEY = 'roles';

export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_METADATA_KEY, roles);
