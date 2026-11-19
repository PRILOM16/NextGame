import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // 1. Получить профиль (без хэша пароля)
  async getUserProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Исключаем пароль из объекта перед отправкой
    const { password_hash, ...result } = user;
    return result;
  }

  // 2. Обновить имя (name)
  async updateProfile(userId: number, name: string) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    user.name = name;
    await this.usersRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  // 3. Обновить аватарку
  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    user.avatar_url = avatarUrl;
    await this.usersRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }
}
