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
import { GamesService } from './games.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Выносим конфиг Multer отдельно, чтобы переиспользовать его
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/covers';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `cover-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // ==========================================
  // СОЗДАНИЕ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post()
  @UseInterceptors(FileInterceptor('cover', multerConfig))
  async create(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const developerId = req.user.user_id || req.user.sub;
    const coverUrl = file ? `/uploads/covers/${file.filename}` : undefined;

    return this.gamesService.createGame(
      body.title,
      body.description,
      developerId,
      coverUrl,
    );
  }

  // ==========================================
  // ПОЛУЧЕНИЕ ВСЕХ ИГР
  // ==========================================
  @Get()
  async findAll(@Query('search') search?: string) {
    return this.gamesService.getAllGames(search);
  }

  // ==========================================
  // ПОЛУЧЕНИЕ ОДНОЙ ИГРЫ ПО ID (ДОБАВЛЕНО СЮДА)
  // ==========================================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.gamesService.getGameById(+id);
  }

  // ==========================================
  // ОБНОВЛЕНИЕ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { title?: string; description?: string },
  ) {
    const developerId = req.user.user_id || req.user.sub;
    return this.gamesService.updateGame(+id, developerId, body);
  }

  // ==========================================
  // ОБНОВЛЕНИЕ ОБЛОЖКИ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('cover', multerConfig))
  async uploadCover(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Файл не найден');

    const developerId = req.user.user_id || req.user.sub;
    const coverUrl = `/uploads/covers/${file.filename}`;

    return this.gamesService.updateGame(+id, developerId, {
      cover_url: coverUrl,
    });
  }

  // ==========================================
  // УДАЛЕНИЕ ИГРЫ
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const developerId = req.user.user_id || req.user.sub;
    return this.gamesService.deleteGame(+id, developerId);
  }
}
