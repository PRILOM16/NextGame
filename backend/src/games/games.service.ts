import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity.js';
import { Subscription } from '../subscriptions/subscriptions.entity.js';
import { News, NewsStatus } from '../news/news.entity.js';
import { Poll, PollStatus } from '../polls/poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(Subscription)
    private subsRepository: Repository<Subscription>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Poll)
    private pollsRepository: Repository<Poll>,
    @InjectRepository(Option)
    private optionsRepository: Repository<Option>,
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  // ==========================================
  // 1. ПРОВЕРКА НАЗВАНИЯ И СОЗДАНИЕ ИГРЫ
  // ==========================================
  async createGame(
    title: string,
    description: string,
    developerId: number,
    coverUrl?: string,
  ) {
    const cleanTitle = title?.trim();
    const cleanDescription = description?.trim();

    if (!cleanTitle) {
      throw new BadRequestException('Введите название игры');
    }

    if (!cleanDescription) {
      throw new BadRequestException('Введите описание игры');
    }

    // Проверяем, есть ли уже игра с таким же названием (без учёта регистра)
    const existingGame = await this.gamesRepository
      .createQueryBuilder('game')
      .where('LOWER(game.title) = LOWER(:title)', { title: cleanTitle })
      .getOne();

    if (existingGame) {
      throw new ConflictException('Игра с таким названием уже существует');
    }

    // Создаём и сохраняем новую игру в базе данных
    const newGame = this.gamesRepository.create({
      title: cleanTitle,
      description: cleanDescription,
      cover_url: coverUrl,
      developer: { user_id: developerId },
    });

    return this.gamesRepository.save(newGame);
  }

  // ==========================================
  // 2. ПОЛУЧЕНИЕ ВСЕХ ИГР (КАТАЛОГ + ПОИСК)
  // ==========================================
  async getAllGames(search?: string) {
    const query = this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.developer', 'developer');

    // Если передан поисковый запрос — ищем по названию игры
    if (search?.trim()) {
      query.where('LOWER(game.title) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }

    const games = await query.getMany();

    // Для каждой игры считаем количество подписчиков и публикаций
    return Promise.all(
      games.map(async (game) => {
        const subscribersCount = await this.subsRepository.count({
          where: { game: { game_id: game.game_id } },
        });

        const postsCount = await this.newsRepository.count({
          where: {
            game: { game_id: game.game_id },
            status: NewsStatus.PUBLISHED,
          },
        });

        const votesCount = await this.votesRepository.count({
          where: {
            option: { poll: { game: { game_id: game.game_id } } },
          },
        });

        return {
          ...game,
          subscribers_count: subscribersCount,
          stats: {
            posts: postsCount,
            votes: votesCount,
          },
        };
      }),
    );
  }

  // ==========================================
  // 3. ПОЛУЧЕНИЕ ОДНОЙ ИГРЫ ПО ID
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
      where: { game: { game_id: gameId } },
    });

    return {
      ...game,
      subscribers_count: subscribersCount,
    };
  }

  // ==========================================
  // 4. ОБЩАЯ СТАТИСТИКА ПЛАТФОРМЫ (ДЛЯ ГЛАВНОЙ И КАТАЛОГА)
  // ==========================================
  async getPlatformStats() {
    const gamesCount = await this.gamesRepository.count();
    const activePolls = await this.pollsRepository.count({
      where: { status: PollStatus.ACTIVE },
    });
    const totalVotes = await this.votesRepository.count();
    const recentUpdates = await this.newsRepository.count({
      where: { status: NewsStatus.PUBLISHED },
    });
    const totalSubscribers = await this.subsRepository.count();

    return {
      games_count: gamesCount,
      active_polls: activePolls,
      total_votes: totalVotes,
      recent_updates: recentUpdates,
      total_subscribers: totalSubscribers,
    };
  }

  // ==========================================
  // 5. АНАЛИТИКА ДЛЯ РАЗРАБОТЧИКА
  // ==========================================
  async getDeveloperAnalytics(developerId: number) {
    // Находим все игры этого разработчика
    const games = await this.gamesRepository.find({
      where: { developer: { user_id: developerId } },
      order: { created_at: 'DESC' },
    });

    // Собираем статистику по каждой игре разработчика
    const gamesAnalytics = await Promise.all(
      games.map(async (game) => {
        // Количество подписчиков игры
        const subscribersCount = await this.subsRepository.count({
          where: { game: { game_id: game.game_id } },
        });

        // Количество опубликованных новостей и черновиков
        const publishedNewsCount = await this.newsRepository.count({
          where: {
            game: { game_id: game.game_id },
            status: NewsStatus.PUBLISHED,
          },
        });

        const draftNewsCount = await this.newsRepository.count({
          where: {
            game: { game_id: game.game_id },
            status: NewsStatus.DRAFT,
          },
        });

        // Все опросы по этой игре
        const polls = await this.pollsRepository.find({
          where: { game: { game_id: game.game_id } },
          order: { created_at: 'DESC' },
        });

        // Считаем голоса для каждого опроса и его вариантов
        const pollsWithStats = await Promise.all(
          polls.map(async (poll) => {
            const options = await this.optionsRepository.find({
              where: { poll: { poll_id: poll.poll_id } },
            });

            const optionsWithVotes = await Promise.all(
              options.map(async (option) => {
                const votesCount = await this.votesRepository.count({
                  where: { option: { option_id: option.option_id } },
                });

                return {
                  option_id: option.option_id,
                  content: option.content,
                  votes_count: votesCount,
                };
              }),
            );

            const pollTotalVotes = optionsWithVotes.reduce(
              (sum, opt) => sum + opt.votes_count,
              0,
            );

            return {
              poll_id: poll.poll_id,
              question: poll.question,
              status: poll.status,
              created_at: poll.created_at,
              total_votes: pollTotalVotes,
              options: optionsWithVotes,
            };
          }),
        );

        const activePollsCount = polls.filter(
          (p) => p.status === PollStatus.ACTIVE,
        ).length;

        const gameVotesCount = pollsWithStats.reduce(
          (sum, poll) => sum + poll.total_votes,
          0,
        );

        return {
          game_id: game.game_id,
          title: game.title,
          cover_url: game.cover_url,
          created_at: game.created_at,
          subscribers_count: subscribersCount,
          published_news_count: publishedNewsCount,
          draft_news_count: draftNewsCount,
          total_news_count: publishedNewsCount + draftNewsCount,
          polls_count: polls.length,
          active_polls_count: activePollsCount,
          votes_count: gameVotesCount,
          polls: pollsWithStats,
        };
      }),
    );

    // Считаем общие итоги по всем играм разработчика
    const summary = {
      total_games: gamesAnalytics.length,
      total_subscribers: gamesAnalytics.reduce(
        (sum, g) => sum + g.subscribers_count,
        0,
      ),
      total_news: gamesAnalytics.reduce(
        (sum, g) => sum + g.total_news_count,
        0,
      ),
      published_news: gamesAnalytics.reduce(
        (sum, g) => sum + g.published_news_count,
        0,
      ),
      draft_news: gamesAnalytics.reduce(
        (sum, g) => sum + g.draft_news_count,
        0,
      ),
      total_polls: gamesAnalytics.reduce((sum, g) => sum + g.polls_count, 0),
      active_polls: gamesAnalytics.reduce(
        (sum, g) => sum + g.active_polls_count,
        0,
      ),
      total_votes: gamesAnalytics.reduce((sum, g) => sum + g.votes_count, 0),
    };

    return {
      summary,
      games: gamesAnalytics,
    };
  }

  // ==========================================
  // 6. ОБНОВЛЕНИЕ ИГРЫ
  // ==========================================
  async updateGame(
    gameId: number,
    developerId: number,
    updateData: { title?: string; description?: string; cover_url?: string },
  ) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) {
      throw new NotFoundException('Игра не найдена, либо нет прав');
    }

    // Если меняется название — проверяем, не занято ли оно другой игрой
    if (updateData.title) {
      const cleanTitle = updateData.title.trim();

      const duplicateGame = await this.gamesRepository
        .createQueryBuilder('game')
        .where('LOWER(game.title) = LOWER(:title)', { title: cleanTitle })
        .andWhere('game.game_id != :gameId', { gameId })
        .getOne();

      if (duplicateGame) {
        throw new ConflictException('Игра с таким названием уже существует');
      }

      game.title = cleanTitle;
    }

    if (updateData.description) {
      game.description = updateData.description.trim();
    }

    if (updateData.cover_url) {
      game.cover_url = updateData.cover_url;
    }

    return this.gamesRepository.save(game);
  }

  // ==========================================
  // 7. УДАЛЕНИЕ ИГРЫ
  // ==========================================
  async deleteGame(gameId: number, developerId: number) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) {
      throw new NotFoundException('Игра не найдена, либо нет прав');
    }

    await this.gamesRepository.remove(game);
    return { message: 'Игра успешно удалена' };
  }
}
