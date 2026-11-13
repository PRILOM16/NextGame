import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';
import { Game } from './game.entity.js';
import { Subscription } from '../subscriptions/subscriptions.entity.js';
import { News } from '../news/news.entity.js';
import { Poll } from '../polls/poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';

@Module({
  // Подключаем таблицы, которые нужны для работы с играми и подсчёта аналитики
  imports: [
    TypeOrmModule.forFeature([Game, Subscription, News, Poll, Option, Vote]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
