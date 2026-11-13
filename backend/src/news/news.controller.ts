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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsService } from './news.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { NewsStatus } from './news.entity.js';
import { createUploadConfig } from '../common/upload.config.js';

// Настройка сохранения фотографий новостей в папку ./uploads/news
const newsImageUploadConfig = createUploadConfig('news', 'news');

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 1. Создать новость для конкретной игры (с возможностью сразу прикрепить фото)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('games/:gameId/news')
  @UseInterceptors(FileInterceptor('image', newsImageUploadConfig))
  async createNews(
    @Param('gameId') gameId: string,
    @Request() req: any,
    @Body() body: { title: string; content: string; status?: NewsStatus },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/news/${file.filename}` : undefined;

    return this.newsService.createNews(+gameId, req.user.user_id, {
      ...body,
      image_url: imageUrl,
    });
  }

  // 2. Загрузить или обновить фото для существующей новости (/news/:id/image)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('news/:id/image')
  @UseInterceptors(FileInterceptor('image', newsImageUploadConfig))
  async uploadNewsImage(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    const imageUrl = `/uploads/news/${file.filename}`;
    return this.newsService.updateNews(+id, req.user.user_id, {
      image_url: imageUrl,
    });
  }

  // 3. Получить опубликованные новости игры (доступно всем)
  @Get('games/:gameId/news')
  async getGameNews(@Param('gameId') gameId: string) {
    return this.newsService.getPublishedNewsForGame(+gameId);
  }

  // 4. Редактировать новость по её ID (/news/:id)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Patch('news/:id')
  async updateNews(
    @Param('id') id: string,
    @Request() req: any,
    @Body()
    body: {
      title?: string;
      content?: string;
      status?: NewsStatus;
      image_url?: string;
    },
  ) {
    return this.newsService.updateNews(+id, req.user.user_id, body);
  }

  // 5. Удалить новость
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Delete('news/:id')
  async deleteNews(@Param('id') id: string, @Request() req: any) {
    return this.newsService.deleteNews(+id, req.user.user_id);
  }
}
