import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GamesService } from './games.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { createUploadConfig } from '../common/upload.config.js';

// Настройка сохранения обложек игр в папку ./uploads/covers
const coverUploadConfig = createUploadConfig('covers', 'cover');

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // ==========================================
  // 1. СОЗДАНИЕ НОВОЙ ИГРЫ (ТОЛЬКО РАЗРАБОТЧИК)
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post()
  @UseInterceptors(FileInterceptor('cover', coverUploadConfig))
  async create(
    @Request() req: any,
    @Body() body: { title: string; description: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const coverUrl = file ? `/uploads/covers/${file.filename}` : undefined;

    return this.gamesService.createGame(
      body.title,
      body.description,
      req.user.user_id,
      coverUrl,
    );
  }

  // ==========================================
  // 2. ПОЛУЧЕНИЕ ВСЕХ ИГР (КАТАЛОГ)
  // ==========================================
  @Get()
  async findAll(@Query('search') search?: string) {
    return this.gamesService.getAllGames(search);
  }

  // ==========================================
  // 3. ОБЩАЯ СТАТИСТИКА ПЛАТФОРМЫ
  // ==========================================
  @Get('stats')
  async getStats() {
    return this.gamesService.getPlatformStats();
  }

  // ==========================================
  // 4. АНАЛИТИКА РАЗРАБОТЧИКА ПО ЕГО ИГРАМ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Get('developer/analytics')
  async getDeveloperAnalytics(@Request() req: any) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.gamesService.getDeveloperAnalytics(
      req.user.user_id,
      isSuperuser,
    );
  }

  // ==========================================
  // 5. ПОЛУЧЕНИЕ ОДНОЙ ИГРЫ ПО ID
  // ==========================================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.gamesService.getGameById(+id);
  }

  // ==========================================
  // 6. ОБНОВЛЕНИЕ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { title?: string; description?: string },
  ) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.gamesService.updateGame(
      +id,
      req.user.user_id,
      body,
      isSuperuser,
    );
  }

  // ==========================================
  // 7. ЗАГРУЗКА ОБЛОЖКИ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('cover', coverUploadConfig))
  async uploadCover(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    const isSuperuser = req.user.role === 'SUPERUSER';
    const coverUrl = `/uploads/covers/${file.filename}`;

    return this.gamesService.updateGame(
      +id,
      req.user.user_id,
      { cover_url: coverUrl },
      isSuperuser,
    );
  }

  // ==========================================
  // 8. УДАЛЕНИЕ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const isSuperuser = req.user.role === 'SUPERUSER';
    return this.gamesService.deleteGame(+id, req.user.user_id, isSuperuser);
  }
}
