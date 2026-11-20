import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity.js';

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

  // Вспомогательный метод: проверка, что имя и почта ещё никем не заняты
  private async checkUniqueUser(
    name?: string,
    email?: string,
    excludeUserId?: number,
  ) {
    if (name) {
      const existingByName = await this.usersRepository.findOne({
        where: { name },
      });
      if (existingByName && existingByName.user_id !== excludeUserId) {
        throw new ConflictException('Этот никнейм уже занят');
      }
    }

    if (email) {
      const existingByEmail = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingByEmail && existingByEmail.user_id !== excludeUserId) {
        throw new ConflictException('Эта почта уже занята');
      }
    }
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

    await this.checkUniqueUser(cleanName, undefined, userId);

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

  // ==========================================
  // МЕТОДЫ ДЛЯ СУПЕРЮЗЕРА (УПРАВЛЕНИЕ ПРОФИЛЯМИ)
  // ==========================================

  // 5. Получить список всех пользователей сайта
  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { created_at: 'DESC' },
    });

    // Убираем хэш пароля у каждого пользователя перед отправкой
    return users.map((user) => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
  }

  // 6. Создать нового пользователя (может делать суперюзер)
  async createUserByAdmin(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim();

    if (!cleanName || !cleanEmail || !data.password) {
      throw new BadRequestException('Заполните имя, почту и пароль');
    }

    await this.checkUniqueUser(cleanName, cleanEmail);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const newUser = this.usersRepository.create({
      name: cleanName,
      email: cleanEmail,
      password_hash,
      role: data.role || UserRole.USER,
    });

    const saved = await this.usersRepository.save(newUser);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  // 7. Изменить данные любого пользователя (имя, почту, роль, пароль)
  async updateUserByAdmin(
    userId: number,
    data: {
      name?: string;
      email?: string;
      role?: UserRole;
      password?: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim();

    await this.checkUniqueUser(cleanName, cleanEmail, userId);

    if (cleanName) user.name = cleanName;
    if (cleanEmail) user.email = cleanEmail;
    if (data.role) user.role = data.role;

    if (data.password && data.password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(data.password.trim(), salt);
    }

    const saved = await this.usersRepository.save(user);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  // 8. Удалить профиль пользователя (свой собственный аккаунт удалить нельзя)
  async deleteUserByAdmin(userId: number, currentUserId: number) {
    if (userId === currentUserId) {
      throw new BadRequestException('Нельзя удалить свой собственный аккаунт');
    }

    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.usersRepository.remove(user);
    return { message: 'Профиль пользователя успешно удалён' };
  }
}
