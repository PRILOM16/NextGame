import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем роли, которые мы указали в декораторе @Roles(...) над методом
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Если роли не требуются, пускаем дальше
    }

    const { user } = context.switchToHttp().getRequest();

    // user.role приходит из нашего JWT-токена (мы зашивали его туда при логине)
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'У вас нет прав разработчика для выполнения этого действия',
      );
    }

    return true;
  }
}
