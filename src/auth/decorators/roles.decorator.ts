import { SetMetadata } from '@nestjs/common';

//decorador para insertar Roles @Roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
