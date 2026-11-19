import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { User } from '../users/user.entity.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Даем модулю доступ к таблице Users
    PassportModule,
    JwtModule.register({
      secret: 'NEXTGAME_SUPER_SECRET_KEY', // Ключ шифрования токенов
      signOptions: { expiresIn: '24h' }, // Токен живет 1 сутки
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
