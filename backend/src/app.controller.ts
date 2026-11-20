import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { GamesService } from './games/games.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly gamesService: GamesService,
  ) {}

  // Проверка работы сервера (GET /)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Общая статистика платформы (доступна по адресу GET /stats)
  @Get('stats')
  getPlatformStats() {
    return this.gamesService.getPlatformStats();
  }
}
