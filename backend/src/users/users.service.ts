import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // 1. Получить профиль пользователя (без хэша пароля)
  async getUserProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { password_hash, ...result } = user;
    return result;
  }

  // 2. Обновить имя (никнейм) пользователя
  async updateProfile(userId: number, name: string) {
    const cleanName = name?.trim();
    if (!cleanName) {
      throw new BadRequestException('Никнейм не может быть пустым');
    }

    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Проверяем, не занят ли никнейм другим пользователем
    if (cleanName !== user.name) {
      const existingUser = await this.usersRepository.findOne({
        where: { name: cleanName },
      });
      if (existingUser && existingUser.user_id !== userId) {
        throw new ConflictException('Этот никнейм уже занят');
      }
    }

    user.name = cleanName;
    await this.usersRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  // 3. Изменить пароль пользователя
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Введите текущий и новый пароль');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'Новый пароль должен содержать не менее 8 символов',
      );
    }

    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Проверяем, совпадает ли введённый старый пароль с паролем в базе
    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordCorrect) {
      throw new BadRequestException('Текущий пароль введён неверно');
    }

    // Хэшируем и сохраняем новый пароль
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.save(user);

    return { message: 'Пароль успешно изменён' };
  }

  // 4. Обновить аватарку профиля
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
