import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';
import { Game } from './game.entity.js';
import { Subscription } from '../subscriptions/subscriptions.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Subscription])], // Даем доступ к таблице игр
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
