import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';
import { Game } from '../games/game.entity.js';
import { PollsService } from './polls.service.js';
import { PollsController } from './polls.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Option, Vote, Game])],
  providers: [PollsService],
  controllers: [PollsController],
})
export class PollsModule {}
