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
} from '@nestjs/common';
import { NewsService } from './news.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { NewsStatus } from './news.entity.js';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Создать новость для конкретной игры (/games/:gameId/news)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Post('games/:gameId/news')
  async createNews(
    @Param('gameId') gameId: string,
    @Request() req: any,
    @Body() body: { title: string; content: string },
  ) {
    return this.newsService.createNews(+gameId, req.user.user_id, body);
  }

  // Получить опубликованные новости игры (доступно всем)
  @Get('games/:gameId/news')
  async getGameNews(@Param('gameId') gameId: string) {
    return this.newsService.getPublishedNewsForGame(+gameId);
  }

  // Редактировать новость по её ID (/news/:id)
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

  // Удалить новость
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  @Delete('news/:id')
  async deleteNews(@Param('id') id: string, @Request() req: any) {
    return this.newsService.deleteNews(+id, req.user.user_id);
  }
}
