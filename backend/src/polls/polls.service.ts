import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll, PollStatus } from './poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';
import { Game } from '../games/game.entity.js';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll) private pollsRepository: Repository<Poll>,
    @InjectRepository(Option) private optionsRepository: Repository<Option>,
    @InjectRepository(Vote) private votesRepository: Repository<Vote>,
    @InjectRepository(Game) private gamesRepository: Repository<Game>,
  ) {}

  // Создать опрос вместе с вариантами
  async createPoll(
    gameId: number,
    developerId: number,
    question: string,
    optionsData: string[],
  ) {
    const game = await this.gamesRepository.findOne({
      where: { game_id: gameId, developer: { user_id: developerId } },
    });

    if (!game) {
      throw new NotFoundException('Игра не найдена или у вас нет прав');
    }

    const poll = this.pollsRepository.create({
      question,
      game: { game_id: gameId },
    });

    const savedPoll = await this.pollsRepository.save(poll);

    const options = optionsData.map((text) =>
      this.optionsRepository.create({
        content: text,
        poll: { poll_id: savedPoll.poll_id },
      }),
    );

    await this.optionsRepository.save(options);

    return {
      message: 'Опрос успешно создан',
      poll_id: savedPoll.poll_id,
    };
  }

  async getPollsForGame(gameId: number) {
    const polls = await this.pollsRepository.find({
      where: { game: { game_id: gameId } },
      order: { created_at: 'DESC' },
    });

    const result = await Promise.all(
      polls.map(async (poll) => {
        const options = await this.optionsRepository.find({
          where: { poll: { poll_id: poll.poll_id } },
        });

        const optionsWithVotes = await Promise.all(
          options.map(async (option) => {
            const votesCount = await this.votesRepository.count({
              where: {
                option: { option_id: option.option_id },
              },
            });

            return {
              ...option,
              votes_count: votesCount,
            };
          }),
        );

        return {
          ...poll,
          options: optionsWithVotes,
        };
      }),
    );

    return result;
  }

  // 3. Отдать голос
  async vote(userId: number, pollId: number, optionId: number) {
    // Находим опрос
    const poll = await this.pollsRepository.findOne({
      where: { poll_id: pollId },
    });

    if (!poll) {
      throw new NotFoundException('Опрос не найден');
    }

    // Проверяем статус опроса
    if (poll.status === PollStatus.CLOSED) {
      throw new ConflictException('Голосование уже завершено');
    }

    // Проверяем существование варианта ответа
    const option = await this.optionsRepository.findOne({
      where: {
        option_id: optionId,
        poll: { poll_id: pollId },
      },
    });

    if (!option) {
      throw new NotFoundException(
        'Такой вариант ответа не найден в этом опросе',
      );
    }

    // Проверяем, голосовал ли пользователь ранее
    const existingVote = await this.votesRepository.findOne({
      where: {
        user: { user_id: userId },
        option: { poll: { poll_id: pollId } },
      },
    });

    if (existingVote) {
      throw new ConflictException('Вы уже проголосовали в этом опросе!');
    }

    // Сохраняем голос
    const newVote = this.votesRepository.create({
      user: { user_id: userId },
      option: { option_id: optionId },
    });

    await this.votesRepository.save(newVote);

    return { message: 'Ваш голос успешно учтен!' };
  }

  async getMyVotes(userId: number) {
    const votes = await this.votesRepository.find({
      where: {
        user: { user_id: userId },
      },
      relations: {
        option: {
          poll: true,
        },
      },
    });

    return votes.map((vote) => ({
      poll_id: vote.option.poll.poll_id,
      option_id: vote.option.option_id,
    }));
  }

  async updatePollImage(pollId: number, developerId: number, imageUrl: string) {
    // Ищем опрос, одновременно проверяя права (опрос -> игра -> разработчик)
    const poll = await this.pollsRepository.findOne({
      where: {
        poll_id: pollId,
        game: { developer: { user_id: developerId } },
      },
    });

    if (!poll) {
      throw new NotFoundException(
        'Опрос не найден или у вас нет прав на его изменение',
      );
    }

    poll.image_url = imageUrl;
    return this.pollsRepository.save(poll);
  }

  // Досрочно завершить опрос (только для его разработчика)
  async closePoll(pollId: number, developerId: number) {
    const poll = await this.pollsRepository.findOne({
      where: {
        poll_id: pollId,
        game: {
          developer: {
            user_id: developerId,
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException(
        'Опрос не найден или у вас нет прав на его завершение',
      );
    }

    if (poll.status === PollStatus.CLOSED) {
      throw new ConflictException('Опрос уже завершён');
    }

    poll.status = PollStatus.CLOSED;

    await this.pollsRepository.save(poll);

    return {
      message: 'Опрос успешно завершён',
      poll_id: poll.poll_id,
    };
  }
}
