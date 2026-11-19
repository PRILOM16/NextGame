import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './news.entity.js';
import { Game } from '../games/game.entity.js';
import { NewsService } from './news.service.js';
import { NewsController } from './news.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([News, Game])],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
