import {
  ConflictException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/user.entity.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Автоматически создаём аккаунт суперюзера при запуске сервера, если его ещё нет
  async onModuleInit() {
    const existingSuperuser = await this.userRepository.findOne({
      where: { role: UserRole.SUPERUSER },
    });

    if (!existingSuperuser) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('admin12345', salt);

      const superuser = this.userRepository.create({
        name: 'admin',
        email: 'admin@nextgame.ru',
        password_hash,
        role: UserRole.SUPERUSER,
      });

      await this.userRepository.save(superuser);
    }
  }

  // Регистрация нового игрока или разработчика и автоматический вход после создания
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    // Защита: обычный пользователь не может зарегистрироваться как суперюзер через публичную форму
    const safeRole =
      role === UserRole.DEVELOPER ? UserRole.DEVELOPER : UserRole.USER;

    // Проверка, существует ли уже такой пользователь по email или имени
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { name }],
    });
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или именем уже существует',
      );
    }

    // Хэширование пароля
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Создание и сохранение пользователя
    const user = this.userRepository.create({
      name,
      email,
      password_hash,
      role: safeRole,
    });
    await this.userRepository.save(user);

    // Автоматический вход (выдача токена) после регистрации
    return this.login({ email, password });
  }

  // Вход в систему: проверяет логин/пароль и выдаёт JWT-токен (при onlySuperuser=true пускает только SUPERUSER)
  async login(
    loginDto: { email?: string; name?: string; password: string },
    onlySuperuser = false,
  ) {
    // 1. Формируем условие поиска: если пришел email — ищем по нему, иначе по name
    const whereCondition = loginDto.email
      ? { email: loginDto.email }
      : { name: loginDto.name };

    // 2. Ищем пользователя в базе с помощью TypeORM
    const user = await this.userRepository.findOne({ where: whereCondition });

    if (!user) {
      throw new UnauthorizedException('Неверные данные для входа');
    }

    // 3. Сравниваем пароль
    const isMatch = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Неверные данные для входа');
    }

    // 4. Если вход идёт через форму суперюзера — обычных пользователей не пускаем
    if (onlySuperuser && user.role !== UserRole.SUPERUSER) {
      throw new ForbiddenException(
        'Доступ запрещён! Эта форма предназначена только для суперюзера.',
      );
    }

    // 5. Полезная нагрузка токена (информация, которая будет зашифрована внутри)
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
