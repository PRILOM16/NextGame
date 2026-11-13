import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity.js';
import { Game } from './games/game.entity.js';
import { Subscription } from './subscriptions/subscriptions.entity.js';
import { News } from './news/news.entity.js';
import { Poll } from './polls/poll.entity.js';
import { Option } from './options/option.entity.js';
import { Vote } from './votes/vote.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { GamesModule } from './games/games.module.js';
import { NewsModule } from './news/news.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { PollsModule } from './polls/polls.module.js';
import { UsersModule } from './users/users.module.js';
import { FeedModule } from './feed/feed.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // Подключение к базе данных MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'rootpassword', // Пароль из docker-compose.yml
      database: 'nextgame_db', // Название БД из docker-compose.yml
      entities: [User, Game, Subscription, News, Poll, Option, Vote],
      synchronize: true, // Автоматически создаёт и обновляет таблицы
    }),
    AuthModule,
    GamesModule,
    NewsModule,
    SubscriptionsModule,
    PollsModule,
    UsersModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
