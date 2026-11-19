import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscription } from '../subscriptions/subscriptions.entity.js';
import { News } from '../news/news.entity.js';
import { Poll } from '../polls/poll.entity.js';
import { Option } from '../options/option.entity.js';
import { Vote } from '../votes/vote.entity.js';

import { FeedService } from './feed.service.js';
import { FeedController } from './feed.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, News, Poll, Option, Vote])],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
