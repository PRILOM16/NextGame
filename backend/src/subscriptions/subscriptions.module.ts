import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscriptions.entity.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
