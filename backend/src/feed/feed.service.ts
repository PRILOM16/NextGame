import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Subscription } from '../subscriptions/subscriptions.entity.js';
import { News, NewsStatus } from '../news/news.entity.js';
import { Poll } from '../polls/poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,

    @InjectRepository(News)
    private newsRepository: Repository<News>,

    @InjectRepository(Poll)
    private pollsRepository: Repository<Poll>,

    @InjectRepository(Option)
    private optionsRepository: Repository<Option>,

    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async getUserFeed(userId: number) {
    // 1. Получаем игры, на которые подписан пользователь
    const subscriptions = await this.subscriptionsRepository.find({
      where: { user: { user_id: userId } },
      relations: { game: true },
    });

    const gameIds = subscriptions.map(
      (subscription) => subscription.game.game_id,
    );

    // Если подписок нет, возвращаем пустую ленту
    if (gameIds.length === 0) {
      return [];
    }

    // 2. Получаем опубликованные новости этих игр
    const news = await this.newsRepository.find({
      where: {
        game: { game_id: In(gameIds) },
        status: NewsStatus.PUBLISHED,
      },
      relations: { game: true },
    });

    // 3. Получаем опросы этих игр
    const polls = await this.pollsRepository.find({
      where: {
        game: { game_id: In(gameIds) },
      },
      relations: { game: true },
    });

    // 4. Формируем карточки новостей
    const newsItems = news.map((item) => ({
      type: 'NEWS',
      id: item.news_id,
      title: item.title,
      content: item.content,
      image_url: item.image_url,
      created_at: item.created_at,
      game: {
        game_id: item.game.game_id,
        title: item.game.title,
        cover_url: item.game.cover_url,
      },
    }));

    // 5. Формируем карточки опросов
    const pollItems = await Promise.all(
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

        const userVote = await this.votesRepository.findOne({
          where: {
            user: { user_id: userId },
            option: { poll: { poll_id: poll.poll_id } },
          },
          relations: { option: true },
        });

        return {
          type: 'POLL',
          id: poll.poll_id,
          question: poll.question,
          description: poll.description,
          image_url: poll.image_url,
          status: poll.status,
          ends_at: poll.ends_at,
          created_at: poll.created_at,
          user_vote: userVote?.option.option_id ?? null,
          options: optionsWithVotes,
          total_votes: optionsWithVotes.reduce(
            (total, option) => total + option.votes_count,
            0,
          ),
          game: {
            game_id: poll.game.game_id,
            title: poll.game.title,
            cover_url: poll.game.cover_url,
          },
        };
      }),
    );

    // 6. Объединяем новости и опросы
    // Сначала самые новые публикации
    return [...newsItems, ...pollItems].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
}
