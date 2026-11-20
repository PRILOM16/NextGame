import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js'; // Импортируем нашего охранника

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Регистрация нового пользователя (игрок или разработчик)
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.role,
    );
  }

  // Обычный вход в аккаунт по почте или никнейму
  @Post('login')
  async login(
    @Body() loginDto: { email?: string; name?: string; password: string },
  ) {
    return this.authService.login(loginDto);
  }

  // Отдельный вход для суперюзера (обычных пользователей не пускает)
  @Post('superuser/login')
  async superuserLogin(
    @Body() loginDto: { email?: string; name?: string; password: string },
  ) {
    return this.authService.login(loginDto, true);
  }

  // Получить данные текущего пользователя из JWT-токена
  @UseGuards(JwtAuthGuard) // Охранник стоит прямо перед этим методом!
  @Get('profile')
  getProfile(@Request() req: any) {
    // Если охранник пропустил запрос, он автоматически расшифровывает токен
    // и кладет данные пользователя в req.user
    return req.user;
  }
}
