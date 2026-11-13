import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity.js';
import { Subscription } from '../subscriptions/subscriptions.entity.js';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(Subscription)
    private subsRepository: Repository<Subscription>,
  ) {}

  async createGame(
    title: string,
    description: string,
    developerId: number,
    coverUrl?: string,
  ) {
    const newGame = this.gamesRepository.create({
      title,
      description,
      cover_url: coverUrl,
      developer: { user_id: developerId },
    });
    return this.gamesRepository.save(newGame);
  }

  async getAllGames(search?: string) {
    const query = this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.developer', 'developer');

    if (search?.trim()) {
      query.where('LOWER(game.title) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }

    const games = await query.getMany();

    return Promise.all(
      games.map(async (game) => {
        const subscribersCount = await this.subsRepository.count({
          where: {
            game: { game_id: game.game_id },
          },
        });

        return {
          ...game,
          subscribers_count: subscribersCount,
        };
      }),
    );
  }

  // ==========================================
  // ДОБАВЛЕННЫЙ МЕТОД ДЛЯ ПОЛУЧЕНИЯ ОДНОЙ ИГРЫ
  // ==========================================

  async getGameById(gameId: number) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId },
      relations: { developer: true },
    });

    if (!game) {
      throw new NotFoundException('Игра не найдена');
    }

    const subscribersCount = await this.subsRepository.count({
      where: {
        game: { game_id: gameId },
      },
    });

    return {
      ...game,
      subscribers_count: subscribersCount,
    };
  }

  async updateGame(
    gameId: number,
    developerId: number,
    updateData: { title?: string; description?: string; cover_url?: string },
  ) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) throw new NotFoundException('Игра не найдена, либо нет прав');

    if (updateData.title) game.title = updateData.title;
    if (updateData.description) game.description = updateData.description;
    if (updateData.cover_url) game.cover_url = updateData.cover_url;

    return this.gamesRepository.save(game);
  }

  async deleteGame(gameId: number, developerId: number) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) throw new NotFoundException('Игра не найдена, либо нет прав');

    await this.gamesRepository.remove(game);
    return { message: 'Игра успешно удалена' };
  }
}
