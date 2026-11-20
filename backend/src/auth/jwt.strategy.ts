import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'NEXTGAME_SUPER_SECRET_KEY',
    });
  }

  // Вызывается автоматически после проверки токена: кладёт данные пользователя в req.user
  async validate(payload: any) {
    return { user_id: payload.sub, email: payload.email, role: payload.role };
  }
}
