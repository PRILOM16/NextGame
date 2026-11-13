import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './news.entity.js';
import { Game } from '../games/game.entity.js';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private newsRepository: Repository<News>,
    @InjectRepository(Game) private gamesRepository: Repository<Game>,
  ) {}

  // Создание новости (с проверкой, что игру создал этот разработчик)
  async createNews(
    gameId: number,
    developerId: number,
    data: { title: string; content: string },
  ) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) {
      throw new NotFoundException('Игра не найдена или у вас нет прав на неё');
    }

    const news = this.newsRepository.create({
      ...data,
      game: { game_id: gameId },
    });

    return this.newsRepository.save(news);
  }

  // Получить все опубликованные новости конкретной игры (для игроков)
  async getPublishedNewsForGame(gameId: number) {
    return this.newsRepository.find({
      where: { game: { game_id: gameId }, status: NewsStatus.PUBLISHED },
      order: { created_at: 'DESC' }, // Сначала свежие
    });
  }

  // Обновить новость (проверка авторства идет через связь с игрой)
  async updateNews(
    newsId: number,
    developerId: number,
    updateData: Partial<News>,
  ) {
    const news = await this.newsRepository.findOne({
      where: { news_id: newsId, game: { developer: { user_id: developerId } } },
    });

    if (!news) {
      throw new NotFoundException(
        'Новость не найдена или у вас нет прав на её изменение',
      );
    }

    Object.assign(news, updateData);
    return this.newsRepository.save(news);
  }

  // Удалить новость
  async deleteNews(newsId: number, developerId: number) {
    const news = await this.newsRepository.findOne({
      where: { news_id: newsId, game: { developer: { user_id: developerId } } },
    });

    if (!news) {
      throw new NotFoundException(
        'Новость не найдена или у вас нет прав на её удаление',
      );
    }

    await this.newsRepository.remove(news);
    return { message: 'Новость удалена' };
  }
}
