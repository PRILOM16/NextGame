import { SetMetadata } from '@nestjs/common';

// Декоратор @Roles('DEVELOPER') указывает, какие роли имеют доступ к маршруту
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
